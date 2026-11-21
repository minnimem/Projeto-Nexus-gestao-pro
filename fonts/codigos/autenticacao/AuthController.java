package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.LoginRequest;
import br.com.diego.projectoads.dto.UsuarioRequest;
import br.com.diego.projectoads.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody @Valid LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        Map<String, Object> resposta = usuarioService.login(request, ip);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/cadastro")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<?> cadastrar(@RequestBody @Valid UsuarioRequest request) {
        usuarioService.cadastrar(request);
        return ResponseEntity.status(201).body(
                Map.of("mensagem", "Cadastro realizado com sucesso")
        );
    }
}
