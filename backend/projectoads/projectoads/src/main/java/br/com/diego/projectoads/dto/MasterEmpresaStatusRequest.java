package br.com.diego.projectoads.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MasterEmpresaStatusRequest {
    private Boolean ativo;
    private String observacaoComercial;
}
