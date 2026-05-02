package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.dto.ConfiguracaoFiscalRequest;
import br.com.diego.projectoads.dto.ConfiguracaoFiscalResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Filial;
import br.com.diego.projectoads.repository.ConfiguracaoFiscalRepository;
import br.com.diego.projectoads.repository.EmpresaRepository;
import br.com.diego.projectoads.repository.FilialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ConfiguracaoFiscalService {

    private final ConfiguracaoFiscalRepository configuracaoFiscalRepository;
    private final EmpresaRepository empresaRepository;
    private final FilialRepository filialRepository;

    public ConfiguracaoFiscalService(ConfiguracaoFiscalRepository configuracaoFiscalRepository,
                                     EmpresaRepository empresaRepository,
                                     FilialRepository filialRepository) {
        this.configuracaoFiscalRepository = configuracaoFiscalRepository;
        this.empresaRepository = empresaRepository;
        this.filialRepository = filialRepository;
    }

    @Transactional(readOnly = true)
    public List<ConfiguracaoFiscalResponse> listar() {
        return configuracaoFiscalRepository.findAllByOrderByEmpresaNomeAscFilialNomeAscModeloAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ConfiguracaoFiscalResponse salvar(ConfiguracaoFiscalRequest request) {
        validar(request);
        Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                .orElseThrow(() -> new BusinessException("Empresa fiscal nao encontrada."));
        Filial filial = buscarFilial(request.getFilialId(), empresa.getId());

        ConfiguracaoFiscal configuracao = buscarExistente(empresa.getId(), filial, request)
                .orElseGet(ConfiguracaoFiscal::new);
        configuracao.setEmpresa(empresa);
        configuracao.setFilial(filial);
        aplicar(configuracao, request);

        return toResponse(configuracaoFiscalRepository.save(configuracao));
    }

    @Transactional
    public ConfiguracaoFiscalResponse atualizar(UUID id, ConfiguracaoFiscalRequest request) {
        validar(request);
        ConfiguracaoFiscal configuracao = configuracaoFiscalRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Configuracao fiscal nao encontrada."));
        Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                .orElseThrow(() -> new BusinessException("Empresa fiscal nao encontrada."));
        Filial filial = buscarFilial(request.getFilialId(), empresa.getId());

        configuracao.setEmpresa(empresa);
        configuracao.setFilial(filial);
        aplicar(configuracao, request);

        return toResponse(configuracaoFiscalRepository.save(configuracao));
    }

    private void validar(ConfiguracaoFiscalRequest request) {
        if (request == null) {
            throw new BusinessException("Configuracao fiscal obrigatoria.");
        }
        if (request.getEmpresaId() == null) {
            throw new BusinessException("Empresa obrigatoria para configuracao fiscal.");
        }
        if (request.getModelo() == null) {
            throw new BusinessException("Modelo fiscal obrigatorio.");
        }
        if (request.getProximoNumero() != null && request.getProximoNumero() < 1) {
            throw new BusinessException("Proximo numero fiscal deve ser maior que zero.");
        }
    }

    private Filial buscarFilial(UUID filialId, UUID empresaId) {
        if (filialId == null) {
            return null;
        }

        Filial filial = filialRepository.findById(filialId)
                .orElseThrow(() -> new BusinessException("Filial fiscal nao encontrada."));
        if (filial.getEmpresa() == null || !empresaId.equals(filial.getEmpresa().getId())) {
            throw new BusinessException("Filial fiscal nao pertence a empresa informada.");
        }
        return filial;
    }

    private Optional<ConfiguracaoFiscal> buscarExistente(UUID empresaId, Filial filial, ConfiguracaoFiscalRequest request) {
        if (filial == null) {
            return configuracaoFiscalRepository.findFirstByEmpresaIdAndFilialIsNullAndModelo(empresaId, request.getModelo());
        }
        return configuracaoFiscalRepository.findFirstByEmpresaIdAndFilialIdAndModelo(empresaId, filial.getId(), request.getModelo());
    }

    private void aplicar(ConfiguracaoFiscal configuracao, ConfiguracaoFiscalRequest request) {
        configuracao.setModelo(request.getModelo());
        configuracao.setAmbiente(request.getAmbiente() == null ? AmbienteFiscal.HOMOLOGACAO : request.getAmbiente());
        configuracao.setAtivo(Boolean.TRUE.equals(request.getAtivo()));
        configuracao.setSerie(trim(request.getSerie()));
        configuracao.setProximoNumero(request.getProximoNumero());
        configuracao.setProvedor(trim(request.getProvedor()));
        configuracao.setCertificadoAlias(trim(request.getCertificadoAlias()));
        configuracao.setCertificadoSenhaEnv(trim(request.getCertificadoSenhaEnv()));
        configuracao.setCscId(trim(request.getCscId()));
        configuracao.setCscTokenEnv(trim(request.getCscTokenEnv()));
        configuracao.setEndpointHomologacao(trim(request.getEndpointHomologacao()));
        configuracao.setEndpointProducao(trim(request.getEndpointProducao()));
        configuracao.setObservacao(trim(request.getObservacao()));
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private ConfiguracaoFiscalResponse toResponse(ConfiguracaoFiscal configuracao) {
        return ConfiguracaoFiscalResponse.builder()
                .id(configuracao.getId())
                .empresaId(configuracao.getEmpresa() != null ? configuracao.getEmpresa().getId() : null)
                .empresaNome(configuracao.getEmpresa() != null ? configuracao.getEmpresa().getNome() : null)
                .filialId(configuracao.getFilial() != null ? configuracao.getFilial().getId() : null)
                .filialNome(configuracao.getFilial() != null ? configuracao.getFilial().getNome() : null)
                .modelo(configuracao.getModelo())
                .ambiente(configuracao.getAmbiente())
                .ativo(configuracao.getAtivo())
                .serie(configuracao.getSerie())
                .proximoNumero(configuracao.getProximoNumero())
                .provedor(configuracao.getProvedor())
                .certificadoAlias(configuracao.getCertificadoAlias())
                .certificadoSenhaEnv(configuracao.getCertificadoSenhaEnv())
                .cscId(configuracao.getCscId())
                .cscTokenEnv(configuracao.getCscTokenEnv())
                .endpointHomologacao(configuracao.getEndpointHomologacao())
                .endpointProducao(configuracao.getEndpointProducao())
                .observacao(configuracao.getObservacao())
                .atualizadoEm(configuracao.getAtualizadoEm())
                .build();
    }
}
