package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.FinanceiroRequest;
import br.com.diego.projectoads.dto.FinanceiroResponse;
import br.com.diego.projectoads.dto.FinanceiroResumoResponse;
import br.com.diego.projectoads.service.FinanceiroService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/financeiro")
@PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'FINANCEIRO')")
public class FinanceiroController {

    private final FinanceiroService financeiroService;

    public FinanceiroController(FinanceiroService financeiroService) {
        this.financeiroService = financeiroService;
    }

    @GetMapping
    public ResponseEntity<List<FinanceiroResponse>> listar(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim
    ) {
        return ResponseEntity.ok(financeiroService.listar(inicio, fim));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FinanceiroResponse> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(financeiroService.buscar(id));
    }

    @GetMapping("/resumo")
    public ResponseEntity<FinanceiroResumoResponse> resumo(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim
    ) {
        return ResponseEntity.ok(financeiroService.resumo(inicio, fim));
    }

    @PostMapping
    public ResponseEntity<FinanceiroResponse> criar(
            @RequestBody @Valid FinanceiroRequest request
    ) {
        FinanceiroResponse response = financeiroService.criar(request);

        return ResponseEntity
                .created(URI.create("/financeiro/" + response.getId()))
                .body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FinanceiroResponse> atualizar(
            @PathVariable UUID id,
            @RequestBody @Valid FinanceiroRequest request
    ) {
        return ResponseEntity.ok(financeiroService.atualizar(id, request));
    }

    /**
     * Financeiro não deve ser apagado por usuário comum.
     * Apenas ADMIN pode excluir. Em produção, prefira cancelar/estornar.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        financeiroService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Cancelamento seguro: mantém histórico/auditoria.
     */
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<FinanceiroResponse> cancelar(@PathVariable UUID id) {
        return ResponseEntity.ok(financeiroService.cancelar(id));
    }

    /**
     * Estorno seguro: mantém histórico/auditoria.
     */
    @PatchMapping("/{id}/estornar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FinanceiroResponse> estornar(@PathVariable UUID id) {
        return ResponseEntity.ok(financeiroService.estornar(id));
    }
}
