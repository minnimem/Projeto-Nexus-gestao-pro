package br.com.diego.projectoads.security;

import br.com.diego.projectoads.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;

public class CustomUserDetails implements UserDetails {

    private final Usuario usuario;
    private final UUID id;
    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Usuario usuario,
                             Collection<? extends GrantedAuthority> authorities) {
        this.usuario = usuario;
        this.id = usuario.getId();
        this.username = usuario.getLogin();
        this.password = usuario.getSenhaUsuario();
        this.authorities = authorities;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public UUID getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !Boolean.TRUE.equals(usuario.getBloqueado());
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(usuario.getAtivo())
                && usuario.getEmpresa() != null
                && Boolean.TRUE.equals(usuario.getEmpresa().getAtivo());
    }
}
