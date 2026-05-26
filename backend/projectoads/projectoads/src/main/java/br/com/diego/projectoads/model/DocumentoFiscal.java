package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import br.com.diego.projectoads.config.Enum.StatusDocumentoFiscal;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@ToString(exclude = {"pedido", "configuracaoFiscal", "empresa", "filial"})
@Table(name = "documento_fiscal", schema = "public")
public class DocumentoFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "configuracao_fiscal_id", nullable = false)
    private ConfiguracaoFiscal configuracaoFiscal;

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
    private AmbienteFiscal ambiente;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StatusDocumentoFiscal status = StatusDocumentoFiscal.PREPARADO_HOMOLOGACAO;

    @Column(length = 20)
    private String serie;

    @Column(nullable = false)
    private Long numero;

    @Column(name = "chave_acesso", length = 80)
    private String chaveAcesso;

    @Column(length = 80)
    private String protocolo;

    @Column(length = 80)
    private String provedor;

    @Column(name = "payload_json", columnDefinition = "TEXT")
    private String payloadJson;

    @Column(name = "xml_envio", columnDefinition = "TEXT")
    private String xmlEnvio;

    @Column(name = "xml_retorno", columnDefinition = "TEXT")
    private String xmlRetorno;

    @Column(name = "danfe_html", columnDefinition = "TEXT")
    private String danfeHtml;

    @Column(name = "carta_correcao_xml", columnDefinition = "TEXT")
    private String cartaCorrecaoXml;

    @Column(name = "carta_correcao_texto", columnDefinition = "TEXT")
    private String cartaCorrecaoTexto;

    @Column(name = "carta_correcao_sequencia")
    private Integer cartaCorrecaoSequencia;

    @Column(name = "mensagem_retorno", columnDefinition = "TEXT")
    private String mensagemRetorno;

    @Column(name = "pendencias_fiscais", columnDefinition = "TEXT")
    private String pendenciasFiscais;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.criadoEm == null) {
            this.criadoEm = now;
        }
        this.atualizadoEm = now;
        if (this.status == null) {
            this.status = StatusDocumentoFiscal.PREPARADO_HOMOLOGACAO;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }
}
