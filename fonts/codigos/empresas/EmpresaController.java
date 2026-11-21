package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.ContratoEmpresaRequest;
import br.com.diego.projectoads.dto.ContratoEmpresaResponse;
import br.com.diego.projectoads.dto.EmpresaRequest;
import br.com.diego.projectoads.dto.FilialRequest;
import br.com.diego.projectoads.dto.FilialResponse;
import br.com.diego.projectoads.dto.LiberacaoModuloRequest;
import br.com.diego.projectoads.dto.LiberacaoModuloResponse;
import br.com.diego.projectoads.dto.MasterEmpresaRequest;
import br.com.diego.projectoads.dto.MasterEmpresaResponse;
import br.com.diego.projectoads.dto.MasterEmpresaStatusRequest;
import br.com.diego.projectoads.dto.PlanoEmpresaRequest;
import br.com.diego.projectoads.dto.PlanoEmpresaResponse;
import br.com.diego.projectoads.config.Enum.Perfil;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.ContratoEmpresa;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Filial;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.ContratoEmpresaRepository;
import br.com.diego.projectoads.repository.EmpresaRepository;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import br.com.diego.projectoads.service.AuditoriaService;
import br.com.diego.projectoads.service.PlanoComercialService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/empresa")
public class EmpresaController {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final FilialRepository filialRepository;
    private final ContratoEmpresaRepository contratoRepository;
    private final AuditoriaService auditoriaService;
    private final PlanoComercialService planoComercialService;
    private final PasswordEncoder passwordEncoder;

    public EmpresaController(EmpresaRepository empresaRepository,
                             UsuarioRepository usuarioRepository,
                             FilialRepository filialRepository,
                             ContratoEmpresaRepository contratoRepository,
                             AuditoriaService auditoriaService,
                             PlanoComercialService planoComercialService,
                             PasswordEncoder passwordEncoder) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.filialRepository = filialRepository;
        this.contratoRepository = contratoRepository;
        this.auditoriaService = auditoriaService;
        this.planoComercialService = planoComercialService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/minha")
    @PreAuthorize("hasRole('ADMIN')")
    public Empresa minhaEmpresa() {
        return empresaAutenticada();
    }

    @PutMapping("/minha")
    @PreAuthorize("hasRole('ADMIN')")
    public Empresa atualizar(@RequestBody EmpresaRequest request) {
        Empresa empresa = empresaAutenticada();

        if (request.getNome() == null || request.getNome().isBlank()) {
            throw new BusinessException("Nome da empresa obrigatorio");
        }

        empresa.setNome(normalizar(request.getNome()));
        empresa.setRazaoSocial(normalizar(request.getRazaoSocial()));
        empresa.setCnpj(normalizar(request.getCnpj()));
        empresa.setTelefone(normalizar(request.getTelefone()));
        empresa.setEmail(normalizar(request.getEmail()));
        empresa.setEndereco(normalizar(request.getEndereco()));
        empresa.setCidade(normalizar(request.getCidade()));
        empresa.setUf(normalizar(request.getUf()) != null ? normalizar(request.getUf()).toUpperCase() : null);
        empresa.setCep(digitos(request.getCep(), 8));
        empresa.setCodigoMunicipio(digitos(request.getCodigoMunicipio(), 7));
        empresa.setInscricaoEstadual(normalizar(request.getInscricaoEstadual()));
        empresa.setInscricaoMunicipal(normalizar(request.getInscricaoMunicipal()));
        empresa.setRegimeTributario(normalizar(request.getRegimeTributario()));
        empresa.setCrt(digitos(request.getCrt(), 1));
        empresa.setEstoqueMinimoPadrao(request.getEstoqueMinimoPadrao() != null ? request.getEstoqueMinimoPadrao() : 5);

        Empresa salva = empresaRepository.save(empresa);
        auditoriaService.registrar("Empresa", "EMPRESA_EDITADA", "Dados da empresa atualizados", salva.getId());
        return salva;
    }

    @GetMapping("/filiais")
    @PreAuthorize("hasRole('ADMIN')")
    public java.util.List<FilialResponse> listarFiliais() {
        Empresa empresa = empresaAutenticada();
        return filialRepository.findByEmpresaIdOrderByMatrizDescNomeAsc(empresa.getId())
                .stream()
                .map(FilialResponse::new)
                .toList();
    }

    @PostMapping("/filiais")
    @PreAuthorize("hasRole('ADMIN')")
    public FilialResponse criarFilial(@RequestBody FilialRequest request) {
        Empresa empresa = empresaAutenticada();
        planoComercialService.validarLimiteFiliais(empresa);
        Filial filial = new Filial();
        filial.setEmpresa(empresa);
        preencherFilial(filial, request);
        Filial salva = filialRepository.save(filial);
        auditoriaService.registrar("Empresa", "FILIAL_CRIADA", "Filial criada: " + salva.getNome(), salva.getId());
        return new FilialResponse(salva);
    }

    @PutMapping("/filiais/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public FilialResponse atualizarFilial(@PathVariable java.util.UUID id,
                                          @RequestBody FilialRequest request) {
        Empresa empresa = empresaAutenticada();
        Filial filial = filialRepository.findById(id)
                .filter(item -> item.getEmpresa() != null && empresa.getId().equals(item.getEmpresa().getId()))
                .orElseThrow(() -> new BusinessException("Filial nao encontrada"));

        preencherFilial(filial, request);
        Filial salva = filialRepository.save(filial);
        auditoriaService.registrar("Empresa", "FILIAL_EDITADA", "Filial atualizada: " + salva.getNome(), salva.getId());
        return new FilialResponse(salva);
    }

    @GetMapping("/contratos")
    @PreAuthorize("hasRole('ADMIN')")
    public java.util.List<ContratoEmpresaResponse> listarContratos() {
        Empresa empresa = empresaAutenticada();
        return contratoRepository.findByEmpresaIdOrderByDataFimAscNomeAsc(empresa.getId())
                .stream()
                .map(ContratoEmpresaResponse::new)
                .toList();
    }

    @GetMapping("/plano")
    @PreAuthorize("hasRole('ADMIN') or @usuarioPermissionService.canPerform(authentication, 'managePlans')")
    public PlanoEmpresaResponse planoAtual() {
        return planoComercialService.resumo(empresaAutenticada());
    }

    @PutMapping("/plano")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'managePlans')")
    public PlanoEmpresaResponse atualizarPlano(@RequestBody PlanoEmpresaRequest request) {
        return planoComercialService.atualizarPlano(empresaAutenticada(), request);
    }

    @GetMapping("/liberacoes")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'managePlans')")
    public java.util.List<LiberacaoModuloResponse> listarLiberacoes() {
        return planoComercialService.listarLiberacoes(empresaAutenticada());
    }

    @PutMapping("/liberacoes")
    @PreAuthorize("@usuarioPermissionService.canPerform(authentication, 'managePlans')")
    public LiberacaoModuloResponse atualizarLiberacao(@RequestBody LiberacaoModuloRequest request) {
        return planoComercialService.atualizarLiberacao(empresaAutenticada(), request);
    }

    @GetMapping("/master/empresas")
    @PreAuthorize("hasRole('MASTER')")
    public List<MasterEmpresaResponse> listarEmpresasMaster() {
        return empresaRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Empresa::getNome, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .map(this::toMasterResponse)
                .toList();
    }

    @PostMapping("/master/empresas")
    @PreAuthorize("hasRole('MASTER')")
    public MasterEmpresaResponse criarEmpresaMaster(@RequestBody MasterEmpresaRequest request) {
        validarNovaEmpresa(request);

        Empresa empresa = new Empresa();
        preencherEmpresa(empresa, request);
        Empresa salva = empresaRepository.save(empresa);
        planoComercialService.atualizarPlano(salva, request);

        Usuario admin = new Usuario();
        admin.setEmpresa(salva);
        admin.setNome(normalizar(request.getAdminNome()));
        admin.setLogin(normalizar(request.getAdminLogin()));
        admin.setSenhaUsuario(passwordEncoder.encode(request.getAdminSenha()));
        admin.setPerfil(Perfil.ADMIN);
        admin.setEmail(normalizar(request.getAdminEmail()));
        admin.setTelefone(normalizar(request.getAdminTelefone()));
        admin.setCargo("Administrador");
        admin.setDepartamento("Administracao");
        admin.setAtivo(true);
        admin.setBloqueado(false);
        admin.setTentativasLogin(0);
        usuarioRepository.save(admin);

        auditoriaService.registrar("Empresas", "EMPRESA_MASTER_CRIADA", "Empresa criada pelo master: " + salva.getNome(), salva.getId());
        auditoriaService.registrar("Usuarios", "ADMIN_INICIAL_CRIADO", "Admin inicial criado para " + salva.getNome() + ": " + admin.getLogin(), admin.getId());
        return toMasterResponse(empresaPorId(salva.getId()));
    }

    @PutMapping("/master/empresas/{id}/plano")
    @PreAuthorize("hasRole('MASTER')")
    public PlanoEmpresaResponse atualizarPlanoMaster(@PathVariable UUID id,
                                                     @RequestBody PlanoEmpresaRequest request) {
        Empresa empresa = empresaPorId(id);
        return planoComercialService.atualizarPlano(empresa, request);
    }

    @PutMapping("/master/empresas/{id}")
    @PreAuthorize("hasRole('MASTER')")
    public MasterEmpresaResponse atualizarEmpresaMaster(@PathVariable UUID id,
                                                        @RequestBody EmpresaRequest request) {
        Empresa empresa = empresaPorId(id);

        if (request.getNome() == null || request.getNome().isBlank()) {
            throw new BusinessException("Nome da empresa obrigatorio.");
        }

        preencherEmpresa(empresa, request);
        Empresa salva = empresaRepository.save(empresa);
        auditoriaService.registrar("Empresas", "EMPRESA_MASTER_EDITADA", "Empresa atualizada pelo master: " + salva.getNome(), salva.getId());
        return toMasterResponse(salva);
    }

    @PatchMapping("/master/empresas/{id}/status")
    @PreAuthorize("hasRole('MASTER')")
    public MasterEmpresaResponse alterarStatusEmpresaMaster(@PathVariable UUID id,
                                                            @RequestBody MasterEmpresaStatusRequest request) {
        Empresa empresa = empresaPorId(id);
        boolean ativo = request != null && Boolean.TRUE.equals(request.getAtivo());
        empresa.setAtivo(ativo);
        Empresa salva = empresaRepository.save(empresa);
        String observacao = request != null ? normalizar(request.getObservacaoComercial()) : null;
        auditoriaService.registrar(
                "Empresas",
                ativo ? "EMPRESA_MASTER_ATIVADA" : "EMPRESA_MASTER_INATIVADA",
                ((ativo ? "Empresa ativada pelo master: " : "Empresa inativada pelo master: ") + salva.getNome())
                        + (observacao != null ? ". Motivo: " + observacao : ""),
                salva.getId()
        );
        return toMasterResponse(salva);
    }

    @GetMapping("/master/empresas/{id}/liberacoes")
    @PreAuthorize("hasRole('MASTER')")
    public List<LiberacaoModuloResponse> listarLiberacoesMaster(@PathVariable UUID id) {
        return planoComercialService.listarLiberacoes(empresaPorId(id));
    }

    @PutMapping("/master/empresas/{id}/liberacoes")
    @PreAuthorize("hasRole('MASTER')")
    public LiberacaoModuloResponse atualizarLiberacaoMaster(@PathVariable UUID id,
                                                            @RequestBody LiberacaoModuloRequest request) {
        return planoComercialService.atualizarLiberacao(empresaPorId(id), request);
    }

    @PostMapping("/contratos")
    @PreAuthorize("hasRole('ADMIN')")
    public ContratoEmpresaResponse criarContrato(@RequestBody ContratoEmpresaRequest request) {
        Empresa empresa = empresaAutenticada();
        ContratoEmpresa contrato = new ContratoEmpresa();
        contrato.setEmpresa(empresa);
        preencherContrato(contrato, request, empresa);
        ContratoEmpresa salvo = contratoRepository.save(contrato);
        auditoriaService.registrar("Empresa", "CONTRATO_CRIADO", "Contrato criado: " + salvo.getNome(), salvo.getId());
        return new ContratoEmpresaResponse(salvo);
    }

    @PutMapping("/contratos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ContratoEmpresaResponse atualizarContrato(@PathVariable java.util.UUID id,
                                                     @RequestBody ContratoEmpresaRequest request) {
        Empresa empresa = empresaAutenticada();
        ContratoEmpresa contrato = contratoRepository.findById(id)
                .filter(item -> item.getEmpresa() != null && empresa.getId().equals(item.getEmpresa().getId()))
                .orElseThrow(() -> new BusinessException("Contrato nao encontrado"));

        preencherContrato(contrato, request, empresa);
        ContratoEmpresa salvo = contratoRepository.save(contrato);
        auditoriaService.registrar("Empresa", "CONTRATO_EDITADO", "Contrato atualizado: " + salvo.getNome(), salvo.getId());
        return new ContratoEmpresaResponse(salvo);
    }

    private Empresa empresaAutenticada() {
        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByLoginIgnoreCase(login)
                .orElseThrow(() -> new BusinessException("Usuario autenticado nao encontrado"));

        if (usuario.getEmpresa() == null || usuario.getEmpresa().getId() == null) {
            throw new BusinessException("Usuario sem empresa vinculada");
        }

        return empresaRepository.findById(usuario.getEmpresa().getId())
                .orElseThrow(() -> new BusinessException("Empresa nao encontrada"));
    }

    private Empresa empresaPorId(UUID id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Empresa nao encontrada"));
    }

    private MasterEmpresaResponse toMasterResponse(Empresa empresa) {
        return new MasterEmpresaResponse(
                empresa,
                usuarioRepository.countByEmpresaIdAndAtivoTrue(empresa.getId()),
                filialRepository.countByEmpresaId(empresa.getId()),
                planoComercialService.resumo(empresa),
                planoComercialService.listarLiberacoes(empresa),
                auditoriaService.listarUltimosPorReferencia(empresa.getId())
        );
    }

    private String normalizar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private void preencherEmpresa(Empresa empresa, EmpresaRequest request) {
        empresa.setNome(normalizar(request.getNome()));
        empresa.setRazaoSocial(normalizar(request.getRazaoSocial()));
        empresa.setCnpj(normalizar(request.getCnpj()));
        empresa.setTelefone(normalizar(request.getTelefone()));
        empresa.setEmail(normalizar(request.getEmail()));
        empresa.setEndereco(normalizar(request.getEndereco()));
        empresa.setCidade(normalizar(request.getCidade()));
        empresa.setUf(normalizar(request.getUf()) != null ? normalizar(request.getUf()).toUpperCase() : null);
        empresa.setCep(digitos(request.getCep(), 8));
        empresa.setCodigoMunicipio(digitos(request.getCodigoMunicipio(), 7));
        empresa.setInscricaoEstadual(normalizar(request.getInscricaoEstadual()));
        empresa.setInscricaoMunicipal(normalizar(request.getInscricaoMunicipal()));
        empresa.setRegimeTributario(normalizar(request.getRegimeTributario()));
        empresa.setCrt(digitos(request.getCrt(), 1));
        empresa.setEstoqueMinimoPadrao(request.getEstoqueMinimoPadrao() != null ? request.getEstoqueMinimoPadrao() : 5);
    }

    private void preencherEmpresa(Empresa empresa, MasterEmpresaRequest request) {
        empresa.setNome(normalizar(request.getNome()));
        empresa.setRazaoSocial(normalizar(request.getRazaoSocial()));
        empresa.setCnpj(normalizar(request.getCnpj()));
        empresa.setTelefone(normalizar(request.getTelefone()));
        empresa.setEmail(normalizar(request.getEmail()));
        empresa.setEndereco(normalizar(request.getEndereco()));
        empresa.setCidade(normalizar(request.getCidade()));
        empresa.setUf(normalizar(request.getUf()) != null ? normalizar(request.getUf()).toUpperCase() : null);
        empresa.setCep(digitos(request.getCep(), 8));
        empresa.setCodigoMunicipio(digitos(request.getCodigoMunicipio(), 7));
        empresa.setInscricaoEstadual(normalizar(request.getInscricaoEstadual()));
        empresa.setInscricaoMunicipal(normalizar(request.getInscricaoMunicipal()));
        empresa.setRegimeTributario(normalizar(request.getRegimeTributario()));
        empresa.setCrt(digitos(request.getCrt(), 1));
        empresa.setEstoqueMinimoPadrao(request.getEstoqueMinimoPadrao() != null ? request.getEstoqueMinimoPadrao() : 5);
    }

    private void validarNovaEmpresa(MasterEmpresaRequest request) {
        if (request == null || request.getNome() == null || request.getNome().isBlank()) {
            throw new BusinessException("Nome da empresa obrigatorio.");
        }
        if (request.getAdminNome() == null || request.getAdminNome().isBlank()) {
            throw new BusinessException("Nome do admin inicial obrigatorio.");
        }
        if (request.getAdminLogin() == null || request.getAdminLogin().isBlank()) {
            throw new BusinessException("Login do admin inicial obrigatorio.");
        }
        if (request.getAdminSenha() == null || request.getAdminSenha().length() < 6) {
            throw new BusinessException("Senha do admin inicial precisa ter no minimo 6 caracteres.");
        }
        if (usuarioRepository.findByLoginIgnoreCase(request.getAdminLogin()).isPresent()) {
            throw new BusinessException("Login do admin inicial ja esta em uso.");
        }
    }

    private String digitos(String valor, int maxLength) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String normalized = valor.replaceAll("\\D", "");
        if (normalized.isBlank()) {
            return null;
        }
        return normalized.length() > maxLength ? normalized.substring(0, maxLength) : normalized;
    }

    private void preencherFilial(Filial filial, FilialRequest request) {
        if (request == null || request.getNome() == null || request.getNome().isBlank()) {
            throw new BusinessException("Nome da filial obrigatorio");
        }

        filial.setNome(normalizar(request.getNome()));
        filial.setCodigo(normalizar(request.getCodigo()));
        filial.setCnpj(normalizar(request.getCnpj()));
        filial.setTelefone(normalizar(request.getTelefone()));
        filial.setEmail(normalizar(request.getEmail()));
        filial.setEndereco(normalizar(request.getEndereco()));
        filial.setCidade(normalizar(request.getCidade()));
        filial.setUf(normalizar(request.getUf()) != null ? normalizar(request.getUf()).toUpperCase() : null);
        filial.setMatriz(Boolean.TRUE.equals(request.getMatriz()));
        filial.setAtivo(request.getAtivo() == null ? true : request.getAtivo());
    }

    private void preencherContrato(ContratoEmpresa contrato, ContratoEmpresaRequest request, Empresa empresa) {
        if (request == null || request.getNome() == null || request.getNome().isBlank()) {
            throw new BusinessException("Nome do contrato obrigatorio");
        }

        contrato.setNome(normalizar(request.getNome()));
        contrato.setNumero(normalizar(request.getNumero()));
        contrato.setTipo(normalizar(request.getTipo()));
        contrato.setStatus(normalizar(request.getStatus()) != null ? normalizar(request.getStatus()).toUpperCase() : "ATIVO");
        contrato.setDataInicio(request.getDataInicio());
        contrato.setDataFim(request.getDataFim());
        contrato.setValorMensal(request.getValorMensal());
        contrato.setObservacao(normalizar(request.getObservacao()));
        contrato.setFilial(null);

        if (request.getFilialId() != null) {
            Filial filial = filialRepository.findById(request.getFilialId())
                    .filter(item -> item.getEmpresa() != null && empresa.getId().equals(item.getEmpresa().getId()))
                    .orElseThrow(() -> new BusinessException("Filial do contrato nao encontrada"));
            contrato.setFilial(filial);
        }
    }
}
