package br.com.diego.projectoads.service;

import br.com.diego.projectoads.model.AuditoriaEvento;
import br.com.diego.projectoads.repository.AuditoriaEventoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditoriaService {

    private static final Logger log = LoggerFactory.getLogger(AuditoriaService.class);

    private final AuditoriaEventoRepository repository;

    public AuditoriaService(AuditoriaEventoRepository repository) {
        this.repository = repository;
    }

    public AuditoriaEvento registrar(String modulo, String acao, String descricao, Object referenciaId) {
        try {
            AuditoriaEvento evento = new AuditoriaEvento();
            evento.setModulo(modulo);
            evento.setAcao(acao);
            evento.setDescricao(descricao);
            evento.setReferenciaId(referenciaId != null ? String.valueOf(referenciaId) : null);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                evento.setUsuarioLogin(auth.getName());
                evento.setPerfil(auth.getAuthorities().stream()
                        .findFirst()
                        .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                        .orElse(null));
            }

            return repository.save(evento);
        } catch (Exception ex) {
            log.warn("Falha ao registrar auditoria {} / {}. A operacao principal foi mantida.", modulo, acao, ex);
            return null;
        }
    }

    public List<AuditoriaEvento> listarUltimos() {
        return repository.findTop50ByOrderByDataEventoDesc();
    }

    public List<AuditoriaEvento> listarUltimosPorReferencia(Object referenciaId) {
        if (referenciaId == null) {
            return List.of();
        }
        return repository.findTop20ByReferenciaIdOrderByDataEventoDesc(String.valueOf(referenciaId));
    }
}
