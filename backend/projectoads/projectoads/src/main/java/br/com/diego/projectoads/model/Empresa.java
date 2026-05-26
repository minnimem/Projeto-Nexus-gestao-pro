package br.com.diego.projectoads.model;
import br.com.diego.projectoads.config.Enum.PlanoComercial;
import br.com.diego.projectoads.config.Enum.StatusAssinatura;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(name = "razao_social", length = 180)
    private String razaoSocial;

    @Column(length = 20)
    private String cnpj;

    @Column(length = 30)
    private String telefone;

    @Column(length = 120)
    private String email;

    @Column(length = 255)
    private String endereco;

    @Column(length = 80)
    private String cidade;

    @Column(length = 2)
    private String uf;

    @Column(name = "cep", length = 10)
    private String cep;

    @Column(name = "codigo_municipio", length = 7)
    private String codigoMunicipio;

    @Column(name = "inscricao_estadual", length = 30)
    private String inscricaoEstadual;

    @Column(name = "inscricao_municipal", length = 30)
    private String inscricaoMunicipal;

    @Column(name = "regime_tributario", length = 40)
    private String regimeTributario;

    @Column(name = "crt", length = 1)
    private String crt;

    @Column(name = "estoque_minimo_padrao")
    private Integer estoqueMinimoPadrao = 5;

    @Enumerated(EnumType.STRING)
    @Column(name = "plano_comercial", length = 30)
    private PlanoComercial planoComercial = PlanoComercial.STARTER;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_assinatura", length = 30)
    private StatusAssinatura statusAssinatura = StatusAssinatura.TESTE;

    @Column(name = "limite_usuarios")
    private Integer limiteUsuarios = 3;

    @Column(name = "limite_filiais")
    private Integer limiteFiliais = 1;

    @Column(name = "limite_caixas")
    private Integer limiteCaixas = 1;

    @Column(name = "limite_produtos")
    private Integer limiteProdutos = 500;

    @Column(name = "valor_mensal_plano", precision = 12, scale = 2)
    private BigDecimal valorMensalPlano;

    @Column(name = "dia_vencimento_plano")
    private Integer diaVencimentoPlano = 10;

    @Column(name = "ultimo_pagamento_plano")
    private LocalDate ultimoPagamentoPlano;

    @Column(name = "fiscal_liberado")
    private Boolean fiscalLiberado = false;

    @Column(name = "pagamentos_liberado")
    private Boolean pagamentosLiberado = false;

    @Column(name = "notificacoes_liberado")
    private Boolean notificacoesLiberado = false;

    @Column(name = "logistica_liberada")
    private Boolean logisticaLiberada = false;

    @Column(name = "servicos_liberado")
    private Boolean servicosLiberado = false;

    @Column(name = "auditoria_avancada_liberada")
    private Boolean auditoriaAvancadaLiberada = false;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    @PostLoad
    public void normalizarPlano() {
        if (planoComercial == null) {
            planoComercial = PlanoComercial.STARTER;
        }
        if (statusAssinatura == null) {
            statusAssinatura = StatusAssinatura.TESTE;
        }
        if (limiteUsuarios == null) {
            limiteUsuarios = 3;
        }
        if (limiteFiliais == null) {
            limiteFiliais = 1;
        }
        if (limiteCaixas == null) {
            limiteCaixas = 1;
        }
        if (limiteProdutos == null) {
            limiteProdutos = 500;
        }
        if (diaVencimentoPlano == null) {
            diaVencimentoPlano = 10;
        }
        if (fiscalLiberado == null) {
            fiscalLiberado = false;
        }
        if (pagamentosLiberado == null) {
            pagamentosLiberado = false;
        }
        if (notificacoesLiberado == null) {
            notificacoesLiberado = false;
        }
        if (logisticaLiberada == null) {
            logisticaLiberada = false;
        }
        if (servicosLiberado == null) {
            servicosLiberado = false;
        }
        if (auditoriaAvancadaLiberada == null) {
            auditoriaAvancadaLiberada = false;
        }
    }
}
