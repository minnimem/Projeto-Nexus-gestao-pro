package br.com.diego.projectoads.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "configuracao_automacao_comercial", schema = "public")
public class ConfiguracaoAutomacaoComercial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filial_id")
    private Filial filial;

    @Column(name = "follow_up_vencido_ativo", nullable = false)
    private Boolean followUpVencidoAtivo = true;

    @Column(name = "acao_hoje_ativo", nullable = false)
    private Boolean acaoHojeAtivo = true;

    @Column(name = "alto_valor_ativo", nullable = false)
    private Boolean altoValorAtivo = true;

    @Column(name = "sem_proxima_acao_ativo", nullable = false)
    private Boolean semProximaAcaoAtivo = false;

    @Column(name = "limite_alto_valor", precision = 12, scale = 2)
    private BigDecimal limiteAltoValor = BigDecimal.valueOf(1000);

    @Column(name = "canal_padrao", length = 30, nullable = false)
    private String canalPadrao = "WEBHOOK";

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    @PreUpdate
    public void prePersistOrUpdate() {
        if (followUpVencidoAtivo == null) {
            followUpVencidoAtivo = true;
        }
        if (acaoHojeAtivo == null) {
            acaoHojeAtivo = true;
        }
        if (altoValorAtivo == null) {
            altoValorAtivo = true;
        }
        if (semProximaAcaoAtivo == null) {
            semProximaAcaoAtivo = false;
        }
        if (limiteAltoValor == null || limiteAltoValor.compareTo(BigDecimal.ZERO) < 0) {
            limiteAltoValor = BigDecimal.valueOf(1000);
        }
        if (canalPadrao == null || canalPadrao.isBlank()) {
            canalPadrao = "WEBHOOK";
        }
        canalPadrao = canalPadrao.trim().toUpperCase();
        atualizadoEm = LocalDateTime.now();
    }
}
