package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.model.Pagamento;
import br.com.diego.projectoads.repository.PagamentoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pagamentos")
public class PagamentoController {

    private final PagamentoRepository pagamentoRepository;

    public PagamentoController(PagamentoRepository pagamentoRepository) {
        this.pagamentoRepository = pagamentoRepository;
    }

    @PostMapping
    public ResponseEntity<Pagamento> salvar(@RequestBody Pagamento pagamento){
        Pagamento salvo = pagamentoRepository.save(pagamento);
        return ResponseEntity.status(201).body(salvo);
    }

    // Listar todos
    @GetMapping
    public ResponseEntity<List<Pagamento>> listar(){
        return ResponseEntity.ok(pagamentoRepository.findAll());
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Pagamento> buscarPorId(@PathVariable UUID id){
        return pagamentoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Atualizar STATUS
    @PatchMapping("/{id}/status")
    public ResponseEntity<Pagamento> atualizarStatus(@PathVariable UUID id,
                                                     @RequestParam StatusPagamento status){

        return pagamentoRepository.findById(id)
                .map(pagamento -> {
                    pagamento.setStatus(status);
                    return ResponseEntity.ok(pagamentoRepository.save(pagamento));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
