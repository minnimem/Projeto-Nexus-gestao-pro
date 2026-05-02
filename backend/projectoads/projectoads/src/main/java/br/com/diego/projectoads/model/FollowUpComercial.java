package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.StatusFollowUpCobranca;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@ToString(exclude = {"pedido", "usuario", "empresa", "filial"})
@Table(name = "follow_up_comercial", schema = "public")
public class FollowUpComercial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Column(name = "cliente_id")
    private UUID clienteId;

    @Column(name = "cliente_nome", length = 120)
    private String clienteNome;

    @Column(name = "canal", length = 30)
    private String canal;

    @Column(name = "proxima_acao")
    private LocalDate proximaAcao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusFollowUpCobranca status = StatusFollowUpCobranca.PENDENTE;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "concluido_em")
    private LocalDateTime concluidoEm;

    @Column(name = "notificacao_externa_em")
    private LocalDateTime notificacaoExternaEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filial_id")
    private Filial filial;

    @PrePersist
    public void prePersist() {
        if (this.criadoEm == null) {
            this.criadoEm = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = StatusFollowUpCobranca.PENDENTE;
        }
    }
}
