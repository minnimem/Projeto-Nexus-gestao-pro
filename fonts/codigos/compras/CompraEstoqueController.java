package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.CompraEstoqueRequest;
import br.com.diego.projectoads.dto.CompraEstoqueResponse;
import br.com.diego.projectoads.service.CompraEstoqueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/compras")
public class CompraEstoqueController {

    private final CompraEstoqueService service;

    public CompraEstoqueController(CompraEstoqueService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CompraEstoqueResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PostMapping
    public ResponseEntity<CompraEstoqueResponse> criar(@RequestBody CompraEstoqueRequest request) {
        CompraEstoqueResponse response = service.criar(request);
        return ResponseEntity.created(URI.create("/compras/" + response.id)).body(response);
    }
}
