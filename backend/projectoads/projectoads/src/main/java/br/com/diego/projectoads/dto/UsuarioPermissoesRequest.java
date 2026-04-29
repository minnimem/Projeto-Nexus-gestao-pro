package br.com.diego.projectoads.dto;

import java.util.List;

public class UsuarioPermissoesRequest {

    private List<String> permissoesExtras;
    private List<String> permissoesBloqueadas;

    public List<String> getPermissoesExtras() {
        return permissoesExtras;
    }

    public void setPermissoesExtras(List<String> permissoesExtras) {
        this.permissoesExtras = permissoesExtras;
    }

    public List<String> getPermissoesBloqueadas() {
        return permissoesBloqueadas;
    }

    public void setPermissoesBloqueadas(List<String> permissoesBloqueadas) {
        this.permissoesBloqueadas = permissoesBloqueadas;
    }
}
