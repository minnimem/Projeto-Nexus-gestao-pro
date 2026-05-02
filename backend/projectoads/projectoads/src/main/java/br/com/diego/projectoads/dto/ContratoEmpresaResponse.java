package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.model.ContratoEmpresa;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class ContratoEmpresaResponse {
    public UUID id;
    public String nome;
    public String numero;
    public String tipo;
    public String status;
    public LocalDate dataInicio;
    public LocalDate dataFim;
    public BigDecimal valorMensal;
    public String observacao;
    public UUID empresaId;
    public String empresa;
    public UUID filialId;
    public String filial;
    public LocalDateTime dataCadastro;

    public ContratoEmpresaResponse(ContratoEmpresa contrato) {
        this.id = contrato.getId();
        this.nome = contrato.getNome();
        this.numero = contrato.getNumero();
        this.tipo = contrato.getTipo();
        this.status = contrato.getStatus();
        this.dataInicio = contrato.getDataInicio();
        this.dataFim = contrato.getDataFim();
        this.valorMensal = contrato.getValorMensal();
        this.observacao = contrato.getObservacao();
        this.empresaId = contrato.getEmpresa() != null ? contrato.getEmpresa().getId() : null;
        this.empresa = contrato.getEmpresa() != null ? contrato.getEmpresa().getNome() : null;
        this.filialId = contrato.getFilial() != null ? contrato.getFilial().getId() : null;
        this.filial = contrato.getFilial() != null ? contrato.getFilial().getNome() : null;
        this.dataCadastro = contrato.getDataCadastro();
    }
}
