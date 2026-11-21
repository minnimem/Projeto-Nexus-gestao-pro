package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.FinanceiroResponse;
import br.com.diego.projectoads.dto.PedidoCancelamentoLoteRequest;
import br.com.diego.projectoads.dto.PedidoFinalizacaoRequest;
import br.com.diego.projectoads.dto.PedidoRequest;
import br.com.diego.projectoads.dto.PedidoResponse;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.service.PedidoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listar() {
        return ResponseEntity.ok(
                pedidoService.listar()
                        .stream()
                        .map(PedidoResponse::new)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(new PedidoResponse(pedidoService.buscar(id)));
    }

    @GetMapping("/{id}/itens")
    public ResponseEntity<List<PedidoResponse.ItemResponse>> listarItens(@PathVariable UUID id) {
        return ResponseEntity.ok(
                pedidoService.listarItens(id)
                        .stream()
                        .map(PedidoResponse.ItemResponse::new)
                        .toList()
        );
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> criar(@RequestBody PedidoRequest req) {
        Pedido salvo = pedidoService.criarPedido(req);
        return ResponseEntity.status(201).body(new PedidoResponse(salvo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PedidoResponse> atualizar(
            @PathVariable UUID id,
            @RequestBody Pedido pedido
    ) {
        return ResponseEntity.ok(new PedidoResponse(pedidoService.atualizar(id, pedido)));
    }

    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<PedidoResponse> finalizar(
            @PathVariable UUID id,
            @RequestBody(required = false) PedidoFinalizacaoRequest request
    ) {
        return ResponseEntity.ok(new PedidoResponse(pedidoService.finalizar(id, request)));
    }

    @PatchMapping("/{id}/gerar-cobranca")
    public ResponseEntity<FinanceiroResponse> gerarCobranca(
            @PathVariable UUID id,
            @RequestBody(required = false) PedidoFinalizacaoRequest request
    ) {
        return ResponseEntity.ok(pedidoService.gerarCobranca(id, request));
    }

    @PatchMapping("/{id}/converter-orcamento")
    public ResponseEntity<PedidoResponse> converterOrcamento(@PathVariable UUID id) {
        return ResponseEntity.ok(new PedidoResponse(pedidoService.converterOrcamento(id)));
    }

    @PatchMapping("/{id}/iniciar-separacao")
    public ResponseEntity<PedidoResponse> iniciarSeparacao(@PathVariable UUID id) {
        return ResponseEntity.ok(new PedidoResponse(pedidoService.iniciarSeparacao(id)));
    }

    @PatchMapping("/{id}/concluir-separacao")
    public ResponseEntity<PedidoResponse> concluirSeparacao(@PathVariable UUID id) {
        return ResponseEntity.ok(new PedidoResponse(pedidoService.concluirSeparacao(id)));
    }

    @PatchMapping("/{id}/cancelar-inconsistente")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PedidoResponse> cancelarInconsistente(@PathVariable UUID id) {
        return ResponseEntity.ok(new PedidoResponse(pedidoService.cancelarInconsistente(id)));
    }

    @PatchMapping("/cancelar-inconsistentes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> cancelarInconsistentes(
            @RequestBody PedidoCancelamentoLoteRequest request
    ) {
        int cancelados = pedidoService.cancelarInconsistentes(request != null ? request.ids() : null);
        return ResponseEntity.ok(Map.of("cancelados", cancelados));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        pedidoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim
    ) {
        return ResponseEntity.ok(pedidoService.getDashboard(inicio, fim));
    }

    @GetMapping("/dashboard/usuario/{usuarioId}")
    public ResponseEntity<Map<String, Object>> dashboardUsuario(
            @PathVariable UUID usuarioId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim
    ) {
        return ResponseEntity.ok(
                pedidoService.getDashboardUsuario(usuarioId, inicio, fim)
        );
    }
}
