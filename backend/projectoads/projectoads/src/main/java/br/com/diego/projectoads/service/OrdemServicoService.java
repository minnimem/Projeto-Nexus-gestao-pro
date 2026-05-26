package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.StatusOrdemServico;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import br.com.diego.projectoads.dto.OrdemServicoPecaRequest;
import br.com.diego.projectoads.dto.OrdemServicoPecaResponse;
import br.com.diego.projectoads.dto.OrdemServicoRequest;
import br.com.diego.projectoads.dto.OrdemServicoResponse;
import br.com.diego.projectoads.dto.OrdemServicoStatusRequest;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Filial;
import br.com.diego.projectoads.model.Financeiro;
import br.com.diego.projectoads.model.OrdemServico;
import br.com.diego.projectoads.model.OrdemServicoPeca;
import br.com.diego.projectoads.model.Produto;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.ClienteRepository;
import br.com.diego.projectoads.repository.EmpresaRepository;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.FinanceiroRepository;
import br.com.diego.projectoads.repository.OrdemServicoRepository;
import br.com.diego.projectoads.repository.ProdutoRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class OrdemServicoService {

    private static final DateTimeFormatter NUMERO_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final long TAMANHO_MAXIMO_ANEXO_BYTES = 10L * 1024L * 1024L;

    private final OrdemServicoRepository ordemServicoRepository;
    private final EmpresaRepository empresaRepository;
    private final FilialRepository filialRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final FinanceiroRepository financeiroRepository;
    private final ProdutoRepository produtoRepository;
    private final EstoqueService estoqueService;
    private final AuditoriaService auditoriaService;

    @Value("${nexus.uploads.ordens-servico-dir:uploads/ordens-servico}")
    private String ordemServicoUploadDir;

    public OrdemServicoService(OrdemServicoRepository ordemServicoRepository,
                               EmpresaRepository empresaRepository,
                               FilialRepository filialRepository,
                               ClienteRepository clienteRepository,
                               UsuarioRepository usuarioRepository,
                               FinanceiroRepository financeiroRepository,
                               ProdutoRepository produtoRepository,
                               EstoqueService estoqueService,
                               AuditoriaService auditoriaService) {
        this.ordemServicoRepository = ordemServicoRepository;
        this.empresaRepository = empresaRepository;
        this.filialRepository = filialRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.financeiroRepository = financeiroRepository;
        this.produtoRepository = produtoRepository;
        this.estoqueService = estoqueService;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<OrdemServicoResponse> listar() {
        return ordemServicoRepository.findAllByOrderByCriadoEmDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrdemServicoResponse buscar(UUID id) {
        return toResponse(buscarOrdem(id));
    }

    @Transactional
    public OrdemServicoResponse criar(OrdemServicoRequest request) {
        validarRequest(request);
        OrdemServico ordem = new OrdemServico();
        aplicar(ordem, request);
        ordem.setNumero(gerarNumero());
        ordem.setStatus(request.getStatus() != null ? request.getStatus() : StatusOrdemServico.ABERTA);

        OrdemServico salva = ordemServicoRepository.save(ordem);
        auditoriaService.registrar("OrdemServico", "OS_CRIADA", "Ordem de servico criada: " + salva.getNumero(), salva.getId());
        return toResponse(salva);
    }

    @Transactional
    public OrdemServicoResponse atualizar(UUID id, OrdemServicoRequest request) {
        validarRequest(request);
        OrdemServico ordem = buscarOrdem(id);
        aplicar(ordem, request);
        if (request.getStatus() != null) {
            ordem.setStatus(request.getStatus());
            atualizarConclusao(ordem);
        }

        OrdemServico salva = ordemServicoRepository.save(ordem);
        auditoriaService.registrar("OrdemServico", "OS_EDITADA", "Ordem de servico atualizada: " + salva.getNumero(), salva.getId());
        return toResponse(salva);
    }

    @Transactional
    public OrdemServicoResponse atualizarStatus(UUID id, OrdemServicoStatusRequest request) {
        if (request == null || request.getStatus() == null) {
            throw new BusinessException("Status obrigatorio para ordem de servico.");
        }
        OrdemServico ordem = buscarOrdem(id);
        ordem.setStatus(request.getStatus());
        if (!isBlank(request.getObservacao())) {
            ordem.setObservacao(trim(request.getObservacao()));
        }
        atualizarConclusao(ordem);

        OrdemServico salva = ordemServicoRepository.save(ordem);
        auditoriaService.registrar("OrdemServico", "OS_STATUS", "Status da ordem de servico alterado para " + salva.getStatus(), salva.getId());
        return toResponse(salva);
    }

    @Transactional
    public OrdemServicoResponse faturar(UUID id) {
        OrdemServico ordem = buscarOrdem(id);
        if (ordem.getValorEstimado() == null || ordem.getValorEstimado().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Valor estimado da ordem de servico deve ser maior que zero para faturar.");
        }

        Financeiro financeiro = ordem.getFinanceiro() != null ? ordem.getFinanceiro() : new Financeiro();
        financeiro.setDataLancamento(financeiro.getDataLancamento() != null ? financeiro.getDataLancamento() : LocalDateTime.now());
        financeiro.setDataVencimento(financeiro.getDataVencimento() != null ? financeiro.getDataVencimento() : LocalDate.now());
        financeiro.setDescricao("Receita da OS " + ordem.getNumero() + " - " + ordem.getTitulo());
        financeiro.setTipo(TipoFinanceiro.RECEITA);
        financeiro.setCategoria("Servicos");
        financeiro.setValor(ordem.getValorEstimado());
        financeiro.setMetodoPagamento(financeiro.getMetodoPagamento() != null ? financeiro.getMetodoPagamento() : MetodoPagamento.PIX);
        financeiro.setStatus(StatusPagamento.PENDENTE);
        financeiro.setEmpresa(ordem.getEmpresa());
        financeiro.setFilial(ordem.getFilial());
        financeiro.setUsuario(ordem.getTecnico());
        financeiro.setObservacao("Lancamento automatico gerado pelo faturamento da OS " + ordem.getNumero() + ".");

        Financeiro salvoFinanceiro = financeiroRepository.save(financeiro);
        ordem.setFinanceiro(salvoFinanceiro);
        ordem.setStatus(StatusOrdemServico.FATURADA);
        atualizarConclusao(ordem);

        OrdemServico salva = ordemServicoRepository.save(ordem);
        auditoriaService.registrar("OrdemServico", "OS_FATURADA", "Ordem de servico faturada: " + salva.getNumero(), salva.getId());
        auditoriaService.registrar("Financeiro", "CRIAR_RECEITA_OS", "Receita gerada pela ordem de servico " + salva.getNumero(), salvoFinanceiro.getId());
        return toResponse(salva);
    }

    @Transactional
    public OrdemServicoResponse baixarPecas(UUID id) {
        OrdemServico ordem = buscarOrdem(id);
        if (Boolean.TRUE.equals(ordem.getPecasEstoqueBaixado())) {
            throw new BusinessException("Pecas da ordem de servico ja foram baixadas no estoque.");
        }
        int total = estoqueService.consumirPecasOrdemServico(ordem.getPecasUtilizadas(), ordem.getNumero());
        ordem.setPecasEstoqueBaixado(true);
        ordem.setPecasEstoqueBaixadoEm(LocalDateTime.now());

        OrdemServico salva = ordemServicoRepository.save(ordem);
        auditoriaService.registrar(
                "OrdemServico",
                "OS_BAIXA_PECAS",
                "Baixa de " + total + " peca(s) no estoque pela OS " + salva.getNumero(),
                salva.getId()
        );
        return toResponse(salva);
    }

    @Transactional
    public OrdemServicoResponse anexarArquivo(UUID id, MultipartFile file) {
        OrdemServico ordem = buscarOrdem(id);
        String link = armazenarArquivoOrdem(ordem, file, "anexo");
        adicionarAnexo(ordem, link);

        OrdemServico salva = ordemServicoRepository.save(ordem);
        auditoriaService.registrar("OrdemServico", "OS_ANEXO", "Anexo incluido na ordem de servico: " + salva.getNumero(), salva.getId());
        return toResponse(salva);
    }

    @Transactional
    public OrdemServicoResponse registrarAssinatura(UUID id,
                                                    MultipartFile file,
                                                    String nomeResponsavel,
                                                    String documentoResponsavel,
                                                    String observacao) {
        OrdemServico ordem = buscarOrdem(id);
        String link = armazenarArquivoOrdem(ordem, file, "assinatura");
        adicionarAnexo(ordem, link);
        ordem.setAssinaturaCliente(true);
        ordem.setAssinaturaClienteNome(trim(nomeResponsavel) != null ? trim(nomeResponsavel) : ordem.getAssinaturaClienteNome());
        ordem.setAssinaturaClienteDocumento(trim(documentoResponsavel) != null ? trim(documentoResponsavel) : ordem.getAssinaturaClienteDocumento());
        String observacaoAssinatura = trim(observacao);
        ordem.setAssinaturaClienteObservacao(observacaoAssinatura != null ? observacaoAssinatura : "Assinatura digitalizada anexada: " + link);
        ordem.setAssinaturaClienteRegistradaEm(LocalDateTime.now());

        OrdemServico salva = ordemServicoRepository.save(ordem);
        auditoriaService.registrar("OrdemServico", "OS_ASSINATURA", "Assinatura digitalizada registrada na ordem de servico: " + salva.getNumero(), salva.getId());
        return toResponse(salva);
    }

    @Transactional(readOnly = true)
    public Resource carregarAnexo(UUID id, String nomeArquivo) {
        buscarOrdem(id);
        String nomeLimpo = limparNomeArquivo(nomeArquivo);
        Path pastaOrdem = pastaAnexosOrdem(id);
        Path arquivo = pastaOrdem.resolve(nomeLimpo).normalize();
        if (!arquivo.startsWith(pastaOrdem) || !Files.exists(arquivo) || !Files.isRegularFile(arquivo)) {
            throw new BusinessException("Anexo da ordem de servico nao encontrado.");
        }
        try {
            Resource resource = new UrlResource(arquivo.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new BusinessException("Anexo da ordem de servico nao esta disponivel para leitura.");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new BusinessException("Anexo da ordem de servico invalido.");
        }
    }

    private void aplicar(OrdemServico ordem, OrdemServicoRequest request) {
        Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                .orElseThrow(() -> new BusinessException("Empresa da ordem de servico nao encontrada."));
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new BusinessException("Cliente da ordem de servico nao encontrado."));
        Filial filial = request.getFilialId() != null
                ? filialRepository.findById(request.getFilialId()).orElseThrow(() -> new BusinessException("Filial da ordem de servico nao encontrada."))
                : null;
        Usuario tecnico = request.getTecnicoId() != null
                ? usuarioRepository.findById(request.getTecnicoId()).orElseThrow(() -> new BusinessException("Tecnico da ordem de servico nao encontrado."))
                : null;

        if (filial != null && (filial.getEmpresa() == null || !empresa.getId().equals(filial.getEmpresa().getId()))) {
            throw new BusinessException("Filial nao pertence a empresa da ordem de servico.");
        }
        if (tecnico != null && tecnico.getEmpresa() != null && !empresa.getId().equals(tecnico.getEmpresa().getId())) {
            throw new BusinessException("Tecnico nao pertence a empresa da ordem de servico.");
        }

        ordem.setEmpresa(empresa);
        ordem.setFilial(filial);
        ordem.setCliente(cliente);
        ordem.setTecnico(tecnico);
        ordem.setTitulo(trim(request.getTitulo()));
        ordem.setDescricao(trim(request.getDescricao()));
        ordem.setChecklist(trim(request.getChecklist()));
        ordem.setPrazo(request.getPrazo());
        ordem.setValorEstimado(request.getValorEstimado());
        ordem.setTipoServico(trim(request.getTipoServico()));
        ordem.setContratoId(request.getContratoId());
        ordem.setGarantiaAte(request.getGarantiaAte());
        ordem.setGarantiaCoberta(Boolean.TRUE.equals(request.getGarantiaCoberta()));
        ordem.setRecorrente(Boolean.TRUE.equals(request.getRecorrente()));
        ordem.setRecorrenciaIntervaloMeses(Boolean.TRUE.equals(request.getRecorrente()) ? request.getRecorrenciaIntervaloMeses() : null);
        ordem.setProximaRecorrencia(Boolean.TRUE.equals(request.getRecorrente()) ? request.getProximaRecorrencia() : null);
        ordem.setPecasUtilizadas(trim(request.getPecasUtilizadas()));
        aplicarPecas(ordem, request.getPecas());
        ordem.setEvidencias(trim(request.getEvidencias()));
        ordem.setAnexos(trim(request.getAnexos()));
        aplicarAssinaturaCliente(ordem, request);
        ordem.setObservacao(trim(request.getObservacao()));
    }

    private void aplicarAssinaturaCliente(OrdemServico ordem, OrdemServicoRequest request) {
        boolean assinada = Boolean.TRUE.equals(request.getAssinaturaCliente());
        ordem.setAssinaturaCliente(assinada);
        if (!assinada) {
            ordem.setAssinaturaClienteNome(null);
            ordem.setAssinaturaClienteDocumento(null);
            ordem.setAssinaturaClienteObservacao(null);
            ordem.setAssinaturaClienteRegistradaEm(null);
            return;
        }

        ordem.setAssinaturaClienteNome(trim(request.getAssinaturaClienteNome()));
        ordem.setAssinaturaClienteDocumento(trim(request.getAssinaturaClienteDocumento()));
        ordem.setAssinaturaClienteObservacao(trim(request.getAssinaturaClienteObservacao()));
        if (ordem.getAssinaturaClienteRegistradaEm() == null) {
            ordem.setAssinaturaClienteRegistradaEm(LocalDateTime.now());
        }
    }

    private void aplicarPecas(OrdemServico ordem, List<OrdemServicoPecaRequest> pecasRequest) {
        ordem.getPecas().clear();
        if (pecasRequest == null || pecasRequest.isEmpty()) {
            return;
        }

        for (OrdemServicoPecaRequest item : pecasRequest) {
            if (item == null || item.getProdutoId() == null) {
                continue;
            }
            Produto produto = produtoRepository.findById(item.getProdutoId())
                    .orElseThrow(() -> new BusinessException("Produto da peca da ordem de servico nao encontrado."));
            OrdemServicoPeca peca = new OrdemServicoPeca();
            peca.setOrdemServico(ordem);
            peca.setProduto(produto);
            peca.setQuantidade(item.getQuantidade() == null ? 1 : item.getQuantidade());
            if (peca.getQuantidade() <= 0) {
                throw new BusinessException("Quantidade da peca da ordem de servico deve ser maior que zero.");
            }
            peca.setCustoUnitario(item.getCustoUnitario() != null ? item.getCustoUnitario() : produto.getPrecoCompra());
            peca.setValorUnitario(item.getValorUnitario() != null ? item.getValorUnitario() : produto.getPrecoVenda());
            ordem.getPecas().add(peca);
        }
    }

    private void validarRequest(OrdemServicoRequest request) {
        if (request == null) {
            throw new BusinessException("Dados da ordem de servico obrigatorios.");
        }
        if (request.getEmpresaId() == null) {
            throw new BusinessException("Empresa obrigatoria para ordem de servico.");
        }
        if (request.getClienteId() == null) {
            throw new BusinessException("Cliente obrigatorio para ordem de servico.");
        }
        if (isBlank(request.getTitulo())) {
            throw new BusinessException("Titulo obrigatorio para ordem de servico.");
        }
        if (Boolean.TRUE.equals(request.getRecorrente())
                && (request.getRecorrenciaIntervaloMeses() == null || request.getRecorrenciaIntervaloMeses() <= 0)) {
            throw new BusinessException("Intervalo de recorrencia obrigatorio para ordem de servico recorrente.");
        }
    }

    private OrdemServico buscarOrdem(UUID id) {
        if (id == null) {
            throw new BusinessException("Ordem de servico obrigatoria.");
        }
        return ordemServicoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Ordem de servico nao encontrada."));
    }

    private void atualizarConclusao(OrdemServico ordem) {
        if (StatusOrdemServico.CONCLUIDA.equals(ordem.getStatus())
                || StatusOrdemServico.FATURADA.equals(ordem.getStatus())) {
            if (ordem.getDataConclusao() == null) {
                ordem.setDataConclusao(LocalDateTime.now());
            }
            return;
        }
        ordem.setDataConclusao(null);
    }

    private String gerarNumero() {
        return "OS-" + LocalDateTime.now().format(NUMERO_FORMAT);
    }

    private OrdemServicoResponse toResponse(OrdemServico ordem) {
        return OrdemServicoResponse.builder()
                .id(ordem.getId())
                .numero(ordem.getNumero())
                .empresaId(ordem.getEmpresa() != null ? ordem.getEmpresa().getId() : null)
                .empresa(ordem.getEmpresa() != null ? ordem.getEmpresa().getNome() : null)
                .filialId(ordem.getFilial() != null ? ordem.getFilial().getId() : null)
                .filial(ordem.getFilial() != null ? ordem.getFilial().getNome() : null)
                .clienteId(ordem.getCliente() != null ? ordem.getCliente().getIdCliente() : null)
                .cliente(ordem.getCliente() != null ? ordem.getCliente().getNome() : null)
                .tecnicoId(ordem.getTecnico() != null ? ordem.getTecnico().getId() : null)
                .tecnico(ordem.getTecnico() != null ? ordem.getTecnico().getNome() : null)
                .financeiroId(ordem.getFinanceiro() != null ? ordem.getFinanceiro().getId() : null)
                .status(ordem.getStatus())
                .titulo(ordem.getTitulo())
                .descricao(ordem.getDescricao())
                .checklist(ordem.getChecklist())
                .dataAbertura(ordem.getDataAbertura())
                .prazo(ordem.getPrazo())
                .dataConclusao(ordem.getDataConclusao())
                .valorEstimado(ordem.getValorEstimado())
                .tipoServico(ordem.getTipoServico())
                .contratoId(ordem.getContratoId())
                .garantiaAte(ordem.getGarantiaAte())
                .garantiaCoberta(Boolean.TRUE.equals(ordem.getGarantiaCoberta()))
                .recorrente(Boolean.TRUE.equals(ordem.getRecorrente()))
                .recorrenciaIntervaloMeses(ordem.getRecorrenciaIntervaloMeses())
                .proximaRecorrencia(ordem.getProximaRecorrencia())
                .pecasUtilizadas(ordem.getPecasUtilizadas())
                .pecas(ordem.getPecas().stream().map(this::toPecaResponse).toList())
                .evidencias(ordem.getEvidencias())
                .anexos(ordem.getAnexos())
                .assinaturaCliente(Boolean.TRUE.equals(ordem.getAssinaturaCliente()))
                .assinaturaClienteNome(ordem.getAssinaturaClienteNome())
                .assinaturaClienteDocumento(ordem.getAssinaturaClienteDocumento())
                .assinaturaClienteObservacao(ordem.getAssinaturaClienteObservacao())
                .assinaturaClienteRegistradaEm(ordem.getAssinaturaClienteRegistradaEm())
                .pecasEstoqueBaixado(Boolean.TRUE.equals(ordem.getPecasEstoqueBaixado()))
                .pecasEstoqueBaixadoEm(ordem.getPecasEstoqueBaixadoEm())
                .observacao(ordem.getObservacao())
                .criadoEm(ordem.getCriadoEm())
                .atualizadoEm(ordem.getAtualizadoEm())
                .build();
    }

    private OrdemServicoPecaResponse toPecaResponse(OrdemServicoPeca peca) {
        Produto produto = peca.getProduto();
        BigDecimal quantidade = BigDecimal.valueOf(peca.getQuantidade() == null ? 0 : peca.getQuantidade());
        BigDecimal custoUnitario = peca.getCustoUnitario() != null ? peca.getCustoUnitario() : BigDecimal.ZERO;
        BigDecimal valorUnitario = peca.getValorUnitario() != null ? peca.getValorUnitario() : BigDecimal.ZERO;
        BigDecimal custoTotal = custoUnitario.multiply(quantidade);
        BigDecimal valorTotal = valorUnitario.multiply(quantidade);
        return OrdemServicoPecaResponse.builder()
                .id(peca.getId())
                .produtoId(produto != null ? produto.getIdProduto() : null)
                .produto(produto != null ? produto.getNomeProduto() : null)
                .sku(produto != null ? produto.getSku() : null)
                .codigoBarras(produto != null ? produto.getCodBarras() : null)
                .quantidade(peca.getQuantidade())
                .custoUnitario(custoUnitario)
                .valorUnitario(valorUnitario)
                .custoTotal(custoTotal)
                .valorTotal(valorTotal)
                .margem(valorTotal.subtract(custoTotal))
                .build();
    }

    private String trim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String armazenarArquivoOrdem(OrdemServico ordem, MultipartFile file, String prefixo) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Arquivo obrigatorio para anexar na ordem de servico.");
        }
        if (file.getSize() > TAMANHO_MAXIMO_ANEXO_BYTES) {
            throw new BusinessException("Anexo da ordem de servico nao pode ultrapassar 10 MB.");
        }

        String nomeOriginal = limparNomeArquivo(file.getOriginalFilename());
        String nomeArquivo = prefixo + "-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + UUID.randomUUID() + "-" + nomeOriginal;
        Path pastaOrdem = pastaAnexosOrdem(ordem.getId());
        try {
            Files.createDirectories(pastaOrdem);
            Path destino = pastaOrdem.resolve(nomeArquivo).normalize();
            if (!destino.startsWith(pastaOrdem)) {
                throw new BusinessException("Nome de arquivo invalido para anexo da ordem de servico.");
            }
            Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BusinessException("Nao foi possivel armazenar o anexo da ordem de servico.");
        }
        return "/ordens-servico/" + ordem.getId() + "/anexos/" + nomeArquivo;
    }

    private void adicionarAnexo(OrdemServico ordem, String link) {
        String anexos = anexarLinha(ordem.getAnexos(), link);
        if (anexos.length() > 3000) {
            throw new BusinessException("Limite de anexos da ordem de servico atingido.");
        }
        ordem.setAnexos(anexos);
    }

    private Path pastaAnexosOrdem(UUID ordemId) {
        return Path.of(ordemServicoUploadDir).toAbsolutePath().normalize().resolve(ordemId.toString()).normalize();
    }

    private String limparNomeArquivo(String nomeArquivo) {
        String nome = nomeArquivo == null || nomeArquivo.isBlank() ? "anexo" : Path.of(nomeArquivo).getFileName().toString();
        nome = nome.replaceAll("[^A-Za-z0-9._-]", "_");
        return nome.isBlank() ? "anexo" : nome;
    }

    private String anexarLinha(String atual, String novaLinha) {
        if (isBlank(atual)) {
            return novaLinha;
        }
        return atual.trim() + "\n" + novaLinha;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
