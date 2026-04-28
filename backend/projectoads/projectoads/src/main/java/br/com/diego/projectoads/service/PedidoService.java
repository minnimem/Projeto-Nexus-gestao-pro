package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.PrioridadeEntrega;
import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPedido;
import br.com.diego.projectoads.dto.ItemPedidoRequest;
import br.com.diego.projectoads.dto.PedidoRequest;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.model.ItemPedido;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.model.Produto;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.ClienteRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import br.com.diego.projectoads.repository.ProdutoRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;

import org.springframework.data.domain.PageRequest;
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

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstoqueService estoqueService;
    private final FinanceiroService financeiroService;
    private final AuditoriaService auditoriaService;

    public PedidoService(
            PedidoRepository pedidoRepository,
            ProdutoRepository produtoRepository,
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository,
            EstoqueService estoqueService,
            FinanceiroService financeiroService,
            AuditoriaService auditoriaService
    ) {
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.estoqueService = estoqueService;
        this.financeiroService = financeiroService;
        this.auditoriaService = auditoriaService;
    }

    public Map<String, Object> getDashboard(LocalDate inicio, LocalDate fim) {
        if (inicio == null) inicio = LocalDate.now().minusDays(30);
        if (fim == null) fim = LocalDate.now();

        LocalDateTime inicioDateTime = inicio.atStartOfDay();
        LocalDateTime fimDateTime = fim.atTime(23, 59, 59);

        Map<String, Object> dados = new LinkedHashMap<>();
        StatusPedido statusVendaConcluida = STATUS_VENDA_FINALIZADA;

        Long totalVendas = Optional.ofNullable(
                pedidoRepository.totalPedidosConcluidos(statusVendaConcluida)
        ).orElse(0L);

        Long pedidosPendentes = pedidoRepository.countByStatus(StatusPedido.PENDENTE);

        BigDecimal receitaTotal = Optional.ofNullable(
                pedidoRepository.receitaPorPeriodo(statusVendaConcluida, inicioDateTime, fimDateTime)
        ).orElse(BigDecimal.ZERO);

        BigDecimal vendasHoje = Optional.ofNullable(
                pedidoRepository.vendasHoje(statusVendaConcluida)
        ).orElse(BigDecimal.ZERO);

        BigDecimal ticketMedio = totalVendas > 0
                ? receitaTotal.divide(BigDecimal.valueOf(totalVendas), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal receitaAnterior = Optional.ofNullable(
                pedidoRepository.receitaPorPeriodo(
                        statusVendaConcluida,
                        inicioDateTime.minusDays(30),
                        fimDateTime.minusDays(30)
                )
        ).orElse(BigDecimal.ZERO);

        BigDecimal crescimento = calcularCrescimento(receitaTotal, receitaAnterior);

        dados.put("totalVendas", totalVendas);
        dados.put("pedidosPendentes", pedidosPendentes);
        dados.put("receitaTotal", receitaTotal);
        dados.put("vendasHoje", vendasHoje);
        dados.put("ticketMedio", ticketMedio);
        dados.put("crescimento", crescimento);

        List<Map<String, Object>> vendasPorDia = pedidoRepository
                .vendasPorDia(statusVendaConcluida, inicioDateTime, fimDateTime)
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
                .rankingProdutos(statusVendaConcluida, inicioDateTime, fimDateTime, PageRequest.of(0, 5))
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
                .findTop10ByOrderByDataPedidoDesc()
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
        if (inicio == null) inicio = LocalDate.now().minusDays(30);
        if (fim == null) fim = LocalDate.now();

        LocalDateTime inicioDateTime = inicio.atStartOfDay();
        LocalDateTime fimDateTime = fim.atTime(23, 59, 59);

        Map<String, Object> dados = new LinkedHashMap<>();
        StatusPedido statusVendaConcluida = STATUS_VENDA_FINALIZADA;

        Long totalPedidos = Optional.ofNullable(
                pedidoRepository.totalPedidosPorUsuario(usuarioId)
        ).orElse(0L);

        BigDecimal receita = Optional.ofNullable(
                pedidoRepository.receitaPorUsuario(usuarioId, statusVendaConcluida, inicioDateTime, fimDateTime)
        ).orElse(BigDecimal.ZERO);

        BigDecimal ticketMedio = totalPedidos > 0
                ? receita.divide(BigDecimal.valueOf(totalPedidos), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        dados.put("usuarioId", usuarioId);
        dados.put("totalPedidos", totalPedidos);
        dados.put("receita", receita);
        dados.put("ticketMedio", ticketMedio);

        List<Map<String, Object>> vendasPorDia = pedidoRepository
                .vendasPorDiaUsuario(usuarioId, statusVendaConcluida, inicioDateTime, fimDateTime)
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
                pedidoRepository.receitaPorUsuario(
                        usuarioId,
                        statusVendaConcluida,
                        inicioDateTime.minusDays(30),
                        fimDateTime.minusDays(30)
                )
        ).orElse(BigDecimal.ZERO);

        dados.put("crescimento", calcularCrescimento(receita, receitaAnterior));

        return dados;
    }

    public List<Pedido> listar() {
        return pedidoRepository.findAll();
    }

    public Pedido buscar(UUID id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
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
        MetodoPagamento metodoPagamento = req.getMetodoPagamento() != null ? req.getMetodoPagamento() : MetodoPagamento.PIX;
        boolean pagarNaEntrega = MetodoPagamento.PAGAR_NA_ENTREGA.equals(metodoPagamento);
        pedido.setMetodoPagamento(metodoPagamento);
        pedido.setStatus(pagarNaEntrega ? StatusPedido.PENDENTE : STATUS_VENDA_FINALIZADA);
        pedido.setDataPedido(LocalDateTime.now());

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
        if (!pagarNaEntrega) {
            baixarEstoque(pedido);
        }

        // =========================
        // 💾 SALVAR
        // =========================
        Pedido salvo = pedidoRepository.save(pedido);
        if (pagarNaEntrega) {
            auditoriaService.registrar("Vendas", "VENDA_AGUARDANDO_ENTREGA",
                    "Venda aguardando pagamento na entrega no valor " + salvo.getValorTotalPedido(), salvo.getId());
        } else {
            registrarReceitaPedido(salvo, usuario);
            auditoriaService.registrar("Vendas", "VENDA_FINALIZADA",
                    "Venda finalizada no valor " + salvo.getValorTotalPedido(), salvo.getId());
        }

        return salvo;
    }

    @Transactional
    public Pedido atualizar(UUID id, Pedido pedido) {
        Pedido existente = buscar(id);

        existente.setCliente(pedido.getCliente());
        existente.setStatus(pedido.getStatus());

        if (pedido.getItens() != null) {
            existente.getItens().clear();

            for (ItemPedido item : pedido.getItens()) {
                existente.adicionarItem(item);
            }
        }

        return pedidoRepository.save(existente);
    }

    @Transactional
    public Pedido finalizar(UUID id) {
        Pedido pedido = buscar(id);

        if (StatusPedido.CANCELADO.equals(pedido.getStatus()) || StatusPedido.CANCELADA.equals(pedido.getStatus())) {
            throw new BusinessException("Pedido cancelado nao pode ser finalizado");
        }

        if (STATUS_VENDA_FINALIZADA.equals(pedido.getStatus())) {
            return pedido;
        }

        baixarEstoque(pedido);
        registrarReceitaPedido(pedido, pedido.getUsuario());
        pedido.setStatus(STATUS_VENDA_FINALIZADA);
        Pedido salvo = pedidoRepository.save(pedido);
        auditoriaService.registrar("Vendas", "VENDA_FINALIZADA",
                "Venda concretizada apos entrega/pagamento no valor " + salvo.getValorTotalPedido(), salvo.getId());
        return salvo;
    }

    private void baixarEstoque(Pedido pedido) {
        for (ItemPedido item : pedido.getItens()) {
            estoqueService.retirar(
                    item.getProduto().getIdProduto(),
                    item.getQuantidade()
            );
        }
    }

    private void registrarReceitaPedido(Pedido pedido, Usuario usuario) {
        financeiroService.registrarReceitaPedido(
                pedido,
                pedido.getMetodoPagamento() != null ? pedido.getMetodoPagamento() : MetodoPagamento.PIX,
                pedido.getValorTotalPedido(),
                usuario
        );
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
