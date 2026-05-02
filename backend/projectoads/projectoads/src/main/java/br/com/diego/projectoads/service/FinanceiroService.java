package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import br.com.diego.projectoads.dto.FinanceiroRequest;
import br.com.diego.projectoads.dto.FinanceiroResponse;
import br.com.diego.projectoads.dto.FinanceiroResumoResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Filial;
import br.com.diego.projectoads.model.Financeiro;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.model.RecorrenciaFinanceira;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.FinanceiroRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class FinanceiroService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final String PIX_GUI = "br.gov.bcb.pix";

    private final FinanceiroRepository financeiroRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final FilialRepository filialRepository;
    private final AuditoriaService auditoriaService;
    private final AsaasPaymentGatewayService asaasPaymentGatewayService;

    public FinanceiroService(FinanceiroRepository financeiroRepository,
                               PedidoRepository pedidoRepository,
                               UsuarioRepository usuarioRepository,
                               FilialRepository filialRepository,
                               AuditoriaService auditoriaService,
                               AsaasPaymentGatewayService asaasPaymentGatewayService) {
        this.financeiroRepository = financeiroRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.filialRepository = filialRepository;
        this.auditoriaService = auditoriaService;
        this.asaasPaymentGatewayService = asaasPaymentGatewayService;
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
        gerarCobrancaSeAplicavel(salvo);
        salvo = financeiroRepository.save(salvo);
        auditoriaService.registrar("Financeiro", "CRIAR", "Lancamento financeiro criado", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public FinanceiroResponse criarPorRecorrencia(RecorrenciaFinanceira recorrencia, LocalDate vencimento, int sequencia) {
        if (recorrencia == null) {
            throw new BusinessException("Recorrencia financeira obrigatoria.");
        }

        Financeiro financeiro = new Financeiro();
        financeiro.setDataLancamento(LocalDateTime.now());
        financeiro.setDataVencimento(vencimento);
        financeiro.setDescricao(recorrencia.getDescricao() + " - Recorrencia " + sequencia);
        financeiro.setTipo(recorrencia.getTipo());
        financeiro.setCategoria(recorrencia.getCategoria());
        financeiro.setValor(recorrencia.getValor());
        financeiro.setMetodoPagamento(recorrencia.getMetodoPagamento());
        financeiro.setStatus(recorrencia.getStatusLancamento());
        financeiro.setUsuario(recorrencia.getUsuario());
        financeiro.setEmpresa(recorrencia.getEmpresa());
        financeiro.setRecorrencia(recorrencia);
        financeiro.setFilial(recorrencia.getFilial());
        financeiro.setObservacao(adicionarObservacao(
                recorrencia.getObservacao(),
                "Gerado pela recorrencia financeira " + recorrencia.getId()
        ));

        Financeiro salvo = financeiroRepository.save(financeiro);
        gerarCobrancaSeAplicavel(salvo);
        salvo = financeiroRepository.save(salvo);
        auditoriaService.registrar("Financeiro", "CRIAR_RECORRENCIA", "Lancamento gerado por recorrencia financeira", salvo.getId());
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

        Financeiro salvo = financeiroRepository.save(financeiro);
        gerarCobrancaSeAplicavel(salvo);
        return toResponse(financeiroRepository.save(salvo));
    }

    @Transactional
    public FinanceiroResponse gerarCobranca(UUID id) {
        Financeiro financeiro = buscarEntidade(id);
        validarCobrancaPermitida(financeiro);
        gerarDadosCobranca(financeiro);
        Financeiro salvo = financeiroRepository.save(financeiro);
        auditoriaService.registrar("Financeiro", "GERAR_COBRANCA", "Cobranca Pix/boleto gerada", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public FinanceiroResponse gerarCobrancaPedido(Pedido pedido, MetodoPagamento metodoPagamento, Usuario usuario) {
        if (pedido == null || pedido.getId() == null) {
            throw new BusinessException("Pedido obrigatorio para gerar cobranca.");
        }

        MetodoPagamento metodo = metodoPagamento != null ? metodoPagamento : pedido.getMetodoPagamento();
        if (!MetodoPagamento.PIX.equals(metodo) && !MetodoPagamento.BOLETO.equals(metodo)) {
            throw new BusinessException("Cobranca disponivel apenas para Pix ou Boleto.");
        }

        Financeiro financeiro = financeiroRepository
                .findFirstByPedidoIdAndTipoAndStatusOrderByDataLancamentoDesc(
                        pedido.getId(),
                        TipoFinanceiro.RECEITA,
                        StatusPagamento.PENDENTE
                )
                .orElseGet(Financeiro::new);

        financeiro.setDataLancamento(financeiro.getDataLancamento() != null ? financeiro.getDataLancamento() : LocalDateTime.now());
        financeiro.setDataVencimento(financeiro.getDataVencimento() != null ? financeiro.getDataVencimento() : LocalDate.now().plusDays(3));
        financeiro.setDescricao("Cobranca do pedido " + pedido.getNumero());
        financeiro.setTipo(TipoFinanceiro.RECEITA);
        financeiro.setCategoria("Venda");
        financeiro.setValor(pedido.getValorTotalPedido());
        financeiro.setMetodoPagamento(metodo);
        financeiro.setStatus(StatusPagamento.PENDENTE);
        financeiro.setPedido(pedido);
        financeiro.setUsuario(usuario != null ? usuario : pedido.getUsuario());
        financeiro.setEmpresa(pedido.getEmpresa());
        financeiro.setFilial(pedido.getFilial() != null ? pedido.getFilial() : usuario != null ? usuario.getFilial() : null);
        financeiro.setObservacao(adicionarObservacao(
                financeiro.getObservacao(),
                "Cobranca gerada para recebimento do pedido no caixa."
        ));

        gerarDadosCobranca(financeiro);
        Financeiro salvo = financeiroRepository.save(financeiro);
        auditoriaService.registrar("Financeiro", "GERAR_COBRANCA_PEDIDO", "Cobranca do pedido gerada", salvo.getId());
        return toResponse(salvo);
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
    public void processarWebhookAsaas(String event, String paymentId) {
        if (paymentId == null || paymentId.isBlank()) {
            return;
        }

        Financeiro financeiro = financeiroRepository.findFirstByCobrancaExternaId(paymentId)
                .orElse(null);
        if (financeiro == null) {
            return;
        }

        StatusPagamento novoStatus = statusPorEventoAsaas(event);
        if (novoStatus == null) {
            financeiro.setObservacao(adicionarObservacao(
                    financeiro.getObservacao(),
                    "Webhook Asaas recebido: " + event
            ));
            financeiroRepository.save(financeiro);
            return;
        }

        financeiro.setStatus(novoStatus);
        if (StatusPagamento.APROVADO.equals(novoStatus)) {
            financeiro.setDataLancamento(LocalDateTime.now());
        }
        financeiro.setObservacao(adicionarObservacao(
                financeiro.getObservacao(),
                "Webhook Asaas " + event + " aplicado em " + LocalDateTime.now()
        ));

        financeiroRepository.save(financeiro);
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
        Financeiro financeiroPendente = financeiroRepository
                .findFirstByPedidoIdAndTipoAndStatusOrderByDataLancamentoDesc(
                        pedido.getId(),
                        TipoFinanceiro.RECEITA,
                        StatusPagamento.PENDENTE
                )
                .orElse(null);

        if (financeiroPendente != null) {
            financeiro = financeiroPendente;
        }

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
        financeiro.setFilial(pedido.getFilial() != null ? pedido.getFilial() : usuario != null ? usuario.getFilial() : null);
        financeiro.setObservacao(adicionarObservacao(
                financeiroPendente != null ? financeiroPendente.getObservacao() : financeiro.getObservacao(),
                criarObservacaoPedido(detalhesPagamento)
        ));

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

        financeiro.setFilial(resolverFilial(request.getFilialId(), financeiro.getPedido(), usuario, financeiro));
    }

    private Filial resolverFilial(UUID filialId, Pedido pedido, Usuario usuario, Financeiro financeiro) {
        if (filialId == null) {
            if (pedido != null && pedido.getFilial() != null) {
                return pedido.getFilial();
            }
            return usuario != null ? usuario.getFilial() : null;
        }

        Filial filial = filialRepository.findById(filialId)
                .orElseThrow(() -> new BusinessException("Filial nao encontrada"));

        UUID empresaFinanceiroId = financeiro.getEmpresa() != null ? financeiro.getEmpresa().getId() : null;
        UUID empresaFilialId = filial.getEmpresa() != null ? filial.getEmpresa().getId() : null;
        if (empresaFinanceiroId == null || !empresaFinanceiroId.equals(empresaFilialId)) {
            throw new BusinessException("Filial nao pertence a empresa do lancamento financeiro");
        }

        return filial;
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

    private void gerarCobrancaSeAplicavel(Financeiro financeiro) {
        if (financeiro == null || !cobrancaAplicavel(financeiro)) {
            return;
        }

        gerarDadosCobranca(financeiro);
    }

    private void validarCobrancaPermitida(Financeiro financeiro) {
        if (!cobrancaAplicavel(financeiro)) {
            throw new BusinessException("Cobranca disponivel apenas para receitas pendentes em Pix ou Boleto.");
        }
    }

    private boolean cobrancaAplicavel(Financeiro financeiro) {
        return financeiro != null
                && TipoFinanceiro.RECEITA.equals(financeiro.getTipo())
                && StatusPagamento.PENDENTE.equals(financeiro.getStatus())
                && (MetodoPagamento.PIX.equals(financeiro.getMetodoPagamento())
                || MetodoPagamento.BOLETO.equals(financeiro.getMetodoPagamento()));
    }

    private void gerarDadosCobranca(Financeiro financeiro) {
        String codigo = financeiro.getCodigoCobranca();
        if (codigo == null || codigo.isBlank()) {
            String base = financeiro.getId() != null
                    ? financeiro.getId().toString().replace("-", "")
                    : UUID.randomUUID().toString().replace("-", "");
            codigo = "COB" + base.substring(0, Math.min(12, base.length())).toUpperCase();
            financeiro.setCodigoCobranca(codigo);
        }

        financeiro.setCobrancaGeradaEm(LocalDateTime.now());
        LocalDate vencimento = financeiro.getDataVencimento() != null ? financeiro.getDataVencimento() : LocalDate.now().plusDays(3);
        financeiro.setCobrancaExpiraEm(vencimento.atTime(23, 59, 59));

        if ("ASAAS".equalsIgnoreCase(financeiro.getCobrancaProvedor())
                && financeiro.getCobrancaExternaId() != null
                && !financeiro.getCobrancaExternaId().isBlank()) {
            return;
        }

        if (gerarCobrancaAsaas(financeiro)) {
            return;
        }

        financeiro.setCobrancaProvedor("DEMO");
        financeiro.setCobrancaExternaId(null);
        financeiro.setCobrancaUrl(null);

        if (MetodoPagamento.PIX.equals(financeiro.getMetodoPagamento())) {
            String payload = montarPixCopiaCola(financeiro, codigo);
            financeiro.setPixCopiaCola(payload);
            financeiro.setPixQrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=220x220&data="
                    + URLEncoder.encode(payload, StandardCharsets.UTF_8));
            financeiro.setBoletoLinhaDigitavel(null);
            financeiro.setBoletoNumeroDocumento(null);
            financeiro.setBoletoNossoNumero(null);
            return;
        }

        financeiro.setPixCopiaCola(null);
        financeiro.setPixQrCodeUrl(null);
        financeiro.setBoletoNumeroDocumento(codigo);
        financeiro.setBoletoNossoNumero(gerarNossoNumero(codigo));
        financeiro.setBoletoLinhaDigitavel(gerarLinhaDigitavelDemonstrativa(financeiro, codigo));
    }

    private boolean gerarCobrancaAsaas(Financeiro financeiro) {
        if (!asaasPaymentGatewayService.isEnabled()) {
            return false;
        }

        AsaasPaymentGatewayService.AsaasChargeResult result = asaasPaymentGatewayService
                .criarCobranca(financeiro)
                .orElse(null);

        if (result == null) {
            return false;
        }

        financeiro.setCobrancaProvedor("ASAAS");
        financeiro.setCobrancaExternaId(result.externalId());
        financeiro.setCobrancaUrl(result.paymentUrl());
        financeiro.setPixCopiaCola(result.pixPayload());
        financeiro.setPixQrCodeUrl(result.pixQrCodeDataUrl());
        financeiro.setBoletoLinhaDigitavel(result.boletoLinhaDigitavel());
        financeiro.setBoletoNumeroDocumento(result.boletoNumeroDocumento());
        financeiro.setBoletoNossoNumero(result.boletoNossoNumero());
        return true;
    }

    private StatusPagamento statusPorEventoAsaas(String event) {
        if (event == null || event.isBlank()) {
            return null;
        }

        return switch (event.trim().toUpperCase()) {
            case "PAYMENT_RECEIVED", "PAYMENT_CONFIRMED", "PAYMENT_CREDITED" -> StatusPagamento.APROVADO;
            case "PAYMENT_DELETED" -> StatusPagamento.CANCELADO;
            case "PAYMENT_REFUNDED", "PAYMENT_REFUND_IN_PROGRESS" -> StatusPagamento.ESTORNADO;
            case "PAYMENT_OVERDUE" -> StatusPagamento.PENDENTE;
            default -> null;
        };
    }

    private String montarPixCopiaCola(Financeiro financeiro, String txid) {
        String chave = escolherChavePix(financeiro);
        String nome = limitar(normalizarPix(financeiro.getEmpresa() != null ? financeiro.getEmpresa().getNome() : "NEXUS ONE"), 25);
        String cidade = limitar(normalizarPix(financeiro.getEmpresa() != null ? financeiro.getEmpresa().getCidade() : "BRASIL"), 15);
        String valor = financeiro.getValor().setScale(2, RoundingMode.HALF_UP).toPlainString();

        String merchantAccount = tag("00", PIX_GUI)
                + tag("01", chave)
                + tag("02", limitar(normalizarPix(financeiro.getDescricao()), 72));

        String payloadSemCrc = tag("00", "01")
                + tag("26", merchantAccount)
                + tag("52", "0000")
                + tag("53", "986")
                + tag("54", valor)
                + tag("58", "BR")
                + tag("59", nome)
                + tag("60", cidade)
                + tag("62", tag("05", limitar(txid, 25)))
                + "6304";

        return payloadSemCrc + crc16(payloadSemCrc);
    }

    private String escolherChavePix(Financeiro financeiro) {
        if (financeiro.getFilial() != null && financeiro.getFilial().getEmail() != null && !financeiro.getFilial().getEmail().isBlank()) {
            return financeiro.getFilial().getEmail().trim();
        }
        if (financeiro.getEmpresa() != null && financeiro.getEmpresa().getEmail() != null && !financeiro.getEmpresa().getEmail().isBlank()) {
            return financeiro.getEmpresa().getEmail().trim();
        }
        if (financeiro.getEmpresa() != null && financeiro.getEmpresa().getCnpj() != null && !financeiro.getEmpresa().getCnpj().isBlank()) {
            return financeiro.getEmpresa().getCnpj().replaceAll("\\D", "");
        }
        return "pix@nexus-one.local";
    }

    private String gerarNossoNumero(String codigo) {
        String base = codigo.replaceAll("\\D", "");
        if (base.isBlank()) {
            base = String.valueOf(Math.abs(codigo.hashCode()));
        }
        return String.format("%011d", Long.parseLong(base.substring(0, Math.min(9, base.length()))));
    }

    private String gerarLinhaDigitavelDemonstrativa(Financeiro financeiro, String codigo) {
        String valorCentavos = financeiro.getValor()
                .setScale(2, RoundingMode.HALF_UP)
                .movePointRight(2)
                .setScale(0, RoundingMode.HALF_UP)
                .toPlainString();
        String id = codigo.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        String bloco = String.format("%10s", id).replace(' ', '0');
        String valor = String.format("%10s", valorCentavos).replace(' ', '0');
        return "34191.79001 " + bloco.substring(0, 5) + "." + bloco.substring(5, 10)
                + " 00000.000000 1 " + valor + " " + codigo;
    }

    private String tag(String id, String valor) {
        String seguro = valor == null ? "" : valor;
        return id + String.format("%02d", seguro.length()) + seguro;
    }

    private String crc16(String payload) {
        int crc = 0xFFFF;
        for (byte b : payload.getBytes(StandardCharsets.UTF_8)) {
            crc ^= (b & 0xFF) << 8;
            for (int i = 0; i < 8; i++) {
                crc = (crc & 0x8000) != 0 ? ((crc << 1) ^ 0x1021) : (crc << 1);
                crc &= 0xFFFF;
            }
        }
        return String.format("%04X", crc);
    }

    private String normalizarPix(String valor) {
        if (valor == null || valor.isBlank()) {
            return "NEXUS ONE";
        }
        return java.text.Normalizer.normalize(valor, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^A-Za-z0-9 .,_\\-]", "")
                .trim()
                .toUpperCase();
    }

    private String limitar(String valor, int tamanho) {
        if (valor == null) {
            return "";
        }
        return valor.length() <= tamanho ? valor : valor.substring(0, tamanho);
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
                .filialId(f.getFilial() != null ? f.getFilial().getId() : null)
                .filial(f.getFilial() != null ? f.getFilial().getNome() : null)
                .recorrenciaId(f.getRecorrencia() != null ? f.getRecorrencia().getId() : null)
                .observacao(f.getObservacao())
                .codigoCobranca(f.getCodigoCobranca())
                .pixCopiaCola(f.getPixCopiaCola())
                .pixQrCodeUrl(f.getPixQrCodeUrl())
                .boletoLinhaDigitavel(f.getBoletoLinhaDigitavel())
                .boletoNumeroDocumento(f.getBoletoNumeroDocumento())
                .boletoNossoNumero(f.getBoletoNossoNumero())
                .cobrancaProvedor(f.getCobrancaProvedor())
                .cobrancaExternaId(f.getCobrancaExternaId())
                .cobrancaUrl(f.getCobrancaUrl())
                .cobrancaGeradaEm(f.getCobrancaGeradaEm())
                .cobrancaExpiraEm(f.getCobrancaExpiraEm())
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
