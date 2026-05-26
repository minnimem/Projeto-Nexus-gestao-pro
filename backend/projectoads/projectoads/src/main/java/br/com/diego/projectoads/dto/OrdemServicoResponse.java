package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.StatusOrdemServico;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class OrdemServicoResponse {
    private UUID id;
    private String numero;
    private UUID empresaId;
    private String empresa;
    private UUID filialId;
    private String filial;
    private UUID clienteId;
    private String cliente;
    private UUID tecnicoId;
    private String tecnico;
    private UUID financeiroId;
    private StatusOrdemServico status;
    private String titulo;
    private String descricao;
    private String checklist;
    private LocalDateTime dataAbertura;
    private LocalDate prazo;
    private LocalDateTime dataConclusao;
    private BigDecimal valorEstimado;
    private String tipoServico;
    private UUID contratoId;
    private LocalDate garantiaAte;
    private Boolean garantiaCoberta;
    private Boolean recorrente;
    private Integer recorrenciaIntervaloMeses;
    private LocalDate proximaRecorrencia;
    private String pecasUtilizadas;
    private List<OrdemServicoPecaResponse> pecas;
    private String evidencias;
    private String anexos;
    private Boolean assinaturaCliente;
    private String assinaturaClienteNome;
    private String assinaturaClienteDocumento;
    private String assinaturaClienteObservacao;
    private LocalDateTime assinaturaClienteRegistradaEm;
    private Boolean pecasEstoqueBaixado;
    private LocalDateTime pecasEstoqueBaixadoEm;
    private String observacao;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
