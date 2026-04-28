package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.config.Enum.StatusRota;
import br.com.diego.projectoads.model.Entregador;
import br.com.diego.projectoads.model.RotaEntrega;
import br.com.diego.projectoads.model.Veiculo;
import br.com.diego.projectoads.repository.EntregadorRepository;
import br.com.diego.projectoads.repository.RotaEntregaRepository;
import br.com.diego.projectoads.repository.VeiculoRepository;
import br.com.diego.projectoads.service.AuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/rotas-entrega")
public class RotaEntregaController {

    private final RotaEntregaRepository rotaEntregaRepository;
    private final EntregadorRepository entregadorRepository;
    private final VeiculoRepository veiculoRepository;
    private final AuditoriaService auditoriaService;

    public RotaEntregaController(
            RotaEntregaRepository rotaEntregaRepository,
            EntregadorRepository entregadorRepository,
            VeiculoRepository veiculoRepository,
            AuditoriaService auditoriaService
    ) {
        this.rotaEntregaRepository = rotaEntregaRepository;
        this.entregadorRepository = entregadorRepository;
        this.veiculoRepository = veiculoRepository;
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    public List<RotaEntrega> listar() {
        return rotaEntregaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RotaEntrega> buscarPorId(@PathVariable UUID id) {
        return rotaEntregaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<?> criar(@RequestBody RotaEntrega rota) {
        if (rota.getNome() == null || rota.getNome().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Nome da rota é obrigatório");
        }

        if (rota.getDataRota() == null) {
            return ResponseEntity.badRequest().body("Data da rota é obrigatória");
        }

        if (rota.getStatus() == null) {
            rota.setStatus(StatusRota.ABERTA);
        }

        if (rota.getPagamentoEntrega() == null || rota.getPagamentoEntrega().isBlank()) {
            rota.setPagamentoEntrega("JA_PAGO");
        }

        RotaEntrega salva = rotaEntregaRepository.save(rota);
        auditoriaService.registrar("Logistica", "ROTA_CRIADA", "Rota criada: " + salva.getNome(), salva.getId());
        return ResponseEntity.ok(salva);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<?> atualizar(@PathVariable UUID id, @RequestBody RotaEntrega dados) {
        return rotaEntregaRepository.findById(id)
                .map(rota -> {
                    rota.setNome(dados.getNome());
                    rota.setStatus(dados.getStatus());
                    rota.setDataRota(dados.getDataRota());
                    rota.setHorarioSaida(dados.getHorarioSaida());
                    rota.setHorarioRetorno(dados.getHorarioRetorno());
                    rota.setQuantidadeEntregas(dados.getQuantidadeEntregas());
                    rota.setDistanciaKm(dados.getDistanciaKm());
                    rota.setCustoEstimado(dados.getCustoEstimado());
                    rota.setPagamentoEntrega(dados.getPagamentoEntrega());
                    rota.setObservacao(dados.getObservacao());
                    rota.setEntregador(dados.getEntregador());
                    rota.setVeiculo(dados.getVeiculo());
                    RotaEntrega salva = rotaEntregaRepository.save(rota);
                    auditoriaService.registrar("Logistica", "ROTA_EDITADA", "Rota editada: " + salva.getNome(), salva.getId());
                    return ResponseEntity.ok(salva);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<?> alterarStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String statusRecebido = body.get("status");

        if (statusRecebido == null || statusRecebido.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Status da rota e obrigatorio"));
        }

        StatusRota novoStatus;

        try {
            novoStatus = StatusRota.valueOf(statusRecebido.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Status da rota invalido"));
        }

        return rotaEntregaRepository.findById(id)
                .map(rota -> {
                    rota.setStatus(novoStatus);

                    if (StatusRota.EM_ANDAMENTO.equals(novoStatus) && rota.getHorarioSaida() == null) {
                        rota.setHorarioSaida(LocalDateTime.now());
                    }

                    if (StatusRota.FINALIZADA.equals(novoStatus)) {
                        rota.setHorarioRetorno(LocalDateTime.now());
                    }

                    RotaEntrega salva = rotaEntregaRepository.save(rota);
                    auditoriaService.registrar("Logistica", "ROTA_STATUS", "Status da rota alterado para " + novoStatus, salva.getId());
                    return ResponseEntity.ok(salva);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/entregador/{idEntregador}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<?> vincularEntregador(@PathVariable UUID id, @PathVariable UUID idEntregador) {
        RotaEntrega rota = rotaEntregaRepository.findById(id).orElse(null);
        Entregador entregador = entregadorRepository.findById(idEntregador).orElse(null);

        if (rota == null || entregador == null) {
            return ResponseEntity.notFound().build();
        }

        rota.setEntregador(entregador);
        return ResponseEntity.ok(rotaEntregaRepository.save(rota));
    }

    @PatchMapping("/{id}/veiculo/{idVeiculo}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<?> vincularVeiculo(@PathVariable UUID id, @PathVariable UUID idVeiculo) {
        RotaEntrega rota = rotaEntregaRepository.findById(id).orElse(null);
        Veiculo veiculo = veiculoRepository.findById(idVeiculo).orElse(null);

        if (rota == null || veiculo == null) {
            return ResponseEntity.notFound().build();
        }

        rota.setVeiculo(veiculo);
        return ResponseEntity.ok(rotaEntregaRepository.save(rota));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletar(@PathVariable UUID id) {
        if (!rotaEntregaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        rotaEntregaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
