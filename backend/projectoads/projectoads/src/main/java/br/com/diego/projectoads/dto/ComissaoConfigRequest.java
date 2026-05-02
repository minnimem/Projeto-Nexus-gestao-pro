package br.com.diego.projectoads.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ComissaoConfigRequest {
    private BigDecimal percentualPadrao;
}
