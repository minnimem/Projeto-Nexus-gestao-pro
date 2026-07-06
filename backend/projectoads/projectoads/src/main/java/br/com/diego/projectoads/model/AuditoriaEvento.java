package br.com.diego.projectoads.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "auditoria_evento", schema = "public")
public class AuditoriaEvento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_auditoria")
    private UUID id;

    @Column(name = "data_evento", nullable = false)
    private LocalDateTime dataEvento;

    @Column(name = "usuario_login", length = 80)
    private String usuarioLogin;

    @Column(name = "usuario_id", length = 80)
    private String usuarioId;

    @Column(name = "usuario_nome", length = 120)
    private String usuarioNome;

    @Column(name = "perfil", length = 30)
    private String perfil;

    @Column(name = "modulo", length = 60, nullable = false)
    private String modulo;

    @Column(name = "acao", length = 80, nullable = false)
    private String acao;

    @Column(name = "descricao", length = 500)
    private String descricao;

    @Column(name = "referencia_id", length = 80)
    private String referenciaId;

    @Column(name = "entidade", length = 120)
    private String entidade;

    @Column(name = "registro_id", length = 120)
    private String registroId;

    @Column(name = "registro_nome", length = 255)
    private String registroNome;

    @Column(name = "metodo_http", length = 12)
    private String metodoHttp;

    @Column(name = "rota", length = 255)
    private String rota;

    @PrePersist
    public void prePersist() {
        if (dataEvento == null) {
            dataEvento = LocalDateTime.now();
        }
    }
}
