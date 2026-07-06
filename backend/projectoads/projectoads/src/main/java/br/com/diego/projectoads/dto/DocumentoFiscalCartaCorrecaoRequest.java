package br.com.diego.projectoads.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentoFiscalCartaCorrecaoRequest {
    @NotBlank(message = "Texto da correcao e obrigatorio")
    @Size(min = 15, max = 1000, message = "Texto da correcao deve ter entre 15 e 1000 caracteres")
    private String textoCorrecao;
}
