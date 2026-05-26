package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.DocumentoFiscalCartaCorrecaoRequest;
import br.com.diego.projectoads.dto.DocumentoFiscalHomologacaoRequest;
import br.com.diego.projectoads.dto.DocumentoFiscalConsultaResponse;
import br.com.diego.projectoads.dto.DocumentoFiscalEmissaoRealStatusResponse;
import br.com.diego.projectoads.dto.DocumentoFiscalRetornoRequest;
import br.com.diego.projectoads.dto.DocumentoFiscalPacoteEmissaoRealResponse;
import br.com.diego.projectoads.dto.DocumentoFiscalPacoteIntegridadeResponse;
import br.com.diego.projectoads.dto.DocumentoFiscalResponse;
import br.com.diego.projectoads.dto.DocumentoFiscalResumoResponse;
import br.com.diego.projectoads.service.DocumentoFiscalService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/documentos-fiscais")
@PreAuthorize("hasAnyRole('ADMIN','GERENTE') and @planoComercialService.canAccessModule(authentication, 'fiscal')")
public class DocumentoFiscalController {

    private final DocumentoFiscalService documentoFiscalService;

    public DocumentoFiscalController(DocumentoFiscalService documentoFiscalService) {
        this.documentoFiscalService = documentoFiscalService;
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<List<DocumentoFiscalResponse>> listarPorPedido(@PathVariable UUID pedidoId) {
        return ResponseEntity.ok(documentoFiscalService.listarPorPedido(pedidoId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentoFiscalResponse> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.buscar(id));
    }

    @GetMapping("/{id}/consulta-homologacao")
    public ResponseEntity<DocumentoFiscalConsultaResponse> consultarHomologacao(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.consultarHomologacao(id));
    }

    @GetMapping(value = "/{id}/dossie-homologacao", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> gerarDossieHomologacao(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.gerarDossieHomologacao(id));
    }

    @GetMapping(value = "/{id}/checklist-emissao-real", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> gerarChecklistEmissaoReal(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.gerarChecklistEmissaoReal(id));
    }

    @GetMapping("/{id}/status-emissao-real")
    public ResponseEntity<DocumentoFiscalEmissaoRealStatusResponse> statusEmissaoReal(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.statusEmissaoReal(id));
    }

    @GetMapping("/{id}/pacote-emissao-real")
    public ResponseEntity<DocumentoFiscalPacoteEmissaoRealResponse> pacoteEmissaoReal(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.pacoteEmissaoReal(id));
    }

    @GetMapping(value = "/{id}/manifesto-pacote-emissao-real", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> gerarManifestoPacoteEmissaoReal(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.gerarManifestoPacoteEmissaoReal(id));
    }

    @GetMapping("/{id}/validar-integridade-pacote-emissao-real")
    public ResponseEntity<DocumentoFiscalPacoteIntegridadeResponse> validarIntegridadePacoteEmissaoReal(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.validarIntegridadePacoteEmissaoReal(id));
    }

    @GetMapping("/pedidos")
    public ResponseEntity<Map<UUID, List<DocumentoFiscalResumoResponse>>> listarPorPedidos(@RequestParam List<UUID> ids) {
        return ResponseEntity.ok(documentoFiscalService.listarPorPedidos(ids));
    }

    @PostMapping("/homologacao")
    public ResponseEntity<DocumentoFiscalResponse> prepararHomologacao(@RequestBody DocumentoFiscalHomologacaoRequest request) {
        DocumentoFiscalResponse response = documentoFiscalService.prepararHomologacao(request);
        return ResponseEntity.created(URI.create("/documentos-fiscais/" + response.getId())).body(response);
    }

    @PatchMapping("/{id}/gerar-xml-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> gerarXmlHomologacao(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.gerarXmlHomologacao(id));
    }

    @PatchMapping("/{id}/validar-xml-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> validarXmlHomologacao(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.validarXmlHomologacao(id));
    }

    @PatchMapping("/{id}/revalidar-pendencias-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> revalidarPendenciasHomologacao(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.revalidarPendenciasHomologacao(id));
    }

    @PatchMapping("/{id}/reprocessar-rejeicao-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> reprocessarRejeicaoHomologacao(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.reprocessarRejeicaoHomologacao(id));
    }

    @PatchMapping("/{id}/transmitir-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> transmitirHomologacao(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.transmitirHomologacao(id));
    }

    @PatchMapping("/{id}/contingencia-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> contingenciaHomologacao(@PathVariable UUID id,
                                                                           @RequestBody(required = false) DocumentoFiscalRetornoRequest request) {
        return ResponseEntity.ok(documentoFiscalService.contingenciaHomologacao(id, request));
    }

    @PatchMapping("/{id}/regularizar-contingencia-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> regularizarContingenciaHomologacao(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.regularizarContingenciaHomologacao(id));
    }

    @PatchMapping("/{id}/gerar-danfe-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> gerarDanfeHomologacao(@PathVariable UUID id) {
        return ResponseEntity.ok(documentoFiscalService.gerarDanfeHomologacao(id));
    }

    @PatchMapping("/{id}/carta-correcao-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> emitirCartaCorrecaoHomologacao(@PathVariable UUID id,
                                                                                  @RequestBody(required = false) DocumentoFiscalCartaCorrecaoRequest request) {
        return ResponseEntity.ok(documentoFiscalService.emitirCartaCorrecaoHomologacao(id, request));
    }

    @PatchMapping("/{id}/autorizar-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> autorizarHomologacao(@PathVariable UUID id,
                                                                        @RequestBody(required = false) DocumentoFiscalRetornoRequest request) {
        return ResponseEntity.ok(documentoFiscalService.autorizarHomologacao(id, request));
    }

    @PatchMapping("/{id}/rejeitar-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> rejeitarHomologacao(@PathVariable UUID id,
                                                                       @RequestBody(required = false) DocumentoFiscalRetornoRequest request) {
        return ResponseEntity.ok(documentoFiscalService.rejeitarHomologacao(id, request));
    }

    @PatchMapping("/{id}/cancelar-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> cancelarHomologacao(@PathVariable UUID id,
                                                                       @RequestBody(required = false) DocumentoFiscalRetornoRequest request) {
        return ResponseEntity.ok(documentoFiscalService.cancelarHomologacao(id, request));
    }

    @PatchMapping("/{id}/inutilizar-homologacao")
    public ResponseEntity<DocumentoFiscalResponse> inutilizarHomologacao(@PathVariable UUID id,
                                                                         @RequestBody(required = false) DocumentoFiscalRetornoRequest request) {
        return ResponseEntity.ok(documentoFiscalService.inutilizarHomologacao(id, request));
    }
}
