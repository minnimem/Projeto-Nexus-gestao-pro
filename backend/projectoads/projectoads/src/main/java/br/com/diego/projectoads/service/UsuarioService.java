package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.Perfil;
import br.com.diego.projectoads.dto.LoginRequest;
import br.com.diego.projectoads.dto.UsuarioRequest;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.LoginAuditoria;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.LoginAuditoriaRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;

import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class UsuarioService {

    private static final int MAX_TENTATIVAS = 5;
    private static final int MINUTOS_BLOQUEIO = 15;

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final LoginAuditoriaRepository loginAuditoriaRepository;
    private final UsuarioPermissionService usuarioPermissionService;
    private final AuditoriaService auditoriaService;
    private final PlanoComercialService planoComercialService;

    public UsuarioService(UsuarioRepository repository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtService jwtService,
                           LoginAuditoriaRepository loginAuditoriaRepository,
                           UsuarioPermissionService usuarioPermissionService,
                           AuditoriaService auditoriaService,
                           PlanoComercialService planoComercialService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.loginAuditoriaRepository = loginAuditoriaRepository;
        this.usuarioPermissionService = usuarioPermissionService;
        this.auditoriaService = auditoriaService;
        this.planoComercialService = planoComercialService;
    }

    // =========================
    // LOGIN SEGURO + JWT SAAS
    // =========================
    @Transactional
    public Map<String, Object> login(@Valid LoginRequest request, String ip) {

        Usuario usuario = repository.findByLoginIgnoreCase(request.login())
                .orElseThrow(() -> new BusinessException("Login ou senha inválidos"));

        validarBloqueio(usuario, request.login(), ip);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.login(),
                            request.senha()
                    )
            );

            validarUsuarioAtivo(usuario, request.login(), ip);
            validarEmpresaUsuario(usuario, request.login(), ip);

            usuario.setTentativasLogin(0);
            usuario.setBloqueado(false);
            usuario.setBloqueadoAte(null);
            repository.save(usuario);

            registrarAuditoria(request.login(), true, ip);
            auditoriaService.registrar("Autenticacao", "LOGIN_SUCESSO", "Login realizado com sucesso", usuario.getId());

            // IMPORTANTE: gera token com usuarioId, empresaId e perfil.
            String token = jwtService.gerarToken(usuario);

            Map<String, Object> resposta = new LinkedHashMap<>();
            resposta.put("mensagem", "Login realizado com sucesso");
            resposta.put("token", token);
            resposta.put("usuarioId", usuario.getId());
            resposta.put("usuario", usuario.getNome());
            resposta.put("login", usuario.getLogin());
            resposta.put("perfil", usuario.getPerfil().name());
            resposta.put("empresaId", usuario.getEmpresa().getId());
            resposta.put("empresa", usuario.getEmpresa().getNome());
            resposta.put("plano", planoComercialService.resumo(usuario.getEmpresa()));
            resposta.put("filialId", usuario.getFilial() != null ? usuario.getFilial().getId() : null);
            resposta.put("filial", usuario.getFilial() != null ? usuario.getFilial().getNome() : null);
            resposta.put("permissoesExtras", usuario.getPermissoesExtras() != null ? usuario.getPermissoesExtras().stream().sorted().toList() : List.of());
            resposta.put("permissoesBloqueadas", usuario.getPermissoesBloqueadas() != null ? usuario.getPermissoesBloqueadas().stream().sorted().toList() : List.of());

            return resposta;

        } catch (BadCredentialsException e) {
            registrarFalhaLogin(usuario, request.login(), ip);
            throw new BusinessException("Login ou senha inválidos");

        } catch (DisabledException e) {
            registrarAuditoria(request.login(), false, ip);
            throw new BusinessException("Usuário desativado");
        }
    }

    private void validarUsuarioAtivo(Usuario usuario, String login, String ip) {
        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            registrarAuditoria(login, false, ip);
            throw new BusinessException("Usuário inativo");
        }
    }

    private void validarEmpresaUsuario(Usuario usuario, String login, String ip) {
        if (usuario.getEmpresa() == null || usuario.getEmpresa().getId() == null) {
            registrarAuditoria(login, false, ip);
            throw new BusinessException("Usuário sem empresa vinculada. Contate o administrador.");
        }

        if (usuario.getEmpresa().getAtivo() != null && !usuario.getEmpresa().getAtivo()) {
            registrarAuditoria(login, false, ip);
            throw new BusinessException("Empresa inativa. Contate o administrador.");
        }
    }

    private void validarBloqueio(Usuario usuario, String login, String ip) {

        if (!Boolean.TRUE.equals(usuario.getBloqueado())) {
            return;
        }

        if (usuario.getBloqueadoAte() != null &&
                usuario.getBloqueadoAte().isBefore(LocalDateTime.now())) {

            usuario.setBloqueado(false);
            usuario.setTentativasLogin(0);
            usuario.setBloqueadoAte(null);
            repository.save(usuario);
            return;
        }

        registrarAuditoria(login, false, ip);
        throw new BusinessException("Usuário bloqueado. Tente novamente mais tarde.");
    }

    private void registrarFalhaLogin(Usuario usuario, String login, String ip) {

        int tentativas = usuario.getTentativasLogin() == null
                ? 0
                : usuario.getTentativasLogin();

        tentativas++;
        usuario.setTentativasLogin(tentativas);

        if (tentativas >= MAX_TENTATIVAS) {
            usuario.setBloqueado(true);
            usuario.setBloqueadoAte(LocalDateTime.now().plusMinutes(MINUTOS_BLOQUEIO));
        }

        repository.save(usuario);
        registrarAuditoria(login, false, ip);
    }

    private void registrarAuditoria(String login, boolean sucesso, String ip) {
        loginAuditoriaRepository.save(
                new LoginAuditoria(login, sucesso, ip, LocalDateTime.now())
        );
    }

    // =========================
    // CADASTRO
    // =========================
    @Transactional
    public void cadastrar(UsuarioRequest request) {

        if (repository.findByLoginIgnoreCase(request.getLogin()).isPresent()) {
            throw new BusinessException("Login já existe");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setLogin(request.getLogin());
        usuario.setSenhaUsuario(passwordEncoder.encode(request.getSenha()));

        usuario.setPerfil(request.getPerfil() != null ? request.getPerfil() : Perfil.VENDEDOR);
        usuario.setCargo(normalizar(request.getCargo()));
        usuario.setDepartamento(normalizar(request.getDepartamento()));
        usuario.setSalario(request.getSalario());
        usuario.setMetaVendas(request.getMetaVendas());
        usuario.setDataInicio(request.getDataInicio());
        usuario.setTelefone(normalizar(request.getTelefone()));
        usuario.setEmail(normalizar(request.getEmail()));
        usuario.setDocumento(normalizar(request.getDocumento()));
        usuario.setAtivo(true);
        usuario.setTentativasLogin(0);
        usuario.setBloqueado(false);
        usuario.setBloqueadoAte(null);

        // ATENÇÃO:
        // Para SaaS multi-empresa, vincule aqui a empresa do usuário.
        // Exemplo recomendado:
        // usuario.setEmpresa(empresaRepository.findById(request.getEmpresaId()).orElseThrow(...));
        // Sem empresa vinculada, o login será bloqueado por segurança.

        repository.save(usuario);
    }

    @Transactional
    public Usuario salvar(Usuario usuario) {

        if (Perfil.ADMIN.equals(usuario.getPerfil()) || Perfil.MASTER.equals(usuario.getPerfil())) {
            throw new BusinessException("Não é permitido criar ou alterar usuário para ADMIN ou MASTER");
        }

        if (usuario.getSenhaUsuario() != null &&
                !usuario.getSenhaUsuario().startsWith("$2")) {
            usuario.setSenhaUsuario(passwordEncoder.encode(usuario.getSenhaUsuario()));
        }

        if (usuario.getTentativasLogin() == null) {
            usuario.setTentativasLogin(0);
        }

        if (usuario.getBloqueado() == null) {
            usuario.setBloqueado(false);
        }

        if (usuario.getAtivo() == null) {
            usuario.setAtivo(true);
        }

        if (usuario.getEmpresa() == null || usuario.getEmpresa().getId() == null) {
            throw new BusinessException("Usuário precisa estar vinculado a uma empresa");
        }

        planoComercialService.validarLimiteUsuarios(usuario.getEmpresa(), usuario.getId());

        return repository.save(usuario);
    }

    @Transactional
    public Usuario alterarAcesso(UUID id, boolean ativo) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario nao encontrado"));

        if (!ativo && usuarioLogado(usuario)) {
            throw new BusinessException("Voce nao pode revogar o proprio acesso.");
        }

        if (!ativo && (Perfil.ADMIN.equals(usuario.getPerfil()) || Perfil.MASTER.equals(usuario.getPerfil()))) {
            throw new BusinessException("Nao e permitido revogar acesso de usuario ADMIN ou MASTER por esta tela.");
        }

        usuario.setAtivo(ativo);

        if (ativo) {
            usuario.setBloqueado(false);
            usuario.setBloqueadoAte(null);
            usuario.setTentativasLogin(0);
        } else {
            usuario.setBloqueado(true);
            usuario.setBloqueadoAte(null);
        }

        Usuario salvo = repository.save(usuario);
        auditoriaService.registrar(
                "Usuarios",
                ativo ? "CONCEDER_ACESSO" : "REVOGAR_ACESSO",
                (ativo ? "Acesso concedido para " : "Acesso revogado de ") + salvo.getLogin(),
                salvo.getId()
        );
        return salvo;
    }

    @Transactional
    public Usuario alterarPermissoes(UUID id, Collection<String> permissoesExtras, Collection<String> permissoesBloqueadas) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario nao encontrado"));

        if (Perfil.ADMIN.equals(usuario.getPerfil()) || Perfil.MASTER.equals(usuario.getPerfil())) {
            throw new BusinessException("Permissoes manuais de usuario ADMIN ou MASTER nao podem ser alteradas por esta tela.");
        }

        Set<String> extrasNormalizadas = usuarioPermissionService.normalizePermissions(permissoesExtras);
        if (extrasNormalizadas.contains("action:managePlans")
                && !usuarioPermissionService.canPerform(SecurityContextHolder.getContext().getAuthentication(), "managePlans")) {
            throw new BusinessException("Somente um responsavel tecnico com permissao de planos pode delegar gerenciamento de planos.");
        }

        usuario.setPermissoesExtras(new LinkedHashSet<>(extrasNormalizadas));
        usuario.setPermissoesBloqueadas(new LinkedHashSet<>(usuarioPermissionService.normalizePermissions(permissoesBloqueadas)));
        usuario.getPermissoesExtras().removeAll(usuario.getPermissoesBloqueadas());

        Usuario salvo = repository.save(usuario);
        auditoriaService.registrar(
                "Usuarios",
                "PERMISSOES_MANUAIS",
                "Permissoes manuais atualizadas para " + salvo.getLogin(),
                salvo.getId()
        );
        return salvo;
    }

    private boolean usuarioLogado(Usuario usuario) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.getName() != null
                && usuario.getLogin() != null
                && usuario.getLogin().equalsIgnoreCase(authentication.getName());
    }

    private String normalizar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
