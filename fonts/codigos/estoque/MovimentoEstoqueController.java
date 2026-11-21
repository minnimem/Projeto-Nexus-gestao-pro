package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.MovimentoEstoqueRequest;
import br.com.diego.projectoads.service.MovimentoEstoqueService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; // ✅ CORRETO
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/estoque")
public class MovimentoEstoqueController {

    private final MovimentoEstoqueService service;

    public MovimentoEstoqueController(MovimentoEstoqueService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('ESTOQUISTA') or hasRole('ADMIN')")
    public ResponseEntity<?> movimentar(@RequestBody MovimentoEstoqueRequest req,
                                        Authentication auth) {

        String login = auth.getName();

        service.registrar(
                req.getProdutoId(),
                req.getQuantidade(),
                req.getTipo(),
                login
        );

        return ResponseEntity.ok("Movimento registrado");
    }
}