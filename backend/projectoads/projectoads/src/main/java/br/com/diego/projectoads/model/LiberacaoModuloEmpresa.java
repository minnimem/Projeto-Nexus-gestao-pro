package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.ModuloPlano;
import br.com.diego.projectoads.config.Enum.StatusLiberacaoModulo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(
        name = "liberacao_modulo_empresa",
        uniqueConstraints = @UniqueConstraint(name = "uk_liberacao_modulo_empresa", columnNames = {"empresa_id", "modulo"})
)
public class LiberacaoModuloEmpresa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Enumerated(EnumType.STRING)
    @Column(name = "modulo", nullable = false, length = 40)
    private ModuloPlano modulo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private StatusLiberacaoModulo status = StatusLiberacaoModulo.BLOQUEADO;

    @Column(name = "contratado", nullable = false)
    private Boolean contratado = false;

    @Column(name = "liberado", nullable = false)
    private Boolean liberado = false;

    @Column(name = "responsavel", length = 120)
    private String responsavel;

    @Column(name = "evidencia", length = 255)
    private String evidencia;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "data_liberacao")
    private LocalDateTime dataLiberacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    @PrePersist
    @PreUpdate
    public void prePersistUpdate() {
        if (status == null) {
            status = StatusLiberacaoModulo.BLOQUEADO;
        }
        contratado = Boolean.TRUE.equals(contratado);
        liberado = StatusLiberacaoModulo.LIBERADO_PRODUCAO.equals(status);
        if (liberado && dataLiberacao == null) {
            dataLiberacao = LocalDateTime.now();
        }
        if (!liberado) {
            dataLiberacao = null;
        }
        dataAtualizacao = LocalDateTime.now();
    }
}
