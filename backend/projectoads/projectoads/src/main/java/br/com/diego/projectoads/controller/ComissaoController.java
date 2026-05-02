package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.ComissaoConfigRequest;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.ConfiguracaoComissao;
import br.com.diego.projectoads.repository.ConfiguracaoComissaoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/comissoes")
public class ComissaoController {

    private final ConfiguracaoComissaoRepository repository;

    public ComissaoController(ConfiguracaoComissaoRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/config")
    public ResponseEntity<ConfiguracaoComissao> obterConfig() {
        return ResponseEntity.ok(repository.findFirstByAtivoTrueOrderByAtualizadoEmDesc()
                .orElseGet(this::configPadrao));
    }

    @PutMapping("/config")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<ConfiguracaoComissao> atualizarConfig(@RequestBody ComissaoConfigRequest request) {
        if (request == null || request.getPercentualPadrao() == null) {
            throw new BusinessException("Percentual de comissao obrigatorio");
        }

        BigDecimal percentual = request.getPercentualPadrao();
        if (percentual.compareTo(BigDecimal.ZERO) < 0 || percentual.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BusinessException("Percentual de comissao deve ficar entre 0 e 100");
        }

        ConfiguracaoComissao config = repository.findFirstByAtivoTrueOrderByAtualizadoEmDesc()
                .orElseGet(this::configPadrao);
        config.setPercentualPadrao(percentual);
        config.setAtivo(true);
        return ResponseEntity.ok(repository.save(config));
    }

    private ConfiguracaoComissao configPadrao() {
        ConfiguracaoComissao config = new ConfiguracaoComissao();
        config.setPercentualPadrao(BigDecimal.valueOf(3));
        config.setAtivo(true);
        return config;
    }
}
