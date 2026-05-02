package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@ToString(exclude = {"empresa", "filial"})
@Table(name = "configuracao_fiscal", schema = "public")
public class ConfiguracaoFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filial_id")
    private Filial filial;

    @Enumerated(EnumType.STRING)
    @Column(name = "modelo", nullable = false, length = 10)
    private ModeloDocumentoFiscal modelo;

    @Enumerated(EnumType.STRING)
    @Column(name = "ambiente", nullable = false, length = 20)
    private AmbienteFiscal ambiente = AmbienteFiscal.HOMOLOGACAO;

    @Column(nullable = false)
    private Boolean ativo = false;

    @Column(length = 20)
    private String serie;

    @Column(name = "proximo_numero")
    private Long proximoNumero;

    @Column(length = 80)
    private String provedor;

    @Column(name = "certificado_alias", length = 120)
    private String certificadoAlias;

    @Column(name = "certificado_senha_env", length = 120)
    private String certificadoSenhaEnv;

    @Column(name = "csc_id", length = 30)
    private String cscId;

    @Column(name = "csc_token_env", length = 120)
    private String cscTokenEnv;

    @Column(name = "endpoint_homologacao", length = 500)
    private String endpointHomologacao;

    @Column(name = "endpoint_producao", length = 500)
    private String endpointProducao;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    @PreUpdate
    public void prePersistOrUpdate() {
        if (this.ambiente == null) {
            this.ambiente = AmbienteFiscal.HOMOLOGACAO;
        }
        if (this.ativo == null) {
            this.ativo = false;
        }
        this.atualizadoEm = LocalDateTime.now();
    }
}
