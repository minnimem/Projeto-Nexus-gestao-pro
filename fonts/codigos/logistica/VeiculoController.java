package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.model.Veiculo;
import br.com.diego.projectoads.repository.VeiculoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/veiculos")
@PreAuthorize("@planoComercialService.canAccessModule(authentication, 'logistica')")
public class VeiculoController {

    private final VeiculoRepository veiculoRepository;

    public VeiculoController(VeiculoRepository veiculoRepository) {
        this.veiculoRepository = veiculoRepository;
    }

    @GetMapping
    public List<Veiculo> listar() {
        return veiculoRepository.findAll();
    }

    @GetMapping("/ativos")
    public List<Veiculo> listarAtivos() {
        return veiculoRepository.findByAtivoTrue();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Veiculo> buscarPorId(@PathVariable UUID id) {
        return veiculoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Veiculo veiculo) {
        if (veiculo.getPlaca() == null || veiculo.getPlaca().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Placa do veículo é obrigatória");
        }

        veiculo.setPlaca(veiculo.getPlaca().trim().toUpperCase());

        if (veiculoRepository.existsByPlaca(veiculo.getPlaca())) {
            return ResponseEntity.badRequest().body("Placa já cadastrada");
        }

        if (veiculo.getAtivo() == null) {
            veiculo.setAtivo(true);
        }

        return ResponseEntity.ok(veiculoRepository.save(veiculo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable UUID id, @RequestBody Veiculo dados) {
        return veiculoRepository.findById(id)
                .map(veiculo -> {
                    veiculo.setPlaca(dados.getPlaca() != null ? dados.getPlaca().trim().toUpperCase() : null);
                    veiculo.setModelo(dados.getModelo());
                    veiculo.setMarca(dados.getMarca());
                    veiculo.setTipo(dados.getTipo());
                    veiculo.setCapacidadeKg(dados.getCapacidadeKg());
                    veiculo.setAtivo(dados.getAtivo());
                    return ResponseEntity.ok(veiculoRepository.save(veiculo));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> alterarStatus(@PathVariable UUID id, @RequestParam boolean ativo) {
        return veiculoRepository.findById(id)
                .map(veiculo -> {
                    veiculo.setAtivo(ativo);
                    return ResponseEntity.ok(veiculoRepository.save(veiculo));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable UUID id) {
        if (!veiculoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        veiculoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
