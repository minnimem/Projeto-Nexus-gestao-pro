package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.ProdutoRequest;
import br.com.diego.projectoads.dto.ProdutoResponse;
import br.com.diego.projectoads.model.Produto;

import br.com.diego.projectoads.service.ProdutoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoService service;

    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProdutoResponse> criar(@RequestBody ProdutoRequest req) {
        Produto produto = service.criar(req);
        return ResponseEntity.status(201).body(new ProdutoResponse(produto));
    }

    @GetMapping
    public List<ProdutoResponse> listar() {
        return service.listar()
                .stream()
                .map(ProdutoResponse::new)
                .toList();
    }

    @GetMapping("/{id}")
    public ProdutoResponse buscar(@PathVariable UUID id) {
        return new ProdutoResponse(service.buscar(id));
    }

    @GetMapping("/buscar")
    public List<ProdutoResponse> buscarNome(@RequestParam String nome) {
        return service.buscarPorNome(nome)
                .stream()
                .map(ProdutoResponse::new)
                .toList();
    }

    @PutMapping("/{id}")
    public ProdutoResponse atualizar(@PathVariable UUID id,
                                     @RequestBody ProdutoRequest req) {
        return new ProdutoResponse(service.atualizar(id, req));
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable UUID id) {
        service.deletar(id);
    }
}
