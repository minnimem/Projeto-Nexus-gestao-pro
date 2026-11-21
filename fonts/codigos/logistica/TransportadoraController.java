package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Transportadora;
import br.com.diego.projectoads.repository.TransportadoraRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/transportadoras")
@PreAuthorize("@usuarioPermissionService.canAccessModule(authentication, 'logistica') and @planoComercialService.canAccessModule(authentication, 'logistica')")
public class TransportadoraController {

    private final TransportadoraRepository transportadoraRepository;

    public TransportadoraController(TransportadoraRepository transportadoraRepository) {
        this.transportadoraRepository = transportadoraRepository;
    }

    @GetMapping
    public ResponseEntity<List<Transportadora>> listar() {
        return ResponseEntity.ok(transportadoraRepository.findAllByOrderByAtivoDescNomeAsc());
    }

    @PostMapping
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'editRoute')")
    public ResponseEntity<Transportadora> criar(@RequestBody Transportadora transportadora) {
        validarTransportadora(transportadora, null);
        Transportadora salva = transportadoraRepository.save(transportadora);
        return ResponseEntity.created(URI.create("/transportadoras/" + salva.getId())).body(salva);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'editRoute')")
    public ResponseEntity<Transportadora> atualizar(@PathVariable UUID id,
                                                    @RequestBody Transportadora transportadora) {
        return transportadoraRepository.findById(id)
                .map(atual -> {
                    validarTransportadora(transportadora, id);
                    transportadora.setId(id);
                    return ResponseEntity.ok(transportadoraRepository.save(transportadora));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'editRoute')")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        if (!transportadoraRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        transportadoraRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void validarTransportadora(Transportadora transportadora, UUID idAtual) {
        if (transportadora == null || transportadora.getNome() == null || transportadora.getNome().trim().isEmpty()) {
            throw new BusinessException("Nome da transportadora e obrigatorio");
        }

        String nome = transportadora.getNome().trim();
        boolean nomeDuplicado = idAtual == null
                ? transportadoraRepository.existsByNomeIgnoreCase(nome)
                : transportadoraRepository.existsByNomeIgnoreCaseAndIdNot(nome, idAtual);
        if (nomeDuplicado) {
            throw new BusinessException("Transportadora ja cadastrada");
        }

        String documento = transportadora.getDocumento() != null
                ? transportadora.getDocumento().replaceAll("\\D", "")
                : "";
        if (!documento.isBlank()) {
            boolean documentoDuplicado = idAtual == null
                    ? transportadoraRepository.existsByDocumento(documento)
                    : transportadoraRepository.existsByDocumentoAndIdNot(documento, idAtual);
            if (documentoDuplicado) {
                throw new BusinessException("Documento ja cadastrado para outra transportadora");
            }
            transportadora.setDocumento(documento);
        }

        transportadora.setNome(nome);
    }
}
