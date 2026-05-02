package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class FinanceiroResponse {
    private UUID id;
    private LocalDateTime dataLancamento;
    private LocalDate dataVencimento;
    private String descricao;
    private TipoFinanceiro tipo;
    private String categoria;
    private BigDecimal valor;
    private MetodoPagamento metodoPagamento;
    private String metodoPagamentoDescricao;
    private StatusPagamento status;
    private UUID pedidoId;
    private UUID usuarioId;
    private UUID filialId;
    private String filial;
    private UUID recorrenciaId;
    private String observacao;
    private String codigoCobranca;
    private String pixCopiaCola;
    private String pixQrCodeUrl;
    private String boletoLinhaDigitavel;
    private String boletoNumeroDocumento;
    private String boletoNossoNumero;
    private String cobrancaProvedor;
    private String cobrancaExternaId;
    private String cobrancaUrl;
    private LocalDateTime cobrancaGeradaEm;
    private LocalDateTime cobrancaExpiraEm;
}
