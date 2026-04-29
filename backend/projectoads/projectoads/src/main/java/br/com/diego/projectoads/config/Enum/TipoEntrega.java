package br.com.diego.projectoads.config.Enum;

public enum TipoEntrega {
    RETIRADA_LOJA("Retirar na loja"),
    ENTREGA("Entregar no endereco");

    private final String descricao;

    TipoEntrega(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
