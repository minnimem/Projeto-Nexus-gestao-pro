package br.com.diego.projectoads.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class FollowUpCobrancaRequest {

    @NotNull(message = "Lancamento financeiro e obrigatorio")
    private UUID financeiroId;

    @Size(max = 30, message = "Canal nao pode ultrapassar 30 caracteres")
    private String canal;

    private LocalDate proximaAcao;

    @Size(max = 1000, message = "Observacao nao pode ultrapassar 1000 caracteres")
    private String observacao;
}
