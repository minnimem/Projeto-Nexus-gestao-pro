package br.com.diego.projectoads.service;

import br.com.diego.projectoads.model.PasswordResetToken;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.PasswordResetTokenRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

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

        log.info("Solicitação de redefinição de credencial registrada para usuário {}.", usuario.getLogin());
    }

    public void resetarSenha(String token, String novaSenha) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Token obrigatório");
        }

        if (novaSenha == null || novaSenha.length() < 6) {
            throw new RuntimeException("Nova senha deve ter no mínimo 6 caracteres");
        }

        PasswordResetToken reset = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (reset.isUsado()) {
            throw new RuntimeException("Token já utilizado");
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
