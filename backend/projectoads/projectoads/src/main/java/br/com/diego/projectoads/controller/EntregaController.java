package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.model.Entrega;
import br.com.diego.projectoads.repository.EntregaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/entregas", "/estregas"})
@PreAuthorize("@planoComercialService.canAccessModule(authentication, 'logistica')")
public class EntregaController {

    private final EntregaRepository entregaRepository;

    public EntregaController(EntregaRepository entregaRepository) {
        this.entregaRepository = entregaRepository;
    }

    @GetMapping
    public ResponseEntity<List<Entrega>> listar() {
        return ResponseEntity.ok(entregaRepository.findAll());
    }
}

