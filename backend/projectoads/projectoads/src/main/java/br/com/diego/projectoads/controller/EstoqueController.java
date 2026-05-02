package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.EstoqueBaixoResponse;
import br.com.diego.projectoads.dto.EstoqueAjusteRequest;
import br.com.diego.projectoads.dto.EstoqueCompraRequest;
import br.com.diego.projectoads.dto.EstoqueSaldoResponse;
import br.com.diego.projectoads.dto.EstoqueTransferenciaRequest;
import br.com.diego.projectoads.service.EstoqueService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/estoque")
public class EstoqueController {

    private final EstoqueService estoqueService;

    public EstoqueController(EstoqueService estoqueService) {
        this.estoqueService = estoqueService;
    }

    @PostMapping("/entrada/{produtoId}")
    public ResponseEntity<Void> entrada(@PathVariable UUID produtoId,
                                        @RequestParam int quantidade) {

        estoqueService.adicionar(produtoId, quantidade);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/saida/{produtoId}")
    public ResponseEntity<Void> saida(@PathVariable UUID produtoId,
                                      @RequestParam int quantidade) {

        estoqueService.retirar(produtoId, quantidade);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/compra")
    public ResponseEntity<Void> compra(@RequestBody EstoqueCompraRequest request) {
        estoqueService.registrarCompra(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/ajuste")
    public ResponseEntity<Void> ajuste(@RequestBody EstoqueAjusteRequest request) {
        estoqueService.ajustarPorInventario(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/transferencia")
    public ResponseEntity<Void> transferencia(@RequestBody EstoqueTransferenciaRequest request) {
        estoqueService.transferir(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/baixo")
    public ResponseEntity<List<EstoqueBaixoResponse>> baixo() {
        return ResponseEntity.ok(estoqueService.estoqueBaixo());
    }

    @GetMapping("/saldos")
    public ResponseEntity<List<EstoqueSaldoResponse>> saldos() {
        return ResponseEntity.ok(estoqueService.saldosPorLocal());
    }
}
