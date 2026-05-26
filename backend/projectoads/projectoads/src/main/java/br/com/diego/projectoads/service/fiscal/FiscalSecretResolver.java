package br.com.diego.projectoads.service.fiscal;

import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class FiscalSecretResolver {

    private final Map<String, String> environment;

    public FiscalSecretResolver() {
        this(System.getenv());
    }

    public FiscalSecretResolver(Map<String, String> environment) {
        this.environment = environment;
    }

    public FiscalSecretStatus validarSegredos(ConfiguracaoFiscal configuracao) {
        List<String> pendencias = new ArrayList<>();
        if (configuracao == null) {
            pendencias.add("Configuracao fiscal obrigatoria para validar segredos.");
            return new FiscalSecretStatus(false, pendencias);
        }

        validarVariavel(configuracao.getCertificadoArquivoEnv(), "Definir a variavel de ambiente do arquivo do certificado.", pendencias);
        validarVariavel(configuracao.getCertificadoSenhaEnv(), "Definir a variavel de ambiente da senha do certificado.", pendencias);
        if (configuracao.getModelo() == ModeloDocumentoFiscal.NFCE) {
            validarVariavel(configuracao.getCscTokenEnv(), "Definir a variavel de ambiente do token CSC da NFC-e.", pendencias);
        }

        return new FiscalSecretStatus(pendencias.isEmpty(), pendencias);
    }

    public String resolverObrigatorio(String variableName, String mensagemErro) {
        if (isBlank(variableName) || isBlank(environment.get(variableName.trim()))) {
            throw new IllegalStateException(mensagemErro);
        }
        return environment.get(variableName.trim());
    }

    public String resolverOpcional(String variableName, String mensagemErro) {
        if (isBlank(variableName)) {
            return null;
        }
        String value = environment.get(variableName.trim());
        if (isBlank(value)) {
            throw new IllegalStateException(mensagemErro);
        }
        return value;
    }

    private void validarVariavel(String variableName, String mensagem, List<String> pendencias) {
        if (isBlank(variableName) || isBlank(environment.get(variableName.trim()))) {
            pendencias.add(mensagem);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
