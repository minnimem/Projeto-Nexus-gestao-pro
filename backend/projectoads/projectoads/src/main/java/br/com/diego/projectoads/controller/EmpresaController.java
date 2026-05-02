package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.ContratoEmpresaRequest;
import br.com.diego.projectoads.dto.ContratoEmpresaResponse;
import br.com.diego.projectoads.dto.EmpresaRequest;
import br.com.diego.projectoads.dto.FilialRequest;
import br.com.diego.projectoads.dto.FilialResponse;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/empresa")
public class EmpresaController {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final FilialRepository filialRepository;
    private final ContratoEmpresaRepository contratoRepository;
    private final AuditoriaService auditoriaService;

    public EmpresaController(EmpresaRepository empresaRepository,
                             UsuarioRepository usuarioRepository,
                             FilialRepository filialRepository,
                             ContratoEmpresaRepository contratoRepository,
                             AuditoriaService auditoriaService) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.filialRepository = filialRepository;
        this.contratoRepository = contratoRepository;
        this.auditoriaService = auditoriaService;
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

    private String normalizar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
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
