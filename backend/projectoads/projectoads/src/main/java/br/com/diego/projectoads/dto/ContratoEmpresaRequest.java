package br.com.diego.projectoads.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class ContratoEmpresaRequest {
    @NotBlank(message = "Nome do contrato e obrigatorio")
    @Size(max = 120, message = "Nome do contrato deve ter no maximo 120 caracteres")
    private String nome;
    @Size(max = 80, message = "Numero do contrato deve ter no maximo 80 caracteres")
    private String numero;
    @Size(max = 60, message = "Tipo do contrato deve ter no maximo 60 caracteres")
    private String tipo;
    @Size(max = 40, message = "Status do contrato deve ter no maximo 40 caracteres")
    private String status;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    @DecimalMin(value = "0.00", message = "Valor mensal nao pode ser negativo")
    private BigDecimal valorMensal;
    @Size(max = 500, message = "Observacao deve ter no maximo 500 caracteres")
    private String observacao;
    private UUID filialId;
}
