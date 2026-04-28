package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.dto.EmpresaRequest;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.EmpresaRepository;
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
    private final AuditoriaService auditoriaService;

    public EmpresaController(EmpresaRepository empresaRepository,
                             UsuarioRepository usuarioRepository,
                             AuditoriaService auditoriaService) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
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
}
