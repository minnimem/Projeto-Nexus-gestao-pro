package br.com.diego.projectoads.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmpresaRequest {
    private String nome;
    private String razaoSocial;
    private String cnpj;
    private String telefone;
    private String email;
    private String endereco;
    private String cidade;
    private String uf;
    private Integer estoqueMinimoPadrao;
}
