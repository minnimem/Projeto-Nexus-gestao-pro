package br.com.diego.projectoads.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FilialRequest {
    private String nome;
    private String codigo;
    private String cnpj;
    private String telefone;
    private String email;
    private String endereco;
    private String cidade;
    private String uf;
    private Boolean matriz;
    private Boolean ativo;
}
