package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.FollowUpCobrancaRequest;
import br.com.diego.projectoads.dto.FollowUpCobrancaResponse;
import br.com.diego.projectoads.service.FollowUpCobrancaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/financeiro/follow-ups")
@PreAuthorize("@usuarioPermissionService.canAccessModule(authentication, 'financeiro')")
public class FollowUpCobrancaController {

    private final FollowUpCobrancaService service;

    public FollowUpCobrancaController(FollowUpCobrancaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<FollowUpCobrancaResponse>> listar(
            @RequestParam(required = false) Boolean vencidos
    ) {
        return ResponseEntity.ok(service.listar(vencidos));
    }

    @PostMapping
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'mutateFinance')")
    public ResponseEntity<FollowUpCobrancaResponse> criar(@RequestBody @Valid FollowUpCobrancaRequest request) {
        FollowUpCobrancaResponse response = service.criar(request);
        return ResponseEntity.created(URI.create("/financeiro/follow-ups/" + response.getId())).body(response);
    }

    @PatchMapping("/{id}/concluir")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'mutateFinance')")
    public ResponseEntity<FollowUpCobrancaResponse> concluir(@PathVariable UUID id) {
        return ResponseEntity.ok(service.concluir(id));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'mutateFinance')")
    public ResponseEntity<FollowUpCobrancaResponse> cancelar(@PathVariable UUID id) {
        return ResponseEntity.ok(service.cancelar(id));
    }
}
