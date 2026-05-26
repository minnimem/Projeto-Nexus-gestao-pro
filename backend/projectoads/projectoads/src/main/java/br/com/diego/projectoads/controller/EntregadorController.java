package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.model.Entregador;
import br.com.diego.projectoads.repository.EntregadorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/entregadores")
@PreAuthorize("@planoComercialService.canAccessModule(authentication, 'logistica')")
public class EntregadorController {

    private final EntregadorRepository entregadorRepository;

    public EntregadorController(EntregadorRepository entregadorRepository) {
        this.entregadorRepository = entregadorRepository;
    }

    @GetMapping
    public List<Entregador> listar() {
        return entregadorRepository.findAll();
    }

    @GetMapping("/ativos")
    public List<Entregador> listarAtivos() {
        return entregadorRepository.findByAtivoTrue();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Entregador> buscarPorId(@PathVariable UUID id) {
        return entregadorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Entregador entregador) {
        if (entregador.getNome() == null || entregador.getNome().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Nome do entregador é obrigatório");
        }

        entregador.setNome(entregador.getNome().trim());
        entregador.setTelefone(normalizarTexto(entregador.getTelefone()));
        entregador.setCpf(normalizarTexto(entregador.getCpf()));
        entregador.setEmail(normalizarTexto(entregador.getEmail()));

        if (entregador.getAtivo() == null) {
            entregador.setAtivo(true);
        }

        return ResponseEntity.ok(entregadorRepository.save(entregador));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable UUID id, @RequestBody Entregador dados) {
        return entregadorRepository.findById(id)
                .map(entregador -> {
                    entregador.setNome(dados.getNome());
                    entregador.setTelefone(dados.getTelefone());
                    entregador.setCpf(dados.getCpf());
                    entregador.setEmail(dados.getEmail());
                    entregador.setAtivo(dados.getAtivo());
                    return ResponseEntity.ok(entregadorRepository.save(entregador));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> alterarStatus(@PathVariable UUID id, @RequestParam boolean ativo) {
        return entregadorRepository.findById(id)
                .map(entregador -> {
                    entregador.setAtivo(ativo);
                    return ResponseEntity.ok(entregadorRepository.save(entregador));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable UUID id) {
        if (!entregadorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        entregadorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    private String normalizarTexto(String valor) {
        return valor == null || valor.trim().isEmpty() ? null : valor.trim();
    }
}
