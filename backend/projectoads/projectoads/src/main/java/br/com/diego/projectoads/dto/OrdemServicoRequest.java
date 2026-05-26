package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.StatusOrdemServico;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class OrdemServicoRequest {

    @NotNull(message = "Empresa obrigatoria.")
    private UUID empresaId;

    private UUID filialId;

    @NotNull(message = "Cliente obrigatorio.")
    private UUID clienteId;

    private UUID tecnicoId;

    private StatusOrdemServico status;

    @NotBlank(message = "Titulo obrigatorio.")
    @Size(max = 160, message = "Titulo nao pode ultrapassar 160 caracteres.")
    private String titulo;

    @Size(max = 2000, message = "Descricao nao pode ultrapassar 2000 caracteres.")
    private String descricao;

    @Size(max = 2000, message = "Checklist nao pode ultrapassar 2000 caracteres.")
    private String checklist;

    private LocalDate prazo;

    @DecimalMin(value = "0.00", message = "Valor estimado nao pode ser negativo.")
    private BigDecimal valorEstimado;

    @Size(max = 60, message = "Tipo de servico nao pode ultrapassar 60 caracteres.")
    private String tipoServico;

    private UUID contratoId;

    private LocalDate garantiaAte;

    private Boolean garantiaCoberta;

    private Boolean recorrente;

    @Min(value = 1, message = "Intervalo de recorrencia deve ser maior que zero.")
    private Integer recorrenciaIntervaloMeses;

    private LocalDate proximaRecorrencia;

    @Size(max = 2000, message = "Pecas utilizadas nao podem ultrapassar 2000 caracteres.")
    private String pecasUtilizadas;

    private List<OrdemServicoPecaRequest> pecas;

    @Size(max = 3000, message = "Evidencias nao podem ultrapassar 3000 caracteres.")
    private String evidencias;

    @Size(max = 3000, message = "Anexos nao podem ultrapassar 3000 caracteres.")
    private String anexos;

    private Boolean assinaturaCliente;

    @Size(max = 160, message = "Nome do responsavel pela assinatura nao pode ultrapassar 160 caracteres.")
    private String assinaturaClienteNome;

    @Size(max = 40, message = "Documento do responsavel pela assinatura nao pode ultrapassar 40 caracteres.")
    private String assinaturaClienteDocumento;

    @Size(max = 500, message = "Observacao da assinatura nao pode ultrapassar 500 caracteres.")
    private String assinaturaClienteObservacao;

    @Size(max = 1000, message = "Observacao nao pode ultrapassar 1000 caracteres.")
    private String observacao;
}
