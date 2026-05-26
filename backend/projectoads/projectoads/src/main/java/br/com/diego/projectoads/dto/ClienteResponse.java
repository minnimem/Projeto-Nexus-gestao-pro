package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.model.Cliente;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class ClienteResponse {

    public UUID id;
    public String nome;
    public String cpf;
    public LocalDate dataNascimento;
    public String email;
    public String telefone;
    public String endereco;
    public String numero;
    public String bairro;
    public String cidade;
    public String uf;
    public String cep;
    public String codigoMunicipio;
    public String inscricaoEstadual;
    public LocalDateTime dataCriacao;

    public ClienteResponse(Cliente cliente) {
        this.id = cliente.getIdCliente();
        this.nome = cliente.getNome();
        this.cpf = cliente.getCpf();
        this.dataNascimento = cliente.getDataNascimento();
        this.email = cliente.getEmail();
        this.telefone = cliente.getTelefone();
        this.endereco = cliente.getEndereco();
        this.numero = cliente.getNumero();
        this.bairro = cliente.getBairro();
        this.cidade = cliente.getCidade();
        this.uf = cliente.getUf();
        this.cep = cliente.getCep();
        this.codigoMunicipio = cliente.getCodigoMunicipio();
        this.inscricaoEstadual = cliente.getInscricaoEstadual();
        this.dataCriacao = cliente.getDataCriacao();
    }
}
