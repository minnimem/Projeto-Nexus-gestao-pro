package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.PlanoComercial;
import br.com.diego.projectoads.config.Enum.StatusAssinatura;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class PlanoEmpresaRequest {
    private PlanoComercial planoComercial;
    private StatusAssinatura statusAssinatura;
    private Integer limiteUsuarios;
    private Integer limiteFiliais;
    private Integer limiteCaixas;
    private Integer limiteProdutos;
    private BigDecimal valorMensalPlano;
    private Integer diaVencimentoPlano;
    private LocalDate ultimoPagamentoPlano;
    private Boolean fiscalLiberado;
    private Boolean pagamentosLiberado;
    private Boolean notificacoesLiberado;
    private Boolean logisticaLiberada;
    private Boolean servicosLiberado;
    private Boolean auditoriaAvancadaLiberada;
    private String observacaoComercial;
}
