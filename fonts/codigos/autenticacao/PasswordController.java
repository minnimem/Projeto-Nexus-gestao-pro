package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.service.PasswordResetService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class PasswordController {

    private final PasswordResetService resetService;

    public PasswordController(PasswordResetService resetService) {
        this.resetService = resetService;
    }

    // solicitar reset
    @PostMapping("/recuperar")
    public Map<String, String> recuperar(@RequestBody Map<String, String> body) {

        resetService.solicitarReset(body.get("login"));

        return Map.of(
                "mensagem", "Se o usuário existir, enviaremos instruções"
        );
    }

    // 🔒 resetar senha
    @PostMapping("/resetar")
    public Map<String, String> resetar(@RequestBody Map<String, String> body) {

        resetService.resetarSenha(
                body.get("token"),
                body.get("novaSenha")
        );

        return Map.of(
                "mensagem", "Senha alterada com sucesso"
        );
    }
}