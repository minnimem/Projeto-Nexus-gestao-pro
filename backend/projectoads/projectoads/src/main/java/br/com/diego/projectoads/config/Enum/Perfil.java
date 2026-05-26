package br.com.diego.projectoads.config.Enum;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Perfil {

        MASTER,
        ADMIN,
        GERENTE,
        VENDEDOR,
        OPERADOR_CAIXA,
        ESTOQUISTA,
        FINANCEIRO;

        @JsonCreator
        public static Perfil fromJson(String value) {
                if (value == null || value.isBlank()) {
                        return null;
                }

                String normalized = value
                        .trim()
                        .toUpperCase()
                        .replace("ROLE_", "")
                        .replace("(A)", "A")
                        .replace("(", "")
                        .replace(")", "")
                        .replace("-", "_")
                        .replace(" ", "_");

                if ("OPERADORA_DE_CAIXA".equals(normalized) ||
                        "OPERADOR_DE_CAIXA".equals(normalized) ||
                        "OPERADOR_A_DE_CAIXA".equals(normalized)) {
                        return OPERADOR_CAIXA;
                }

                return Perfil.valueOf(normalized);
        }
}
