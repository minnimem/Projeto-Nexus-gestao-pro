package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.config.Enum.Perfil;
import br.com.diego.projectoads.dto.UsuarioPermissoesRequest;
import br.com.diego.projectoads.dto.UsuarioRequest;
import br.com.diego.projectoads.dto.UsuarioResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Filial;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import br.com.diego.projectoads.service.UsuarioService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final FilialRepository filialRepository;

    public UsuarioController(UsuarioRepository usuarioRepository,
                             UsuarioService usuarioService,
                             FilialRepository filialRepository) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
        this.filialRepository = filialRepository;
    }

    // =========================
    // 🔒 VERIFICA SE É ADMIN
    // =========================
    private boolean isAdminOrMaster() {
        return org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MASTER"));
    }

    private Usuario usuarioAutenticado() {
        String login = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return usuarioRepository.findByLoginIgnoreCase(login)
                .orElseThrow(() -> new BusinessException("Usuario autenticado nao encontrado"));
    }

    // =========================
    // 📝 CRIAR USUÁRIO
    // =========================
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<UsuarioResponse> criar(@RequestBody @Valid UsuarioRequest req) {

        if (req.getSenha() == null || req.getSenha().isBlank() || req.getSenha().length() < 6) {
            throw new BusinessException("Senha precisa ter no minimo 6 caracteres");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(req.getNome());
        usuario.setLogin(req.getLogin());
        usuario.setSenhaUsuario(req.getSenha());
        usuario.setEmpresa(usuarioAutenticado().getEmpresa());
        preencherDadosColaborador(usuario, req);

        // 🔐 regra: só admin cria admin
        if ((req.getPerfil() == Perfil.ADMIN || req.getPerfil() == Perfil.MASTER) && !isAdminOrMaster()) {
            throw new AccessDeniedException("Somente ADMIN ou MASTER pode criar perfil privilegiado");
        }

        // 🎯 perfil padrão
        Perfil perfil = req.getPerfil() != null ? req.getPerfil() : Perfil.VENDEDOR;

        if (perfil == Perfil.ADMIN || perfil == Perfil.MASTER) {
            throw new BusinessException("Criacao de ADMIN ou MASTER deve ser feita diretamente pelo responsavel tecnico");
        }

        usuario.setPerfil(perfil);

        Usuario salvo = usuarioService.salvar(usuario);

        return ResponseEntity.status(201).body(new UsuarioResponse(salvo));
    }

    // =========================
    // 🔍 BUSCAR POR ID
    // =========================
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE')")
    public ResponseEntity<UsuarioResponse> buscarPorId(@PathVariable UUID id) {

        return usuarioRepository.findById(id)
                .map(u -> ResponseEntity.ok(new UsuarioResponse(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================
    // 📋 LISTAR
    // =========================
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<List<UsuarioResponse>> listar() {

        List<UsuarioResponse> lista = usuarioRepository.findAll()
                .stream()
                .map(UsuarioResponse::new)
                .toList();

        return ResponseEntity.ok(lista);
    }

    // =========================
    // ❌ DELETAR
    // =========================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {

        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // =========================
    // ✏️ ATUALIZAR
    // =========================
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE')")
    public ResponseEntity<UsuarioResponse> atualizar(@PathVariable UUID id,
                                                     @RequestBody @Valid UsuarioRequest req) {

        return usuarioRepository.findById(id)
                .map(u -> {

                    u.setNome(req.getNome());
                    u.setLogin(req.getLogin());
                    preencherDadosColaborador(u, req);

                    // 🔐 senha (se enviada)
                    if (req.getSenha() != null && !req.getSenha().isBlank()) {
                        u.setSenhaUsuario(req.getSenha());
                    }

                    // 🔐 somente admin altera perfil
                    if (req.getPerfil() != null) {

                        u.setPerfil(req.getPerfil());
                    }

                    Usuario atualizado = usuarioService.salvar(u);

                    return ResponseEntity.ok(new UsuarioResponse(atualizado));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================
// 🔁 ALTERAR PERFIL (ROLE)
// =========================
    @PutMapping("/{id}/perfil")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<?> alterarPerfil(@PathVariable UUID id,
                                           @RequestParam Perfil novoPerfil) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // 🔒 REGRA: só ADMIN pode definir ADMIN
        if ((novoPerfil == Perfil.ADMIN || novoPerfil == Perfil.MASTER) && !isAdminOrMaster()) {
            throw new AccessDeniedException("Somente ADMIN ou MASTER pode definir perfil privilegiado");
        }

        usuario.setPerfil(novoPerfil);
        usuarioService.salvar(usuario);

        return ResponseEntity.ok("Perfil atualizado com sucesso");
    }

    @PatchMapping("/{id}/acesso")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> alterarAcesso(@PathVariable UUID id,
                                                         @RequestParam boolean ativo) {
        return ResponseEntity.ok(new UsuarioResponse(usuarioService.alterarAcesso(id, ativo)));
    }

    @PatchMapping("/{id}/permissoes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> alterarPermissoes(@PathVariable UUID id,
                                                             @RequestBody UsuarioPermissoesRequest request) {
        return ResponseEntity.ok(new UsuarioResponse(
                usuarioService.alterarPermissoes(id, request.getPermissoesExtras(), request.getPermissoesBloqueadas())
        ));
    }



    // =========================
    // 🔐 TESTE ADMIN
    // =========================
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String admin() {
        return "Acesso admin OK";
    }

    private void preencherDadosColaborador(Usuario usuario, UsuarioRequest req) {
        usuario.setCargo(normalizar(req.getCargo()));
        usuario.setDepartamento(normalizar(req.getDepartamento()));
        usuario.setSalario(req.getSalario());
        usuario.setMetaVendas(req.getMetaVendas());
        usuario.setDataInicio(req.getDataInicio());
        usuario.setTelefone(normalizar(req.getTelefone()));
        usuario.setEmail(normalizar(req.getEmail()));
        usuario.setDocumento(normalizar(req.getDocumento()));
        usuario.setFilial(resolverFilial(req.getFilialId(), usuario));
    }

    private Filial resolverFilial(UUID filialId, Usuario usuario) {
        if (filialId == null) {
            return null;
        }

        Filial filial = filialRepository.findById(filialId)
                .orElseThrow(() -> new BusinessException("Filial nao encontrada"));

        UUID empresaUsuarioId = usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null;
        UUID empresaFilialId = filial.getEmpresa() != null ? filial.getEmpresa().getId() : null;
        if (empresaUsuarioId == null || !empresaUsuarioId.equals(empresaFilialId)) {
            throw new BusinessException("Filial nao pertence a empresa do usuario");
        }

        return filial;
    }

    private String normalizar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
