package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.CaixaAberturaRequest;
import br.com.diego.projectoads.dto.CaixaFechamentoRequest;
import br.com.diego.projectoads.dto.CaixaMovimentoRequest;
import br.com.diego.projectoads.dto.CaixaResponse;
import br.com.diego.projectoads.service.CaixaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/caixas")
@PreAuthorize("@usuarioPermissionService.canAccessModule(authentication, 'caixa')")
public class CaixaController {

    private final CaixaService caixaService;

    public CaixaController(CaixaService caixaService) {
        this.caixaService = caixaService;
    }

    @PostMapping("/abrir")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'operateCash')")
    public ResponseEntity<CaixaResponse> abrir(@RequestBody @Valid CaixaAberturaRequest request) {
        CaixaResponse response = caixaService.abrir(request);
        return ResponseEntity.created(URI.create("/caixas/" + response.getId())).body(response);
    }

    @GetMapping("/aberto")
    public ResponseEntity<CaixaResponse> aberto() {
        CaixaResponse response = caixaService.aberto();
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<CaixaResponse>> listarRecentes() {
        return ResponseEntity.ok(caixaService.listarRecentes());
    }

    @GetMapping("/{id}/resumo")
    public ResponseEntity<CaixaResponse> resumo(@PathVariable UUID id) {
        return ResponseEntity.ok(caixaService.resumo(id));
    }

    @PostMapping("/{id}/suprimento")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'operateCash')")
    public ResponseEntity<CaixaResponse> suprimento(
            @PathVariable UUID id,
            @RequestBody @Valid CaixaMovimentoRequest request
    ) {
        return ResponseEntity.ok(caixaService.suprimento(id, request));
    }

    @PostMapping("/{id}/pagamento-recebido")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'operateCash')")
    public ResponseEntity<CaixaResponse> pagamentoRecebido(
            @PathVariable UUID id,
            @RequestBody @Valid CaixaMovimentoRequest request
    ) {
        return ResponseEntity.ok(caixaService.pagamentoRecebido(id, request));
    }

    @PostMapping("/{id}/sangria")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'operateCash')")
    public ResponseEntity<CaixaResponse> sangria(
            @PathVariable UUID id,
            @RequestBody @Valid CaixaMovimentoRequest request
    ) {
        return ResponseEntity.ok(caixaService.sangria(id, request));
    }

    @PostMapping("/{id}/fechar")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'operateCash')")
    public ResponseEntity<CaixaResponse> fechar(
            @PathVariable UUID id,
            @RequestBody @Valid CaixaFechamentoRequest request
    ) {
        return ResponseEntity.ok(caixaService.fechar(id, request));
    }
}
