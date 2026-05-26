package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.AuditoriaEvento;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class MasterEmpresaResponse {
    public UUID id;
    public String nome;
    public String razaoSocial;
    public String cnpj;
    public String email;
    public String telefone;
    public String cidade;
    public String uf;
    public Boolean ativo;
    public LocalDateTime dataCadastro;
    public String planoComercial;
    public String statusAssinatura;
    public Integer limiteUsuarios;
    public Integer limiteFiliais;
    public Integer limiteCaixas;
    public Integer limiteProdutos;
    public BigDecimal valorMensalPlano;
    public Integer diaVencimentoPlano;
    public LocalDate ultimoPagamentoPlano;
    public Boolean fiscalLiberado;
    public Boolean pagamentosLiberado;
    public Boolean notificacoesLiberado;
    public Boolean logisticaLiberada;
    public Boolean servicosLiberado;
    public Boolean auditoriaAvancadaLiberada;
    public long usuariosAtivos;
    public long filiais;
    public PlanoEmpresaResponse plano;
    public List<LiberacaoModuloResponse> liberacoes;
    public List<AuditoriaEvento> historicoComercial;

    public MasterEmpresaResponse(Empresa empresa,
                                 long usuariosAtivos,
                                 long filiais,
                                 PlanoEmpresaResponse plano,
                                 List<LiberacaoModuloResponse> liberacoes,
                                 List<AuditoriaEvento> historicoComercial) {
        empresa.normalizarPlano();
        this.id = empresa.getId();
        this.nome = empresa.getNome();
        this.razaoSocial = empresa.getRazaoSocial();
        this.cnpj = empresa.getCnpj();
        this.email = empresa.getEmail();
        this.telefone = empresa.getTelefone();
        this.cidade = empresa.getCidade();
        this.uf = empresa.getUf();
        this.ativo = empresa.getAtivo();
        this.dataCadastro = empresa.getDataCadastro();
        this.planoComercial = empresa.getPlanoComercial().name();
        this.statusAssinatura = empresa.getStatusAssinatura().name();
        this.limiteUsuarios = empresa.getLimiteUsuarios();
        this.limiteFiliais = empresa.getLimiteFiliais();
        this.limiteCaixas = empresa.getLimiteCaixas();
        this.limiteProdutos = empresa.getLimiteProdutos();
        this.valorMensalPlano = empresa.getValorMensalPlano();
        this.diaVencimentoPlano = empresa.getDiaVencimentoPlano();
        this.ultimoPagamentoPlano = empresa.getUltimoPagamentoPlano();
        this.fiscalLiberado = empresa.getFiscalLiberado();
        this.pagamentosLiberado = empresa.getPagamentosLiberado();
        this.notificacoesLiberado = empresa.getNotificacoesLiberado();
        this.logisticaLiberada = empresa.getLogisticaLiberada();
        this.servicosLiberado = empresa.getServicosLiberado();
        this.auditoriaAvancadaLiberada = empresa.getAuditoriaAvancadaLiberada();
        this.usuariosAtivos = usuariosAtivos;
        this.filiais = filiais;
        this.plano = plano;
        this.liberacoes = liberacoes;
        this.historicoComercial = historicoComercial;
    }
}
