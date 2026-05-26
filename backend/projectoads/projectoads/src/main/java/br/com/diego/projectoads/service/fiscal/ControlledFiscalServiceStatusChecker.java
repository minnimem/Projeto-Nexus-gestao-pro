package br.com.diego.projectoads.service.fiscal;

import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "nexus.fiscal", name = "provider", havingValue = "controlled", matchIfMissing = true)
public class ControlledFiscalServiceStatusChecker implements FiscalServiceStatusChecker {

    @Override
    public FiscalServiceStatusResult consultar(ConfiguracaoFiscal configuracao) {
        return new FiscalServiceStatusResult(
                true,
                "DISPONIVEL_HOMOLOGACAO_CONTROLADA",
                "Configuracao pronta para consulta/transmissao em homologacao controlada."
        );
    }
}
