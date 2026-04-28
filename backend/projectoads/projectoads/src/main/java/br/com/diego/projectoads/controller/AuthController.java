package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.LoginRequest;
import br.com.diego.projectoads.dto.UsuarioRequest;
import br.com.diego.projectoads.service.UsuarioService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // 🔐 LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody @Valid LoginRequest request,
            HttpServletRequest httpRequest
    ) {

        String ip = httpRequest.getRemoteAddr();

        Map<String, Object> resposta = usuarioService.login(request, ip);

        return ResponseEntity.ok(resposta);
    }
    // 📝 CADASTRO
    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody @Valid UsuarioRequest request) {

        usuarioService.cadastrar(request);

        return ResponseEntity.status(201).body(
                Map.of("mensagem", "Cadastro realizado com sucesso")
        );
    }
}