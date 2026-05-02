package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.Perfil;
import br.com.diego.projectoads.config.StringSetConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "usuario", schema = "public")
@Getter
@Setter
@ToString(exclude = {"senhaUsuario", "filial"})
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_usuario")
    private UUID id;

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 50)
    @Column(name = "nome", length = 50, nullable = false)
    private String nome;

    @NotBlank(message = "Login é obrigatório")
    @Column(name = "login", length = 50, nullable = false, unique = true)
    private String login;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6)
    @Column(name = "senha_usuario", length = 255, nullable = false)
    private String senhaUsuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "perfil", nullable = false, length = 20)
    private Perfil perfil;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    @Column(name = "tentativas_login")
    private Integer tentativasLogin = 0;

    @Column(name = "bloqueado")
    private Boolean bloqueado = false;

    @Column(name = "bloqueado_ate")
    private LocalDateTime bloqueadoAte;

    @Column(name = "cargo", length = 80)
    private String cargo;

    @Column(name = "departamento", length = 80)
    private String departamento;

    @Column(name = "salario", precision = 12, scale = 2)
    private BigDecimal salario;

    @Column(name = "meta_vendas", precision = 12, scale = 2)
    private BigDecimal metaVendas;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "telefone", length = 30)
    private String telefone;

    @Column(name = "email", length = 120)
    private String email;

    @Column(name = "documento", length = 30)
    private String documento;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filial_id")
    private Filial filial;

    @Convert(converter = StringSetConverter.class)
    @Column(name = "permissoes_extras", length = 2000)
    private Set<String> permissoesExtras = new LinkedHashSet<>();

    @Convert(converter = StringSetConverter.class)
    @Column(name = "permissoes_bloqueadas", length = 2000)
    private Set<String> permissoesBloqueadas = new LinkedHashSet<>();

    @PrePersist
    public void prePersist() {
        this.dataCriacao = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}
