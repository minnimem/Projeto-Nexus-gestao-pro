package br.com.diego.projectoads.service;

import br.com.diego.projectoads.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final String secret;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms:3600000}") long expirationMs
    ) {
        if (secret == null || secret.isBlank() || secret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET deve ter pelo menos 32 caracteres.");
        }
        if (expirationMs < 300000) {
            throw new IllegalStateException("jwt.expiration-ms deve ser de pelo menos 300000 ms.");
        }
        this.secret = secret;
        this.expirationMs = expirationMs;
    }

    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // TOKEN PREMIUM SAAS: login, isolamento multi-empresa, perfil e auditoria.
    public String gerarToken(Usuario usuario) {
        if (usuario == null) {
            throw new IllegalArgumentException("Usuário não informado para gerar token");
        }

        if (usuario.getLogin() == null || usuario.getLogin().isBlank()) {
            throw new IllegalArgumentException("Login do usuário não informado");
        }

        var builder = Jwts.builder()
                .setSubject(usuario.getLogin())
                .claim("usuarioId", usuario.getId() != null ? usuario.getId().toString() : null)
                .claim("perfil", usuario.getPerfil() != null ? usuario.getPerfil().name() : null)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs));

        if (usuario.getEmpresa() != null && usuario.getEmpresa().getId() != null) {
            builder.claim("empresaId", usuario.getEmpresa().getId().toString());
        }

        return builder
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Mantido por compatibilidade com código antigo.
    public String gerarToken(String login) {
        return Jwts.builder()
                .setSubject(login)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Mantido por compatibilidade com Spring Security.
    public String generateToken(UserDetails userDetails) {
        if (userDetails instanceof Usuario usuario) {
            return gerarToken(usuario);
        }

        return gerarToken(userDetails.getUsername());
    }

    public String extrairLogin(String token) {
        return extrairClaims(token).getSubject();
    }

    public String extractUsername(String token) {
        return extrairLogin(token);
    }

    public UUID extrairEmpresaId(String token) {
        String empresaId = extrairClaimComoString(token, "empresaId");
        return empresaId != null ? UUID.fromString(empresaId) : null;
    }

    public UUID extrairUsuarioId(String token) {
        String usuarioId = extrairClaimComoString(token, "usuarioId");
        return usuarioId != null ? UUID.fromString(usuarioId) : null;
    }

    public String extrairPerfil(String token) {
        return extrairClaimComoString(token, "perfil");
    }

    public boolean validarToken(String token) {
        try {
            extrairClaims(token);
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        if (token == null || userDetails == null) {
            return false;
        }

        final String username = extractUsername(token);

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    public boolean isTokenExpired(String token) {
        return extrairClaims(token)
                .getExpiration()
                .before(new Date());
    }

    private String extrairClaimComoString(String token, String claimName) {
        Object value = extrairClaims(token).get(claimName);
        return value != null ? value.toString() : null;
    }

    private Claims extrairClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
