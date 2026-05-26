package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.Perfil;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

@Service("usuarioPermissionService")
public class UsuarioPermissionService {

    private final UsuarioRepository usuarioRepository;
    private final Map<String, Set<Perfil>> moduleAccess = new LinkedHashMap<>();
    private final Map<String, Set<Perfil>> actionAccess = new LinkedHashMap<>();

    public UsuarioPermissionService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        registerModule("overview", Perfil.ADMIN, Perfil.GERENTE, Perfil.VENDEDOR, Perfil.OPERADOR_CAIXA, Perfil.ESTOQUISTA, Perfil.FINANCEIRO);
        registerModule("pedidos", Perfil.ADMIN, Perfil.GERENTE, Perfil.VENDEDOR);
        registerModule("caixa", Perfil.ADMIN, Perfil.GERENTE, Perfil.OPERADOR_CAIXA);
        registerModule("clientes", Perfil.ADMIN, Perfil.GERENTE, Perfil.VENDEDOR);
        registerModule("produtos", Perfil.ADMIN, Perfil.GERENTE, Perfil.VENDEDOR, Perfil.ESTOQUISTA);
        registerModule("financeiro", Perfil.ADMIN, Perfil.GERENTE, Perfil.FINANCEIRO);
        registerModule("logistica", Perfil.ADMIN, Perfil.GERENTE, Perfil.ESTOQUISTA);
        registerModule("colaboradores", Perfil.ADMIN, Perfil.GERENTE);
        registerModule("relatorios", Perfil.ADMIN, Perfil.GERENTE, Perfil.VENDEDOR, Perfil.ESTOQUISTA, Perfil.FINANCEIRO);
        registerModule("usuarios", Perfil.ADMIN);

        registerAction("manageCollaborators", Perfil.ADMIN);
        registerAction("editRoute", Perfil.ADMIN, Perfil.GERENTE, Perfil.ESTOQUISTA);
        registerAction("printRoute", Perfil.ADMIN, Perfil.GERENTE, Perfil.ESTOQUISTA);
        registerAction("mutateFinance", Perfil.ADMIN, Perfil.GERENTE, Perfil.FINANCEIRO);
        registerAction("reverseFinance", Perfil.ADMIN);
        registerAction("seeProfit", Perfil.ADMIN, Perfil.GERENTE, Perfil.FINANCEIRO);
        registerAction("operateCash", Perfil.ADMIN, Perfil.GERENTE, Perfil.OPERADOR_CAIXA);
        registerAction("manageCommercialFollowUp", Perfil.ADMIN, Perfil.GERENTE, Perfil.VENDEDOR);
    }

    public boolean canAccessModule(Authentication authentication, String module) {
        String normalizedModule = normalizeKey(module);
        if ("caixa".equals(normalizedModule)) {
            return hasCashPermission(authentication, "module:" + normalizedModule);
        }

        return hasPermission(authentication, "module:" + normalizedModule, moduleAccess);
    }

    public boolean canPerform(Authentication authentication, String action) {
        String normalizedAction = normalizeKey(action);
        if ("operateCash".equals(normalizedAction)) {
            return hasCashPermission(authentication, "action:" + normalizedAction);
        }

        return hasPermission(authentication, "action:" + normalizedAction, actionAccess);
    }

    public Set<String> normalizePermissions(Collection<String> permissions) {
        Set<String> normalized = new LinkedHashSet<>();
        if (permissions == null) {
            return normalized;
        }

        for (String permission : permissions) {
            String value = normalizePermission(permission);
            if (value != null) {
                normalized.add(value);
            }
        }

        return normalized;
    }

    private boolean hasPermission(Authentication authentication,
                                  String permissionKey,
                                  Map<String, Set<Perfil>> accessMap) {
        Usuario usuario = resolveUsuario(authentication);
        if (usuario == null || usuario.getPerfil() == null) {
            return false;
        }

        Set<String> blocked = normalizePermissions(usuario.getPermissoesBloqueadas());
        if (blocked.contains(permissionKey)) {
            return false;
        }

        if ("action:managePlans".equals(permissionKey)) {
            return Perfil.MASTER.equals(usuario.getPerfil());
        }

        if (Perfil.MASTER.equals(usuario.getPerfil())) {
            return false;
        }

        Set<String> extras = normalizePermissions(usuario.getPermissoesExtras());
        if (extras.contains(permissionKey)) {
            return true;
        }

        String normalizedKey = permissionKey.substring(permissionKey.indexOf(':') + 1);
        return accessMap.getOrDefault(normalizedKey, Set.of()).contains(usuario.getPerfil());
    }

    private boolean hasCashPermission(Authentication authentication, String permissionKey) {
        Usuario usuario = resolveUsuario(authentication);
        if (usuario == null || usuario.getPerfil() == null) {
            return false;
        }

        Set<String> blocked = normalizePermissions(usuario.getPermissoesBloqueadas());
        if (blocked.contains(permissionKey)) {
            return false;
        }

        return Set.of(Perfil.ADMIN, Perfil.GERENTE, Perfil.OPERADOR_CAIXA).contains(usuario.getPerfil());
    }

    private Usuario resolveUsuario(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }

        return usuarioRepository.findByLoginIgnoreCase(authentication.getName()).orElse(null);
    }

    private void registerModule(String module, Perfil... perfis) {
        moduleAccess.put(module, Set.of(perfis));
    }

    private void registerAction(String action, Perfil... perfis) {
        actionAccess.put(action, Set.of(perfis));
    }

    private String normalizePermission(String permission) {
        if (permission == null || permission.isBlank()) {
            return null;
        }

        String trimmed = permission.trim();
        if (!trimmed.contains(":")) {
            return null;
        }

        String[] parts = trimmed.split(":", 2);
        return parts[0].toLowerCase() + ":" + normalizeKey(parts[1]);
    }

    private String normalizeKey(String key) {
        return key == null ? "" : key.trim();
    }
}
