package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.model.Filial;

import java.time.LocalDateTime;
import java.util.UUID;

public class FilialResponse {
    public UUID id;
    public String nome;
    public String codigo;
    public String cnpj;
    public String telefone;
    public String email;
    public String endereco;
    public String cidade;
    public String uf;
    public Boolean matriz;
    public Boolean ativo;
    public UUID empresaId;
    public String empresa;
    public LocalDateTime dataCadastro;

    public FilialResponse(Filial filial) {
        this.id = filial.getId();
        this.nome = filial.getNome();
        this.codigo = filial.getCodigo();
        this.cnpj = filial.getCnpj();
        this.telefone = filial.getTelefone();
        this.email = filial.getEmail();
        this.endereco = filial.getEndereco();
        this.cidade = filial.getCidade();
        this.uf = filial.getUf();
        this.matriz = filial.getMatriz();
        this.ativo = filial.getAtivo();
        this.empresaId = filial.getEmpresa() != null ? filial.getEmpresa().getId() : null;
        this.empresa = filial.getEmpresa() != null ? filial.getEmpresa().getNome() : null;
        this.dataCadastro = filial.getDataCadastro();
    }
}
