package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.StatusEntrega;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@ToString(exclude = {"pedido", "rotaEntrega", "entregador", "veiculo"})
@Table(name = "entrega")
public class Entrega {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_entrega", nullable = false)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "id_rota")
    private RotaEntrega rotaEntrega;

    @ManyToOne
    @JoinColumn(name = "id_entregador")
    private Entregador entregador;

    @ManyToOne
    @JoinColumn(name = "id_veiculo")
    private Veiculo veiculo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusEntrega status = StatusEntrega.PENDENTE;

    @Column(name = "prioridade")
    private String prioridade = "NORMAL";

    @Column(name = "transportadora")
    private String transportadora;

    @Column(name = "codigo_rastreio")
    private String codigoRastreio;

    @Column(name = "placa_veiculo")
    private String placaVeiculo;

    @Column(name = "previsao_entrega")
    private LocalDateTime previsaoEntrega;

    @CreationTimestamp
    @Column(name = "data_envio", nullable = false)
    private LocalDateTime dataEnvio;

    @Column(name = "data_entrega")
    private LocalDateTime dataEntrega;

    @Column(name = "endereco_entrega")
    private String enderecoEntrega;

    @Column(name = "bairro_entrega")
    private String bairroEntrega;

    @Column(name = "cidade_entrega")
    private String cidadeEntrega;

    @Column(name = "telefone_contato")
    private String telefoneContato;

    @Column(name = "valor_frete")
    private Double valorFrete = 0.0;

    @Column(name = "observacao")
    private String observacao;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
}