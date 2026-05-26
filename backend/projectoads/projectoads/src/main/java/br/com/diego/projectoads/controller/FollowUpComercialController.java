package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.ConfiguracaoAutomacaoComercialRequest;
import br.com.diego.projectoads.dto.ConfiguracaoAutomacaoComercialResponse;
import br.com.diego.projectoads.dto.FollowUpComercialRequest;
import br.com.diego.projectoads.dto.FollowUpComercialResponse;
import br.com.diego.projectoads.service.ConfiguracaoAutomacaoComercialService;
import br.com.diego.projectoads.service.FollowUpComercialService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pedidos/follow-ups")
@PreAuthorize("@usuarioPermissionService.canAccessModule(authentication, 'pedidos')")
public class FollowUpComercialController {

    private final FollowUpComercialService service;
    private final ConfiguracaoAutomacaoComercialService configuracaoService;

    public FollowUpComercialController(FollowUpComercialService service,
                                       ConfiguracaoAutomacaoComercialService configuracaoService) {
        this.service = service;
        this.configuracaoService = configuracaoService;
    }

    @GetMapping
    public ResponseEntity<List<FollowUpComercialResponse>> listar(
            @RequestParam(required = false) Boolean vencidos
    ) {
        return ResponseEntity.ok(service.listar(vencidos));
    }

    @GetMapping("/configuracao")
    public ResponseEntity<ConfiguracaoAutomacaoComercialResponse> obterConfiguracao(
            @RequestParam(required = false) UUID filialId
    ) {
        return ResponseEntity.ok(configuracaoService.obter(filialId));
    }

    @PutMapping("/configuracao")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'manageCommercialFollowUp')")
    public ResponseEntity<ConfiguracaoAutomacaoComercialResponse> salvarConfiguracao(
            @RequestBody ConfiguracaoAutomacaoComercialRequest request
    ) {
        return ResponseEntity.ok(configuracaoService.salvar(request));
    }

    @PostMapping
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'manageCommercialFollowUp')")
    public ResponseEntity<FollowUpComercialResponse> criar(@RequestBody @Valid FollowUpComercialRequest request) {
        FollowUpComercialResponse response = service.criar(request);
        return ResponseEntity.created(URI.create("/pedidos/follow-ups/" + response.getId())).body(response);
    }

    @PatchMapping("/{id}/concluir")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'manageCommercialFollowUp')")
    public ResponseEntity<FollowUpComercialResponse> concluir(@PathVariable UUID id) {
        return ResponseEntity.ok(service.concluir(id));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'manageCommercialFollowUp')")
    public ResponseEntity<FollowUpComercialResponse> cancelar(@PathVariable UUID id) {
        return ResponseEntity.ok(service.cancelar(id));
    }
}
