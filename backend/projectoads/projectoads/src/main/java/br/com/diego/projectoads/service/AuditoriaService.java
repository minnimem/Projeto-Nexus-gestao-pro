package br.com.diego.projectoads.service;

import br.com.diego.projectoads.model.AuditoriaEvento;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.AuditoriaEventoRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
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
    private final UsuarioRepository usuarioRepository;

    public AuditoriaService(AuditoriaEventoRepository repository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    public AuditoriaEvento registrar(String modulo, String acao, String descricao, Object referenciaId) {
        try {
            AuditoriaEvento evento = new AuditoriaEvento();
            evento.setModulo(modulo);
            evento.setAcao(acao);
            evento.setDescricao(descricao);
            evento.setReferenciaId(referenciaId != null ? String.valueOf(referenciaId) : null);

            preencherUsuarioAtual(evento);

            return repository.save(evento);
        } catch (Exception ex) {
            log.warn("Falha ao registrar auditoria {} / {}. A operacao principal foi mantida.", modulo, acao, ex);
            return null;
        }
    }

    public AuditoriaEvento registrarExclusao(String entidade, Object registroId, String registroNome, String rota) {
        try {
            AuditoriaEvento evento = new AuditoriaEvento();
            evento.setModulo(entidade != null && !entidade.isBlank() ? entidade : "Banco de dados");
            evento.setAcao("EXCLUIR");
            evento.setDescricao("Registro excluido do banco de dados");
            evento.setReferenciaId(registroId != null ? String.valueOf(registroId) : null);
            evento.setEntidade(entidade);
            evento.setRegistroId(registroId != null ? String.valueOf(registroId) : null);
            evento.setRegistroNome(registroNome);
            evento.setMetodoHttp("DELETE");
            evento.setRota(rota);
            preencherUsuarioAtual(evento);

            return repository.save(evento);
        } catch (Exception ex) {
            log.warn("Falha ao registrar auditoria de exclusao {} / {}. A operacao principal foi mantida.",
                    entidade, registroId, ex);
            return null;
        }
    }

    private void preencherUsuarioAtual(AuditoriaEvento evento) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return;
        }

        String login = auth.getName();
        evento.setUsuarioLogin(login);
        evento.setPerfil(auth.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .orElse(null));

        usuarioRepository.findByLoginIgnoreCase(login).ifPresent(usuario -> preencherDadosUsuario(evento, usuario));
    }

    private void preencherDadosUsuario(AuditoriaEvento evento, Usuario usuario) {
        if (usuario.getId() != null) {
            evento.setUsuarioId(String.valueOf(usuario.getId()));
        }
        evento.setUsuarioNome(usuario.getNome());
        if (usuario.getPerfil() != null) {
            evento.setPerfil(usuario.getPerfil().name());
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
