package br.com.diego.projectoads.service;

import br.com.diego.projectoads.dto.ConfiguracaoAutomacaoComercialRequest;
import br.com.diego.projectoads.dto.ConfiguracaoAutomacaoComercialResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.ConfiguracaoAutomacaoComercial;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Filial;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.ConfiguracaoAutomacaoComercialRepository;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class ConfiguracaoAutomacaoComercialService {

    private static final Set<String> CANAIS_PERMITIDOS = Set.of("WEBHOOK", "WHATSAPP", "EMAIL");

    private final ConfiguracaoAutomacaoComercialRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final FilialRepository filialRepository;
    private final AuditoriaService auditoriaService;

    public ConfiguracaoAutomacaoComercialService(ConfiguracaoAutomacaoComercialRepository repository,
                                                 UsuarioRepository usuarioRepository,
                                                 FilialRepository filialRepository,
                                                 AuditoriaService auditoriaService) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.filialRepository = filialRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public ConfiguracaoAutomacaoComercialResponse obter(UUID filialId) {
        Usuario usuario = usuarioAtualObrigatorio();
        Empresa empresa = empresaObrigatoria(usuario);
        Filial filial = resolverFilial(filialId, empresa);

        ConfiguracaoAutomacaoComercial configuracao = buscarConfiguracao(empresa.getId(), filial)
                .orElseGet(() -> defaults(empresa, filial));

        return toResponse(configuracao);
    }

    @Transactional
    public ConfiguracaoAutomacaoComercialResponse salvar(ConfiguracaoAutomacaoComercialRequest request) {
        Usuario usuario = usuarioAtualObrigatorio();
        Empresa empresa = empresaObrigatoria(usuario);
        Filial filial = resolverFilial(request != null ? request.getFilialId() : null, empresa);

        ConfiguracaoAutomacaoComercial configuracao = buscarConfiguracao(empresa.getId(), filial)
                .orElseGet(() -> defaults(empresa, filial));
        aplicar(configuracao, request);

        ConfiguracaoAutomacaoComercial salvo = repository.save(configuracao);
        auditoriaService.registrar("Pedidos", "CONFIG_AUTOMACAO_COMERCIAL",
                "Configuracao de automacao comercial atualizada", salvo.getId());
        return toResponse(salvo);
    }

    private Optional<ConfiguracaoAutomacaoComercial> buscarConfiguracao(UUID empresaId, Filial filial) {
        if (filial == null) {
            return repository.findFirstByEmpresaIdAndFilialIsNull(empresaId);
        }
        return repository.findFirstByEmpresaIdAndFilialId(empresaId, filial.getId());
    }

    private ConfiguracaoAutomacaoComercial defaults(Empresa empresa, Filial filial) {
        ConfiguracaoAutomacaoComercial configuracao = new ConfiguracaoAutomacaoComercial();
        configuracao.setEmpresa(empresa);
        configuracao.setFilial(filial);
        return configuracao;
    }

    private void aplicar(ConfiguracaoAutomacaoComercial configuracao,
                         ConfiguracaoAutomacaoComercialRequest request) {
        if (request == null) {
            return;
        }

        configuracao.setFollowUpVencidoAtivo(Boolean.TRUE.equals(request.getOverdue()));
        configuracao.setAcaoHojeAtivo(Boolean.TRUE.equals(request.getToday()));
        configuracao.setAltoValorAtivo(Boolean.TRUE.equals(request.getHighValue()));
        configuracao.setSemProximaAcaoAtivo(Boolean.TRUE.equals(request.getMissingDate()));
        configuracao.setLimiteAltoValor(normalizarLimite(request.getHighValueThreshold()));
        configuracao.setCanalPadrao(normalizarCanal(request.getChannel()));
    }

    private BigDecimal normalizarLimite(BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.valueOf(1000);
        }
        return value;
    }

    private String normalizarCanal(String canal) {
        String value = canal == null || canal.isBlank() ? "WEBHOOK" : canal.trim().toUpperCase();
        if (!CANAIS_PERMITIDOS.contains(value)) {
            throw new BusinessException("Canal de automacao comercial invalido.");
        }
        return value;
    }

    private Filial resolverFilial(UUID filialId, Empresa empresa) {
        if (filialId == null) {
            return null;
        }
        return filialRepository.findById(filialId)
                .filter(filial -> filial.getEmpresa() != null && empresa.getId().equals(filial.getEmpresa().getId()))
                .orElseThrow(() -> new BusinessException("Filial da automacao comercial nao encontrada."));
    }

    private Usuario usuarioAtualObrigatorio() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BusinessException("Usuario autenticado obrigatorio.");
        }
        return usuarioRepository.findByLoginIgnoreCase(authentication.getName())
                .orElseThrow(() -> new BusinessException("Usuario autenticado nao encontrado."));
    }

    private Empresa empresaObrigatoria(Usuario usuario) {
        if (usuario.getEmpresa() == null || usuario.getEmpresa().getId() == null) {
            throw new BusinessException("Empresa obrigatoria para automacao comercial.");
        }
        return usuario.getEmpresa();
    }

    private ConfiguracaoAutomacaoComercialResponse toResponse(ConfiguracaoAutomacaoComercial configuracao) {
        return ConfiguracaoAutomacaoComercialResponse.builder()
                .id(configuracao.getId())
                .empresaId(configuracao.getEmpresa() != null ? configuracao.getEmpresa().getId() : null)
                .filialId(configuracao.getFilial() != null ? configuracao.getFilial().getId() : null)
                .filial(configuracao.getFilial() != null ? configuracao.getFilial().getNome() : null)
                .overdue(configuracao.getFollowUpVencidoAtivo())
                .today(configuracao.getAcaoHojeAtivo())
                .highValue(configuracao.getAltoValorAtivo())
                .missingDate(configuracao.getSemProximaAcaoAtivo())
                .highValueThreshold(configuracao.getLimiteAltoValor())
                .channel(configuracao.getCanalPadrao())
                .atualizadoEm(configuracao.getAtualizadoEm())
                .build();
    }
}
