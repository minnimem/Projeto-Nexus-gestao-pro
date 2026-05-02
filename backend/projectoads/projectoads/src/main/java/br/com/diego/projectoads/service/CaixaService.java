package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.Perfil;
import br.com.diego.projectoads.config.Enum.StatusCaixa;
import br.com.diego.projectoads.config.Enum.TipoMovimentoCaixa;
import br.com.diego.projectoads.dto.*;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Caixa;
import br.com.diego.projectoads.model.Filial;
import br.com.diego.projectoads.model.MovimentoCaixa;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.CaixaRepository;
import br.com.diego.projectoads.repository.MovimentoCaixaRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CaixaService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final CaixaRepository caixaRepository;
    private final MovimentoCaixaRepository movimentoCaixaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public CaixaService(CaixaRepository caixaRepository,
                        MovimentoCaixaRepository movimentoCaixaRepository,
                        UsuarioRepository usuarioRepository,
                        AuditoriaService auditoriaService) {
        this.caixaRepository = caixaRepository;
        this.movimentoCaixaRepository = movimentoCaixaRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    public CaixaResponse abrir(CaixaAberturaRequest request) {
        Usuario usuario = usuarioAtual();
        validarOperadorCaixa(usuario);

        if (caixaRepository.existsByUsuarioAndStatus(usuario, StatusCaixa.ABERTO)) {
            throw new BusinessException("Usuario ja possui caixa aberto.");
        }

        Caixa caixa = new Caixa();
        caixa.setUsuario(usuario);
        caixa.setPerfil(usuario.getPerfil());
        caixa.setEmpresa(usuario.getEmpresa());
        caixa.setDataAbertura(LocalDateTime.now());
        caixa.setValorInicial(nvl(request.getValorInicial()));
        caixa.setStatus(StatusCaixa.ABERTO);
        caixa.setObservacao(normalizarTexto(request.getObservacao()));

        Caixa salvo = caixaRepository.save(caixa);
        registrarMovimento(
                salvo,
                TipoMovimentoCaixa.ABERTURA,
                salvo.getValorInicial(),
                "Abertura de caixa",
                request.getObservacao()
        );

        auditoriaService.registrar("Caixa", "ABRIR", "Caixa aberto", salvo.getId());
        return toResponse(salvo, true);
    }

    @Transactional(readOnly = true)
    public CaixaResponse aberto() {
        Usuario usuario = usuarioAtual();
        Optional<Caixa> caixa = podeVerTodosCaixas(usuario)
                ? usuario.getEmpresa() == null
                        ? Optional.empty()
                        : caixaRepository.findFirstByEmpresaAndStatusOrderByDataAberturaDesc(usuario.getEmpresa(), StatusCaixa.ABERTO)
                : caixaRepository.findFirstByUsuarioAndStatusOrderByDataAberturaDesc(usuario, StatusCaixa.ABERTO);

        return caixa.map(value -> toResponse(value, true)).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<CaixaResponse> listarRecentes() {
        Usuario usuario = usuarioAtual();

        if (!podeVerTodosCaixas(usuario)) {
            Caixa caixa = caixaRepository
                    .findFirstByUsuarioAndStatusOrderByDataAberturaDesc(usuario, StatusCaixa.ABERTO)
                    .orElse(null);
            return caixa == null ? List.of() : List.of(toResponse(caixa, false));
        }

        if (usuario.getEmpresa() == null) {
            return List.of();
        }

        return caixaRepository.findTop50ByEmpresaOrderByDataAberturaDesc(usuario.getEmpresa())
                .stream()
                .map(caixa -> toResponse(caixa, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public CaixaResponse resumo(UUID caixaId) {
        if (caixaId == null) {
            throw new BusinessException("ID do caixa e obrigatorio.");
        }

        Caixa caixa = caixaRepository.findById(caixaId)
                .orElseThrow(() -> new BusinessException("Caixa nao encontrado."));
        validarAcessoCaixa(caixa);
        return toResponse(caixa, true);
    }

    @Transactional
    public CaixaResponse suprimento(UUID caixaId, CaixaMovimentoRequest request) {
        Caixa caixa = buscarCaixaOperavel(caixaId);
        registrarMovimento(
                caixa,
                TipoMovimentoCaixa.SUPRIMENTO,
                request.getValor(),
                textoOuPadrao(request.getDescricao(), "Suprimento de caixa"),
                request.getObservacao()
        );

        auditoriaService.registrar("Caixa", "SUPRIMENTO", "Suprimento registrado", caixa.getId());
        return toResponse(caixa, true);
    }

    @Transactional
    public CaixaResponse sangria(UUID caixaId, CaixaMovimentoRequest request) {
        Caixa caixa = buscarCaixaOperavel(caixaId);
        BigDecimal saldo = calcularSaldo(caixa);

        if (request.getValor().compareTo(saldo) > 0) {
            throw new BusinessException("Valor da sangria nao pode ser maior que o saldo calculado.");
        }

        registrarMovimento(
                caixa,
                TipoMovimentoCaixa.SANGRIA,
                request.getValor(),
                textoOuPadrao(request.getDescricao(), "Sangria de caixa"),
                request.getObservacao()
        );

        auditoriaService.registrar("Caixa", "SANGRIA", "Sangria registrada", caixa.getId());
        return toResponse(caixa, true);
    }

    @Transactional
    public CaixaResponse pagamentoRecebido(UUID caixaId, CaixaMovimentoRequest request) {
        Caixa caixa = buscarCaixaOperavel(caixaId);
        MovimentoCaixa movimento = registrarMovimento(
                caixa,
                TipoMovimentoCaixa.PAGAMENTO_RECEBIDO,
                request.getValor(),
                textoOuPadrao(request.getDescricao(), "Pagamento recebido"),
                request.getObservacao()
        );
        movimento.setMetodoPagamento(request.getMetodoPagamento());
        movimento.setParcelas(normalizarParcelas(request.getMetodoPagamento(), request.getParcelas()));
        movimentoCaixaRepository.save(movimento);

        auditoriaService.registrar("Caixa", "PAGAMENTO_RECEBIDO", "Pagamento recebido no caixa", caixa.getId());
        return toResponse(caixa, true);
    }

    @Transactional
    public CaixaResponse fechar(UUID caixaId, CaixaFechamentoRequest request) {
        Caixa caixa = buscarCaixaOperavel(caixaId);
        Usuario usuario = usuarioAtual();
        BigDecimal saldoCalculado = calcularSaldo(caixa);
        BigDecimal valorFechamento = nvl(request.getValorFechamento());

        caixa.setDataFechamento(LocalDateTime.now());
        caixa.setValorFechamento(valorFechamento);
        caixa.setSaldoCalculado(saldoCalculado);
        caixa.setDivergencia(valorFechamento.subtract(saldoCalculado));
        caixa.setStatus(StatusCaixa.FECHADO);
        caixa.setObservacao(adicionarObservacao(caixa.getObservacao(), request.getObservacao()));

        registrarMovimento(
                caixa,
                TipoMovimentoCaixa.FECHAMENTO,
                valorFechamento,
                "Fechamento de caixa",
                request.getObservacao()
        );

        Caixa salvo = caixaRepository.save(caixa);
        auditoriaService.registrar("Caixa", "FECHAR", "Caixa fechado por " + usuario.getLogin(), salvo.getId());
        return toResponse(salvo, true);
    }

    @Transactional
    public void registrarVendaPedido(Pedido pedido, Usuario usuario) {
        registrarVendaPedido(pedido, usuario, null);
    }

    @Transactional
    public void registrarVendaPedido(Pedido pedido, Usuario usuario, String detalhesPagamento) {
        if (pedido == null || pedido.getId() == null) {
            throw new BusinessException("Pedido obrigatorio para registrar venda no caixa.");
        }

        if (usuario == null || usuario.getId() == null) {
            throw new BusinessException("Usuario obrigatorio para registrar venda no caixa.");
        }

        Caixa caixa = buscarCaixaAbertoParaVenda(usuario);

        if (movimentoCaixaRepository.existsByCaixaIdAndPedidoIdAndTipo(caixa.getId(), pedido.getId(), TipoMovimentoCaixa.VENDA)) {
            return;
        }

        MovimentoCaixa movimento = new MovimentoCaixa();
        movimento.setCaixa(caixa);
        movimento.setTipo(TipoMovimentoCaixa.VENDA);
        movimento.setValor(nvl(pedido.getValorTotalPedido()));
        movimento.setMetodoPagamento(pedido.getMetodoPagamento());
        movimento.setParcelas(normalizarParcelas(pedido.getMetodoPagamento(), pedido.getParcelasPagamento()));
        movimento.setPedido(pedido);
        movimento.setUsuario(usuario);
        movimento.setDescricao("Venda do pedido " + pedido.getNumero());
        movimento.setObservacao(criarObservacaoVenda(detalhesPagamento));
        movimentoCaixaRepository.save(movimento);

        auditoriaService.registrar("Caixa", "VENDA", "Venda registrada no caixa", pedido.getId());
    }

    private String criarObservacaoVenda(String detalhesPagamento) {
        String observacao = "Movimento automatico gerado pela finalizacao da venda.";
        if (detalhesPagamento == null || detalhesPagamento.isBlank()) {
            return observacao;
        }
        return observacao + " Pagamento misto: " + detalhesPagamento.trim();
    }

    private Caixa buscarCaixaAbertoParaVenda(Usuario usuario) {
        if (podeVerTodosCaixas(usuario) && usuario.getEmpresa() != null) {
            Optional<Caixa> caixaDaEmpresa = caixaRepository
                    .findFirstByEmpresaAndStatusOrderByDataAberturaDesc(usuario.getEmpresa(), StatusCaixa.ABERTO);

            if (caixaDaEmpresa.isPresent()) {
                return caixaDaEmpresa.get();
            }
        }

        Optional<Caixa> caixaDoUsuario = caixaRepository
                .findFirstByUsuarioAndStatusOrderByDataAberturaDesc(usuario, StatusCaixa.ABERTO);

        if (caixaDoUsuario.isPresent()) {
            return caixaDoUsuario.get();
        }

        if (podeVerTodosCaixas(usuario)) {
            throw new BusinessException("Abra um caixa para a empresa antes de finalizar vendas.");
        }

        throw new BusinessException("Abra um caixa antes de finalizar vendas.");
    }

    private Caixa buscarCaixaOperavel(UUID caixaId) {
        if (caixaId == null) {
            throw new BusinessException("ID do caixa e obrigatorio.");
        }

        Caixa caixa = caixaRepository.findById(caixaId)
                .orElseThrow(() -> new BusinessException("Caixa nao encontrado."));

        if (!StatusCaixa.ABERTO.equals(caixa.getStatus())) {
            throw new BusinessException("Caixa nao esta aberto.");
        }

        validarAcessoCaixa(caixa);
        return caixa;
    }

    private void validarAcessoCaixa(Caixa caixa) {
        Usuario usuario = usuarioAtual();

        if (podeVerTodosCaixas(usuario)) {
            if (usuario.getEmpresa() == null || caixa.getEmpresa() == null) {
                throw new BusinessException("Caixa sem empresa vinculada.");
            }
            if (!usuario.getEmpresa().getId().equals(caixa.getEmpresa().getId())) {
                throw new BusinessException("Caixa pertence a outra empresa.");
            }
            return;
        }

        if (caixa.getUsuario() == null || !caixa.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("Usuario sem permissao para operar este caixa.");
        }
    }

    private void validarOperadorCaixa(Usuario usuario) {
        if (usuario.getEmpresa() == null || usuario.getEmpresa().getId() == null) {
            throw new BusinessException("Usuario precisa estar vinculado a uma empresa para abrir caixa.");
        }

        if (Perfil.ESTOQUISTA.equals(usuario.getPerfil()) || Perfil.FINANCEIRO.equals(usuario.getPerfil())) {
            throw new BusinessException("Perfil sem permissao para abrir caixa.");
        }
    }

    private boolean podeVerTodosCaixas(Usuario usuario) {
        return Perfil.ADMIN.equals(usuario.getPerfil()) || Perfil.GERENTE.equals(usuario.getPerfil());
    }

    private MovimentoCaixa registrarMovimento(Caixa caixa,
                                              TipoMovimentoCaixa tipo,
                                              BigDecimal valor,
                                              String descricao,
                                              String observacao) {
        MovimentoCaixa movimento = new MovimentoCaixa();
        movimento.setCaixa(caixa);
        movimento.setTipo(tipo);
        movimento.setValor(nvl(valor));
        movimento.setDescricao(descricao);
        movimento.setUsuario(usuarioAtual());
        movimento.setObservacao(normalizarTexto(observacao));
        return movimentoCaixaRepository.save(movimento);
    }

    private BigDecimal calcularSaldo(Caixa caixa) {
        return nvl(caixa.getValorInicial())
                .add(total(caixa, TipoMovimentoCaixa.VENDA))
                .add(total(caixa, TipoMovimentoCaixa.PAGAMENTO_RECEBIDO))
                .add(total(caixa, TipoMovimentoCaixa.SUPRIMENTO))
                .subtract(total(caixa, TipoMovimentoCaixa.SANGRIA));
    }

    private BigDecimal total(Caixa caixa, TipoMovimentoCaixa tipo) {
        return caixa == null || caixa.getId() == null
                ? ZERO
                : nvl(movimentoCaixaRepository.somarPorCaixaETipo(caixa.getId(), tipo));
    }

    private CaixaResponse toResponse(Caixa caixa, boolean incluirMovimentos) {
        BigDecimal totalVendas = total(caixa, TipoMovimentoCaixa.VENDA);
        BigDecimal totalPagamentosRecebidos = total(caixa, TipoMovimentoCaixa.PAGAMENTO_RECEBIDO);
        BigDecimal totalSuprimentos = total(caixa, TipoMovimentoCaixa.SUPRIMENTO);
        BigDecimal totalSangrias = total(caixa, TipoMovimentoCaixa.SANGRIA);
        Filial filial = caixa.getUsuario() != null ? caixa.getUsuario().getFilial() : null;
        BigDecimal saldo = StatusCaixa.FECHADO.equals(caixa.getStatus()) && caixa.getSaldoCalculado() != null
                ? caixa.getSaldoCalculado()
                : nvl(caixa.getValorInicial()).add(totalVendas).add(totalPagamentosRecebidos).add(totalSuprimentos).subtract(totalSangrias);

        return CaixaResponse.builder()
                .id(caixa.getId())
                .usuarioId(caixa.getUsuario() != null ? caixa.getUsuario().getId() : null)
                .usuarioNome(caixa.getUsuario() != null ? caixa.getUsuario().getNome() : null)
                .usuarioLogin(caixa.getUsuario() != null ? caixa.getUsuario().getLogin() : null)
                .perfil(caixa.getPerfil())
                .empresaId(caixa.getEmpresa() != null ? caixa.getEmpresa().getId() : null)
                .empresaNome(caixa.getEmpresa() != null ? caixa.getEmpresa().getNome() : null)
                .filialId(filial != null ? filial.getId() : null)
                .filial(filial != null ? filial.getNome() : null)
                .dataAbertura(caixa.getDataAbertura())
                .dataFechamento(caixa.getDataFechamento())
                .valorInicial(nvl(caixa.getValorInicial()))
                .valorFechamento(caixa.getValorFechamento())
                .saldoCalculado(saldo)
                .totalVendas(totalVendas)
                .totalPagamentosRecebidos(totalPagamentosRecebidos)
                .totalSuprimentos(totalSuprimentos)
                .totalSangrias(totalSangrias)
                .divergencia(caixa.getDivergencia())
                .status(caixa.getStatus())
                .observacao(caixa.getObservacao())
                .movimentos(incluirMovimentos ? movimentos(caixa) : List.of())
                .build();
    }

    private List<MovimentoCaixaResponse> movimentos(Caixa caixa) {
        return movimentoCaixaRepository.findByCaixaOrderByDataMovimentoDesc(caixa)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private MovimentoCaixaResponse toResponse(MovimentoCaixa movimento) {
        return MovimentoCaixaResponse.builder()
                .id(movimento.getId())
                .tipo(movimento.getTipo())
                .dataMovimento(movimento.getDataMovimento())
                .valor(movimento.getValor())
                .metodoPagamento(movimento.getMetodoPagamento())
                .parcelas(movimento.getParcelas())
                .pedidoId(movimento.getPedido() != null ? movimento.getPedido().getId() : null)
                .usuarioId(movimento.getUsuario() != null ? movimento.getUsuario().getId() : null)
                .usuarioNome(movimento.getUsuario() != null ? movimento.getUsuario().getNome() : null)
                .descricao(movimento.getDescricao())
                .observacao(movimento.getObservacao())
                .build();
    }

    private Usuario usuarioAtual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BusinessException("Usuario autenticado nao encontrado.");
        }

        return usuarioRepository.findByLoginIgnoreCase(authentication.getName())
                .orElseThrow(() -> new BusinessException("Usuario autenticado nao encontrado."));
    }

    private BigDecimal nvl(BigDecimal valor) {
        return valor != null ? valor : ZERO;
    }

    private String normalizarTexto(String valor) {
        return valor == null || valor.trim().isEmpty() ? null : valor.trim();
    }

    private String textoOuPadrao(String valor, String padrao) {
        String texto = normalizarTexto(valor);
        return texto != null ? texto : padrao;
    }

    private Integer normalizarParcelas(br.com.diego.projectoads.config.Enum.MetodoPagamento metodoPagamento, Integer parcelas) {
        if (br.com.diego.projectoads.config.Enum.MetodoPagamento.CARTAO_CREDITO.equals(metodoPagamento) ||
                br.com.diego.projectoads.config.Enum.MetodoPagamento.BOLETO.equals(metodoPagamento)) {
            int valor = parcelas != null ? parcelas : 1;
            return Math.max(1, Math.min(valor, 12));
        }

        return 1;
    }

    private String adicionarObservacao(String atual, String nova) {
        String texto = normalizarTexto(nova);
        if (texto == null) {
            return atual;
        }

        if (atual == null || atual.isBlank()) {
            return texto;
        }

        return atual + " | " + texto;
    }
}
