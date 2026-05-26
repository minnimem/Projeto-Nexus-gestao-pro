package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.PrioridadeEntrega;
import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusEntrega;
import br.com.diego.projectoads.config.Enum.StatusPedido;
import br.com.diego.projectoads.config.Enum.TipoEntrega;
import br.com.diego.projectoads.dto.FinanceiroResponse;
import br.com.diego.projectoads.dto.ItemPedidoRequest;
import br.com.diego.projectoads.dto.PedidoFinalizacaoRequest;
import br.com.diego.projectoads.dto.PedidoRequest;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.model.Entrega;
import br.com.diego.projectoads.model.Filial;
import br.com.diego.projectoads.model.ItemPedido;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.model.Produto;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.ClienteRepository;
import br.com.diego.projectoads.repository.EntregaRepository;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.ItemPedidoRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import br.com.diego.projectoads.repository.ProdutoRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PedidoService {

    private static final StatusPedido STATUS_VENDA_FINALIZADA = StatusPedido.FINALIZADA;
    private static final List<StatusPedido> STATUS_VENDAS_CONTABILIZADAS = List.of(
            StatusPedido.FINALIZADA,
            StatusPedido.RECEBIDO,
            StatusPedido.ENTREGUE,
            StatusPedido.CONCLUIDO
    );

    private final PedidoRepository pedidoRepository;
    private final ItemPedidoRepository itemPedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final EntregaRepository entregaRepository;
    private final FilialRepository filialRepository;
    private final EstoqueService estoqueService;
    private final FinanceiroService financeiroService;
    private final CaixaService caixaService;
    private final AuditoriaService auditoriaService;

    public PedidoService(
            PedidoRepository pedidoRepository,
            ItemPedidoRepository itemPedidoRepository,
            ProdutoRepository produtoRepository,
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository,
            EntregaRepository entregaRepository,
            FilialRepository filialRepository,
            EstoqueService estoqueService,
            FinanceiroService financeiroService,
            CaixaService caixaService,
            AuditoriaService auditoriaService
    ) {
        this.pedidoRepository = pedidoRepository;
        this.itemPedidoRepository = itemPedidoRepository;
        this.produtoRepository = produtoRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.entregaRepository = entregaRepository;
        this.filialRepository = filialRepository;
        this.estoqueService = estoqueService;
        this.financeiroService = financeiroService;
        this.caixaService = caixaService;
        this.auditoriaService = auditoriaService;
    }

    public Map<String, Object> getDashboard(LocalDate inicio, LocalDate fim) {
        UUID empresaId = empresaAtualId(usuarioAtual());

        if (inicio == null) inicio = LocalDate.now().minusDays(30);
        if (fim == null) fim = LocalDate.now();

        LocalDateTime inicioDateTime = inicio.atStartOfDay();
        LocalDateTime fimDateTime = fim.atTime(23, 59, 59);

        Map<String, Object> dados = new LinkedHashMap<>();
        Long totalVendas = Optional.ofNullable(
                pedidoRepository.totalPedidosConcluidosPorEmpresa(empresaId, STATUS_VENDAS_CONTABILIZADAS, inicioDateTime, fimDateTime)
        ).orElse(0L);

        Long pedidosPendentes = pedidoRepository.countByEmpresaIdAndStatus(empresaId, StatusPedido.PENDENTE);
        Long orcamentos = pedidoRepository.countByEmpresaIdAndStatus(empresaId, StatusPedido.ORCAMENTO);
        Long pedidosEmSeparacao = pedidoRepository.countByEmpresaIdAndStatus(empresaId, StatusPedido.SEPARACAO);
        Long pedidosSeparados = pedidoRepository.countByEmpresaIdAndStatus(empresaId, StatusPedido.SEPARADO);

        BigDecimal receitaTotal = Optional.ofNullable(
                pedidoRepository.receitaPorEmpresaPeriodo(empresaId, STATUS_VENDAS_CONTABILIZADAS, inicioDateTime, fimDateTime)
        ).orElse(BigDecimal.ZERO);

        BigDecimal vendasHoje = Optional.ofNullable(
                pedidoRepository.vendasHojePorEmpresa(empresaId, STATUS_VENDAS_CONTABILIZADAS)
        ).orElse(BigDecimal.ZERO);

        BigDecimal ticketMedio = totalVendas > 0
                ? receitaTotal.divide(BigDecimal.valueOf(totalVendas), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal receitaAnterior = Optional.ofNullable(
                pedidoRepository.receitaPorEmpresaPeriodo(
                        empresaId,
                        STATUS_VENDAS_CONTABILIZADAS,
                        inicioDateTime.minusDays(30),
                        fimDateTime.minusDays(30)
                )
        ).orElse(BigDecimal.ZERO);

        BigDecimal crescimento = calcularCrescimento(receitaTotal, receitaAnterior);

        dados.put("totalVendas", totalVendas);
        dados.put("pedidosPendentes", pedidosPendentes);
        dados.put("pedidosEmSeparacao", pedidosEmSeparacao);
        dados.put("pedidosSeparados", pedidosSeparados);
        dados.put("orcamentos", orcamentos);
        dados.put("receitaTotal", receitaTotal);
        dados.put("vendasHoje", vendasHoje);
        dados.put("ticketMedio", ticketMedio);
        dados.put("crescimento", crescimento);

        List<Map<String, Object>> vendasPorDia = pedidoRepository
                .vendasPorDiaPorEmpresa(empresaId, STATUS_VENDAS_CONTABILIZADAS, inicioDateTime, fimDateTime)
                .stream()
                .map(obj -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("data", obj[0].toString());
                    item.put("total", obj[1] != null ? obj[1] : BigDecimal.ZERO);
                    return item;
                })
                .toList();

        dados.put("vendasPorDia", vendasPorDia);

        List<Map<String, Object>> rankingProdutos = pedidoRepository
                .rankingProdutosPorEmpresa(empresaId, STATUS_VENDAS_CONTABILIZADAS, inicioDateTime, fimDateTime, PageRequest.of(0, 5))
                .stream()
                .map(obj -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("produto", obj[0]);
                    item.put("quantidade", obj[1]);
                    item.put("valorTotal", obj[2]);
                    return item;
                })
                .toList();

        dados.put("rankingProdutos", rankingProdutos);

        List<Map<String, Object>> ultimosPedidos = pedidoRepository
                .findTop10ByEmpresaIdOrderByDataPedidoDesc(empresaId)
                .stream()
                .map(p -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", p.getId());
                    item.put("cliente", p.getCliente() != null ? p.getCliente().getNome() : "N/A");
                    item.put("data", p.getDataPedido() != null ? p.getDataPedido().toString() : "");
                    item.put("valor", p.getValorTotalPedido() != null ? p.getValorTotalPedido() : BigDecimal.ZERO);
                    item.put("status", p.getStatus() != null ? p.getStatus().name() : "");
                    return item;
                })
                .toList();

        dados.put("ultimosPedidos", ultimosPedidos);

        return dados;
    }

    public Map<String, Object> getDashboardUsuario(UUID usuarioId, LocalDate inicio, LocalDate fim) {
        UUID empresaId = empresaAtualId(usuarioAtual());
        validarUsuarioDaEmpresa(usuarioId, empresaId);

        if (inicio == null) inicio = LocalDate.now().minusDays(30);
        if (fim == null) fim = LocalDate.now();

        LocalDateTime inicioDateTime = inicio.atStartOfDay();
        LocalDateTime fimDateTime = fim.atTime(23, 59, 59);

        Map<String, Object> dados = new LinkedHashMap<>();
        Long totalPedidos = Optional.ofNullable(
                pedidoRepository.totalPedidosPorUsuarioEmpresa(empresaId, usuarioId, STATUS_VENDAS_CONTABILIZADAS, inicioDateTime, fimDateTime)
        ).orElse(0L);

        BigDecimal receita = Optional.ofNullable(
                pedidoRepository.receitaPorUsuarioEmpresa(empresaId, usuarioId, STATUS_VENDAS_CONTABILIZADAS, inicioDateTime, fimDateTime)
        ).orElse(BigDecimal.ZERO);

        BigDecimal ticketMedio = totalPedidos > 0
                ? receita.divide(BigDecimal.valueOf(totalPedidos), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        dados.put("usuarioId", usuarioId);
        dados.put("totalPedidos", totalPedidos);
        dados.put("receita", receita);
        dados.put("ticketMedio", ticketMedio);

        List<Map<String, Object>> vendasPorDia = pedidoRepository
                .vendasPorDiaUsuarioPorEmpresa(empresaId, usuarioId, STATUS_VENDAS_CONTABILIZADAS, inicioDateTime, fimDateTime)
                .stream()
                .map(obj -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("data", obj[0].toString());
                    item.put("total", obj[1] != null ? obj[1] : BigDecimal.ZERO);
                    return item;
                })
                .toList();

        dados.put("vendasPorDia", vendasPorDia);

        BigDecimal receitaAnterior = Optional.ofNullable(
                pedidoRepository.receitaPorUsuarioEmpresa(
                        empresaId,
                        usuarioId,
                        STATUS_VENDAS_CONTABILIZADAS,
                        inicioDateTime.minusDays(30),
                        fimDateTime.minusDays(30)
                )
        ).orElse(BigDecimal.ZERO);

        dados.put("crescimento", calcularCrescimento(receita, receitaAnterior));

        return dados;
    }

    public List<Pedido> listar() {
        UUID empresaId = empresaAtualId(usuarioAtual());
        return pedidoRepository.findAllWithDetailsByEmpresaId(empresaId);
    }

    public Pedido buscar(UUID id) {
        UUID empresaId = empresaAtualId(usuarioAtual());
        return pedidoRepository.findDetailedByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new BusinessException("Pedido não encontrado"));
    }

    public List<ItemPedido> listarItens(UUID id) {
        return itemPedidoRepository.findByPedidoIdWithProduto(id);
    }

    @Transactional
    public Pedido criarPedido(PedidoRequest req) {

        if (req.getClienteId() == null) {
            throw new BusinessException("Cliente obrigatorio");
        }

        if (req.getUsuarioId() == null) {
            throw new BusinessException("Usuario obrigatorio");
        }

        if (req.getItens() == null || req.getItens().isEmpty()) {
            throw new BusinessException("Pedido sem itens");
        }

        Cliente cliente = clienteRepository.findById(req.getClienteId())
                .orElseThrow(() -> new BusinessException("Cliente nao encontrado"));

        Usuario usuario = usuarioRepository.findById(req.getUsuarioId())
                .orElseThrow(() -> new BusinessException("Usuario nao encontrado"));

        if (usuario.getEmpresa() == null || usuario.getEmpresa().getId() == null) {
            throw new BusinessException("Usuario sem empresa vinculada");
        }

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setUsuario(usuario);
        pedido.setEmpresa(usuario.getEmpresa());
        pedido.setFilial(resolverFilial(req.getFilialId(), usuario));
        MetodoPagamento metodoPagamento = req.getMetodoPagamento() != null ? req.getMetodoPagamento() : MetodoPagamento.PIX;
        pedido.setMetodoPagamento(metodoPagamento);
        pedido.setParcelasPagamento(normalizarParcelas(metodoPagamento, req.getParcelas()));
        boolean isOrcamento = Boolean.TRUE.equals(req.getOrcamento());
        pedido.setStatus(isOrcamento ? StatusPedido.ORCAMENTO : StatusPedido.PENDENTE);
        pedido.setDataPedido(LocalDateTime.now());
        pedido.setTipoEntrega(req.getTipoEntrega() != null ? req.getTipoEntrega() : TipoEntrega.RETIRADA_LOJA);
        pedido.setEnderecoEntrega(normalizarTexto(req.getEnderecoEntrega()));
        pedido.setObservacaoEntrega(normalizarTexto(req.getObservacaoEntrega()));
        pedido.setValidadeProposta(isOrcamento
                ? Optional.ofNullable(req.getValidadeProposta()).orElse(LocalDate.now().plusDays(7))
                : null);
        pedido.setCondicoesComerciais(isOrcamento ? normalizarTexto(req.getCondicoesComerciais()) : null);

        // 🔥 PRIORIDADE
        pedido.setPrioridade(
                req.getPrioridade() != null ? req.getPrioridade() : PrioridadeEntrega.NORMAL
        );

        // =========================
        // 📦 ITENS
        // =========================
        for (ItemPedidoRequest itemReq : req.getItens()) {

            if (itemReq.getProdutoId() == null) {
                throw new BusinessException("Produto obrigatorio no item do pedido");
            }

            if (itemReq.getQuantidade() == null || itemReq.getQuantidade() <= 0) {
                throw new BusinessException("Quantidade invalida");
            }

            Produto produto = produtoRepository.findById(itemReq.getProdutoId())
                    .orElseThrow(() -> new BusinessException("Produto nao encontrado"));

            if (!produto.isAtivo()) {
                throw new BusinessException("Produto inativo: " + produto.getNomeProduto());
            }

            if (!isOrcamento) {
                estoqueService.validarDisponibilidade(produto.getIdProduto(), itemReq.getQuantidade());
            }

            ItemPedido item = new ItemPedido();
            item.setProduto(produto);
            item.setQuantidade(itemReq.getQuantidade());
            item.setPrecoUnit(produto.calcularPrecoComDesconto());

            pedido.adicionarItem(item);
        }

        // =========================
        // 💰 TOTAL
        // =========================
        pedido.calcularTotal();

        // =========================
        // 🔥 DESCONTO (PROFISSIONAL)
        // =========================
        BigDecimal desconto = req.getDesconto() != null
                ? req.getDesconto()
                : BigDecimal.ZERO;

        if (desconto.compareTo(BigDecimal.ZERO) > 0) {

            if (desconto.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new BusinessException("Desconto nao pode ser maior que 100%");
            }

            BigDecimal percentual = desconto
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            BigDecimal descontoValor = pedido.getValorTotalPedido().multiply(percentual);

            pedido.setValorTotalPedido(
                    pedido.getValorTotalPedido()
                            .subtract(descontoValor)
                            .setScale(2, RoundingMode.HALF_UP)
            );
        }

        // =========================
        // 📦 BAIXA DE ESTOQUE
        // =========================
        // A baixa de estoque acontece somente quando o caixa recebe o pagamento.

        // =========================
        // 💾 SALVAR
        // =========================
        Pedido salvo = pedidoRepository.save(pedido);
        if (!isOrcamento) {
            registrarEntregaSeNecessario(salvo);
        }
        auditoriaService.registrar(
                "Vendas",
                isOrcamento ? "ORCAMENTO_CRIADO" : "VENDA_AGUARDANDO_CAIXA",
                isOrcamento
                        ? "Orcamento registrado no valor " + salvo.getValorTotalPedido()
                        : "Venda registrada pelo vendedor aguardando recebimento no caixa no valor " + salvo.getValorTotalPedido(),
                salvo.getId()
        );

        return salvo;
    }

    @Transactional
    public Pedido atualizar(UUID id, Pedido pedido) {
        Pedido existente = buscar(id);

        existente.setCliente(pedido.getCliente());
        existente.setStatus(pedido.getStatus());

        if (pedido.getItens() != null) {
            if (pedido.getItens().isEmpty()) {
                throw new BusinessException("Pedido nao pode ficar sem itens.");
            }

            existente.getItens().clear();

            for (ItemPedido item : pedido.getItens()) {
                if (item.getProduto() == null || item.getProduto().getIdProduto() == null) {
                    throw new BusinessException("Produto obrigatorio na atualizacao do pedido.");
                }

                if (item.getQuantidade() == null || item.getQuantidade() <= 0) {
                    throw new BusinessException("Quantidade invalida na atualizacao do pedido.");
                }

                existente.adicionarItem(item);
            }

            existente.calcularTotal();
        }

        return pedidoRepository.save(existente);
    }

    @Transactional
    public Pedido finalizar(UUID id) {
        return finalizar(id, null);
    }

    @Transactional
    public FinanceiroResponse gerarCobranca(UUID id, PedidoFinalizacaoRequest request) {
        Pedido pedido = buscar(id);

        if (pedido.getItens() == null || pedido.getItens().isEmpty()) {
            throw new BusinessException("Pedido sem itens nao pode gerar cobranca.");
        }

        if (!StatusPedido.PENDENTE.equals(pedido.getStatus()) && !StatusPedido.SEPARADO.equals(pedido.getStatus())) {
            throw new BusinessException("Cobranca disponivel apenas para pedidos pendentes ou separados.");
        }

        MetodoPagamento metodoPagamento = request != null && request.getMetodoPagamento() != null
                ? request.getMetodoPagamento()
                : pedido.getMetodoPagamento();

        pedido.setMetodoPagamento(metodoPagamento != null ? metodoPagamento : MetodoPagamento.PIX);
        pedido.setParcelasPagamento(normalizarParcelas(
                pedido.getMetodoPagamento(),
                request != null ? request.getParcelas() : pedido.getParcelasPagamento()
        ));
        Pedido salvo = pedidoRepository.save(pedido);

        return financeiroService.gerarCobrancaPedido(salvo, salvo.getMetodoPagamento(), usuarioAtual());
    }

    @Transactional
    public Pedido iniciarSeparacao(UUID id) {
        Pedido pedido = buscar(id);

        if (!StatusPedido.PENDENTE.equals(pedido.getStatus()) && !StatusPedido.RECEBIDO.equals(pedido.getStatus())) {
            throw new BusinessException("Somente pedidos pendentes ou recebidos pelo caixa podem iniciar separacao.");
        }

        if (pedido.getItens() == null || pedido.getItens().isEmpty()) {
            throw new BusinessException("Pedido sem itens nao pode entrar em separacao.");
        }

        pedido.setStatus(StatusPedido.SEPARACAO);
        Pedido salvo = pedidoRepository.save(pedido);
        auditoriaService.registrar(
                "Vendas",
                "SEPARACAO_INICIADA",
                "Separacao iniciada para o pedido " + salvo.getNumero(),
                salvo.getId()
        );
        return salvo;
    }

    @Transactional
    public Pedido concluirSeparacao(UUID id) {
        Pedido pedido = buscar(id);

        if (!StatusPedido.SEPARACAO.equals(pedido.getStatus())) {
            throw new BusinessException("Somente pedidos em separacao podem ser marcados como separados.");
        }

        boolean retiradaNaLoja = TipoEntrega.RETIRADA_LOJA.equals(pedido.getTipoEntrega());
        if (retiradaNaLoja) {
            baixarEstoque(pedido);
            pedido.setStatus(StatusPedido.CONCLUIDO);
        } else {
            pedido.setStatus(StatusPedido.SEPARADO);
        }
        Pedido salvo = pedidoRepository.save(pedido);
        auditoriaService.registrar(
                "Vendas",
                retiradaNaLoja ? "RETIRADA_ESTOQUE_CONCLUIDA" : "SEPARACAO_CONCLUIDA",
                retiradaNaLoja
                        ? "Produto retirado no estoque para o pedido " + salvo.getNumero()
                        : "Pedido " + salvo.getNumero() + " separado e pronto para recebimento.",
                salvo.getId()
        );
        return salvo;
    }

    @Transactional
    public Pedido converterOrcamento(UUID id) {
        Pedido pedido = buscar(id);

        if (!StatusPedido.ORCAMENTO.equals(pedido.getStatus())) {
            throw new BusinessException("Somente orcamentos podem ser convertidos em pedido.");
        }

        if (pedido.getItens() == null || pedido.getItens().isEmpty()) {
            throw new BusinessException("Orcamento sem itens nao pode ser convertido.");
        }

        pedido.setStatus(StatusPedido.PENDENTE);
        Pedido salvo = pedidoRepository.save(pedido);
        registrarEntregaSeNecessario(salvo);
        auditoriaService.registrar(
                "Vendas",
                "ORCAMENTO_CONVERTIDO",
                "Orcamento convertido em pedido aguardando recebimento no caixa.",
                salvo.getId()
        );
        return salvo;
    }

    @Transactional
    public Pedido finalizar(UUID id, PedidoFinalizacaoRequest request) {
        Pedido pedido = buscar(id);

        if (pedido.getItens() == null || pedido.getItens().isEmpty()) {
            throw new BusinessException("Pedido sem itens cadastrados nao pode ser finalizado.");
        }

        if (StatusPedido.CANCELADO.equals(pedido.getStatus()) || StatusPedido.CANCELADA.equals(pedido.getStatus())) {
            throw new BusinessException("Pedido cancelado nao pode ser finalizado");
        }

        if (STATUS_VENDA_FINALIZADA.equals(pedido.getStatus())) {
            caixaService.registrarVendaPedido(pedido, usuarioAtual());
            return pedido;
        }

        if (TipoEntrega.RETIRADA_LOJA.equals(pedido.getTipoEntrega())
                && (StatusPedido.RECEBIDO.equals(pedido.getStatus())
                || StatusPedido.SEPARACAO.equals(pedido.getStatus())
                || StatusPedido.CONCLUIDO.equals(pedido.getStatus()))) {
            caixaService.registrarVendaPedido(pedido, usuarioAtual());
            return pedido;
        }

        Usuario operadorCaixa = usuarioAtual();
        MetodoPagamento metodoPagamento = request != null && request.getMetodoPagamento() != null
                ? request.getMetodoPagamento()
                : pedido.getMetodoPagamento();

        String detalhesPagamento = request != null ? normalizarTexto(request.getDetalhesPagamento()) : null;
        MetodoPagamento metodoPersistido = metodoPagamentoParaPersistir(metodoPagamento, detalhesPagamento);

        pedido.setMetodoPagamento(metodoPersistido);
        pedido.setParcelasPagamento(normalizarParcelas(metodoPersistido, request != null ? request.getParcelas() : pedido.getParcelasPagamento()));

        boolean retiradaNaLoja = TipoEntrega.RETIRADA_LOJA.equals(pedido.getTipoEntrega());
        pedido.setStatus(retiradaNaLoja ? StatusPedido.RECEBIDO : STATUS_VENDA_FINALIZADA);
        Pedido salvo = pedidoRepository.save(pedido);

        if (!retiradaNaLoja) {
            baixarEstoque(salvo);
        }
        registrarReceitaPedido(salvo, operadorCaixa, detalhesPagamento);
        caixaService.registrarVendaPedido(salvo, operadorCaixa, detalhesPagamento);
        registrarEntregaSeNecessario(salvo);
        auditoriaService.registrar(
                "Vendas",
                retiradaNaLoja ? "VENDA_RECEBIDA_AGUARDANDO_ESTOQUE" : "VENDA_FINALIZADA",
                retiradaNaLoja
                        ? "Venda recebida pelo caixa e enviada para retirada no estoque no valor " + salvo.getValorTotalPedido()
                        : "Venda recebida pelo caixa no valor " + salvo.getValorTotalPedido(),
                salvo.getId()
        );
        return salvo;
    }

    @Transactional
    public Pedido cancelarInconsistente(UUID id) {
        Pedido pedido = buscar(id);

        if (pedido.getItens() != null && !pedido.getItens().isEmpty()) {
            throw new BusinessException("Somente pedidos sem itens podem ser cancelados por esta acao.");
        }

        if (StatusPedido.CANCELADO.equals(pedido.getStatus()) || StatusPedido.CANCELADA.equals(pedido.getStatus())) {
            return pedido;
        }

        pedido.setStatus(StatusPedido.CANCELADO);
        Pedido salvo = pedidoRepository.save(pedido);
        auditoriaService.registrar(
                "Vendas",
                "PEDIDO_INCONSISTENTE_CANCELADO",
                "Pedido sem itens cancelado administrativamente: " + (salvo.getNumero() != null ? salvo.getNumero() : salvo.getId()),
                salvo.getId()
        );
        return salvo;
    }

    @Transactional
    public int cancelarInconsistentes(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new BusinessException("Informe ao menos um pedido para cancelamento em lote.");
        }

        int cancelados = 0;
        Set<UUID> unicos = new LinkedHashSet<>(ids);
        for (UUID id : unicos) {
            if (id == null) {
                continue;
            }
            cancelarInconsistente(id);
            cancelados++;
        }

        if (cancelados == 0) {
            throw new BusinessException("Nenhum pedido valido foi enviado para cancelamento.");
        }

        return cancelados;
    }

    private Usuario usuarioAtual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BusinessException("Usuario autenticado nao encontrado.");
        }

        return usuarioRepository.findByLoginIgnoreCase(authentication.getName())
                .orElseThrow(() -> new BusinessException("Usuario autenticado nao encontrado."));
    }

    private UUID empresaAtualId(Usuario usuario) {
        UUID empresaId = usuario != null && usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null;
        if (empresaId == null) {
            throw new BusinessException("Usuario sem empresa vinculada.");
        }
        return empresaId;
    }

    private void validarUsuarioDaEmpresa(UUID usuarioId, UUID empresaId) {
        if (usuarioId == null) {
            throw new BusinessException("Usuario obrigatorio para dashboard.");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new BusinessException("Usuario nao encontrado."));
        UUID empresaUsuarioId = usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null;
        if (empresaUsuarioId == null || !empresaUsuarioId.equals(empresaId)) {
            throw new BusinessException("Usuario nao pertence a empresa autenticada.");
        }
    }

    private String normalizarTexto(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private Filial resolverFilial(UUID filialId, Usuario usuario) {
        if (filialId == null) {
            return usuario != null ? usuario.getFilial() : null;
        }

        Filial filial = filialRepository.findById(filialId)
                .orElseThrow(() -> new BusinessException("Filial nao encontrada"));

        UUID empresaUsuarioId = usuario != null && usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null;
        UUID empresaFilialId = filial.getEmpresa() != null ? filial.getEmpresa().getId() : null;
        if (empresaUsuarioId == null || !empresaUsuarioId.equals(empresaFilialId)) {
            throw new BusinessException("Filial nao pertence a empresa do pedido");
        }

        return filial;
    }

    private void baixarEstoque(Pedido pedido) {
        for (ItemPedido item : pedido.getItens()) {
            estoqueService.retirar(
                    item.getProduto().getIdProduto(),
                    item.getQuantidade()
            );
        }
    }

    private void registrarReceitaPedido(Pedido pedido, Usuario usuario, String detalhesPagamento) {
        financeiroService.registrarReceitaPedido(
                pedido,
                pedido.getMetodoPagamento() != null ? pedido.getMetodoPagamento() : MetodoPagamento.PIX,
                pedido.getValorTotalPedido(),
                usuario,
                detalhesPagamento
        );
    }

    private Integer normalizarParcelas(MetodoPagamento metodoPagamento, Integer parcelas) {
        if (MetodoPagamento.CARTAO_CREDITO.equals(metodoPagamento) || MetodoPagamento.BOLETO.equals(metodoPagamento)) {
            int valor = parcelas != null ? parcelas : 1;
            return Math.max(1, Math.min(valor, 12));
        }

        return 1;
    }

    private MetodoPagamento metodoPagamentoParaPersistir(MetodoPagamento metodoPagamento, String detalhesPagamento) {
        if (metodoPagamento == null) {
            return MetodoPagamento.PIX;
        }

        if (!MetodoPagamento.MISTO.equals(metodoPagamento)) {
            return metodoPagamento;
        }

        MetodoPagamento metodoDetalhado = metodoPagamentoPeloPrimeiroDetalhe(detalhesPagamento);
        return metodoDetalhado != null ? metodoDetalhado : MetodoPagamento.PIX;
    }

    private MetodoPagamento metodoPagamentoPeloPrimeiroDetalhe(String detalhesPagamento) {
        String detalhes = detalhesPagamento != null ? detalhesPagamento.toLowerCase() : "";
        MetodoPagamento metodo = null;
        int menorIndice = Integer.MAX_VALUE;

        int indicePix = detalhes.indexOf("pix:");
        if (indicePix >= 0) {
            menorIndice = indicePix;
            metodo = MetodoPagamento.PIX;
        }

        int indiceDinheiro = detalhes.indexOf("dinheiro:");
        if (indiceDinheiro >= 0 && indiceDinheiro < menorIndice) {
            menorIndice = indiceDinheiro;
            metodo = MetodoPagamento.DINHEIRO;
        }

        int indiceCredito = indiceMaisProximo(detalhes, "credito:", "cartao_credito:");
        if (indiceCredito >= 0 && indiceCredito < menorIndice) {
            menorIndice = indiceCredito;
            metodo = MetodoPagamento.CARTAO_CREDITO;
        }

        int indiceDebito = indiceMaisProximo(detalhes, "debito:", "cartao_debito:");
        if (indiceDebito >= 0 && indiceDebito < menorIndice) {
            menorIndice = indiceDebito;
            metodo = MetodoPagamento.CARTAO_DEBITO;
        }

        int indiceBoleto = detalhes.indexOf("boleto:");
        if (indiceBoleto >= 0 && indiceBoleto < menorIndice) {
            metodo = MetodoPagamento.BOLETO;
        }

        return metodo;
    }

    private int indiceMaisProximo(String texto, String primeiroMarcador, String segundoMarcador) {
        int primeiro = texto.indexOf(primeiroMarcador);
        int segundo = texto.indexOf(segundoMarcador);
        if (primeiro < 0) {
            return segundo;
        }
        if (segundo < 0) {
            return primeiro;
        }
        return Math.min(primeiro, segundo);
    }

    private void registrarEntregaSeNecessario(Pedido pedido) {
        if (pedido == null || pedido.getId() == null || !TipoEntrega.ENTREGA.equals(pedido.getTipoEntrega())) {
            return;
        }

        if (entregaRepository.existsByPedidoId(pedido.getId())) {
            return;
        }

        Entrega entrega = new Entrega();
        entrega.setPedido(pedido);
        entrega.setStatus(StatusEntrega.PENDENTE);
        entrega.setPrioridade(pedido.getPrioridade() != null ? pedido.getPrioridade().name() : "NORMAL");
        entrega.setEnderecoEntrega(
                normalizarTexto(pedido.getEnderecoEntrega()) != null
                        ? normalizarTexto(pedido.getEnderecoEntrega())
                        : pedido.getCliente() != null ? normalizarTexto(pedido.getCliente().getEndereco()) : null
        );
        entrega.setTelefoneContato(pedido.getCliente() != null ? normalizarTexto(pedido.getCliente().getTelefone()) : null);
        entrega.setObservacao(normalizarTexto(pedido.getObservacaoEntrega()));
        entregaRepository.save(entrega);

        auditoriaService.registrar("Logistica", "ENTREGA_CRIADA",
                "Entrega criada automaticamente apos recebimento no caixa.", pedido.getId());
    }

    @Transactional
    public void deletar(UUID id) {
        Pedido pedido = buscar(id);
        pedidoRepository.delete(pedido);
    }

    private BigDecimal calcularCrescimento(BigDecimal atual, BigDecimal anterior) {
        if (anterior == null || anterior.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        if (atual == null) {
            atual = BigDecimal.ZERO;
        }

        return atual.subtract(anterior)
                .divide(anterior, 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}
