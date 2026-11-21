package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.FinanceiroResponse;
import br.com.diego.projectoads.dto.RecorrenciaFinanceiraRequest;
import br.com.diego.projectoads.dto.RecorrenciaFinanceiraResponse;
import br.com.diego.projectoads.service.RecorrenciaFinanceiraService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/financeiro/recorrencias")
@PreAuthorize("@usuarioPermissionService.canAccessModule(authentication, 'financeiro')")
public class RecorrenciaFinanceiraController {

    private final RecorrenciaFinanceiraService recorrenciaService;

    public RecorrenciaFinanceiraController(RecorrenciaFinanceiraService recorrenciaService) {
        this.recorrenciaService = recorrenciaService;
    }

    @GetMapping
    public ResponseEntity<List<RecorrenciaFinanceiraResponse>> listar() {
        return ResponseEntity.ok(recorrenciaService.listar());
    }

    @PostMapping
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'mutateFinance')")
    public ResponseEntity<RecorrenciaFinanceiraResponse> criar(
            @RequestBody @Valid RecorrenciaFinanceiraRequest request
    ) {
        RecorrenciaFinanceiraResponse response = recorrenciaService.criar(request);
        return ResponseEntity
                .created(URI.create("/financeiro/recorrencias/" + response.getId()))
                .body(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'mutateFinance')")
    public ResponseEntity<RecorrenciaFinanceiraResponse> atualizarStatus(
            @PathVariable UUID id,
            @RequestParam boolean ativo
    ) {
        return ResponseEntity.ok(recorrenciaService.atualizarStatus(id, ativo));
    }

    @PostMapping("/{id}/gerar")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'mutateFinance')")
    public ResponseEntity<List<FinanceiroResponse>> gerarProximos(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "1") Integer quantidade
    ) {
        return ResponseEntity.ok(recorrenciaService.gerarProximos(id, quantidade));
    }
}
