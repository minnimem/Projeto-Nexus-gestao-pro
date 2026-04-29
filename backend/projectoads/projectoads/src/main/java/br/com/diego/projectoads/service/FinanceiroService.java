package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import br.com.diego.projectoads.dto.FinanceiroRequest;
import br.com.diego.projectoads.dto.FinanceiroResponse;
import br.com.diego.projectoads.dto.FinanceiroResumoResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Financeiro;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.FinanceiroRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class FinanceiroService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final FinanceiroRepository financeiroRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public FinanceiroService(FinanceiroRepository financeiroRepository,
                              PedidoRepository pedidoRepository,
                              UsuarioRepository usuarioRepository,
                              AuditoriaService auditoriaService) {
        this.financeiroRepository = financeiroRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<FinanceiroResponse> listar(LocalDate inicio, LocalDate fim) {
        Periodo periodo = montarPeriodo(inicio, fim);

        return financeiroRepository
                .findByDataLancamentoBetweenOrderByDataLancamentoDesc(periodo.inicio(), periodo.fim())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FinanceiroResponse buscar(UUID id) {
        Financeiro financeiro = buscarEntidade(id);
        return toResponse(financeiro);
    }

    @Transactional(readOnly = true)
    public FinanceiroResumoResponse resumo(LocalDate inicio, LocalDate fim) {
        Periodo periodo = montarPeriodo(inicio, fim);

        BigDecimal receita = nvl(financeiroRepository.somarPorTipoEStatusNoPeriodo(
                TipoFinanceiro.RECEITA,
                StatusPagamento.APROVADO,
                periodo.inicio(),
                periodo.fim()
        ));

        BigDecimal despesas = nvl(financeiroRepository.somarPorTipoEStatusNoPeriodo(
                TipoFinanceiro.DESPESA,
                StatusPagamento.APROVADO,
                periodo.inicio(),
                periodo.fim()
        ));

        List<FinanceiroResponse> movimentacoes = financeiroRepository
                .findByDataLancamentoBetweenOrderByDataLancamentoDesc(periodo.inicio(), periodo.fim())
                .stream()
                .map(this::toResponse)
                .toList();

        return FinanceiroResumoResponse.builder()
                .receitaTotal(receita)
                .despesas(despesas)
                .lucro(receita.subtract(despesas))
                .pedidosPagos(financeiroRepository.countByStatusAndDataLancamentoBetween(
                        StatusPagamento.APROVADO,
                        periodo.inicio(),
                        periodo.fim()
                ))
                .lancamentos(financeiroRepository.countByDataLancamentoBetween(
                        periodo.inicio(),
                        periodo.fim()
                ))
                .movimentacoes(movimentacoes)
                .build();
    }

    @Transactional
    public FinanceiroResponse criar(FinanceiroRequest request) {
        validarRequest(request);

        Financeiro financeiro = new Financeiro();
        preencher(financeiro, request);

        Financeiro salvo = financeiroRepository.save(financeiro);
        auditoriaService.registrar("Financeiro", "CRIAR", "Lancamento financeiro criado", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public FinanceiroResponse atualizar(UUID id, FinanceiroRequest request) {
        validarRequest(request);

        Financeiro financeiro = buscarEntidade(id);

        validarAlteracaoPermitida(financeiro);

        preencher(financeiro, request);

        return toResponse(financeiroRepository.save(financeiro));
    }

    /**
     * Apenas ADMIN deve apagar fisicamente.
     * Para rotina normal, use cancelar() ou estornar().
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deletar(UUID id) {
        Financeiro financeiro = buscarEntidade(id);

        if (StatusPagamento.APROVADO.equals(financeiro.getStatus())) {
            throw new BusinessException("Lançamento aprovado não deve ser excluído. Use estorno.");
        }

        financeiroRepository.delete(financeiro);
    }

    @Transactional
    public FinanceiroResponse cancelar(UUID id) {
        Financeiro financeiro = buscarEntidade(id);

        if (StatusPagamento.APROVADO.equals(financeiro.getStatus())) {
            throw new BusinessException("Lançamento aprovado não pode ser cancelado. Use estorno.");
        }

        if (StatusPagamento.CANCELADO.equals(financeiro.getStatus())) {
            throw new BusinessException("Lançamento já está cancelado.");
        }

        financeiro.setStatus(StatusPagamento.CANCELADO);
        financeiro.setObservacao(adicionarObservacao(
                financeiro.getObservacao(),
                "Cancelado em " + LocalDateTime.now()
        ));

        return toResponse(financeiroRepository.save(financeiro));
    }

    @Transactional
    public FinanceiroResponse baixar(UUID id) {
        Financeiro financeiro = buscarEntidade(id);

        if (!StatusPagamento.PENDENTE.equals(financeiro.getStatus())) {
            throw new BusinessException("Somente lancamentos pendentes podem ser baixados.");
        }

        financeiro.setStatus(StatusPagamento.APROVADO);
        financeiro.setDataLancamento(LocalDateTime.now());
        financeiro.setObservacao(adicionarObservacao(
                financeiro.getObservacao(),
                "Baixado em " + LocalDateTime.now()
        ));

        Financeiro salvo = financeiroRepository.save(financeiro);
        auditoriaService.registrar("Financeiro", "BAIXAR", "Lancamento financeiro baixado", id);
        return toResponse(salvo);
    }

    @Transactional
    public FinanceiroResponse estornar(UUID id) {
        Financeiro original = buscarEntidade(id);

        if (!StatusPagamento.APROVADO.equals(original.getStatus())) {
            throw new BusinessException("Somente lançamentos aprovados podem ser estornados.");
        }

        original.setStatus(StatusPagamento.ESTORNADO);
        original.setObservacao(adicionarObservacao(
                original.getObservacao(),
                "Estornado em " + LocalDateTime.now()
        ));

        Financeiro estorno = new Financeiro();
        estorno.setDataLancamento(LocalDateTime.now());
        estorno.setDescricao("Estorno - " + original.getDescricao());
        estorno.setTipo(inverterTipo(original.getTipo()));
        estorno.setCategoria(original.getCategoria());
        estorno.setValor(original.getValor());
        estorno.setMetodoPagamento(original.getMetodoPagamento());
        estorno.setStatus(StatusPagamento.APROVADO);
        estorno.setPedido(original.getPedido());
        estorno.setUsuario(original.getUsuario());
        estorno.setEmpresa(original.getEmpresa());
        estorno.setObservacao("Lançamento automático de estorno do financeiro " + original.getId());

        financeiroRepository.save(original);
        Financeiro salvo = financeiroRepository.save(estorno);
        auditoriaService.registrar("Financeiro", "ESTORNAR", "Lancamento financeiro estornado", id);
        return toResponse(salvo);
    }

    /**
     * Use este método no PedidoService após finalizar uma venda paga.
     */
    @Transactional
    public FinanceiroResponse registrarReceitaPedido(Pedido pedido,
                                                     MetodoPagamento metodoPagamento,
                                                     BigDecimal valor,
                                                     Usuario usuario) {
        return registrarReceitaPedido(pedido, metodoPagamento, valor, usuario, null);
    }

    @Transactional
    public FinanceiroResponse registrarReceitaPedido(Pedido pedido,
                                                     MetodoPagamento metodoPagamento,
                                                     BigDecimal valor,
                                                     Usuario usuario,
                                                     String detalhesPagamento) {
        if (pedido == null) {
            throw new BusinessException("Pedido obrigatório para registrar receita.");
        }

        if (metodoPagamento == null) {
            throw new BusinessException("Método de pagamento obrigatório.");
        }

        if (valor == null || valor.compareTo(ZERO) <= 0) {
            throw new BusinessException("Valor da receita do pedido deve ser maior que zero.");
        }

        Financeiro financeiro = new Financeiro();
        financeiro.setDataLancamento(LocalDateTime.now());
        financeiro.setDescricao("Receita do pedido " + pedido.getNumero());
        financeiro.setTipo(TipoFinanceiro.RECEITA);
        financeiro.setCategoria("Venda");
        financeiro.setValor(valor);
        financeiro.setMetodoPagamento(metodoPagamento);
        financeiro.setStatus(StatusPagamento.APROVADO);
        financeiro.setPedido(pedido);
        financeiro.setUsuario(usuario);
        financeiro.setEmpresa(usuario != null && usuario.getEmpresa() != null
                ? usuario.getEmpresa()
                : pedido.getEmpresa());
        financeiro.setObservacao(criarObservacaoPedido(detalhesPagamento));

        return toResponse(financeiroRepository.save(financeiro));
    }

    private String criarObservacaoPedido(String detalhesPagamento) {
        String observacao = "Lancamento automatico gerado pela finalizacao do pedido.";
        if (detalhesPagamento == null || detalhesPagamento.isBlank()) {
            return observacao;
        }
        return observacao + " Pagamento misto: " + detalhesPagamento.trim();
    }

    private void preencher(Financeiro financeiro, FinanceiroRequest request) {
        financeiro.setDataLancamento(
                request.getDataLancamento() != null
                        ? request.getDataLancamento()
                        : LocalDateTime.now()
        );
        financeiro.setDataVencimento(request.getDataVencimento());

        financeiro.setDescricao(request.getDescricao().trim());
        financeiro.setTipo(request.getTipo());
        financeiro.setCategoria(normalizarTexto(request.getCategoria()));
        financeiro.setValor(request.getValor());
        financeiro.setMetodoPagamento(request.getMetodoPagamento());
        financeiro.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : StatusPagamento.APROVADO
        );
        financeiro.setObservacao(normalizarTexto(request.getObservacao()));

        if (request.getPedidoId() != null) {
            Pedido pedido = pedidoRepository.findById(request.getPedidoId())
                    .orElseThrow(() -> new BusinessException("Pedido não encontrado"));
            financeiro.setPedido(pedido);
        } else {
            financeiro.setPedido(null);
        }

        Usuario usuario = resolverUsuarioResponsavel(request.getUsuarioId());
        financeiro.setUsuario(usuario);

        if (usuario != null && usuario.getEmpresa() != null) {
            financeiro.setEmpresa(usuario.getEmpresa());
        } else if (financeiro.getPedido() != null && financeiro.getPedido().getEmpresa() != null) {
            financeiro.setEmpresa(financeiro.getPedido().getEmpresa());
        } else if (financeiro.getEmpresa() == null) {
            throw new BusinessException("Empresa obrigatoria para lancamento financeiro.");
        }
    }

    private Usuario resolverUsuarioResponsavel(UUID usuarioId) {
        if (usuarioId != null) {
            return usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new BusinessException("Usuario nao encontrado"));
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return null;
        }

        return usuarioRepository.findByLoginIgnoreCase(authentication.getName())
                .orElse(null);
    }

    private void validarRequest(FinanceiroRequest request) {
        if (request == null) {
            throw new BusinessException("Dados financeiros obrigatórios.");
        }

        if (request.getDescricao() == null || request.getDescricao().trim().isEmpty()) {
            throw new BusinessException("Descrição é obrigatória.");
        }

        if (request.getDescricao().length() > 255) {
            throw new BusinessException("Descrição não pode ultrapassar 255 caracteres.");
        }

        if (request.getTipo() == null) {
            throw new BusinessException("Tipo financeiro é obrigatório.");
        }

        if (request.getValor() == null || request.getValor().compareTo(ZERO) <= 0) {
            throw new BusinessException("Valor financeiro deve ser maior que zero.");
        }

        if (request.getMetodoPagamento() == null) {
            throw new BusinessException("Método de pagamento é obrigatório.");
        }

        if (request.getStatus() == StatusPagamento.ESTORNADO) {
            throw new BusinessException("Status ESTORNADO deve ser gerado pelo fluxo de estorno.");
        }

        if (request.getStatus() == StatusPagamento.CANCELADO && request.getPedidoId() != null) {
            throw new BusinessException("Lançamento vinculado a pedido não deve nascer cancelado.");
        }
    }

    private void validarAlteracaoPermitida(Financeiro financeiro) {
        if (StatusPagamento.ESTORNADO.equals(financeiro.getStatus())) {
            throw new BusinessException("Lançamento estornado não pode ser alterado.");
        }

        if (StatusPagamento.CANCELADO.equals(financeiro.getStatus())) {
            throw new BusinessException("Lançamento cancelado não pode ser alterado.");
        }
    }

    private Financeiro buscarEntidade(UUID id) {
        if (id == null) {
            throw new BusinessException("ID do lançamento financeiro é obrigatório.");
        }

        return financeiroRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Lançamento financeiro não encontrado."));
    }

    private FinanceiroResponse toResponse(Financeiro f) {
        MetodoPagamento metodo = f.getMetodoPagamento();

        return FinanceiroResponse.builder()
                .id(f.getId())
                .dataLancamento(f.getDataLancamento())
                .dataVencimento(f.getDataVencimento())
                .descricao(f.getDescricao())
                .tipo(f.getTipo())
                .categoria(f.getCategoria())
                .valor(f.getValor())
                .metodoPagamento(metodo)
                .metodoPagamentoDescricao(metodo != null ? metodo.getDescricao() : null)
                .status(f.getStatus())
                .pedidoId(f.getPedido() != null ? f.getPedido().getId() : null)
                .usuarioId(f.getUsuario() != null ? f.getUsuario().getId() : null)
                .observacao(f.getObservacao())
                .build();
    }

    private Periodo montarPeriodo(LocalDate inicio, LocalDate fim) {
        LocalDate hoje = LocalDate.now();
        LocalDate dataInicio = inicio != null ? inicio : hoje.withDayOfMonth(1);
        LocalDate dataFim = fim != null ? fim : hoje;

        if (dataInicio.isAfter(dataFim)) {
            throw new BusinessException("Data inicial não pode ser maior que a data final.");
        }

        return new Periodo(dataInicio.atStartOfDay(), dataFim.atTime(LocalTime.MAX));
    }

    private BigDecimal nvl(BigDecimal valor) {
        return valor != null ? valor : ZERO;
    }

    private String normalizarTexto(String valor) {
        return valor == null || valor.trim().isEmpty() ? null : valor.trim();
    }

    private String adicionarObservacao(String atual, String nova) {
        if (atual == null || atual.isBlank()) {
            return nova;
        }

        return atual + " | " + nova;
    }

    private TipoFinanceiro inverterTipo(TipoFinanceiro tipo) {
        return TipoFinanceiro.RECEITA.equals(tipo)
                ? TipoFinanceiro.DESPESA
                : TipoFinanceiro.RECEITA;
    }

    private record Periodo(LocalDateTime inicio, LocalDateTime fim) {}
}
