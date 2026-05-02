package br.com.diego.projectoads.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class ContratoEmpresaRequest {
    private String nome;
    private String numero;
    private String tipo;
    private String status;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private BigDecimal valorMensal;
    private String observacao;
    private UUID filialId;
}
