package br.com.diego.projectoads.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MasterEmpresaRequest extends PlanoEmpresaRequest {
    private String nome;
    private String razaoSocial;
    private String cnpj;
    private String telefone;
    private String email;
    private String endereco;
    private String cidade;
    private String uf;
    private String cep;
    private String codigoMunicipio;
    private String inscricaoEstadual;
    private String inscricaoMunicipal;
    private String regimeTributario;
    private String crt;
    private Integer estoqueMinimoPadrao;
    private String adminNome;
    private String adminLogin;
    private String adminSenha;
    private String adminEmail;
    private String adminTelefone;
}
