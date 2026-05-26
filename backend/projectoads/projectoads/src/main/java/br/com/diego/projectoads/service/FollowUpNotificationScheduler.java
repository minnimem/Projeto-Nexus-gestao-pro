package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.StatusFollowUpCobranca;
import br.com.diego.projectoads.model.ConfiguracaoAutomacaoComercial;
import br.com.diego.projectoads.model.FollowUpCobranca;
import br.com.diego.projectoads.model.FollowUpComercial;
import br.com.diego.projectoads.repository.ConfiguracaoAutomacaoComercialRepository;
import br.com.diego.projectoads.repository.FollowUpCobrancaRepository;
import br.com.diego.projectoads.repository.FollowUpComercialRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FollowUpNotificationScheduler {

    private final FollowUpCobrancaRepository cobrancaRepository;
    private final FollowUpComercialRepository comercialRepository;
    private final ConfiguracaoAutomacaoComercialRepository configuracaoAutomacaoComercialRepository;
    private final ExternalNotificationService notificationService;
    private final AuditoriaService auditoriaService;

    public FollowUpNotificationScheduler(FollowUpCobrancaRepository cobrancaRepository,
                                         FollowUpComercialRepository comercialRepository,
                                         ConfiguracaoAutomacaoComercialRepository configuracaoAutomacaoComercialRepository,
                                         ExternalNotificationService notificationService,
                                         AuditoriaService auditoriaService) {
        this.cobrancaRepository = cobrancaRepository;
        this.comercialRepository = comercialRepository;
        this.configuracaoAutomacaoComercialRepository = configuracaoAutomacaoComercialRepository;
        this.notificationService = notificationService;
        this.auditoriaService = auditoriaService;
    }

    @Scheduled(cron = "${notifications.follow-up-cron:0 0 8 * * *}")
    @Transactional
    public FollowUpNotificationResult enviarFollowUpsPendentes() {
        if (!notificationService.ativo()) {
            return new FollowUpNotificationResult(false, 0, 0);
        }

        LocalDate hoje = LocalDate.now();
        List<FollowUpCobranca> cobrancas = cobrancaRepository
                .findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                        StatusFollowUpCobranca.PENDENTE,
                        hoje
                );
        List<FollowUpComercial> comerciais = comercialRepository
                .findByStatusAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                        StatusFollowUpCobranca.PENDENTE
                );

        cobrancas.forEach(this::notificarCobranca);
        int comerciaisEnviados = comerciais.stream()
                .mapToInt(followUp -> notificarComercial(followUp, hoje) ? 1 : 0)
                .sum();
        return new FollowUpNotificationResult(true, cobrancas.size(), comerciaisEnviados);
    }

    private void notificarCobranca(FollowUpCobranca followUp) {
        notificationService.enviarFollowUpCobranca(followUp);
        followUp.setNotificacaoExternaEm(LocalDateTime.now());
        cobrancaRepository.save(followUp);
        auditoriaService.registrar("Financeiro", "NOTIFICAR_FOLLOW_UP_COBRANCA", "Notificacao externa de cobranca enviada", followUp.getId());
    }

    private boolean notificarComercial(FollowUpComercial followUp, LocalDate hoje) {
        ConfiguracaoAutomacaoComercial configuracao = buscarConfiguracaoComercial(followUp);
        String regra = regraAutomacaoAtiva(followUp, configuracao, hoje);
        if (regra == null) {
            return false;
        }

        notificationService.enviarFollowUpComercial(followUp, configuracao.getCanalPadrao(), regra);
        followUp.setNotificacaoExternaEm(LocalDateTime.now());
        comercialRepository.save(followUp);
        auditoriaService.registrar("Pedidos", "NOTIFICAR_FOLLOW_UP_COMERCIAL", "Notificacao externa comercial enviada", followUp.getId());
        return true;
    }

    private ConfiguracaoAutomacaoComercial buscarConfiguracaoComercial(FollowUpComercial followUp) {
        if (followUp == null || followUp.getEmpresa() == null || followUp.getEmpresa().getId() == null) {
            return configuracaoPadrao();
        }
        if (followUp.getFilial() != null && followUp.getFilial().getId() != null) {
            return configuracaoAutomacaoComercialRepository
                    .findFirstByEmpresaIdAndFilialId(followUp.getEmpresa().getId(), followUp.getFilial().getId())
                    .orElseGet(() -> buscarConfiguracaoEmpresa(followUp));
        }
        return buscarConfiguracaoEmpresa(followUp);
    }

    private ConfiguracaoAutomacaoComercial buscarConfiguracaoEmpresa(FollowUpComercial followUp) {
        return configuracaoAutomacaoComercialRepository
                .findFirstByEmpresaIdAndFilialIsNull(followUp.getEmpresa().getId())
                .orElseGet(this::configuracaoPadrao);
    }

    private ConfiguracaoAutomacaoComercial configuracaoPadrao() {
        return new ConfiguracaoAutomacaoComercial();
    }

    private String regraAutomacaoAtiva(FollowUpComercial followUp,
                                       ConfiguracaoAutomacaoComercial configuracao,
                                       LocalDate hoje) {
        return regrasAplicaveis(followUp, configuracao, hoje).stream()
                .filter(regra -> regraAtiva(configuracao, regra))
                .findFirst()
                .orElse(null);
    }

    private List<String> regrasAplicaveis(FollowUpComercial followUp,
                                          ConfiguracaoAutomacaoComercial configuracao,
                                          LocalDate hoje) {
        List<String> regras = new ArrayList<>();
        if (followUp.getProximaAcao() != null && followUp.getProximaAcao().isBefore(hoje)) {
            regras.add("FOLLOW_UP_VENCIDO");
        }
        if (followUp.getProximaAcao() != null && followUp.getProximaAcao().isEqual(hoje)) {
            regras.add("ACAO_DE_HOJE");
        }
        if (followUp.getProximaAcao() == null) {
            regras.add("SEM_PROXIMA_ACAO");
        }
        if (isAltoValor(followUp, configuracao) && exigeAtencaoAgora(followUp, hoje)) {
            regras.add("ALTO_VALOR_ABERTO");
        }
        return regras;
    }

    private boolean regraAtiva(ConfiguracaoAutomacaoComercial configuracao, String regra) {
        if ("FOLLOW_UP_VENCIDO".equals(regra)) {
            return Boolean.TRUE.equals(configuracao.getFollowUpVencidoAtivo());
        }
        if ("ACAO_DE_HOJE".equals(regra)) {
            return Boolean.TRUE.equals(configuracao.getAcaoHojeAtivo());
        }
        if ("SEM_PROXIMA_ACAO".equals(regra)) {
            return Boolean.TRUE.equals(configuracao.getSemProximaAcaoAtivo());
        }
        if ("ALTO_VALOR_ABERTO".equals(regra)) {
            return Boolean.TRUE.equals(configuracao.getAltoValorAtivo());
        }
        return true;
    }

    private boolean isAltoValor(FollowUpComercial followUp, ConfiguracaoAutomacaoComercial configuracao) {
        BigDecimal valor = followUp.getPedido() != null ? followUp.getPedido().getValorTotalPedido() : null;
        if (valor == null) {
            return false;
        }
        BigDecimal limite = configuracao.getLimiteAltoValor() != null
                ? configuracao.getLimiteAltoValor()
                : BigDecimal.valueOf(1000);
        return valor.compareTo(limite) >= 0;
    }

    private boolean exigeAtencaoAgora(FollowUpComercial followUp, LocalDate hoje) {
        return followUp.getProximaAcao() == null || !followUp.getProximaAcao().isAfter(hoje);
    }

    public record FollowUpNotificationResult(
            boolean ativo,
            int cobrancasEnviadas,
            int comerciaisEnviadas
    ) {
        public int totalEnviado() {
            return cobrancasEnviadas + comerciaisEnviadas;
        }
    }
}
