package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.StatusRota;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@ToString(exclude = {"entregador", "veiculo"})
@Table(name = "rota_entrega")
public class RotaEntrega {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_rota", nullable = false)
    private UUID id;

    @Column(name = "nome", nullable = false, length = 120)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StatusRota status = StatusRota.ABERTA;

    @Column(name = "data_rota", nullable = false)
    private LocalDate dataRota;

    @Column(name = "horario_saida")
    private LocalDateTime horarioSaida;

    @Column(name = "horario_retorno")
    private LocalDateTime horarioRetorno;

    @ManyToOne
    @JoinColumn(name = "id_entregador")
    private Entregador entregador;

    @ManyToOne
    @JoinColumn(name = "id_veiculo")
    private Veiculo veiculo;

    @Column(name = "quantidade_entregas")
    private Integer quantidadeEntregas = 0;

    @Column(name = "distancia_km")
    private BigDecimal distanciaKm;

    @Column(name = "custo_estimado")
    private BigDecimal custoEstimado = BigDecimal.ZERO;

    @Column(name = "pagamento_entrega", length = 30)
    private String pagamentoEntrega = "JA_PAGO";

    @Column(name = "observacao")
    private String observacao;

    @CreationTimestamp
    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
}
