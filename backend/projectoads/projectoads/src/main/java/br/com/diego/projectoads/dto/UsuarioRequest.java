package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.Perfil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class UsuarioRequest {

    @NotBlank(message = "Nome obrigatorio")
    private String nome;

    @NotBlank(message = "Login obrigatorio")
    private String login;

    @Size(min = 6, message = "Senha deve ter no minimo 6 caracteres")
    private String senha;

    private Perfil perfil;

    private String cargo;

    private String departamento;

    private BigDecimal salario;

    private LocalDate dataInicio;

    private String telefone;

    private String email;

    private String documento;
}
