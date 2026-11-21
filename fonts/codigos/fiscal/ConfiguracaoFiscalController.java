package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.ConfiguracaoFiscalRequest;
import br.com.diego.projectoads.dto.ConfiguracaoFiscalResponse;
import br.com.diego.projectoads.dto.ConfiguracaoFiscalStatusResponse;
import br.com.diego.projectoads.dto.StatusServicoFiscalResponse;
import br.com.diego.projectoads.service.ConfiguracaoFiscalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/configuracoes-fiscais")
@PreAuthorize("hasAnyRole('ADMIN','GERENTE') and @planoComercialService.canAccessModule(authentication, 'fiscal')")
public class ConfiguracaoFiscalController {

    private final ConfiguracaoFiscalService configuracaoFiscalService;

    public ConfiguracaoFiscalController(ConfiguracaoFiscalService configuracaoFiscalService) {
        this.configuracaoFiscalService = configuracaoFiscalService;
    }

    @GetMapping
    public ResponseEntity<List<ConfiguracaoFiscalResponse>> listar() {
        return ResponseEntity.ok(configuracaoFiscalService.listar());
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<ConfiguracaoFiscalStatusResponse> status(@PathVariable UUID id) {
        return ResponseEntity.ok(configuracaoFiscalService.status(id));
    }

    @GetMapping("/{id}/status-servico")
    public ResponseEntity<StatusServicoFiscalResponse> statusServico(@PathVariable UUID id) {
        return ResponseEntity.ok(configuracaoFiscalService.statusServico(id));
    }

    @PostMapping
    public ResponseEntity<ConfiguracaoFiscalResponse> salvar(@RequestBody ConfiguracaoFiscalRequest request) {
        ConfiguracaoFiscalResponse response = configuracaoFiscalService.salvar(request);
        return ResponseEntity.created(URI.create("/configuracoes-fiscais/" + response.getId())).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConfiguracaoFiscalResponse> atualizar(@PathVariable UUID id,
                                                                @RequestBody ConfiguracaoFiscalRequest request) {
        return ResponseEntity.ok(configuracaoFiscalService.atualizar(id, request));
    }
}
