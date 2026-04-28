package br.com.diego.projectoads.service;

import br.com.diego.projectoads.model.PasswordResetToken;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.PasswordResetTokenRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.tokenRepository = tokenRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void solicitarReset(String login) {
        Usuario usuario = usuarioRepository.findByLoginIgnoreCase(login)
                .orElse(null);

        if (usuario == null) {
            return;
        }

        String token = UUID.randomUUID().toString();

        PasswordResetToken reset = new PasswordResetToken();
        reset.setToken(token);
        reset.setUsuario(usuario);
        reset.setUsado(false);
        reset.setExpiracao(LocalDateTime.now().plusMinutes(30));

        tokenRepository.save(reset);

        // Simula envio. Em producao, enviar por e-mail/WhatsApp.
        System.out.println("LINK RESET:");
        System.out.println("http://localhost:5173/login?token=" + token);
        System.out.println("TOKEN RESET: " + token);
    }

    public void resetarSenha(String token, String novaSenha) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Token obrigatorio");
        }

        if (novaSenha == null || novaSenha.length() < 6) {
            throw new RuntimeException("Nova senha deve ter no minimo 6 caracteres");
        }

        PasswordResetToken reset = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token invalido"));

        if (reset.isUsado()) {
            throw new RuntimeException("Token ja utilizado");
        }

        if (reset.getExpiracao().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        Usuario usuario = reset.getUsuario();
        usuario.setSenhaUsuario(passwordEncoder.encode(novaSenha));

        usuarioRepository.save(usuario);

        reset.setUsado(true);
        tokenRepository.save(reset);
    }
}
