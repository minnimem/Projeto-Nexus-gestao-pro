package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.Perfil;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UsuarioPermissionServiceTest {

    private UsuarioRepository usuarioRepository;
    private UsuarioPermissionService service;

    @BeforeEach
    void setUp() {
        usuarioRepository = mock(UsuarioRepository.class);
        service = new UsuarioPermissionService(usuarioRepository);
    }

    @Test
    void vendedorNaoOperaCaixaMasGerenciaFollowUpComercial() {
        Usuario vendedor = usuario("vendedor", Perfil.VENDEDOR);
        when(usuarioRepository.findByLoginIgnoreCase("vendedor")).thenReturn(Optional.of(vendedor));

        Authentication auth = new UsernamePasswordAuthenticationToken("vendedor", "senha");

        assertThat(service.canPerform(auth, "operateCash")).isFalse();
        assertThat(service.canPerform(auth, "manageCommercialFollowUp")).isTrue();
    }

    @Test
    void gerentePodeOperarCaixaEFollowUpComercial() {
        Usuario gerente = usuario("gerente", Perfil.GERENTE);
        when(usuarioRepository.findByLoginIgnoreCase("gerente")).thenReturn(Optional.of(gerente));

        Authentication auth = new UsernamePasswordAuthenticationToken("gerente", "senha");

        assertThat(service.canPerform(auth, "operateCash")).isTrue();
        assertThat(service.canPerform(auth, "manageCommercialFollowUp")).isTrue();
    }

    @Test
    void bloqueioIndividualRemoveFollowUpComercialDoVendedor() {
        Usuario vendedor = usuario("vendedor", Perfil.VENDEDOR);
        vendedor.setPermissoesBloqueadas(new LinkedHashSet<>(Set.of("action:manageCommercialFollowUp")));
        when(usuarioRepository.findByLoginIgnoreCase("vendedor")).thenReturn(Optional.of(vendedor));

        Authentication auth = new UsernamePasswordAuthenticationToken("vendedor", "senha");

        assertThat(service.canPerform(auth, "manageCommercialFollowUp")).isFalse();
    }

    @Test
    void permissaoExtraNaoLiberaCaixaParaVendedor() {
        Usuario vendedor = usuario("vendedor", Perfil.VENDEDOR);
        vendedor.setPermissoesExtras(new LinkedHashSet<>(Set.of("action:operateCash", "module:caixa")));
        when(usuarioRepository.findByLoginIgnoreCase("vendedor")).thenReturn(Optional.of(vendedor));

        Authentication auth = new UsernamePasswordAuthenticationToken("vendedor", "senha");

        assertThat(service.canAccessModule(auth, "caixa")).isFalse();
        assertThat(service.canPerform(auth, "operateCash")).isFalse();
    }

    private Usuario usuario(String login, Perfil perfil) {
        Usuario usuario = new Usuario();
        usuario.setLogin(login);
        usuario.setPerfil(perfil);
        return usuario;
    }
}
