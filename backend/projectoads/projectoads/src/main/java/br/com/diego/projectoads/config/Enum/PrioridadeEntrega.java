package br.com.diego.projectoads.config.Enum;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;


@Getter
public enum PrioridadeEntrega {

    BAIXA("BAIXA", "Baixa"),
    NORMAL("NORMAL", "Normal"),
    ALTA("ALTA", "Alta"),
    URGENTE("URGENTE", "Urgente");

    private final String codigo;
    private final String descricao;

    PrioridadeEntrega(String codigo, String descricao) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    // 🔥 JSON bonito
    @JsonValue
    public String toJson() {
        return descricao;
    }

    // 🔥
    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static PrioridadeEntrega from(String value) {
        for (PrioridadeEntrega p : values()) {
            if (p.codigo.equalsIgnoreCase(value) || p.descricao.equalsIgnoreCase(value)) {
                return p;
            }
        }
        throw new IllegalArgumentException("Prioridade inválida: " + value);
    }
}
