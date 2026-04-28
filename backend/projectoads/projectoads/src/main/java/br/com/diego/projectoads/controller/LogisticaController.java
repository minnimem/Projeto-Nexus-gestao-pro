package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.LogisticaResponse;
import br.com.diego.projectoads.service.LogisticaService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/logistica")
public class LogisticaController {

    private final LogisticaService service;

    public LogisticaController(LogisticaService service) {
        this.service = service;
    }

    // 📄 LISTAGEM PAGINADA
    @GetMapping
    public Page<LogisticaResponse> listar(Pageable pageable) {
        return service.listar(pageable);
    }
}