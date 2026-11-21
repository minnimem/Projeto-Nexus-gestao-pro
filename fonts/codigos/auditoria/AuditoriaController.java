package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.model.AuditoriaEvento;
import br.com.diego.projectoads.service.AuditoriaService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/auditoria")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    public AuditoriaController(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuditoriaEvento> listar() {
        return auditoriaService.listarUltimos();
    }
}
