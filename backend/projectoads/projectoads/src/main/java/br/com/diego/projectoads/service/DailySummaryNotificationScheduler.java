package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.StatusPedido;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import br.com.diego.projectoads.dto.EstoqueBaixoResponse;
import br.com.diego.projectoads.repository.FinanceiroRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DailySummaryNotificationScheduler {

    private final PedidoRepository pedidoRepository;
    private final FinanceiroRepository financeiroRepository;
    private final EstoqueService estoqueService;
    private final ExternalNotificationService notificationService;
    private final AuditoriaService auditoriaService;

    public DailySummaryNotificationScheduler(PedidoRepository pedidoRepository,
                                             FinanceiroRepository financeiroRepository,
                                             EstoqueService estoqueService,
                                             ExternalNotificationService notificationService,
                                             AuditoriaService auditoriaService) {
        this.pedidoRepository = pedidoRepository;
        this.financeiroRepository = financeiroRepository;
        this.estoqueService = estoqueService;
        this.notificationService = notificationService;
        this.auditoriaService = auditoriaService;
    }

    @Scheduled(cron = "${notifications.daily-summary-cron:0 0 18 * * *}")
    public DailySummaryNotificationResult enviarResumoDiario() {
        if (!notificationService.ativo()) {
            return new DailySummaryNotificationResult(false, 0);
        }

        Map<String, Object> resumo = montarResumo(LocalDate.now());
        notificationService.enviarResumoDiario(resumo);
        auditoriaService.registrar("Relatorios", "NOTIFICAR_RESUMO_DIARIO", "Resumo diario enviado para webhook externo", null);
        return new DailySummaryNotificationResult(true, 1);
    }

    private Map<String, Object> montarResumo(LocalDate data) {
        LocalDateTime inicio = data.atStartOfDay();
        LocalDateTime fim = data.atTime(LocalTime.MAX);
        List<StatusPedido> statusesVenda = List.copyOf(EnumSet.of(
                StatusPedido.RECEBIDO,
                StatusPedido.ENTREGUE,
                StatusPedido.CONCLUIDO,
                StatusPedido.FINALIZADA
        ));
        List<EstoqueBaixoResponse> estoqueBaixo = estoqueService.estoqueBaixo();

        BigDecimal vendas = pedidoRepository.receitaPorPeriodo(statusesVenda, inicio, fim);
        Long pedidosConcluidos = pedidoRepository.totalPedidosConcluidos(statusesVenda, inicio, fim);
        BigDecimal receitas = financeiroRepository.somarPorTipoEStatusNoPeriodo(
                TipoFinanceiro.RECEITA,
                StatusPagamento.APROVADO,
                inicio,
                fim
        );
        BigDecimal despesas = financeiroRepository.somarPorTipoEStatusNoPeriodo(
                TipoFinanceiro.DESPESA,
                StatusPagamento.APROVADO,
                inicio,
                fim
        );
        long financeirosPendentes = financeiroRepository.countByStatusAndDataLancamentoBetween(
                StatusPagamento.PENDENTE,
                inicio,
                fim
        );

        Map<String, Object> resumo = new LinkedHashMap<>();
        resumo.put("data", data);
        resumo.put("vendasValor", vendas);
        resumo.put("pedidosConcluidos", pedidosConcluidos == null ? 0 : pedidosConcluidos);
        resumo.put("receitasAprovadas", receitas);
        resumo.put("despesasAprovadas", despesas);
        resumo.put("resultadoFinanceiro", receitas.subtract(despesas));
        resumo.put("lancamentosPendentesCriadosHoje", financeirosPendentes);
        resumo.put("estoqueBaixoItens", estoqueBaixo.size());
        return resumo;
    }

    public record DailySummaryNotificationResult(
            boolean ativo,
            int resumosEnviados
    ) {
    }
}
