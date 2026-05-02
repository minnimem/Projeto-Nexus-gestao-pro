package br.com.diego.projectoads.model;

import br.com.diego.projectoads.exception.BusinessException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "configuracao_comissao")
public class ConfiguracaoComissao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_configuracao_comissao")
    private UUID id;

    @Column(name = "percentual_padrao", nullable = false, precision = 5, scale = 2)
    private BigDecimal percentualPadrao = BigDecimal.valueOf(3);

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist
    @PreUpdate
    public void preSave() {
        if (percentualPadrao == null ||
                percentualPadrao.compareTo(BigDecimal.ZERO) < 0 ||
                percentualPadrao.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BusinessException("Percentual de comissao deve ficar entre 0 e 100");
        }
        if (ativo == null) {
            ativo = true;
        }
        atualizadoEm = LocalDateTime.now();
    }
}
