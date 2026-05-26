package br.com.diego.projectoads.service;

import br.com.diego.projectoads.model.ConfiguracaoAutomacaoComercial;
import br.com.diego.projectoads.config.Enum.StatusFollowUpCobranca;
import br.com.diego.projectoads.model.FollowUpCobranca;
import br.com.diego.projectoads.model.FollowUpComercial;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.repository.ConfiguracaoAutomacaoComercialRepository;
import br.com.diego.projectoads.repository.FollowUpCobrancaRepository;
import br.com.diego.projectoads.repository.FollowUpComercialRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FollowUpNotificationSchedulerTest {

    private final FollowUpCobrancaRepository cobrancaRepository = mock(FollowUpCobrancaRepository.class);
    private final FollowUpComercialRepository comercialRepository = mock(FollowUpComercialRepository.class);
    private final ConfiguracaoAutomacaoComercialRepository configuracaoRepository = mock(ConfiguracaoAutomacaoComercialRepository.class);
    private final ExternalNotificationService notificationService = mock(ExternalNotificationService.class);
    private final AuditoriaService auditoriaService = mock(AuditoriaService.class);
    private final FollowUpNotificationScheduler scheduler = new FollowUpNotificationScheduler(
            cobrancaRepository,
            comercialRepository,
            configuracaoRepository,
            notificationService,
            auditoriaService
    );

    @Test
    void deveIgnorarQuandoNotificacoesExternasEstaoDesligadas() {
        when(notificationService.ativo()).thenReturn(false);

        FollowUpNotificationScheduler.FollowUpNotificationResult result = scheduler.enviarFollowUpsPendentes();

        assertFalse(result.ativo());
        assertEquals(0, result.totalEnviado());
        verify(cobrancaRepository, never())
                .findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(any(), any());
        verify(comercialRepository, never())
                .findByStatusAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(any());
    }

    @Test
    void deveEnviarFollowUpsPendentesEMarcarNotificacao() {
        FollowUpCobranca cobranca = new FollowUpCobranca();
        FollowUpComercial comercial = new FollowUpComercial();
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        comercial.setEmpresa(empresa);
        comercial.setProximaAcao(LocalDate.now());
        ConfiguracaoAutomacaoComercial configuracao = new ConfiguracaoAutomacaoComercial();
        configuracao.setCanalPadrao("WHATSAPP");
        when(notificationService.ativo()).thenReturn(true);
        when(configuracaoRepository.findFirstByEmpresaIdAndFilialIsNull(empresa.getId()))
                .thenReturn(Optional.of(configuracao));
        when(cobrancaRepository.findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                eq(StatusFollowUpCobranca.PENDENTE),
                any(LocalDate.class)
        )).thenReturn(List.of(cobranca));
        when(comercialRepository.findByStatusAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                eq(StatusFollowUpCobranca.PENDENTE)
        )).thenReturn(List.of(comercial));

        FollowUpNotificationScheduler.FollowUpNotificationResult result = scheduler.enviarFollowUpsPendentes();

        assertTrue(result.ativo());
        assertEquals(1, result.cobrancasEnviadas());
        assertEquals(1, result.comerciaisEnviadas());
        assertEquals(2, result.totalEnviado());
        assertNotNull(cobranca.getNotificacaoExternaEm());
        assertNotNull(comercial.getNotificacaoExternaEm());
        verify(notificationService).enviarFollowUpCobranca(cobranca);
        verify(notificationService).enviarFollowUpComercial(comercial, "WHATSAPP", "ACAO_DE_HOJE");
        verify(cobrancaRepository).save(cobranca);
        verify(comercialRepository).save(comercial);
        verify(auditoriaService).registrar(eq("Financeiro"), eq("NOTIFICAR_FOLLOW_UP_COBRANCA"), any(), any());
        verify(auditoriaService).registrar(eq("Pedidos"), eq("NOTIFICAR_FOLLOW_UP_COMERCIAL"), any(), any());
    }

    @Test
    void deveRespeitarRegraComercialDeAcaoHojeDesativada() {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        FollowUpComercial comercial = new FollowUpComercial();
        comercial.setEmpresa(empresa);
        comercial.setProximaAcao(LocalDate.now());
        ConfiguracaoAutomacaoComercial configuracao = new ConfiguracaoAutomacaoComercial();
        configuracao.setAcaoHojeAtivo(false);
        when(notificationService.ativo()).thenReturn(true);
        when(cobrancaRepository.findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                eq(StatusFollowUpCobranca.PENDENTE),
                any(LocalDate.class)
        )).thenReturn(List.of());
        when(comercialRepository.findByStatusAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                eq(StatusFollowUpCobranca.PENDENTE)
        )).thenReturn(List.of(comercial));
        when(configuracaoRepository.findFirstByEmpresaIdAndFilialIsNull(empresa.getId()))
                .thenReturn(Optional.of(configuracao));

        FollowUpNotificationScheduler.FollowUpNotificationResult result = scheduler.enviarFollowUpsPendentes();

        assertTrue(result.ativo());
        assertEquals(0, result.comerciaisEnviadas());
        assertEquals(0, result.totalEnviado());
        verify(notificationService, never()).enviarFollowUpComercial(any(), any(), any());
        verify(comercialRepository, never()).save(any());
    }

    @Test
    void deveEnviarFollowUpComercialDeAltoValorSemProximaAcao() {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        Pedido pedido = new Pedido();
        pedido.setValorTotalPedido(BigDecimal.valueOf(1500));
        FollowUpComercial comercial = new FollowUpComercial();
        comercial.setEmpresa(empresa);
        comercial.setPedido(pedido);
        ConfiguracaoAutomacaoComercial configuracao = new ConfiguracaoAutomacaoComercial();
        configuracao.setCanalPadrao("EMAIL");
        configuracao.setAltoValorAtivo(true);
        configuracao.setLimiteAltoValor(BigDecimal.valueOf(1000));
        when(notificationService.ativo()).thenReturn(true);
        when(cobrancaRepository.findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                eq(StatusFollowUpCobranca.PENDENTE),
                any(LocalDate.class)
        )).thenReturn(List.of());
        when(comercialRepository.findByStatusAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                eq(StatusFollowUpCobranca.PENDENTE)
        )).thenReturn(List.of(comercial));
        when(configuracaoRepository.findFirstByEmpresaIdAndFilialIsNull(empresa.getId()))
                .thenReturn(Optional.of(configuracao));

        FollowUpNotificationScheduler.FollowUpNotificationResult result = scheduler.enviarFollowUpsPendentes();

        assertEquals(1, result.comerciaisEnviadas());
        assertNotNull(comercial.getNotificacaoExternaEm());
        verify(notificationService).enviarFollowUpComercial(comercial, "EMAIL", "ALTO_VALOR_ABERTO");
        verify(comercialRepository).save(comercial);
    }

    @Test
    void deveEnviarFollowUpComercialSemProximaAcaoQuandoRegraAtiva() {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        FollowUpComercial comercial = new FollowUpComercial();
        comercial.setEmpresa(empresa);
        ConfiguracaoAutomacaoComercial configuracao = new ConfiguracaoAutomacaoComercial();
        configuracao.setSemProximaAcaoAtivo(true);
        when(notificationService.ativo()).thenReturn(true);
        when(cobrancaRepository.findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                eq(StatusFollowUpCobranca.PENDENTE),
                any(LocalDate.class)
        )).thenReturn(List.of());
        when(comercialRepository.findByStatusAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                eq(StatusFollowUpCobranca.PENDENTE)
        )).thenReturn(List.of(comercial));
        when(configuracaoRepository.findFirstByEmpresaIdAndFilialIsNull(empresa.getId()))
                .thenReturn(Optional.of(configuracao));

        FollowUpNotificationScheduler.FollowUpNotificationResult result = scheduler.enviarFollowUpsPendentes();

        assertEquals(1, result.comerciaisEnviadas());
        assertNotNull(comercial.getNotificacaoExternaEm());
        verify(notificationService).enviarFollowUpComercial(comercial, "WEBHOOK", "SEM_PROXIMA_ACAO");
        verify(comercialRepository).save(comercial);
    }
}
