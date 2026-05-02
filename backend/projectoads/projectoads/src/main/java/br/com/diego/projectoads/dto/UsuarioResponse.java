package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.model.Usuario;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class UsuarioResponse {

    private UUID id;
    private String nome;
    private String login;
    private String perfil;
    private Boolean ativo;
    private Boolean bloqueado;
    private Integer tentativasLogin;
    private UUID empresaId;
    private String empresa;
    private UUID filialId;
    private String filial;
    private LocalDateTime dataCriacao;
    private String cargo;
    private String departamento;
    private BigDecimal salario;
    private BigDecimal metaVendas;
    private LocalDate dataInicio;
    private String telefone;
    private String email;
    private String documento;
    private List<String> permissoesExtras;
    private List<String> permissoesBloqueadas;

    public UsuarioResponse(Usuario u) {
        this.id = u.getId();
        this.nome = u.getNome();
        this.login = u.getLogin();
        this.perfil = u.getPerfil() != null ? u.getPerfil().name() : null;
        this.ativo = u.getAtivo();
        this.bloqueado = u.getBloqueado();
        this.tentativasLogin = u.getTentativasLogin();
        this.empresaId = u.getEmpresa() != null ? u.getEmpresa().getId() : null;
        this.empresa = u.getEmpresa() != null ? u.getEmpresa().getNome() : null;
        this.filialId = u.getFilial() != null ? u.getFilial().getId() : null;
        this.filial = u.getFilial() != null ? u.getFilial().getNome() : null;
        this.dataCriacao = u.getDataCriacao();
        this.cargo = u.getCargo();
        this.departamento = u.getDepartamento();
        this.salario = u.getSalario();
        this.metaVendas = u.getMetaVendas();
        this.dataInicio = u.getDataInicio();
        this.telefone = u.getTelefone();
        this.email = u.getEmail();
        this.documento = u.getDocumento();
        this.permissoesExtras = u.getPermissoesExtras() != null ? u.getPermissoesExtras().stream().sorted().toList() : List.of();
        this.permissoesBloqueadas = u.getPermissoesBloqueadas() != null ? u.getPermissoesBloqueadas().stream().sorted().toList() : List.of();
    }

    public UUID getId() { return id; }
    public String getNome() { return nome; }
    public String getLogin() { return login; }
    public String getPerfil() { return perfil; }
    public Boolean getAtivo() { return ativo; }
    public Boolean getBloqueado() { return bloqueado; }
    public Integer getTentativasLogin() { return tentativasLogin; }
    public UUID getEmpresaId() { return empresaId; }
    public String getEmpresa() { return empresa; }
    public UUID getFilialId() { return filialId; }
    public String getFilial() { return filial; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public String getCargo() { return cargo; }
    public String getDepartamento() { return departamento; }
    public BigDecimal getSalario() { return salario; }
    public BigDecimal getMetaVendas() { return metaVendas; }
    public LocalDate getDataInicio() { return dataInicio; }
    public String getTelefone() { return telefone; }
    public String getEmail() { return email; }
    public String getDocumento() { return documento; }
    public List<String> getPermissoesExtras() { return permissoesExtras; }
    public List<String> getPermissoesBloqueadas() { return permissoesBloqueadas; }
}
