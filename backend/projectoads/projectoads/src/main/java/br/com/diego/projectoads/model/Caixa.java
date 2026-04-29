package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.Perfil;
import br.com.diego.projectoads.config.Enum.StatusCaixa;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@ToString(exclude = {"usuario", "empresa"})
@Table(name = "caixa", schema = "public")
public class Caixa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "perfil", nullable = false, length = 20)
    private Perfil perfil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(name = "data_abertura", nullable = false)
    private LocalDateTime dataAbertura;

    @Column(name = "data_fechamento")
    private LocalDateTime dataFechamento;

    @Column(name = "valor_inicial", nullable = false, precision = 18, scale = 2)
    private BigDecimal valorInicial = BigDecimal.ZERO;

    @Column(name = "valor_fechamento", precision = 18, scale = 2)
    private BigDecimal valorFechamento;

    @Column(name = "saldo_calculado", precision = 18, scale = 2)
    private BigDecimal saldoCalculado;

    @Column(name = "divergencia", precision = 18, scale = 2)
    private BigDecimal divergencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusCaixa status = StatusCaixa.ABERTO;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @PrePersist
    public void prePersist() {
        if (dataAbertura == null) {
            dataAbertura = LocalDateTime.now();
        }

        if (valorInicial == null) {
            valorInicial = BigDecimal.ZERO;
        }

        if (status == null) {
            status = StatusCaixa.ABERTO;
        }
    }
}
