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
    public LocalDateTime dataCriacao;

    public ClienteResponse(Cliente cliente) {
        this.id = cliente.getIdCliente();
        this.nome = cliente.getNome();
        this.cpf = cliente.getCpf();
        this.dataNascimento = cliente.getDataNascimento();
        this.email = cliente.getEmail();
        this.telefone = cliente.getTelefone();
        this.endereco = cliente.getEndereco();
        this.dataCriacao = cliente.getDataCriacao();
    }
}
