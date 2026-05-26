package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.ModuloPlano;
import br.com.diego.projectoads.config.Enum.PlanoComercial;
import br.com.diego.projectoads.config.Enum.StatusAssinatura;
import br.com.diego.projectoads.config.Enum.StatusLiberacaoModulo;
import br.com.diego.projectoads.dto.LiberacaoModuloRequest;
import br.com.diego.projectoads.dto.LiberacaoModuloResponse;
import br.com.diego.projectoads.dto.PlanoEmpresaRequest;
import br.com.diego.projectoads.dto.PlanoEmpresaResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.LiberacaoModuloEmpresa;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.config.Enum.StatusCaixa;
import br.com.diego.projectoads.repository.CaixaRepository;
import br.com.diego.projectoads.repository.EmpresaRepository;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.LiberacaoModuloEmpresaRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service("planoComercialService")
public class PlanoComercialService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final FilialRepository filialRepository;
    private final CaixaRepository caixaRepository;
    private final LiberacaoModuloEmpresaRepository liberacaoModuloRepository;
    private final AuditoriaService auditoriaService;

    public PlanoComercialService(EmpresaRepository empresaRepository,
                                 UsuarioRepository usuarioRepository,
                                 FilialRepository filialRepository,
                                 CaixaRepository caixaRepository,
                                 LiberacaoModuloEmpresaRepository liberacaoModuloRepository,
                                 AuditoriaService auditoriaService) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.filialRepository = filialRepository;
        this.caixaRepository = caixaRepository;
        this.liberacaoModuloRepository = liberacaoModuloRepository;
        this.auditoriaService = auditoriaService;
    }

    public PlanoEmpresaResponse resumo(Empresa empresa) {
        empresa.normalizarPlano();
        return new PlanoEmpresaResponse(empresa, modulosLiberados(empresa));
    }

    public boolean canAccessModule(Authentication authentication, String module) {
        Usuario usuario = usuarioAutenticado(authentication);
        if (usuario == null || usuario.getEmpresa() == null) {
            return false;
        }
        return moduloLiberado(usuario.getEmpresa(), resolverModulo(module));
    }

    public void validarModulo(Empresa empresa, ModuloPlano modulo) {
        if (!moduloLiberado(empresa, modulo)) {
            throw new BusinessException("Recurso nao incluido no plano atual ou aguardando homologacao/liberacao.");
        }
    }

    public void validarLimiteUsuarios(Empresa empresa, UUID usuarioAtualId) {
        empresa.normalizarPlano();
        if (empresa.getLimiteUsuarios() == null || empresa.getLimiteUsuarios() <= 0) {
            return;
        }
        long usuariosAtivos = usuarioRepository.countByEmpresaIdAndAtivoTrue(empresa.getId());
        if (usuarioAtualId == null && usuariosAtivos >= empresa.getLimiteUsuarios()) {
            throw new BusinessException("Limite de usuarios do plano atingido. Solicite upgrade ou usuario adicional.");
        }
    }

    public void validarLimiteFiliais(Empresa empresa) {
        empresa.normalizarPlano();
        if (empresa.getLimiteFiliais() == null || empresa.getLimiteFiliais() <= 0) {
            return;
        }
        long filiais = filialRepository.countByEmpresaId(empresa.getId());
        if (filiais >= empresa.getLimiteFiliais()) {
            throw new BusinessException("Limite de filiais do plano atingido. Solicite upgrade ou filial adicional.");
        }
    }

    public void validarLimiteCaixasAbertos(Empresa empresa) {
        empresa.normalizarPlano();
        if (empresa.getLimiteCaixas() == null || empresa.getLimiteCaixas() <= 0) {
            return;
        }
        long caixasAbertos = caixaRepository.countByEmpresaAndStatus(empresa, StatusCaixa.ABERTO);
        if (caixasAbertos >= empresa.getLimiteCaixas()) {
            throw new BusinessException("Limite de caixas abertos do plano atingido. Feche um caixa ou solicite caixa adicional.");
        }
    }

    @Transactional(readOnly = true)
    public List<LiberacaoModuloResponse> listarLiberacoes(Empresa empresa) {
        empresa.normalizarPlano();
        Map<ModuloPlano, LiberacaoModuloEmpresa> liberacoes = liberacaoModuloRepository
                .findByEmpresaIdOrderByModuloAsc(empresa.getId())
                .stream()
                .collect(Collectors.toMap(LiberacaoModuloEmpresa::getModulo, Function.identity(), (a, b) -> a, () -> new EnumMap<>(ModuloPlano.class)));

        Map<ModuloPlano, Boolean> basePlano = modulosLiberadosPorPlano(empresa);
        return modulosControlados().stream()
                .map(modulo -> {
                    LiberacaoModuloEmpresa liberacao = liberacoes.get(modulo);
                    if (liberacao != null) {
                        return LiberacaoModuloResponse.fromEntity(liberacao, Boolean.TRUE.equals(basePlano.get(modulo)));
                    }
                    return new LiberacaoModuloResponse(
                            modulo,
                            Boolean.TRUE.equals(basePlano.get(modulo)) ? StatusLiberacaoModulo.LIBERADO_PRODUCAO : StatusLiberacaoModulo.BLOQUEADO,
                            Boolean.TRUE.equals(basePlano.get(modulo)),
                            Boolean.TRUE.equals(basePlano.get(modulo)),
                            Boolean.TRUE.equals(basePlano.get(modulo)),
                            null,
                            null,
                            Boolean.TRUE.equals(basePlano.get(modulo)) ? "Liberado pelo plano atual." : null,
                            null,
                            null,
                            null
                    );
                })
                .toList();
    }

    @Transactional
    public LiberacaoModuloResponse atualizarLiberacao(Empresa empresa, LiberacaoModuloRequest request) {
        if (request == null || request.getModulo() == null) {
            throw new BusinessException("Modulo da liberacao obrigatorio");
        }
        if (!modulosControlados().contains(request.getModulo())) {
            throw new BusinessException("Modulo nao controlado pela central de liberacao");
        }

        LiberacaoModuloEmpresa liberacao = liberacaoModuloRepository
                .findByEmpresaIdAndModulo(empresa.getId(), request.getModulo())
                .orElseGet(() -> {
                    LiberacaoModuloEmpresa nova = new LiberacaoModuloEmpresa();
                    nova.setEmpresa(empresa);
                    nova.setModulo(request.getModulo());
                    return nova;
                });

        liberacao.setStatus(request.getStatus() != null ? request.getStatus() : StatusLiberacaoModulo.BLOQUEADO);
        liberacao.setContratado(Boolean.TRUE.equals(request.getContratado()));
        liberacao.setResponsavel(normalizar(request.getResponsavel()));
        liberacao.setEvidencia(normalizar(request.getEvidencia()));
        liberacao.setObservacao(normalizar(request.getObservacao()));

        LiberacaoModuloEmpresa salva = liberacaoModuloRepository.save(liberacao);
        auditoriaService.registrar(
                "Planos",
                "LIBERACAO_MODULO",
                "Liberacao " + salva.getModulo() + " atualizada para " + salva.getStatus()
                        + (salva.getObservacao() != null && !salva.getObservacao().isBlank() ? ". Motivo: " + salva.getObservacao() : ""),
                empresa.getId()
        );
        return LiberacaoModuloResponse.fromEntity(salva, Boolean.TRUE.equals(modulosLiberadosPorPlano(empresa).get(salva.getModulo())));
    }

    @Transactional
    public PlanoEmpresaResponse atualizarPlano(Empresa empresa, PlanoEmpresaRequest request) {
        if (request == null) {
            throw new BusinessException("Dados do plano obrigatorios");
        }

        PlanoComercial planoAnterior = empresa.getPlanoComercial();
        empresa.setPlanoComercial(request.getPlanoComercial() != null ? request.getPlanoComercial() : empresa.getPlanoComercial());
        empresa.setStatusAssinatura(request.getStatusAssinatura() != null ? request.getStatusAssinatura() : empresa.getStatusAssinatura());
        if (request.getPlanoComercial() != null && !request.getPlanoComercial().equals(planoAnterior)
                && request.getLimiteUsuarios() == null
                && request.getLimiteFiliais() == null
                && request.getLimiteCaixas() == null
                && request.getLimiteProdutos() == null) {
            aplicarLimitesPadrao(empresa);
        } else {
            aplicarLimitesPadraoSeNecessario(empresa);
        }
        empresa.setLimiteUsuarios(normalizarLimite(request.getLimiteUsuarios(), empresa.getLimiteUsuarios()));
        empresa.setLimiteFiliais(normalizarLimite(request.getLimiteFiliais(), empresa.getLimiteFiliais()));
        empresa.setLimiteCaixas(normalizarLimite(request.getLimiteCaixas(), empresa.getLimiteCaixas()));
        empresa.setLimiteProdutos(normalizarLimite(request.getLimiteProdutos(), empresa.getLimiteProdutos()));
        if (request.getValorMensalPlano() != null) {
            if (request.getValorMensalPlano().signum() < 0) {
                throw new BusinessException("Valor mensal do plano nao pode ser negativo");
            }
            empresa.setValorMensalPlano(request.getValorMensalPlano());
        }
        if (request.getDiaVencimentoPlano() != null) {
            if (request.getDiaVencimentoPlano() < 1 || request.getDiaVencimentoPlano() > 28) {
                throw new BusinessException("Dia de vencimento do plano deve ficar entre 1 e 28");
            }
            empresa.setDiaVencimentoPlano(request.getDiaVencimentoPlano());
        }
        if (request.getUltimoPagamentoPlano() != null) {
            empresa.setUltimoPagamentoPlano(request.getUltimoPagamentoPlano());
        }
        empresa.setFiscalLiberado(valor(request.getFiscalLiberado(), empresa.getFiscalLiberado()));
        empresa.setPagamentosLiberado(valor(request.getPagamentosLiberado(), empresa.getPagamentosLiberado()));
        empresa.setNotificacoesLiberado(valor(request.getNotificacoesLiberado(), empresa.getNotificacoesLiberado()));
        empresa.setLogisticaLiberada(valor(request.getLogisticaLiberada(), empresa.getLogisticaLiberada()));
        empresa.setServicosLiberado(valor(request.getServicosLiberado(), empresa.getServicosLiberado()));
        empresa.setAuditoriaAvancadaLiberada(valor(request.getAuditoriaAvancadaLiberada(), empresa.getAuditoriaAvancadaLiberada()));

        Empresa salva = empresaRepository.save(empresa);
        String observacao = normalizar(request.getObservacaoComercial());
        auditoriaService.registrar(
                "Planos",
                "PLANO_ATUALIZADO",
                "Plano comercial atualizado de " + planoAnterior + " para " + salva.getPlanoComercial()
                        + " / assinatura " + salva.getStatusAssinatura()
                        + (observacao != null ? ". Motivo: " + observacao : ""),
                salva.getId()
        );
        return resumo(salva);
    }

    private boolean moduloLiberado(Empresa empresa, ModuloPlano modulo) {
        empresa.normalizarPlano();
        if (!assinaturaOperavel(empresa.getStatusAssinatura())) {
            return false;
        }
        return Boolean.TRUE.equals(modulosLiberados(empresa).get(modulo));
    }

    private Map<ModuloPlano, Boolean> modulosLiberados(Empresa empresa) {
        empresa.normalizarPlano();
        Map<ModuloPlano, Boolean> modulos = modulosLiberadosPorPlano(empresa);
        aplicarLiberacoesCentralizadas(empresa, modulos);
        return modulos;
    }

    private Map<ModuloPlano, Boolean> modulosLiberadosPorPlano(Empresa empresa) {
        Map<ModuloPlano, Boolean> modulos = new EnumMap<>(ModuloPlano.class);
        for (ModuloPlano modulo : ModuloPlano.values()) {
            modulos.put(modulo, false);
        }

        Set<ModuloPlano> base = Set.of(
                ModuloPlano.VENDAS,
                ModuloPlano.CAIXA,
                ModuloPlano.CLIENTES,
                ModuloPlano.PRODUTOS,
                ModuloPlano.ESTOQUE,
                ModuloPlano.FINANCEIRO,
                ModuloPlano.RELATORIOS,
                ModuloPlano.USUARIOS
        );
        base.forEach(modulo -> modulos.put(modulo, true));

        if (PlanoComercial.BUSINESS.equals(empresa.getPlanoComercial()) || PlanoComercial.ENTERPRISE.equals(empresa.getPlanoComercial())) {
            modulos.put(ModuloPlano.LOGISTICA, true);
            modulos.put(ModuloPlano.NOTIFICACOES, true);
        }

        if (PlanoComercial.ENTERPRISE.equals(empresa.getPlanoComercial())) {
            modulos.put(ModuloPlano.SERVICOS, true);
            modulos.put(ModuloPlano.AUDITORIA, true);
        }

        if (Boolean.TRUE.equals(empresa.getLogisticaLiberada())) modulos.put(ModuloPlano.LOGISTICA, true);
        if (Boolean.TRUE.equals(empresa.getServicosLiberado())) modulos.put(ModuloPlano.SERVICOS, true);
        if (Boolean.TRUE.equals(empresa.getFiscalLiberado())) modulos.put(ModuloPlano.FISCAL, true);
        if (Boolean.TRUE.equals(empresa.getPagamentosLiberado())) modulos.put(ModuloPlano.PAGAMENTOS, true);
        if (Boolean.TRUE.equals(empresa.getNotificacoesLiberado())) modulos.put(ModuloPlano.NOTIFICACOES, true);
        if (Boolean.TRUE.equals(empresa.getAuditoriaAvancadaLiberada())) modulos.put(ModuloPlano.AUDITORIA, true);

        return modulos;
    }

    private void aplicarLiberacoesCentralizadas(Empresa empresa, Map<ModuloPlano, Boolean> modulos) {
        if (empresa.getId() == null) {
            return;
        }

        for (LiberacaoModuloEmpresa liberacao : liberacaoModuloRepository.findByEmpresaIdOrderByModuloAsc(empresa.getId())) {
            if (!modulosControlados().contains(liberacao.getModulo())) {
                continue;
            }

            if (StatusLiberacaoModulo.LIBERADO_PRODUCAO.equals(liberacao.getStatus())) {
                modulos.put(liberacao.getModulo(), true);
            } else if (StatusLiberacaoModulo.BLOQUEADO.equals(liberacao.getStatus())
                    || StatusLiberacaoModulo.CONTRATADO.equals(liberacao.getStatus())
                    || StatusLiberacaoModulo.PENDENTE_HOMOLOGACAO.equals(liberacao.getStatus())
                    || StatusLiberacaoModulo.HOMOLOGADO.equals(liberacao.getStatus())
                    || StatusLiberacaoModulo.SUSPENSO.equals(liberacao.getStatus())) {
                modulos.put(liberacao.getModulo(), false);
            }
        }
    }

    private Set<ModuloPlano> modulosControlados() {
        return Set.of(
                ModuloPlano.FISCAL,
                ModuloPlano.PAGAMENTOS,
                ModuloPlano.NOTIFICACOES,
                ModuloPlano.LOGISTICA,
                ModuloPlano.SERVICOS,
                ModuloPlano.AUDITORIA
        );
    }

    private void aplicarLimitesPadraoSeNecessario(Empresa empresa) {
        if (empresa.getLimiteUsuarios() != null && empresa.getLimiteFiliais() != null
                && empresa.getLimiteCaixas() != null && empresa.getLimiteProdutos() != null) {
            return;
        }
        aplicarLimitesPadrao(empresa);
    }

    private void aplicarLimitesPadrao(Empresa empresa) {
        switch (empresa.getPlanoComercial()) {
            case BUSINESS -> {
                empresa.setLimiteUsuarios(8);
                empresa.setLimiteFiliais(3);
                empresa.setLimiteCaixas(3);
                empresa.setLimiteProdutos(5000);
            }
            case ENTERPRISE -> {
                empresa.setLimiteUsuarios(15);
                empresa.setLimiteFiliais(5);
                empresa.setLimiteCaixas(5);
                empresa.setLimiteProdutos(20000);
            }
            default -> {
                empresa.setLimiteUsuarios(3);
                empresa.setLimiteFiliais(1);
                empresa.setLimiteCaixas(1);
                empresa.setLimiteProdutos(500);
            }
        }
    }

    private boolean assinaturaOperavel(StatusAssinatura status) {
        return StatusAssinatura.ATIVA.equals(status) || StatusAssinatura.TESTE.equals(status);
    }

    private Integer normalizarLimite(Integer novoValor, Integer atual) {
        Integer valor = novoValor != null ? novoValor : atual;
        if (valor == null) {
            return null;
        }
        if (valor < 0) {
            throw new BusinessException("Limite do plano nao pode ser negativo");
        }
        return valor;
    }

    private Boolean valor(Boolean novoValor, Boolean atual) {
        return novoValor != null ? novoValor : Boolean.TRUE.equals(atual);
    }

    private String normalizar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private ModuloPlano resolverModulo(String module) {
        String normalized = module == null ? "" : module.trim().toLowerCase();
        return switch (normalized) {
            case "pedidos", "vendas" -> ModuloPlano.VENDAS;
            case "caixa" -> ModuloPlano.CAIXA;
            case "clientes" -> ModuloPlano.CLIENTES;
            case "produtos", "estoque" -> ModuloPlano.ESTOQUE;
            case "financeiro" -> ModuloPlano.FINANCEIRO;
            case "relatorios" -> ModuloPlano.RELATORIOS;
            case "usuarios", "colaboradores" -> ModuloPlano.USUARIOS;
            case "logistica" -> ModuloPlano.LOGISTICA;
            case "servicos", "ordens-servico" -> ModuloPlano.SERVICOS;
            case "fiscal", "documentos-fiscais", "configuracoes-fiscais" -> ModuloPlano.FISCAL;
            case "pagamentos" -> ModuloPlano.PAGAMENTOS;
            case "notificacoes" -> ModuloPlano.NOTIFICACOES;
            case "auditoria" -> ModuloPlano.AUDITORIA;
            default -> ModuloPlano.RELATORIOS;
        };
    }

    private Usuario usuarioAutenticado(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return usuarioRepository.findByLoginIgnoreCase(authentication.getName()).orElse(null);
    }
}
