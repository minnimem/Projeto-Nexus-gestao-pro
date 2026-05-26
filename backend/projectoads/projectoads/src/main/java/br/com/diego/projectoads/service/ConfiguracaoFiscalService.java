package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import br.com.diego.projectoads.dto.ConfiguracaoFiscalRequest;
import br.com.diego.projectoads.dto.ConfiguracaoFiscalResponse;
import br.com.diego.projectoads.dto.ConfiguracaoFiscalStatusResponse;
import br.com.diego.projectoads.dto.StatusServicoFiscalResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Filial;
import br.com.diego.projectoads.repository.ConfiguracaoFiscalRepository;
import br.com.diego.projectoads.repository.EmpresaRepository;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.service.fiscal.FiscalServiceStatusChecker;
import br.com.diego.projectoads.service.fiscal.FiscalServiceStatusResult;
import br.com.diego.projectoads.service.fiscal.FiscalSecretResolver;
import br.com.diego.projectoads.service.fiscal.FiscalSecretStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class ConfiguracaoFiscalService {

    private final ConfiguracaoFiscalRepository configuracaoFiscalRepository;
    private final EmpresaRepository empresaRepository;
    private final FilialRepository filialRepository;
    private final FiscalSecretResolver fiscalSecretResolver;
    private final FiscalServiceStatusChecker fiscalServiceStatusChecker;

    public ConfiguracaoFiscalService(ConfiguracaoFiscalRepository configuracaoFiscalRepository,
                                     EmpresaRepository empresaRepository,
                                     FilialRepository filialRepository,
                                     FiscalSecretResolver fiscalSecretResolver,
                                     FiscalServiceStatusChecker fiscalServiceStatusChecker) {
        this.configuracaoFiscalRepository = configuracaoFiscalRepository;
        this.empresaRepository = empresaRepository;
        this.filialRepository = filialRepository;
        this.fiscalSecretResolver = fiscalSecretResolver;
        this.fiscalServiceStatusChecker = fiscalServiceStatusChecker;
    }

    @Transactional(readOnly = true)
    public List<ConfiguracaoFiscalResponse> listar() {
        return configuracaoFiscalRepository.findAllByOrderByEmpresaNomeAscFilialNomeAscModeloAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConfiguracaoFiscalStatusResponse status(UUID id) {
        ConfiguracaoFiscal configuracao = configuracaoFiscalRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Configuracao fiscal nao encontrada."));
        List<String> pendencias = pendencias(configuracao);
        boolean pronto = pendencias.isEmpty();

        return ConfiguracaoFiscalStatusResponse.builder()
                .id(configuracao.getId())
                .empresaId(configuracao.getEmpresa() != null ? configuracao.getEmpresa().getId() : null)
                .empresaNome(configuracao.getEmpresa() != null ? configuracao.getEmpresa().getNome() : null)
                .filialId(configuracao.getFilial() != null ? configuracao.getFilial().getId() : null)
                .filialNome(configuracao.getFilial() != null ? configuracao.getFilial().getNome() : null)
                .modelo(configuracao.getModelo())
                .ambiente(configuracao.getAmbiente())
                .ativo(configuracao.getAtivo())
                .prontoHomologacao(pronto)
                .status(pronto ? "PRONTO_HOMOLOGACAO" : "PENDENTE")
                .pendencias(pendencias)
                .build();
    }

    @Transactional(readOnly = true)
    public StatusServicoFiscalResponse statusServico(UUID id) {
        ConfiguracaoFiscal configuracao = configuracaoFiscalRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Configuracao fiscal nao encontrada."));
        List<String> pendencias = pendencias(configuracao);
        FiscalSecretStatus secretStatus = fiscalSecretResolver.validarSegredos(configuracao);
        pendencias.addAll(secretStatus.pendencias());
        String endpoint = endpointAmbiente(configuracao);
        FiscalServiceStatusResult statusServico = pendencias.isEmpty()
                ? fiscalServiceStatusChecker.consultar(configuracao)
                : new FiscalServiceStatusResult(false, "INDISPONIVEL_CONFIGURACAO", "Configuracao fiscal possui pendencias antes da consulta de servico.");

        return StatusServicoFiscalResponse.builder()
                .configuracaoFiscalId(configuracao.getId())
                .modelo(configuracao.getModelo())
                .ambiente(configuracao.getAmbiente())
                .endpoint(endpoint)
                .disponivel(statusServico.disponivel())
                .status(statusServico.status())
                .mensagem(statusServico.mensagem())
                .pendencias(pendencias)
                .consultadoEm(LocalDateTime.now())
                .build();
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
        configuracao.setProvedorTokenEnv(trim(request.getProvedorTokenEnv()));
        configuracao.setCertificadoAlias(trim(request.getCertificadoAlias()));
        configuracao.setCertificadoArquivoEnv(trim(request.getCertificadoArquivoEnv()));
        configuracao.setCertificadoSenhaEnv(trim(request.getCertificadoSenhaEnv()));
        configuracao.setCertificadoValidoAte(request.getCertificadoValidoAte());
        configuracao.setCscId(trim(request.getCscId()));
        configuracao.setCscTokenEnv(trim(request.getCscTokenEnv()));
        configuracao.setEndpointHomologacao(trim(request.getEndpointHomologacao()));
        configuracao.setEndpointProducao(trim(request.getEndpointProducao()));
        configuracao.setObservacao(trim(request.getObservacao()));
    }

    private List<String> pendencias(ConfiguracaoFiscal configuracao) {
        List<String> pendencias = new ArrayList<>();
        if (!Boolean.TRUE.equals(configuracao.getAtivo())) {
            pendencias.add("Ativar a configuracao fiscal.");
        }
        if (configuracao.getModelo() == null) {
            pendencias.add("Informar o modelo fiscal.");
        }
        if (isBlank(configuracao.getSerie())) {
            pendencias.add("Informar a serie autorizada.");
        }
        if (configuracao.getProximoNumero() == null || configuracao.getProximoNumero() < 1) {
            pendencias.add("Informar o proximo numero fiscal maior que zero.");
        }
        if (isBlank(configuracao.getCertificadoAlias())) {
            pendencias.add("Informar o alias do certificado digital.");
        }
        if (isBlank(configuracao.getCertificadoArquivoEnv())) {
            pendencias.add("Informar o nome da variavel do arquivo do certificado.");
        }
        if (isBlank(configuracao.getCertificadoSenhaEnv())) {
            pendencias.add("Informar o nome da variavel de senha do certificado.");
        }
        if (configuracao.getCertificadoValidoAte() == null) {
            pendencias.add("Informar a validade do certificado digital A1.");
        } else if (configuracao.getCertificadoValidoAte().isBefore(LocalDate.now())) {
            pendencias.add("Certificado digital A1 vencido.");
        } else if (!configuracao.getCertificadoValidoAte().isAfter(LocalDate.now().plusDays(30))) {
            pendencias.add("Certificado digital A1 vence em ate 30 dias.");
        }
        String endpoint = endpointAmbiente(configuracao);
        if (isBlank(endpoint)) {
            pendencias.add("Informar o endpoint do ambiente fiscal.");
        }
        if (configuracao.getModelo() == ModeloDocumentoFiscal.NFCE) {
            if (isBlank(configuracao.getCscId())) {
                pendencias.add("Informar o CSC id para NFC-e.");
            }
            if (isBlank(configuracao.getCscTokenEnv())) {
                pendencias.add("Informar o nome da variavel do token CSC para NFC-e.");
            }
        }
        return pendencias;
    }

    private String endpointAmbiente(ConfiguracaoFiscal configuracao) {
        return configuracao.getAmbiente() == AmbienteFiscal.PRODUCAO
                ? configuracao.getEndpointProducao()
                : configuracao.getEndpointHomologacao();
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
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
                .provedorTokenEnv(configuracao.getProvedorTokenEnv())
                .certificadoAlias(configuracao.getCertificadoAlias())
                .certificadoArquivoEnv(configuracao.getCertificadoArquivoEnv())
                .certificadoSenhaEnv(configuracao.getCertificadoSenhaEnv())
                .certificadoValidoAte(configuracao.getCertificadoValidoAte())
                .cscId(configuracao.getCscId())
                .cscTokenEnv(configuracao.getCscTokenEnv())
                .endpointHomologacao(configuracao.getEndpointHomologacao())
                .endpointProducao(configuracao.getEndpointProducao())
                .observacao(configuracao.getObservacao())
                .atualizadoEm(configuracao.getAtualizadoEm())
                .build();
    }
}
