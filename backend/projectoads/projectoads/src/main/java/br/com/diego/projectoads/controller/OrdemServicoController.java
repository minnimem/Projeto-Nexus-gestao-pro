package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.OrdemServicoRequest;
import br.com.diego.projectoads.dto.OrdemServicoResponse;
import br.com.diego.projectoads.dto.OrdemServicoStatusRequest;
import br.com.diego.projectoads.service.OrdemServicoService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/ordens-servico")
@PreAuthorize("@usuarioPermissionService.canAccessModule(authentication, 'pedidos') and @planoComercialService.canAccessModule(authentication, 'servicos')")
public class OrdemServicoController {

    private final OrdemServicoService ordemServicoService;

    public OrdemServicoController(OrdemServicoService ordemServicoService) {
        this.ordemServicoService = ordemServicoService;
    }

    @GetMapping
    public ResponseEntity<List<OrdemServicoResponse>> listar() {
        return ResponseEntity.ok(ordemServicoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdemServicoResponse> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(ordemServicoService.buscar(id));
    }

    @PostMapping
    public ResponseEntity<OrdemServicoResponse> criar(@Valid @RequestBody OrdemServicoRequest request) {
        OrdemServicoResponse response = ordemServicoService.criar(request);
        return ResponseEntity.created(URI.create("/ordens-servico/" + response.getId())).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrdemServicoResponse> atualizar(@PathVariable UUID id,
                                                          @Valid @RequestBody OrdemServicoRequest request) {
        return ResponseEntity.ok(ordemServicoService.atualizar(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrdemServicoResponse> atualizarStatus(@PathVariable UUID id,
                                                                @Valid @RequestBody OrdemServicoStatusRequest request) {
        return ResponseEntity.ok(ordemServicoService.atualizarStatus(id, request));
    }

    @PostMapping("/{id}/faturar")
    public ResponseEntity<OrdemServicoResponse> faturar(@PathVariable UUID id) {
        return ResponseEntity.ok(ordemServicoService.faturar(id));
    }

    @PostMapping("/{id}/baixar-pecas")
    public ResponseEntity<OrdemServicoResponse> baixarPecas(@PathVariable UUID id) {
        return ResponseEntity.ok(ordemServicoService.baixarPecas(id));
    }

    @PostMapping(value = "/{id}/anexos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OrdemServicoResponse> anexarArquivo(@PathVariable UUID id,
                                                              @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ordemServicoService.anexarArquivo(id, file));
    }

    @PostMapping(value = "/{id}/assinatura", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OrdemServicoResponse> registrarAssinatura(@PathVariable UUID id,
                                                                    @RequestParam("file") MultipartFile file,
                                                                    @RequestParam(value = "nomeResponsavel", required = false) String nomeResponsavel,
                                                                    @RequestParam(value = "documentoResponsavel", required = false) String documentoResponsavel,
                                                                    @RequestParam(value = "observacao", required = false) String observacao) {
        return ResponseEntity.ok(ordemServicoService.registrarAssinatura(id, file, nomeResponsavel, documentoResponsavel, observacao));
    }

    @GetMapping("/{id}/anexos/{nomeArquivo:.+}")
    public ResponseEntity<Resource> baixarAnexo(@PathVariable UUID id,
                                                @PathVariable String nomeArquivo) {
        Resource resource = ordemServicoService.carregarAnexo(id, nomeArquivo);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
