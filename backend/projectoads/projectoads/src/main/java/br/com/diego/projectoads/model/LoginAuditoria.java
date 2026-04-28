package br.com.diego.projectoads.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class LoginAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String login;
    private Boolean sucesso;
    private String ip;
    private LocalDateTime data;

    public LoginAuditoria() {}

    public LoginAuditoria(String login, Boolean sucesso, String ip, LocalDateTime data) {
        this.login = login;
        this.sucesso = sucesso;
        this.ip = ip;
        this.data = data;
    }
}