package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.StatusOrdemServico;
import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "ordem_servico", schema = "public")
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 30, unique = true)
    private String numero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filial_id")
    private Filial filial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id")
    private Usuario tecnico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "financeiro_id")
    private Financeiro financeiro;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusOrdemServico status = StatusOrdemServico.ABERTA;

    @Column(nullable = false, length = 160)
    private String titulo;

    @Column(length = 2000)
    private String descricao;

    @Column(name = "checklist", length = 2000)
    private String checklist;

    @Column(name = "data_abertura", nullable = false)
    private LocalDateTime dataAbertura;

    @Column(name = "prazo")
    private LocalDate prazo;

    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;

    @Column(name = "valor_estimado", precision = 12, scale = 2)
    private BigDecimal valorEstimado;

    @Column(name = "tipo_servico", length = 60)
    private String tipoServico;

    @Column(name = "contrato_id")
    private UUID contratoId;

    @Column(name = "garantia_ate")
    private LocalDate garantiaAte;

    @Column(name = "garantia_coberta")
    private Boolean garantiaCoberta = false;

    @Column(name = "recorrente")
    private Boolean recorrente = false;

    @Column(name = "recorrencia_intervalo_meses")
    private Integer recorrenciaIntervaloMeses;

    @Column(name = "proxima_recorrencia")
    private LocalDate proximaRecorrencia;

    @Column(name = "pecas_utilizadas", length = 2000)
    private String pecasUtilizadas;

    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrdemServicoPeca> pecas = new ArrayList<>();

    @Column(name = "evidencias", length = 3000)
    private String evidencias;

    @Column(name = "anexos", length = 3000)
    private String anexos;

    @Column(name = "assinatura_cliente")
    private Boolean assinaturaCliente = false;

    @Column(name = "assinatura_cliente_nome", length = 160)
    private String assinaturaClienteNome;

    @Column(name = "assinatura_cliente_documento", length = 40)
    private String assinaturaClienteDocumento;

    @Column(name = "assinatura_cliente_observacao", length = 500)
    private String assinaturaClienteObservacao;

    @Column(name = "assinatura_cliente_registrada_em")
    private LocalDateTime assinaturaClienteRegistradaEm;

    @Column(name = "pecas_estoque_baixado")
    private Boolean pecasEstoqueBaixado = false;

    @Column(name = "pecas_estoque_baixado_em")
    private LocalDateTime pecasEstoqueBaixadoEm;

    @Column(length = 1000)
    private String observacao;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (dataAbertura == null) {
            dataAbertura = now;
        }
        if (criadoEm == null) {
            criadoEm = now;
        }
        atualizadoEm = now;
        if (status == null) {
            status = StatusOrdemServico.ABERTA;
        }
    }

    @PreUpdate
    public void preUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
}
