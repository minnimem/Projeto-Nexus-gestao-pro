package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import br.com.diego.projectoads.config.Enum.StatusDocumentoFiscal;
import br.com.diego.projectoads.dto.ConfiguracaoFiscalStatusResponse;
import br.com.diego.projectoads.dto.DocumentoFiscalCartaCorrecaoRequest;
import br.com.diego.projectoads.dto.DocumentoFiscalConsultaResponse;
import br.com.diego.projectoads.dto.DocumentoFiscalEmissaoRealStatusResponse;
import br.com.diego.projectoads.dto.DocumentoFiscalHomologacaoRequest;
import br.com.diego.projectoads.dto.DocumentoFiscalPacoteEmissaoRealResponse;
import br.com.diego.projectoads.dto.DocumentoFiscalPacoteIntegridadeResponse;
import br.com.diego.projectoads.dto.DocumentoFiscalRetornoRequest;
import br.com.diego.projectoads.dto.DocumentoFiscalResponse;
import br.com.diego.projectoads.dto.DocumentoFiscalResumoResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import br.com.diego.projectoads.model.DocumentoFiscal;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.ItemPedido;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.model.Produto;
import br.com.diego.projectoads.repository.ConfiguracaoFiscalRepository;
import br.com.diego.projectoads.repository.DocumentoFiscalRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import br.com.diego.projectoads.service.fiscal.FiscalProvider;
import br.com.diego.projectoads.service.fiscal.FiscalTransmissionResult;
import br.com.diego.projectoads.service.fiscal.FiscalXmlSigner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DocumentoFiscalService {

    private final DocumentoFiscalRepository documentoFiscalRepository;
    private final ConfiguracaoFiscalRepository configuracaoFiscalRepository;
    private final PedidoRepository pedidoRepository;
    private final ConfiguracaoFiscalService configuracaoFiscalService;
    private final AuditoriaService auditoriaService;
    private final List<FiscalProvider> fiscalProviders;
    private final FiscalXmlSigner fiscalXmlSigner;

    public DocumentoFiscalService(DocumentoFiscalRepository documentoFiscalRepository,
                                   ConfiguracaoFiscalRepository configuracaoFiscalRepository,
                                   PedidoRepository pedidoRepository,
                                   ConfiguracaoFiscalService configuracaoFiscalService,
                                   AuditoriaService auditoriaService,
                                   List<FiscalProvider> fiscalProviders,
                                   FiscalXmlSigner fiscalXmlSigner) {
        this.documentoFiscalRepository = documentoFiscalRepository;
        this.configuracaoFiscalRepository = configuracaoFiscalRepository;
        this.pedidoRepository = pedidoRepository;
        this.configuracaoFiscalService = configuracaoFiscalService;
        this.auditoriaService = auditoriaService;
        this.fiscalProviders = fiscalProviders != null ? fiscalProviders : List.of();
        this.fiscalXmlSigner = fiscalXmlSigner;
    }

    @Transactional(readOnly = true)
    public List<DocumentoFiscalResponse> listarPorPedido(UUID pedidoId) {
        return documentoFiscalRepository.findByPedidoIdOrderByCriadoEmDesc(pedidoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentoFiscalResponse buscar(UUID id) {
        return toResponse(buscarDocumento(id));
    }

    @Transactional(readOnly = true)
    public DocumentoFiscalConsultaResponse consultarHomologacao(UUID id) {
        return toConsultaResponse(buscarDocumento(id));
    }

    @Transactional(readOnly = true)
    public String gerarDossieHomologacao(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        return montarDossieHomologacao(documento);
    }

    @Transactional(readOnly = true)
    public String gerarChecklistEmissaoReal(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        return montarChecklistEmissaoReal(documento);
    }

    @Transactional(readOnly = true)
    public DocumentoFiscalEmissaoRealStatusResponse statusEmissaoReal(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        ChecklistEmissaoReal checklist = checklistEmissaoReal(documento);
        List<String> pendenciasExternas = pendenciasExternasEmissaoReal(documento);
        return DocumentoFiscalEmissaoRealStatusResponse.builder()
                .id(documento.getId())
                .documento(valorOuPadrao(documento.getModelo() != null ? documento.getModelo().name() : null, "-")
                        + " " + valorOuPadrao(documento.getSerie(), "-") + "-" + (documento.getNumero() != null ? documento.getNumero() : "-"))
                .status(documento.getStatus())
                .prontoEmissaoReal(checklist.pendencias().isEmpty())
                .percentualProntidao(checklist.percentual())
                .itensProntos(checklist.prontos())
                .pendencias(checklist.pendencias())
                .pendenciasExternas(pendenciasExternas)
                .totalItensProntos(checklist.prontos().size())
                .totalPendencias(checklist.pendencias().size())
                .totalPendenciasExternas(pendenciasExternas.size())
                .proximaAcao(proximaAcaoEmissaoReal(checklist))
                .build();
    }

    @Transactional(readOnly = true)
    public DocumentoFiscalPacoteEmissaoRealResponse pacoteEmissaoReal(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        ChecklistEmissaoReal checklist = checklistEmissaoReal(documento);
        List<String> pendenciasExternas = pendenciasExternasEmissaoReal(documento);
        ConfiguracaoFiscal configuracao = documento.getConfiguracaoFiscal();
        String payloadHash = !isBlank(documento.getPayloadJson()) ? sha256(documento.getPayloadJson()) : null;
        String xmlHash = !isBlank(documento.getXmlEnvio()) ? sha256(documento.getXmlEnvio()) : null;
        return DocumentoFiscalPacoteEmissaoRealResponse.builder()
                .id(documento.getId())
                .pedidoId(documento.getPedido() != null ? documento.getPedido().getId() : null)
                .pedidoNumero(documento.getPedido() != null ? documento.getPedido().getNumero() : null)
                .modelo(documento.getModelo())
                .ambienteDocumento(documento.getAmbiente())
                .ambienteConfiguracao(configuracao != null ? configuracao.getAmbiente() : null)
                .status(documento.getStatus())
                .serie(documento.getSerie())
                .numero(documento.getNumero())
                .provedor(documento.getProvedor())
                .endpointProducao(configuracao != null ? configuracao.getEndpointProducao() : null)
                .provedorTokenEnv(configuracao != null ? configuracao.getProvedorTokenEnv() : null)
                .certificadoArquivoEnv(configuracao != null ? configuracao.getCertificadoArquivoEnv() : null)
                .certificadoSenhaEnv(configuracao != null ? configuracao.getCertificadoSenhaEnv() : null)
                .cscId(configuracao != null ? configuracao.getCscId() : null)
                .cscTokenEnv(configuracao != null ? configuracao.getCscTokenEnv() : null)
                .prontoEmissaoReal(checklist.pendencias().isEmpty())
                .percentualProntidao(checklist.percentual())
                .itensProntos(checklist.prontos())
                .pendencias(checklist.pendencias())
                .pendenciasExternas(pendenciasExternas)
                .totalItensProntos(checklist.prontos().size())
                .totalPendencias(checklist.pendencias().size())
                .totalPendenciasExternas(pendenciasExternas.size())
                .proximaAcao(proximaAcaoEmissaoReal(checklist))
                .payloadJson(documento.getPayloadJson())
                .payloadJsonSha256(payloadHash)
                .xmlEnvio(documento.getXmlEnvio())
                .xmlEnvioSha256(xmlHash)
                .pacoteReferencia(referenciaPacoteReal(documento, payloadHash, xmlHash))
                .observacao("Pacote operacional para homologacao com provedor/contador; nao transmite nem autoriza documento fiscal.")
                .geradoEm(LocalDateTime.now())
                .build();
    }

    @Transactional(readOnly = true)
    public String gerarManifestoPacoteEmissaoReal(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        ChecklistEmissaoReal checklist = checklistEmissaoReal(documento);
        String payloadHash = !isBlank(documento.getPayloadJson()) ? sha256(documento.getPayloadJson()) : null;
        String xmlHash = !isBlank(documento.getXmlEnvio()) ? sha256(documento.getXmlEnvio()) : null;
        List<String> linhas = new ArrayList<>();
        linhas.add("MANIFESTO DE INTEGRIDADE - PACOTE DE EMISSAO REAL");
        linhas.add("Documento: " + valorOuPadrao(documento.getModelo() != null ? documento.getModelo().name() : null, "-")
                + " " + valorOuPadrao(documento.getSerie(), "-") + "-" + (documento.getNumero() != null ? documento.getNumero() : "-"));
        linhas.add("Pedido: " + valorOuPadrao(documento.getPedido() != null ? documento.getPedido().getNumero() : null, "-"));
        linhas.add("Status: " + valorOuPadrao(documento.getStatus() != null ? documento.getStatus().name() : null, "-"));
        linhas.add("Prontidao real: " + checklist.percentual() + "%");
        linhas.add("Itens prontos: " + checklist.prontos().size());
        linhas.add("Pendencias: " + checklist.pendencias().size());
        linhas.add("Proxima acao: " + proximaAcaoEmissaoReal(checklist));
        linhas.add("Referencia pacote: " + referenciaPacoteReal(documento, payloadHash, xmlHash));
        linhas.add("Payload SHA-256: " + valorOuPadrao(payloadHash, "NAO_GERADO"));
        linhas.add("XML SHA-256: " + valorOuPadrao(xmlHash, "NAO_GERADO"));
        linhas.add("");
        linhas.add("PENDENCIAS");
        if (checklist.pendencias().isEmpty()) {
            linhas.add("- Nenhuma pendencia operacional identificada neste checklist.");
        } else {
            checklist.pendencias().forEach(item -> linhas.add("- " + item));
        }
        linhas.add("");
        linhas.add("Observacao: use este manifesto para conferir se o pacote JSON enviado ao provedor/contador corresponde ao payload e XML gerados pelo Nexus One.");
        linhas.add("Gerado em: " + LocalDateTime.now());
        return String.join("\n", linhas);
    }

    @Transactional(readOnly = true)
    public DocumentoFiscalPacoteIntegridadeResponse validarIntegridadePacoteEmissaoReal(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        String payloadHash = !isBlank(documento.getPayloadJson()) ? sha256(documento.getPayloadJson()) : null;
        String xmlHash = !isBlank(documento.getXmlEnvio()) ? sha256(documento.getXmlEnvio()) : null;
        List<String> pendencias = new ArrayList<>();
        if (payloadHash == null) {
            pendencias.add("Payload JSON fiscal ainda nao foi gerado.");
        }
        if (xmlHash == null) {
            pendencias.add("XML de envio fiscal ainda nao foi gerado.");
        }
        ChecklistEmissaoReal checklist = checklistEmissaoReal(documento);
        pendencias.addAll(checklist.pendencias());
        List<String> pendenciasUnicas = itensUnicos(pendencias);
        String referencia = referenciaPacoteReal(documento, payloadHash, xmlHash);
        return DocumentoFiscalPacoteIntegridadeResponse.builder()
                .id(documento.getId())
                .documento(valorOuPadrao(documento.getModelo() != null ? documento.getModelo().name() : null, "-")
                        + " " + valorOuPadrao(documento.getSerie(), "-") + "-" + (documento.getNumero() != null ? documento.getNumero() : "-"))
                .valido(pendencias.isEmpty())
                .pacoteReferencia(referencia)
                .payloadJsonSha256(payloadHash)
                .xmlEnvioSha256(xmlHash)
                .itensProntos(checklist.prontos())
                .pendencias(pendenciasUnicas)
                .totalItensProntos(checklist.prontos().size())
                .totalPendencias(pendenciasUnicas.size())
                .percentualProntidao(checklist.percentual())
                .proximaAcao(pendenciasUnicas.isEmpty()
                        ? "Pacote integro; validar regras tributarias, credenciamento e provedor real antes de producao."
                        : pendenciasUnicas.getFirst())
                .validadoEm(LocalDateTime.now())
                .build();
    }

    @Transactional(readOnly = true)
    public Map<UUID, List<DocumentoFiscalResumoResponse>> listarPorPedidos(Collection<UUID> pedidoIds) {
        Map<UUID, List<DocumentoFiscalResumoResponse>> documentosPorPedido = new LinkedHashMap<>();
        if (pedidoIds == null || pedidoIds.isEmpty()) {
            return documentosPorPedido;
        }

        documentoFiscalRepository.findByPedidoIdsOrderByPedidoAndCriadoEmDesc(pedidoIds)
                .stream()
                .map(this::toResumoResponse)
                .forEach(response -> documentosPorPedido
                        .computeIfAbsent(response.getPedidoId(), ignored -> new java.util.ArrayList<>())
                        .add(response));

        return documentosPorPedido;
    }

    @Transactional
    public DocumentoFiscalResponse prepararHomologacao(DocumentoFiscalHomologacaoRequest request) {
        validarRequest(request);
        ConfiguracaoFiscal configuracao = configuracaoFiscalRepository.findById(request.getConfiguracaoFiscalId())
                .orElseThrow(() -> new BusinessException("Configuracao fiscal nao encontrada."));
        UUID empresaConfiguracaoId = configuracao.getEmpresa() != null ? configuracao.getEmpresa().getId() : null;
        if (empresaConfiguracaoId == null) {
            throw new BusinessException("Configuracao fiscal sem empresa vinculada.");
        }
        Pedido pedido = pedidoRepository.findDetailedByIdAndEmpresaId(request.getPedidoId(), empresaConfiguracaoId)
                .orElseThrow(() -> new BusinessException("Pedido fiscal nao encontrado."));

        ModeloDocumentoFiscal modelo = request.getModelo() != null ? request.getModelo() : configuracao.getModelo();
        validarCompatibilidade(pedido, configuracao, modelo);
        validarProntidao(configuracao);

        AmbienteFiscal ambiente = configuracao.getAmbiente() != null ? configuracao.getAmbiente() : AmbienteFiscal.HOMOLOGACAO;
        if (!AmbienteFiscal.HOMOLOGACAO.equals(ambiente)) {
            throw new BusinessException("Fluxo de homologacao nao pode usar configuracao fiscal de producao.");
        }
        documentoFiscalRepository.findFirstByPedidoIdAndModeloAndAmbienteOrderByCriadoEmDesc(
                pedido.getId(),
                modelo,
                ambiente
        ).ifPresent(documento -> {
            throw new BusinessException("Pedido ja possui documento fiscal preparado para este modelo e ambiente.");
        });

        Long numero = configuracao.getProximoNumero();
        DocumentoFiscal documento = new DocumentoFiscal();
        documento.setPedido(pedido);
        documento.setConfiguracaoFiscal(configuracao);
        documento.setEmpresa(pedido.getEmpresa());
        documento.setFilial(pedido.getFilial());
        documento.setModelo(modelo);
        documento.setAmbiente(ambiente);
        documento.setStatus(StatusDocumentoFiscal.PREPARADO_HOMOLOGACAO);
        documento.setSerie(configuracao.getSerie());
        documento.setNumero(numero);
        documento.setProvedor(configuracao.getProvedor());
        List<String> pendencias = pendenciasFiscais(pedido, configuracao, modelo);
        documento.setPendenciasFiscais(formatarPendencias(pendencias));
        documento.setPayloadJson(montarPayloadJson(pedido, configuracao, modelo, numero, pendencias));
        documento.setObservacao(trim(request.getObservacao()));

        configuracao.setProximoNumero(numero + 1);
        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "PREPARAR_HOMOLOGACAO", "Documento fiscal preparado para homologacao", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse gerarXmlHomologacao(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        if (!StatusDocumentoFiscal.PREPARADO_HOMOLOGACAO.equals(documento.getStatus())) {
            throw new BusinessException("XML de homologacao so pode ser gerado para documento preparado.");
        }

        String xml = montarXmlHomologacao(documento);
        documento.setPendenciasFiscais(formatarPendencias(
                pendenciasFiscais(documento.getPedido(), documento.getConfiguracaoFiscal(), documento.getModelo())
        ));
        documento.setXmlEnvio(fiscalXmlSigner.assinarHomologacao(documento, documento.getConfiguracaoFiscal(), xml));
        documento.setStatus(StatusDocumentoFiscal.EM_PROCESSAMENTO);
        documento.setMensagemRetorno("XML de homologacao gerado e aguardando transmissao externa.");

        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "GERAR_XML_HOMOLOGACAO", "XML fiscal de homologacao gerado", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse validarXmlHomologacao(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        if (!StatusDocumentoFiscal.EM_PROCESSAMENTO.equals(documento.getStatus())) {
            throw new BusinessException("XML de homologacao so pode ser validado quando o documento esta em processamento.");
        }
        validarEstruturaXmlHomologacao(documento);

        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setMensagemRetorno("XML de homologacao validado internamente e aguardando transmissao externa.");
        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "VALIDAR_XML_HOMOLOGACAO", "XML fiscal de homologacao validado", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse revalidarPendenciasHomologacao(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        if (!StatusDocumentoFiscal.EM_PROCESSAMENTO.equals(documento.getStatus())
                && !StatusDocumentoFiscal.XML_VALIDADO.equals(documento.getStatus())) {
            throw new BusinessException("Revalidacao fiscal exige documento com XML gerado ou validado.");
        }

        List<String> pendencias = pendenciasFiscais(documento.getPedido(), documento.getConfiguracaoFiscal(), documento.getModelo());
        documento.setPendenciasFiscais(formatarPendencias(pendencias));
        documento.setPayloadJson(montarPayloadJson(
                documento.getPedido(),
                documento.getConfiguracaoFiscal(),
                documento.getModelo(),
                documento.getNumero(),
                pendencias
        ));
        String xml = montarXmlHomologacao(documento);
        documento.setXmlEnvio(fiscalXmlSigner.assinarHomologacao(documento, documento.getConfiguracaoFiscal(), xml));
        documento.setStatus(StatusDocumentoFiscal.EM_PROCESSAMENTO);
        documento.setMensagemRetorno(pendencias.isEmpty()
                ? "Pendencias fiscais revalidadas; XML aguardando validacao interna."
                : "Pendencias fiscais atualizadas; corrija o cadastro antes da transmissao.");

        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "REVALIDAR_PENDENCIAS_HOMOLOGACAO", "Pendencias fiscais revalidadas", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse reprocessarRejeicaoHomologacao(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        if (!StatusDocumentoFiscal.REJEITADO.equals(documento.getStatus())) {
            throw new BusinessException("Reprocessamento fiscal exige documento rejeitado.");
        }

        List<String> pendencias = pendenciasFiscais(documento.getPedido(), documento.getConfiguracaoFiscal(), documento.getModelo());
        documento.setPendenciasFiscais(formatarPendencias(pendencias));
        documento.setPayloadJson(montarPayloadJson(
                documento.getPedido(),
                documento.getConfiguracaoFiscal(),
                documento.getModelo(),
                documento.getNumero(),
                pendencias
        ));
        documento.setStatus(StatusDocumentoFiscal.EM_PROCESSAMENTO);
        String xml = montarXmlHomologacao(documento);
        documento.setXmlEnvio(fiscalXmlSigner.assinarHomologacao(documento, documento.getConfiguracaoFiscal(), xml));
        documento.setChaveAcesso(null);
        documento.setProtocolo(null);
        documento.setXmlRetorno(null);
        documento.setDanfeHtml(null);
        documento.setMensagemRetorno(pendencias.isEmpty()
                ? "Documento rejeitado reprocessado; XML aguardando validacao interna."
                : "Documento rejeitado reprocessado com pendencias; corrija o cadastro antes da transmissao.");

        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "REPROCESSAR_REJEICAO_HOMOLOGACAO", "Documento fiscal rejeitado reprocessado", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse transmitirHomologacao(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        if (!StatusDocumentoFiscal.XML_VALIDADO.equals(documento.getStatus())) {
            throw new BusinessException("Transmissao de homologacao exige XML validado internamente.");
        }
        validarEstruturaXmlHomologacao(documento);
        garantirSemPendenciasFiscais(documento);

        FiscalProvider provider = fiscalProviders.stream()
                .filter(item -> item.supports(documento.getConfiguracaoFiscal()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Nenhum provedor fiscal disponivel para esta configuracao."));

        FiscalTransmissionResult result = provider.transmitirHomologacao(documento);
        documento.setStatus(result.autorizado() ? StatusDocumentoFiscal.AUTORIZADO : StatusDocumentoFiscal.REJEITADO);
        documento.setChaveAcesso(result.chaveAcesso());
        documento.setProtocolo(result.protocolo());
        documento.setMensagemRetorno(result.mensagem());
        documento.setXmlRetorno(valorOuPadrao(result.xmlRetorno(), montarXmlRetornoHomologacao(documento, result.mensagem())));
        if (!isBlank(result.danfeHtml())) {
            documento.setDanfeHtml(result.danfeHtml());
        }

        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar(
                "Fiscal",
                result.autorizado() ? "TRANSMITIR_HOMOLOGACAO_AUTORIZADA" : "TRANSMITIR_HOMOLOGACAO_REJEITADA",
                result.mensagem(),
                salvo.getId()
        );
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse contingenciaHomologacao(UUID id, DocumentoFiscalRetornoRequest request) {
        DocumentoFiscal documento = buscarDocumento(id);
        if (!StatusDocumentoFiscal.XML_VALIDADO.equals(documento.getStatus())) {
            throw new BusinessException("Contingencia de homologacao exige XML validado internamente.");
        }
        validarEstruturaXmlHomologacao(documento);

        String mensagem = valorOuPadrao(
                request != null ? request.getMensagemRetorno() : null,
                "Documento registrado em contingencia de homologacao por indisponibilidade do provedor fiscal."
        );
        documento.setStatus(StatusDocumentoFiscal.CONTINGENCIA);
        documento.setMensagemRetorno(mensagem);
        documento.setXmlRetorno(valorOuPadrao(request != null ? request.getXmlRetorno() : null, montarXmlRetornoHomologacao(documento, mensagem)));
        documento.setObservacao(valorOuPadrao(request != null ? request.getObservacao() : null, documento.getObservacao()));

        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "CONTINGENCIA_HOMOLOGACAO", mensagem, salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse regularizarContingenciaHomologacao(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        if (!StatusDocumentoFiscal.CONTINGENCIA.equals(documento.getStatus())) {
            throw new BusinessException("Regularizacao de contingencia exige documento em contingencia.");
        }
        validarEstruturaXmlHomologacao(documento);
        garantirSemPendenciasFiscais(documento);

        FiscalTransmissionResult result = fiscalProviders.stream()
                .filter(item -> item.supports(documento.getConfiguracaoFiscal()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Nenhum provedor fiscal disponivel para regularizar contingencia."))
                .transmitirHomologacao(documento);

        documento.setStatus(result.autorizado() ? StatusDocumentoFiscal.AUTORIZADO : StatusDocumentoFiscal.REJEITADO);
        documento.setChaveAcesso(result.chaveAcesso());
        documento.setProtocolo(result.protocolo());
        documento.setMensagemRetorno(result.mensagem());
        documento.setXmlRetorno(valorOuPadrao(result.xmlRetorno(), montarXmlRetornoHomologacao(documento, result.mensagem())));
        if (!isBlank(result.danfeHtml())) {
            documento.setDanfeHtml(result.danfeHtml());
        }
        documento.setObservacao(valorOuPadrao(documento.getObservacao(), "Contingencia regularizada em homologacao."));

        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "REGULARIZAR_CONTINGENCIA_HOMOLOGACAO", result.mensagem(), salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse gerarDanfeHomologacao(UUID id) {
        DocumentoFiscal documento = buscarDocumento(id);
        if (!StatusDocumentoFiscal.AUTORIZADO.equals(documento.getStatus())
                && !StatusDocumentoFiscal.CONTINGENCIA.equals(documento.getStatus())) {
            throw new BusinessException("DANFE de homologacao so pode ser gerado para documento autorizado ou em contingencia.");
        }
        if (StatusDocumentoFiscal.AUTORIZADO.equals(documento.getStatus())
                && (isBlank(documento.getChaveAcesso()) || isBlank(documento.getProtocolo()))) {
            throw new BusinessException("Documento fiscal autorizado sem chave ou protocolo para gerar DANFE.");
        }

        documento.setDanfeHtml(montarDanfeHomologacao(documento));
        documento.setMensagemRetorno("Documento auxiliar de homologacao gerado para conferencia.");

        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "GERAR_DANFE_HOMOLOGACAO", "Documento auxiliar fiscal de homologacao gerado", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse emitirCartaCorrecaoHomologacao(UUID id, DocumentoFiscalCartaCorrecaoRequest request) {
        DocumentoFiscal documento = buscarDocumento(id);
        if (!StatusDocumentoFiscal.AUTORIZADO.equals(documento.getStatus())) {
            throw new BusinessException("Carta de correcao exige documento fiscal autorizado.");
        }
        if (!ModeloDocumentoFiscal.NFE.equals(documento.getModelo())) {
            throw new BusinessException("Carta de correcao controlada esta disponivel para NF-e.");
        }
        if (isBlank(documento.getChaveAcesso()) || isBlank(documento.getProtocolo())) {
            throw new BusinessException("Carta de correcao exige chave e protocolo da autorizacao.");
        }
        String texto = trim(request != null ? request.getTextoCorrecao() : null);
        if (texto == null || texto.length() < 15) {
            throw new BusinessException("Informe a correcao fiscal com pelo menos 15 caracteres.");
        }
        if (texto.length() > 1000) {
            throw new BusinessException("Carta de correcao deve ter no maximo 1000 caracteres.");
        }

        int sequencia = documento.getCartaCorrecaoSequencia() == null ? 1 : documento.getCartaCorrecaoSequencia() + 1;
        documento.setCartaCorrecaoSequencia(sequencia);
        documento.setCartaCorrecaoTexto(texto);
        documento.setCartaCorrecaoXml(montarCartaCorrecaoHomologacao(documento, texto, sequencia));
        documento.setMensagemRetorno("Carta de correcao de homologacao registrada para conferencia.");

        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "CARTA_CORRECAO_HOMOLOGACAO", "Carta de correcao fiscal registrada em homologacao", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse autorizarHomologacao(UUID id, DocumentoFiscalRetornoRequest request) {
        DocumentoFiscal documento = buscarDocumento(id);
        validarPodeReceberRetorno(documento);

        documento.setStatus(StatusDocumentoFiscal.AUTORIZADO);
        documento.setChaveAcesso(valorOuPadrao(request != null ? request.getChaveAcesso() : null, gerarChaveHomologacao(documento)));
        documento.setProtocolo(valorOuPadrao(request != null ? request.getProtocolo() : null, "HOMOLOG-" + documento.getNumero()));
        String mensagem = valorOuPadrao(request != null ? request.getMensagemRetorno() : null, "Documento autorizado em homologacao interna.");
        documento.setMensagemRetorno(mensagem);
        documento.setXmlRetorno(valorOuPadrao(request != null ? request.getXmlRetorno() : null, montarXmlRetornoHomologacao(documento, mensagem)));

        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "AUTORIZAR_HOMOLOGACAO", "Documento fiscal autorizado em homologacao", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse rejeitarHomologacao(UUID id, DocumentoFiscalRetornoRequest request) {
        DocumentoFiscal documento = buscarDocumento(id);
        validarPodeReceberRetorno(documento);

        documento.setStatus(StatusDocumentoFiscal.REJEITADO);
        String mensagem = valorOuPadrao(request != null ? request.getMensagemRetorno() : null, "Documento rejeitado em homologacao interna.");
        documento.setMensagemRetorno(mensagem);
        documento.setXmlRetorno(valorOuPadrao(request != null ? request.getXmlRetorno() : null, montarXmlRetornoHomologacao(documento, mensagem)));

        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "REJEITAR_HOMOLOGACAO", "Documento fiscal rejeitado em homologacao", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse cancelarHomologacao(UUID id, DocumentoFiscalRetornoRequest request) {
        DocumentoFiscal documento = buscarDocumento(id);
        if (!StatusDocumentoFiscal.AUTORIZADO.equals(documento.getStatus())) {
            throw new BusinessException("Somente documento fiscal autorizado pode ser cancelado.");
        }

        documento.setStatus(StatusDocumentoFiscal.CANCELADO);
        String mensagem = valorOuPadrao(request != null ? request.getMensagemRetorno() : null, "Documento cancelado em homologacao interna.");
        documento.setMensagemRetorno(mensagem);
        documento.setXmlRetorno(valorOuPadrao(request != null ? request.getXmlRetorno() : null, montarXmlRetornoHomologacao(documento, mensagem)));

        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "CANCELAR_HOMOLOGACAO", "Documento fiscal cancelado em homologacao", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public DocumentoFiscalResponse inutilizarHomologacao(UUID id, DocumentoFiscalRetornoRequest request) {
        DocumentoFiscal documento = buscarDocumento(id);
        if (!StatusDocumentoFiscal.REJEITADO.equals(documento.getStatus())) {
            throw new BusinessException("Somente documento fiscal rejeitado pode ter numeracao inutilizada em homologacao.");
        }

        documento.setStatus(StatusDocumentoFiscal.INUTILIZADO);
        String mensagem = valorOuPadrao(request != null ? request.getMensagemRetorno() : null, "Numeracao inutilizada em homologacao interna.");
        documento.setMensagemRetorno(mensagem);
        documento.setXmlRetorno(valorOuPadrao(request != null ? request.getXmlRetorno() : null, montarXmlRetornoHomologacao(documento, mensagem)));

        DocumentoFiscal salvo = documentoFiscalRepository.save(documento);
        auditoriaService.registrar("Fiscal", "INUTILIZAR_HOMOLOGACAO", "Numeracao fiscal inutilizada em homologacao", salvo.getId());
        return toResponse(salvo);
    }

    private void validarRequest(DocumentoFiscalHomologacaoRequest request) {
        if (request == null) {
            throw new BusinessException("Solicitacao fiscal obrigatoria.");
        }
        if (request.getPedidoId() == null) {
            throw new BusinessException("Pedido obrigatorio para documento fiscal.");
        }
        if (request.getConfiguracaoFiscalId() == null) {
            throw new BusinessException("Configuracao fiscal obrigatoria para documento fiscal.");
        }
    }

    private DocumentoFiscal buscarDocumento(UUID id) {
        if (id == null) {
            throw new BusinessException("Documento fiscal obrigatorio.");
        }
        return documentoFiscalRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Documento fiscal nao encontrado."));
    }

    private void validarPodeReceberRetorno(DocumentoFiscal documento) {
        if (!StatusDocumentoFiscal.XML_VALIDADO.equals(documento.getStatus())) {
            throw new BusinessException("Retorno manual de homologacao exige XML validado internamente.");
        }
        garantirSemPendenciasFiscais(documento);
    }

    private void garantirSemPendenciasFiscais(DocumentoFiscal documento) {
        if (!isBlank(documento.getPendenciasFiscais())) {
            throw new BusinessException("Documento fiscal possui pendencias cadastrais antes da transmissao: " + documento.getPendenciasFiscais());
        }
    }

    private void validarCompatibilidade(Pedido pedido, ConfiguracaoFiscal configuracao, ModeloDocumentoFiscal modelo) {
        if (modelo == null) {
            throw new BusinessException("Modelo fiscal obrigatorio para documento fiscal.");
        }
        UUID pedidoEmpresaId = pedido.getEmpresa() != null ? pedido.getEmpresa().getId() : null;
        UUID configuracaoEmpresaId = configuracao.getEmpresa() != null ? configuracao.getEmpresa().getId() : null;
        if (pedidoEmpresaId == null || !pedidoEmpresaId.equals(configuracaoEmpresaId)) {
            throw new BusinessException("Configuracao fiscal nao pertence a empresa do pedido.");
        }
        UUID pedidoFilialId = pedido.getFilial() != null ? pedido.getFilial().getId() : null;
        UUID configuracaoFilialId = configuracao.getFilial() != null ? configuracao.getFilial().getId() : null;
        if (configuracaoFilialId != null && !configuracaoFilialId.equals(pedidoFilialId)) {
            throw new BusinessException("Configuracao fiscal nao pertence a filial do pedido.");
        }
        if (!modelo.equals(configuracao.getModelo())) {
            throw new BusinessException("Modelo solicitado difere da configuracao fiscal.");
        }
        if (pedido.getItens() == null || pedido.getItens().isEmpty()) {
            throw new BusinessException("Pedido sem itens nao pode preparar documento fiscal.");
        }
    }

    private void validarProntidao(ConfiguracaoFiscal configuracao) {
        ConfiguracaoFiscalStatusResponse status = configuracaoFiscalService.status(configuracao.getId());
        if (!Boolean.TRUE.equals(status.getProntoHomologacao())) {
            throw new BusinessException("Configuracao fiscal pendente: " + String.join(" ", status.getPendencias()));
        }
    }

    private String montarPayloadJson(Pedido pedido, ConfiguracaoFiscal configuracao, ModeloDocumentoFiscal modelo, Long numero) {
        return montarPayloadJson(pedido, configuracao, modelo, numero, pendenciasFiscais(pedido, configuracao, modelo));
    }

    private String montarPayloadJson(Pedido pedido,
                                     ConfiguracaoFiscal configuracao,
                                     ModeloDocumentoFiscal modelo,
                                     Long numero,
                                     List<String> pendenciasFiscais) {
        String itens = pedido.getItens().stream()
                .map(this::itemJson)
                .reduce((left, right) -> left + "," + right)
                .orElse("");
        String pendencias = pendenciasFiscais.stream()
                .map(pendencia -> "\"" + escape(pendencia) + "\"")
                .reduce((left, right) -> left + "," + right)
                .orElse("");
        return "{"
                + "\"modelo\":\"" + modelo + "\","
                + "\"ambiente\":\"" + configuracao.getAmbiente() + "\","
                + "\"serie\":\"" + escape(configuracao.getSerie()) + "\","
                + "\"numero\":" + numero + ","
                + "\"pedido\":\"" + escape(pedido.getNumero()) + "\","
                + "\"emitente\":" + emitenteJson(pedido.getEmpresa()) + ","
                + "\"destinatario\":" + destinatarioJson(pedido.getCliente()) + ","
                + "\"valorTotal\":\"" + pedido.getValorTotalPedido() + "\","
                + "\"itens\":[" + itens + "],"
                + "\"pendenciasFiscais\":[" + pendencias + "]"
                + "}";
    }

    private String montarXmlHomologacao(DocumentoFiscal documento) {
        Pedido pedido = documento.getPedido();
        String root = switch (documento.getModelo()) {
            case NFCE -> "NFCeHomologacao";
            case NFSE -> "NFSeHomologacao";
            default -> "NFeHomologacao";
        };
        String itens = pedido != null && pedido.getItens() != null
                ? pedido.getItens().stream()
                        .map(this::itemXml)
                        .reduce((left, right) -> left + right)
                        .orElse("")
                : "";

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<" + root + ">"
                + "<Modelo>" + escapeXml(documento.getModelo() != null ? documento.getModelo().name() : "") + "</Modelo>"
                + "<Ambiente>" + escapeXml(documento.getAmbiente() != null ? documento.getAmbiente().name() : "") + "</Ambiente>"
                + "<Serie>" + escapeXml(documento.getSerie()) + "</Serie>"
                + "<Numero>" + (documento.getNumero() != null ? documento.getNumero() : "") + "</Numero>"
                + "<Pedido>" + escapeXml(pedido != null ? pedido.getNumero() : "") + "</Pedido>"
                + emitenteXml(documento.getEmpresa())
                + destinatarioXml(pedido != null ? pedido.getCliente() : null)
                + "<ValorTotal>" + escapeXml(pedido != null && pedido.getValorTotalPedido() != null ? pedido.getValorTotalPedido().toPlainString() : "0") + "</ValorTotal>"
                + "<Itens>" + itens + "</Itens>"
                + pendenciasFiscaisXml(pedido, documento.getConfiguracaoFiscal(), documento.getModelo())
                + camposModelo(documento)
                + "</" + root + ">";
    }

    private String itemJson(ItemPedido item) {
        Produto produto = item.getProduto();
        return "{"
                + "\"produto\":\"" + escape(produto != null ? produto.getNomeProduto() : null) + "\","
                + "\"descricao\":\"" + escape(produto != null ? produto.getDescricao() : null) + "\","
                + "\"sku\":\"" + escape(produto != null ? produto.getSku() : null) + "\","
                + "\"codigoBarras\":\"" + escape(produto != null ? produto.getCodBarras() : null) + "\","
                + "\"ncm\":\"" + escape(valorOuPadrao(produto != null ? produto.getNcm() : null, "PENDENTE")) + "\","
                + "\"cfop\":\"" + escape(valorOuPadrao(produto != null ? produto.getCfop() : null, "PENDENTE")) + "\","
                + "\"cest\":\"" + escape(produto != null ? produto.getCest() : null) + "\","
                + "\"origemFiscal\":\"" + escape(produto != null ? produto.getOrigemFiscal() : null) + "\","
                + "\"unidadeComercial\":\"" + escape(valorOuPadrao(produto != null ? produto.getUnidadeComercial() : null, "UN")) + "\","
                + "\"cstIcms\":\"" + escape(produto != null ? produto.getCstIcms() : null) + "\","
                + "\"csosn\":\"" + escape(produto != null ? produto.getCsosn() : null) + "\","
                + "\"aliquotaIcms\":\"" + escape(decimalOuVazio(produto != null ? produto.getAliquotaIcms() : null)) + "\","
                + "\"aliquotaPis\":\"" + escape(decimalOuVazio(produto != null ? produto.getAliquotaPis() : null)) + "\","
                + "\"aliquotaCofins\":\"" + escape(decimalOuVazio(produto != null ? produto.getAliquotaCofins() : null)) + "\","
                + "\"aliquotaIpi\":\"" + escape(decimalOuVazio(produto != null ? produto.getAliquotaIpi() : null)) + "\","
                + "\"codigoServicoMunicipal\":\"" + escape(produto != null ? produto.getCodigoServicoMunicipal() : null) + "\","
                + "\"codigoServicoNacional\":\"" + escape(produto != null ? produto.getCodigoServicoNacional() : null) + "\","
                + "\"aliquotaIss\":\"" + escape(decimalOuVazio(produto != null ? produto.getAliquotaIss() : null)) + "\","
                + "\"quantidade\":" + item.getQuantidade() + ","
                + "\"precoUnit\":\"" + item.getPrecoUnit() + "\","
                + "\"total\":\"" + totalItem(item) + "\""
                + "}";
    }

    private String itemXml(ItemPedido item) {
        Produto produto = item.getProduto();
        return "<Item>"
                + "<Produto>" + escapeXml(produto != null ? produto.getNomeProduto() : "") + "</Produto>"
                + "<Descricao>" + escapeXml(produto != null ? produto.getDescricao() : "") + "</Descricao>"
                + "<Sku>" + escapeXml(produto != null ? produto.getSku() : "") + "</Sku>"
                + "<CodigoBarras>" + escapeXml(produto != null ? produto.getCodBarras() : "") + "</CodigoBarras>"
                + "<Ncm>" + escapeXml(valorOuPadrao(produto != null ? produto.getNcm() : null, "PENDENTE")) + "</Ncm>"
                + "<Cfop>" + escapeXml(valorOuPadrao(produto != null ? produto.getCfop() : null, "PENDENTE")) + "</Cfop>"
                + "<Cest>" + escapeXml(produto != null ? produto.getCest() : "") + "</Cest>"
                + "<OrigemFiscal>" + escapeXml(produto != null ? produto.getOrigemFiscal() : "") + "</OrigemFiscal>"
                + "<UnidadeComercial>" + escapeXml(valorOuPadrao(produto != null ? produto.getUnidadeComercial() : null, "UN")) + "</UnidadeComercial>"
                + "<Tributacao>"
                + "<CstIcms>" + escapeXml(produto != null ? produto.getCstIcms() : "") + "</CstIcms>"
                + "<Csosn>" + escapeXml(produto != null ? produto.getCsosn() : "") + "</Csosn>"
                + "<AliquotaIcms>" + escapeXml(decimalOuVazio(produto != null ? produto.getAliquotaIcms() : null)) + "</AliquotaIcms>"
                + "<AliquotaPis>" + escapeXml(decimalOuVazio(produto != null ? produto.getAliquotaPis() : null)) + "</AliquotaPis>"
                + "<AliquotaCofins>" + escapeXml(decimalOuVazio(produto != null ? produto.getAliquotaCofins() : null)) + "</AliquotaCofins>"
                + "<AliquotaIpi>" + escapeXml(decimalOuVazio(produto != null ? produto.getAliquotaIpi() : null)) + "</AliquotaIpi>"
                + "<CodigoServicoMunicipal>" + escapeXml(produto != null ? produto.getCodigoServicoMunicipal() : "") + "</CodigoServicoMunicipal>"
                + "<CodigoServicoNacional>" + escapeXml(produto != null ? produto.getCodigoServicoNacional() : "") + "</CodigoServicoNacional>"
                + "<AliquotaIss>" + escapeXml(decimalOuVazio(produto != null ? produto.getAliquotaIss() : null)) + "</AliquotaIss>"
                + "</Tributacao>"
                + "<Quantidade>" + (item.getQuantidade() != null ? item.getQuantidade() : 0) + "</Quantidade>"
                + "<PrecoUnit>" + escapeXml(item.getPrecoUnit() != null ? item.getPrecoUnit().toPlainString() : "0") + "</PrecoUnit>"
                + "<Total>" + escapeXml(totalItem(item)) + "</Total>"
                + "</Item>";
    }

    private String emitenteJson(Empresa empresa) {
        return "{"
                + "\"nome\":\"" + escape(empresa != null ? empresa.getNome() : null) + "\","
                + "\"razaoSocial\":\"" + escape(empresa != null ? empresa.getRazaoSocial() : null) + "\","
                + "\"cnpj\":\"" + escape(empresa != null ? empresa.getCnpj() : null) + "\","
                + "\"inscricaoEstadual\":\"" + escape(empresa != null ? empresa.getInscricaoEstadual() : null) + "\","
                + "\"inscricaoMunicipal\":\"" + escape(empresa != null ? empresa.getInscricaoMunicipal() : null) + "\","
                + "\"regimeTributario\":\"" + escape(empresa != null ? empresa.getRegimeTributario() : null) + "\","
                + "\"crt\":\"" + escape(empresa != null ? empresa.getCrt() : null) + "\","
                + "\"telefone\":\"" + escape(empresa != null ? empresa.getTelefone() : null) + "\","
                + "\"email\":\"" + escape(empresa != null ? empresa.getEmail() : null) + "\","
                + "\"endereco\":\"" + escape(empresa != null ? empresa.getEndereco() : null) + "\","
                + "\"cidade\":\"" + escape(empresa != null ? empresa.getCidade() : null) + "\","
                + "\"uf\":\"" + escape(empresa != null ? empresa.getUf() : null) + "\","
                + "\"cep\":\"" + escape(empresa != null ? empresa.getCep() : null) + "\","
                + "\"codigoMunicipio\":\"" + escape(empresa != null ? empresa.getCodigoMunicipio() : null) + "\""
                + "}";
    }

    private String destinatarioJson(Cliente cliente) {
        return "{"
                + "\"nome\":\"" + escape(cliente != null ? cliente.getNome() : null) + "\","
                + "\"cpf\":\"" + escape(cliente != null ? cliente.getCpf() : null) + "\","
                + "\"email\":\"" + escape(cliente != null ? cliente.getEmail() : null) + "\","
                + "\"telefone\":\"" + escape(cliente != null ? cliente.getTelefone() : null) + "\","
                + "\"endereco\":\"" + escape(cliente != null ? cliente.getEndereco() : null) + "\","
                + "\"numero\":\"" + escape(cliente != null ? cliente.getNumero() : null) + "\","
                + "\"bairro\":\"" + escape(cliente != null ? cliente.getBairro() : null) + "\","
                + "\"cidade\":\"" + escape(cliente != null ? cliente.getCidade() : null) + "\","
                + "\"uf\":\"" + escape(cliente != null ? cliente.getUf() : null) + "\","
                + "\"cep\":\"" + escape(cliente != null ? cliente.getCep() : null) + "\","
                + "\"codigoMunicipio\":\"" + escape(cliente != null ? cliente.getCodigoMunicipio() : null) + "\","
                + "\"inscricaoEstadual\":\"" + escape(cliente != null ? cliente.getInscricaoEstadual() : null) + "\""
                + "}";
    }

    private String emitenteXml(Empresa empresa) {
        return "<Emitente>"
                + "<Nome>" + escapeXml(empresa != null ? empresa.getNome() : "") + "</Nome>"
                + "<RazaoSocial>" + escapeXml(empresa != null ? empresa.getRazaoSocial() : "") + "</RazaoSocial>"
                + "<Cnpj>" + escapeXml(empresa != null ? empresa.getCnpj() : "") + "</Cnpj>"
                + "<InscricaoEstadual>" + escapeXml(empresa != null ? empresa.getInscricaoEstadual() : "") + "</InscricaoEstadual>"
                + "<InscricaoMunicipal>" + escapeXml(empresa != null ? empresa.getInscricaoMunicipal() : "") + "</InscricaoMunicipal>"
                + "<RegimeTributario>" + escapeXml(empresa != null ? empresa.getRegimeTributario() : "") + "</RegimeTributario>"
                + "<Crt>" + escapeXml(empresa != null ? empresa.getCrt() : "") + "</Crt>"
                + "<Telefone>" + escapeXml(empresa != null ? empresa.getTelefone() : "") + "</Telefone>"
                + "<Email>" + escapeXml(empresa != null ? empresa.getEmail() : "") + "</Email>"
                + "<Endereco>" + escapeXml(empresa != null ? empresa.getEndereco() : "") + "</Endereco>"
                + "<Cidade>" + escapeXml(empresa != null ? empresa.getCidade() : "") + "</Cidade>"
                + "<Uf>" + escapeXml(empresa != null ? empresa.getUf() : "") + "</Uf>"
                + "<Cep>" + escapeXml(empresa != null ? empresa.getCep() : "") + "</Cep>"
                + "<CodigoMunicipio>" + escapeXml(empresa != null ? empresa.getCodigoMunicipio() : "") + "</CodigoMunicipio>"
                + "</Emitente>";
    }

    private String destinatarioXml(Cliente cliente) {
        return "<Destinatario>"
                + "<Nome>" + escapeXml(cliente != null ? cliente.getNome() : "") + "</Nome>"
                + "<Cpf>" + escapeXml(cliente != null ? cliente.getCpf() : "") + "</Cpf>"
                + "<Email>" + escapeXml(cliente != null ? cliente.getEmail() : "") + "</Email>"
                + "<Telefone>" + escapeXml(cliente != null ? cliente.getTelefone() : "") + "</Telefone>"
                + "<Endereco>" + escapeXml(cliente != null ? cliente.getEndereco() : "") + "</Endereco>"
                + "<Numero>" + escapeXml(cliente != null ? cliente.getNumero() : "") + "</Numero>"
                + "<Bairro>" + escapeXml(cliente != null ? cliente.getBairro() : "") + "</Bairro>"
                + "<Cidade>" + escapeXml(cliente != null ? cliente.getCidade() : "") + "</Cidade>"
                + "<Uf>" + escapeXml(cliente != null ? cliente.getUf() : "") + "</Uf>"
                + "<Cep>" + escapeXml(cliente != null ? cliente.getCep() : "") + "</Cep>"
                + "<CodigoMunicipio>" + escapeXml(cliente != null ? cliente.getCodigoMunicipio() : "") + "</CodigoMunicipio>"
                + "<InscricaoEstadual>" + escapeXml(cliente != null ? cliente.getInscricaoEstadual() : "") + "</InscricaoEstadual>"
                + "</Destinatario>";
    }

    private String pendenciasFiscaisXml(Pedido pedido, ConfiguracaoFiscal configuracao, ModeloDocumentoFiscal modelo) {
        String pendencias = pendenciasFiscais(pedido, configuracao, modelo).stream()
                .map(pendencia -> "<Pendencia>" + escapeXml(pendencia) + "</Pendencia>")
                .reduce((left, right) -> left + right)
                .orElse("");
        return "<PendenciasFiscais>" + pendencias + "</PendenciasFiscais>";
    }

    private List<String> pendenciasFiscais(Pedido pedido, ConfiguracaoFiscal configuracao, ModeloDocumentoFiscal modelo) {
        List<String> pendencias = new java.util.ArrayList<>();
        Empresa empresa = pedido != null ? pedido.getEmpresa() : null;
        Cliente cliente = pedido != null ? pedido.getCliente() : null;
        if (isBlank(empresa != null ? empresa.getCnpj() : null)) {
            pendencias.add("CNPJ do emitente pendente.");
        } else if (!possuiDigitos(empresa.getCnpj(), 14)) {
            pendencias.add("CNPJ do emitente invalido; informe 14 digitos.");
        }
        if (isBlank(empresa != null ? empresa.getRazaoSocial() : null)) {
            pendencias.add("Razao social do emitente pendente.");
        }
        if (isBlank(empresa != null ? empresa.getUf() : null)) {
            pendencias.add("UF do emitente pendente.");
        } else if (!ufValida(empresa.getUf())) {
            pendencias.add("UF do emitente invalida.");
        }
        if (modelo != ModeloDocumentoFiscal.NFSE && isBlank(empresa != null ? empresa.getInscricaoEstadual() : null)) {
            pendencias.add("Inscricao estadual do emitente pendente.");
        }
        if (modelo == ModeloDocumentoFiscal.NFSE && isBlank(empresa != null ? empresa.getInscricaoMunicipal() : null)) {
            pendencias.add("Inscricao municipal do prestador pendente.");
        }
        if (isBlank(empresa != null ? empresa.getCrt() : null)) {
            pendencias.add("CRT/regime tributario do emitente pendente.");
        }
        if (isBlank(empresa != null ? empresa.getCep() : null)) {
            pendencias.add("CEP do emitente pendente.");
        } else if (!possuiDigitos(empresa.getCep(), 8)) {
            pendencias.add("CEP do emitente invalido; informe 8 digitos.");
        }
        if (isBlank(empresa != null ? empresa.getCodigoMunicipio() : null)) {
            pendencias.add("Codigo do municipio do emitente pendente.");
        } else if (!possuiDigitos(empresa.getCodigoMunicipio(), 7)) {
            pendencias.add("Codigo do municipio do emitente invalido; informe 7 digitos IBGE.");
        }
        if (modelo != ModeloDocumentoFiscal.NFCE && isBlank(cliente != null ? cliente.getCpf() : null)) {
            pendencias.add("CPF do destinatario pendente.");
        } else if (cliente != null && !isBlank(cliente.getCpf()) && !possuiDigitos(cliente.getCpf(), 11)) {
            pendencias.add("CPF do destinatario invalido; informe 11 digitos.");
        }
        if (cliente != null) {
            if (isBlank(cliente.getEndereco())) {
                pendencias.add("Endereco do destinatario pendente.");
            }
            if (isBlank(cliente.getCidade())) {
                pendencias.add("Cidade do destinatario pendente.");
            }
            if (isBlank(cliente.getUf())) {
                pendencias.add("UF do destinatario pendente.");
            } else if (!ufValida(cliente.getUf())) {
                pendencias.add("UF do destinatario invalida.");
            }
            if (isBlank(cliente.getCep())) {
                pendencias.add("CEP do destinatario pendente.");
            } else if (!possuiDigitos(cliente.getCep(), 8)) {
                pendencias.add("CEP do destinatario invalido; informe 8 digitos.");
            }
            if (isBlank(cliente.getCodigoMunicipio())) {
                pendencias.add("Codigo do municipio do destinatario pendente.");
            } else if (!possuiDigitos(cliente.getCodigoMunicipio(), 7)) {
                pendencias.add("Codigo do municipio do destinatario invalido; informe 7 digitos IBGE.");
            }
        }
        if (pedido == null || pedido.getItens() == null || pedido.getItens().isEmpty()) {
            pendencias.add("Pedido sem itens fiscais.");
        } else {
            for (ItemPedido item : pedido.getItens()) {
                Produto produto = item.getProduto();
                if (produto == null) {
                    pendencias.add("Item sem produto vinculado.");
                    continue;
                }
                if (modelo != ModeloDocumentoFiscal.NFSE && isBlank(produto.getCodBarras())) {
                    pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " sem codigo de barras.");
                }
                if (modelo != ModeloDocumentoFiscal.NFSE && isBlank(produto.getNcm())) {
                    pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " sem NCM fiscal real.");
                } else if (!possuiDigitos(produto.getNcm(), 8)) {
                    pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " com NCM invalido; informe 8 digitos.");
                }
                if (modelo != ModeloDocumentoFiscal.NFSE && isBlank(produto.getCfop())) {
                    pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " sem CFOP fiscal real.");
                } else if (!possuiDigitos(produto.getCfop(), 4)) {
                    pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " com CFOP invalido; informe 4 digitos.");
                }
                if (modelo != ModeloDocumentoFiscal.NFSE && !isBlank(produto.getCest()) && !possuiDigitos(produto.getCest(), 7)) {
                    pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " com CEST invalido; informe 7 digitos.");
                }
                if (modelo != ModeloDocumentoFiscal.NFSE && isBlank(produto.getOrigemFiscal())) {
                    pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " sem origem fiscal.");
                } else if (modelo != ModeloDocumentoFiscal.NFSE && !produto.getOrigemFiscal().trim().matches("[0-8]")) {
                    pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " com origem fiscal invalida; use 0 a 8.");
                }
                if (modelo != ModeloDocumentoFiscal.NFSE) {
                    if (isBlank(produto.getCstIcms()) && isBlank(produto.getCsosn())) {
                        pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " sem CST/CSOSN de ICMS.");
                    }
                    if (!isBlank(produto.getCstIcms()) && !possuiDigitos(produto.getCstIcms(), 2) && !possuiDigitos(produto.getCstIcms(), 3)) {
                        pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " com CST ICMS invalido; informe 2 ou 3 digitos.");
                    }
                    if (!isBlank(produto.getCsosn()) && !possuiDigitos(produto.getCsosn(), 3)) {
                        pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " com CSOSN invalido; informe 3 digitos.");
                    }
                }
                if (percentualInvalido(produto.getAliquotaIcms())) {
                    pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " com aliquota ICMS invalida; use 0 a 100.");
                }
                if (percentualInvalido(produto.getAliquotaPis())) {
                    pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " com aliquota PIS invalida; use 0 a 100.");
                }
                if (percentualInvalido(produto.getAliquotaCofins())) {
                    pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " com aliquota COFINS invalida; use 0 a 100.");
                }
                if (percentualInvalido(produto.getAliquotaIpi())) {
                    pendencias.add("Produto " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " com aliquota IPI invalida; use 0 a 100.");
                }
                if (modelo == ModeloDocumentoFiscal.NFSE) {
                    if (isBlank(produto.getCodigoServicoMunicipal()) && isBlank(produto.getCodigoServicoNacional())) {
                        pendencias.add("Servico " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " sem codigo de servico municipal/nacional.");
                    }
                    if (percentualInvalido(produto.getAliquotaIss())) {
                        pendencias.add("Servico " + valorOuPadrao(produto.getNomeProduto(), "sem nome") + " com aliquota ISS invalida; use 0 a 100.");
                    }
                }
            }
        }
        if (configuracao != null && configuracao.getModelo() == ModeloDocumentoFiscal.NFCE && isBlank(configuracao.getCscId())) {
            pendencias.add("CSC Id da NFC-e pendente.");
        }
        return pendencias;
    }

    private String totalItem(ItemPedido item) {
        if (item == null || item.getPrecoUnit() == null || item.getQuantidade() == null) {
            return "0";
        }
        return item.getPrecoUnit().multiply(java.math.BigDecimal.valueOf(item.getQuantidade())).toPlainString();
    }

    private String camposModelo(DocumentoFiscal documento) {
        if (documento.getModelo() == ModeloDocumentoFiscal.NFCE) {
            String cscId = documento.getConfiguracaoFiscal() != null ? documento.getConfiguracaoFiscal().getCscId() : "";
            String qrCode = qrCodeHomologacaoNfce(documento, cscId);
            return "<NFCe>"
                    + "<CscId>" + escapeXml(cscId) + "</CscId>"
                    + "<QrCodeHomologacao>" + escapeXml(qrCode) + "</QrCodeHomologacao>"
                    + "<QrCodePendente>true</QrCodePendente>"
                    + "</NFCe>";
        }
        if (documento.getModelo() == ModeloDocumentoFiscal.NFSE) {
            String provedor = documento.getProvedor() != null ? documento.getProvedor() : "";
            Produto servico = primeiroProduto(documento);
            boolean servicoPendente = servico == null
                    || (isBlank(servico.getCodigoServicoMunicipal()) && isBlank(servico.getCodigoServicoNacional()));
            return "<NFSe>"
                    + "<Provedor>" + escapeXml(provedor) + "</Provedor>"
                    + "<Servico>"
                    + "<CodigoServicoMunicipal>" + escapeXml(servico != null ? servico.getCodigoServicoMunicipal() : "") + "</CodigoServicoMunicipal>"
                    + "<CodigoServicoNacional>" + escapeXml(servico != null ? servico.getCodigoServicoNacional() : "") + "</CodigoServicoNacional>"
                    + "<MunicipioIncidencia>" + escapeXml(documento.getEmpresa() != null ? documento.getEmpresa().getCodigoMunicipio() : "") + "</MunicipioIncidencia>"
                    + "<AliquotaIss>" + escapeXml(decimalOuVazio(servico != null ? servico.getAliquotaIss() : null)) + "</AliquotaIss>"
                    + "<Discriminacao>" + escapeXml(servico != null ? valorOuPadrao(servico.getDescricao(), servico.getNomeProduto()) : "") + "</Discriminacao>"
                    + "</Servico>"
                    + "<ServicoPendente>" + servicoPendente + "</ServicoPendente>"
                    + "</NFSe>";
        }
        return "<NFe><DanfePendente>true</DanfePendente></NFe>";
    }

    private void validarEstruturaXmlHomologacao(DocumentoFiscal documento) {
        String xml = documento.getXmlEnvio();
        if (isBlank(xml)) {
            throw new BusinessException("Documento fiscal sem XML de homologacao para validar.");
        }
        exigirTag(xml, "Modelo");
        exigirTag(xml, "Ambiente");
        exigirTag(xml, "Serie");
        exigirTag(xml, "Numero");
        exigirTag(xml, "Pedido");
        exigirTag(xml, "Emitente");
        exigirTag(xml, "Destinatario");
        exigirTag(xml, "Itens");
        exigirTag(xml, "Item");
        exigirTag(xml, "Produto");
        exigirTag(xml, "Quantidade");
        exigirTag(xml, "PrecoUnit");
        exigirTag(xml, "Total");
        exigirTag(xml, "Tributacao");
        exigirTag(xml, "CstIcms");
        exigirTag(xml, "Csosn");
        exigirTag(xml, "AliquotaIcms");
        exigirTag(xml, "AliquotaPis");
        exigirTag(xml, "AliquotaCofins");
        exigirTag(xml, "AliquotaIpi");
        exigirTag(xml, "AliquotaIss");
        exigirTag(xml, "PendenciasFiscais");
        exigirTag(xml, "AssinaturaHomologacao");
        exigirTag(xml, "Digest");
        exigirTag(xml, "AssinaturaRealPendente");

        if (documento.getModelo() == ModeloDocumentoFiscal.NFCE) {
            exigirConteudo(xml, "<NFCeHomologacao>");
            exigirTag(xml, "CscId");
            exigirTag(xml, "QrCodeHomologacao");
            exigirTag(xml, "QrCodePendente");
            return;
        }
        if (documento.getModelo() == ModeloDocumentoFiscal.NFSE) {
            exigirConteudo(xml, "<NFSeHomologacao>");
            exigirTag(xml, "Provedor");
            exigirTag(xml, "Servico");
            exigirTag(xml, "CodigoServicoMunicipal");
            exigirTag(xml, "CodigoServicoNacional");
            exigirTag(xml, "MunicipioIncidencia");
            exigirTag(xml, "AliquotaIss");
            exigirTag(xml, "Discriminacao");
            exigirTag(xml, "ServicoPendente");
            return;
        }

        exigirConteudo(xml, "<NFeHomologacao>");
        exigirTag(xml, "DanfePendente");
    }

    private void exigirTag(String xml, String tag) {
        exigirConteudo(xml, "<" + tag + ">");
        exigirConteudo(xml, "</" + tag + ">");
    }

    private void exigirConteudo(String xml, String trecho) {
        if (xml == null || !xml.contains(trecho)) {
            throw new BusinessException("XML de homologacao invalido: trecho obrigatorio ausente " + trecho + ".");
        }
    }

    private String montarXmlRetornoHomologacao(DocumentoFiscal documento, String mensagem) {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<RetornoDocumentoFiscalHomologacao>"
                + "<Status>" + escapeXml(documento.getStatus() != null ? documento.getStatus().name() : "") + "</Status>"
                + "<Modelo>" + escapeXml(documento.getModelo() != null ? documento.getModelo().name() : "") + "</Modelo>"
                + "<Ambiente>" + escapeXml(documento.getAmbiente() != null ? documento.getAmbiente().name() : "") + "</Ambiente>"
                + "<Serie>" + escapeXml(documento.getSerie()) + "</Serie>"
                + "<Numero>" + (documento.getNumero() != null ? documento.getNumero() : "") + "</Numero>"
                + "<ChaveAcesso>" + escapeXml(documento.getChaveAcesso()) + "</ChaveAcesso>"
                + "<Protocolo>" + escapeXml(documento.getProtocolo()) + "</Protocolo>"
                + "<Mensagem>" + escapeXml(mensagem) + "</Mensagem>"
                + "</RetornoDocumentoFiscalHomologacao>";
    }

    private String montarCartaCorrecaoHomologacao(DocumentoFiscal documento, String texto, int sequencia) {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<CartaCorrecaoHomologacao>"
                + "<Modelo>" + documento.getModelo() + "</Modelo>"
                + "<Ambiente>" + documento.getAmbiente() + "</Ambiente>"
                + "<Serie>" + escapeXml(documento.getSerie()) + "</Serie>"
                + "<Numero>" + documento.getNumero() + "</Numero>"
                + "<ChaveAcesso>" + escapeXml(documento.getChaveAcesso()) + "</ChaveAcesso>"
                + "<ProtocoloAutorizacao>" + escapeXml(documento.getProtocolo()) + "</ProtocoloAutorizacao>"
                + "<SequenciaEvento>" + sequencia + "</SequenciaEvento>"
                + "<CondicaoUso>A carta de correcao e disciplinada pelo Ajuste SINIEF e nao pode corrigir valores fiscais, dados cadastrais que alterem identidade ou data de emissao/saida.</CondicaoUso>"
                + "<Correcao>" + escapeXml(texto) + "</Correcao>"
                + "<GeradoEm>" + LocalDateTime.now() + "</GeradoEm>"
                + "</CartaCorrecaoHomologacao>";
    }

    private String montarDossieHomologacao(DocumentoFiscal documento) {
        List<String> linhas = new ArrayList<>();
        linhas.add("DOSSIE FISCAL DE HOMOLOGACAO - NEXUS ONE");
        linhas.add("Documento: " + valorOuPadrao(documento.getModelo() != null ? documento.getModelo().name() : null, "-")
                + " " + valorOuPadrao(documento.getSerie(), "-") + "-" + (documento.getNumero() != null ? documento.getNumero() : "-"));
        linhas.add("Pedido: " + valorOuPadrao(documento.getPedido() != null ? documento.getPedido().getNumero() : null, "-"));
        linhas.add("Ambiente: " + valorOuPadrao(documento.getAmbiente() != null ? documento.getAmbiente().name() : null, "-"));
        linhas.add("Status: " + valorOuPadrao(documento.getStatus() != null ? documento.getStatus().name() : null, "-"));
        linhas.add("Provedor: " + valorOuPadrao(documento.getProvedor(), "-"));
        linhas.add("Chave: " + valorOuPadrao(documento.getChaveAcesso(), "-"));
        linhas.add("Protocolo: " + valorOuPadrao(documento.getProtocolo(), "-"));
        linhas.add("Mensagem: " + valorOuPadrao(documento.getMensagemRetorno(), "-"));
        linhas.add("Proxima acao: " + proximaAcaoFiscal(documento));
        List<String> pendencias = listaPendencias(documento);
        List<String> acoesDisponiveis = acoesDisponiveis(documento);
        int arquivosDisponiveis = totalArquivosDisponiveis(documento);
        linhas.add("Arquivos disponiveis: " + arquivosDisponiveis);
        linhas.add("Pendencias fiscais: " + pendencias.size());
        linhas.add("Acoes disponiveis: " + acoesDisponiveis.size());
        linhas.add("");
        linhas.add("ARQUIVOS");
        linhas.add("- Payload JSON: " + simNao(!isBlank(documento.getPayloadJson())));
        linhas.add("- XML de envio: " + simNao(!isBlank(documento.getXmlEnvio())));
        linhas.add("- XML de retorno: " + simNao(!isBlank(documento.getXmlRetorno())));
        linhas.add("- DANFE/DANFCE/DANFSe: " + simNao(!isBlank(documento.getDanfeHtml())));
        linhas.add("- CC-e: " + simNao(!isBlank(documento.getCartaCorrecaoXml())));
        if (!isBlank(documento.getCartaCorrecaoXml())) {
            linhas.add("  Sequencia CC-e: " + valorOuPadrao(documento.getCartaCorrecaoSequencia() != null ? documento.getCartaCorrecaoSequencia().toString() : null, "-"));
            linhas.add("  Texto CC-e: " + valorOuPadrao(documento.getCartaCorrecaoTexto(), "-"));
        }
        linhas.add("");
        linhas.add("PENDENCIAS FISCAIS");
        if (pendencias.isEmpty()) {
            linhas.add("- Nenhuma pendencia fiscal persistida.");
        } else {
            pendencias.forEach(item -> linhas.add("- " + item));
        }
        linhas.add("");
        linhas.add("ACOES DISPONIVEIS");
        acoesDisponiveis.forEach(item -> linhas.add("- " + item));
        linhas.add("");
        linhas.add("Observacao: dossie de homologacao para conferencia operacional; nao substitui documentos fiscais oficiais.");
        linhas.add("Gerado em: " + LocalDateTime.now());
        return String.join("\n", linhas);
    }

    private String montarChecklistEmissaoReal(DocumentoFiscal documento) {
        ChecklistEmissaoReal checklist = checklistEmissaoReal(documento);
        List<String> linhas = new ArrayList<>();
        linhas.add("CHECKLIST DE EMISSAO FISCAL REAL - NEXUS ONE");
        linhas.add("Documento: " + valorOuPadrao(documento.getModelo() != null ? documento.getModelo().name() : null, "-")
                + " " + valorOuPadrao(documento.getSerie(), "-") + "-" + (documento.getNumero() != null ? documento.getNumero() : "-"));
        linhas.add("Pedido: " + valorOuPadrao(documento.getPedido() != null ? documento.getPedido().getNumero() : null, "-"));
        linhas.add("Status atual: " + valorOuPadrao(documento.getStatus() != null ? documento.getStatus().name() : null, "-"));
        linhas.add("Prontidao estimada: " + checklist.percentual() + "%");
        linhas.add("Itens prontos: " + checklist.prontos().size());
        linhas.add("Pendencias: " + checklist.pendencias().size());
        linhas.add("Proxima acao: " + proximaAcaoEmissaoReal(checklist));
        linhas.add("");
        linhas.add("ITENS PRONTOS");
        if (checklist.prontos().isEmpty()) {
            linhas.add("- Nenhum item pronto identificado.");
        } else {
            checklist.prontos().forEach(item -> linhas.add("- " + item));
        }
        linhas.add("");
        linhas.add("PENDENCIAS PARA EMISSAO REAL");
        if (checklist.pendencias().isEmpty()) {
            linhas.add("- Nenhuma pendencia operacional identificada neste checklist.");
        } else {
            checklist.pendencias().forEach(item -> linhas.add("- " + item));
        }
        linhas.add("");
        linhas.add("Observacao: checklist operacional para emissao fiscal real; validar regras tributarias, certificado e provedor com contador antes de producao.");
        linhas.add("Gerado em: " + LocalDateTime.now());
        return String.join("\n", linhas);
    }

    private ChecklistEmissaoReal checklistEmissaoReal(DocumentoFiscal documento) {
        ConfiguracaoFiscal configuracao = documento.getConfiguracaoFiscal();
        List<String> pendencias = new ArrayList<>();
        List<String> prontos = new ArrayList<>();

        registrarChecklist(!isBlank(documento.getXmlEnvio()), "XML de envio gerado", "Gerar XML fiscal antes da emissao real.", prontos, pendencias);
        registrarChecklist(StatusDocumentoFiscal.XML_VALIDADO.equals(documento.getStatus())
                        || StatusDocumentoFiscal.AUTORIZADO.equals(documento.getStatus()),
                "XML ja passou por validacao interna ou autorizacao controlada",
                "Validar internamente o XML antes da emissao real.",
                prontos,
                pendencias);
        registrarChecklist(isBlank(documento.getPendenciasFiscais()),
                "Sem pendencias fiscais persistidas no documento",
                "Corrigir pendencias fiscais cadastrais e revalidar o documento.",
                prontos,
                pendencias);
        registrarChecklist(configuracao != null && AmbienteFiscal.PRODUCAO.equals(configuracao.getAmbiente()),
                "Configuracao fiscal em PRODUCAO",
                "Criar/selecionar configuracao fiscal de PRODUCAO para emissao oficial.",
                prontos,
                pendencias);
        registrarChecklist(configuracao != null && !isBlank(configuracao.getEndpointProducao()),
                "Endpoint de producao informado",
                "Informar endpoint de producao do emissor fiscal/provedor.",
                prontos,
                pendencias);
        registrarChecklist(configuracao != null && !isBlank(configuracao.getCertificadoArquivoEnv()),
                "Alias do arquivo certificado A1 informado",
                "Informar certificadoArquivoEnv apontando para o PFX/P12 real.",
                prontos,
                pendencias);
        registrarChecklist(configuracao != null && !isBlank(configuracao.getCertificadoSenhaEnv()),
                "Alias da senha do certificado informado",
                "Informar certificadoSenhaEnv para carregar o certificado real.",
                prontos,
                pendencias);
        registrarChecklist(configuracao != null && configuracao.getCertificadoValidoAte() != null,
                "Validade do certificado A1 informada",
                "Informar validade do certificado A1 e revisar vencimento.",
                prontos,
                pendencias);
        if (configuracao != null && configuracao.getCertificadoValidoAte() != null) {
            registrarChecklist(certificadoValidoParaEmissaoReal(configuracao.getCertificadoValidoAte()),
                    "Certificado A1 valido por mais de 30 dias",
                    "Certificado A1 vencido ou vencendo em ate 30 dias; renovar antes da emissao real.",
                    prontos,
                    pendencias);
        }
        registrarChecklist(configuracao != null && !isBlank(configuracao.getProvedorTokenEnv()),
                "Alias do token do provedor informado",
                "Informar provedorTokenEnv quando o emissor fiscal exigir token/API key.",
                prontos,
                pendencias);
        if (ModeloDocumentoFiscal.NFCE.equals(documento.getModelo())) {
            registrarChecklist(configuracao != null && !isBlank(configuracao.getCscId()) && !isBlank(configuracao.getCscTokenEnv()),
                    "CSC da NFC-e informado",
                    "Informar CSC ID e cscTokenEnv para QR Code oficial NFC-e.",
                    prontos,
                    pendencias);
        }
        if (ModeloDocumentoFiscal.NFSE.equals(documento.getModelo())) {
            registrarChecklist(configuracao != null && !isBlank(configuracao.getEndpointProducao()),
                    "Endpoint municipal/provedor NFS-e informado",
                    "Informar endpoint de producao do municipio/provedor NFS-e.",
                    prontos,
                    pendencias);
        }
        List<String> prontosUnicos = itensUnicos(prontos);
        List<String> pendenciasUnicas = itensUnicos(pendencias);
        int total = prontosUnicos.size() + pendenciasUnicas.size();
        int percentual = total == 0 ? 0 : (int) Math.round((prontosUnicos.size() * 100.0) / total);
        return new ChecklistEmissaoReal(prontosUnicos, pendenciasUnicas, percentual);
    }

    private record ChecklistEmissaoReal(List<String> prontos, List<String> pendencias, int percentual) {
    }

    private List<String> itensUnicos(List<String> itens) {
        if (itens == null || itens.isEmpty()) {
            return List.of();
        }
        return itens.stream()
                .filter(item -> !isBlank(item))
                .distinct()
                .toList();
    }

    private String proximaAcaoEmissaoReal(ChecklistEmissaoReal checklist) {
        if (checklist.pendencias().isEmpty()) {
            return "Documento sem pendencias operacionais neste checklist; validar regras tributarias e provedor real.";
        }
        return checklist.pendencias().getFirst();
    }

    private List<String> pendenciasExternasEmissaoReal(DocumentoFiscal documento) {
        List<String> pendencias = new ArrayList<>();
        pendencias.add("Validar credenciamento fiscal da empresa/filial na SEFAZ, prefeitura ou provedor.");
        pendencias.add("Assinar XML com certificado A1 oficial e validar assinatura no ambiente fiscal real.");
        pendencias.add("Homologar autorizacao, rejeicao, cancelamento, inutilizacao e contingencia com provedor/SEFAZ/municipio.");
        pendencias.add("Validar NCM, CFOP, CST/CSOSN, aliquotas, CRT/regime e calculos fiscais com contador.");
        if (ModeloDocumentoFiscal.NFCE.equals(documento.getModelo())) {
            pendencias.add("Substituir QR Code interno da NFC-e pelo QR Code oficial da SEFAZ com CSC homologado.");
        }
        if (ModeloDocumentoFiscal.NFSE.equals(documento.getModelo())) {
            pendencias.add("Homologar layout NFS-e especifico do municipio/provedor, codigo de servico, ISS e retorno oficial.");
        }
        return itensUnicos(pendencias);
    }

    private boolean certificadoValidoParaEmissaoReal(LocalDate validade) {
        return validade != null && validade.isAfter(LocalDate.now().plusDays(30));
    }

    private void registrarChecklist(boolean ok, String pronto, String pendencia, List<String> prontos, List<String> pendencias) {
        if (ok) {
            prontos.add(pronto);
        } else {
            pendencias.add(pendencia);
        }
    }

    private String simNao(boolean value) {
        return value ? "SIM" : "NAO";
    }

    private String montarDanfeHomologacao(DocumentoFiscal documento) {
        Pedido pedido = documento.getPedido();
        String tituloBase = switch (documento.getModelo()) {
            case NFCE -> "DANFCE Homologacao";
            case NFSE -> "DANFSe Homologacao";
            default -> "DANFE Homologacao";
        };
        String titulo = StatusDocumentoFiscal.CONTINGENCIA.equals(documento.getStatus())
                ? tituloBase + " - Contingencia"
                : tituloBase;
        String itens = pedido != null && pedido.getItens() != null
                ? pedido.getItens().stream()
                        .map(this::itemDanfeHtml)
                        .reduce((left, right) -> left + right)
                        .orElse("")
                : "";

        return "<!doctype html>"
                + "<html lang=\"pt-BR\"><head><meta charset=\"UTF-8\" />"
                + "<title>" + escapeXml(titulo) + " " + escapeXml(documento.getSerie()) + "-" + (documento.getNumero() != null ? documento.getNumero() : "") + "</title>"
                + "<style>"
                + "body{font-family:Arial,sans-serif;color:#111;margin:24px}.box{border:1px solid #111;padding:12px;margin-bottom:12px}"
                + "h1{font-size:22px;margin:0 0 8px}.muted{color:#555;font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}"
                + "table{width:100%;border-collapse:collapse}th,td{border:1px solid #777;padding:6px;text-align:left}th{background:#eee}"
                + ".watermark{font-size:18px;font-weight:bold;text-align:center;border:2px solid #111;padding:8px;margin:12px 0}.notice{background:#fff3cd;border:1px solid #b7791f;padding:8px;margin:8px 0}"
                + "</style></head><body>"
                + "<div class=\"watermark\">SEM VALOR FISCAL - HOMOLOGACAO CONTROLADA</div>"
                + (StatusDocumentoFiscal.CONTINGENCIA.equals(documento.getStatus())
                        ? "<div class=\"notice\"><strong>Contingencia:</strong> emissao registrada para regularizacao posterior junto ao provedor fiscal.</div>"
                        : "")
                + "<section class=\"box\"><h1>" + escapeXml(titulo) + "</h1>"
                + "<p class=\"muted\">Documento auxiliar gerado pelo Nexus One para conferencia interna antes da emissao fiscal real.</p>"
                + "<div class=\"grid\">"
                + "<div><strong>Modelo:</strong> " + escapeXml(documento.getModelo() != null ? documento.getModelo().name() : "") + "</div>"
                + "<div><strong>Ambiente:</strong> " + escapeXml(documento.getAmbiente() != null ? documento.getAmbiente().name() : "") + "</div>"
                + "<div><strong>Serie/Numero:</strong> " + escapeXml(documento.getSerie()) + "/" + (documento.getNumero() != null ? documento.getNumero() : "") + "</div>"
                + "<div><strong>Protocolo:</strong> " + escapeXml(documento.getProtocolo()) + "</div>"
                + "<div><strong>Chave:</strong> " + escapeXml(documento.getChaveAcesso()) + "</div>"
                + "<div><strong>Pedido:</strong> " + escapeXml(pedido != null ? pedido.getNumero() : "") + "</div>"
                + "</div></section>"
                + secaoQrCodeNfce(documento)
                + "<section class=\"box\"><h2>Emitente e destinatario</h2>"
                + "<p><strong>Empresa:</strong> " + escapeXml(documento.getEmpresa() != null ? documento.getEmpresa().getNome() : "") + "</p>"
                + "<p><strong>Filial:</strong> " + escapeXml(documento.getFilial() != null ? documento.getFilial().getNome() : "Empresa / sem filial") + "</p>"
                + "<p><strong>Cliente:</strong> " + escapeXml(pedido != null && pedido.getCliente() != null ? pedido.getCliente().getNome() : "") + "</p>"
                + "</section>"
                + "<section class=\"box\"><h2>Itens</h2><table><thead><tr><th>Produto</th><th>SKU</th><th>Qtd.</th><th>Unit.</th></tr></thead><tbody>"
                + itens
                + "</tbody></table></section>"
                + "<section class=\"box\"><strong>Total:</strong> "
                + escapeXml(pedido != null && pedido.getValorTotalPedido() != null ? pedido.getValorTotalPedido().toPlainString() : "0")
                + "</section>"
                + "</body></html>";
    }

    private String itemDanfeHtml(ItemPedido item) {
        return "<tr>"
                + "<td>" + escapeXml(item.getProduto() != null ? item.getProduto().getNomeProduto() : "") + "</td>"
                + "<td>" + escapeXml(item.getProduto() != null ? item.getProduto().getSku() : "") + "</td>"
                + "<td>" + (item.getQuantidade() != null ? item.getQuantidade() : 0) + "</td>"
                + "<td>" + escapeXml(item.getPrecoUnit() != null ? item.getPrecoUnit().toPlainString() : "0") + "</td>"
                + "</tr>";
    }

    private String secaoQrCodeNfce(DocumentoFiscal documento) {
        if (documento.getModelo() != ModeloDocumentoFiscal.NFCE) {
            return "";
        }
        String cscId = documento.getConfiguracaoFiscal() != null ? documento.getConfiguracaoFiscal().getCscId() : "";
        String qrCode = qrCodeHomologacaoNfce(documento, cscId);
        return "<section class=\"box\"><h2>QR Code NFC-e</h2>"
                + "<p class=\"muted\">QR Code interno de homologacao. O QR Code oficial depende da autorizacao fiscal real.</p>"
                + "<p style=\"word-break:break-all\">" + escapeXml(qrCode) + "</p>"
                + "</section>";
    }

    private String qrCodeHomologacaoNfce(DocumentoFiscal documento, String cscId) {
        String base = "modelo=NFCE"
                + "|ambiente=" + valorOuPadrao(documento.getAmbiente() != null ? documento.getAmbiente().name() : null, "HOMOLOGACAO")
                + "|serie=" + valorOuPadrao(documento.getSerie(), "0")
                + "|numero=" + (documento.getNumero() != null ? documento.getNumero() : 0)
                + "|pedido=" + valorOuPadrao(documento.getPedido() != null ? documento.getPedido().getNumero() : null, "")
                + "|cscId=" + valorOuPadrao(cscId, "");
        return "nexus-one://nfce-homologacao/" + sha256(base);
    }

    private Produto primeiroProduto(DocumentoFiscal documento) {
        if (documento == null || documento.getPedido() == null || documento.getPedido().getItens() == null) {
            return null;
        }
        return documento.getPedido().getItens().stream()
                .map(ItemPedido::getProduto)
                .filter(produto -> produto != null)
                .findFirst()
                .orElse(null);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new BusinessException("Algoritmo SHA-256 indisponivel para QR Code fiscal.");
        }
    }

    private String referenciaPacoteReal(DocumentoFiscal documento, String payloadHash, String xmlHash) {
        String base = valorOuPadrao(documento.getModelo() != null ? documento.getModelo().name() : null, "DOC")
                + "|serie=" + valorOuPadrao(documento.getSerie(), "0")
                + "|numero=" + (documento.getNumero() != null ? documento.getNumero() : 0)
                + "|payload=" + valorOuPadrao(payloadHash, "")
                + "|xml=" + valorOuPadrao(xmlHash, "");
        return "nexus-one://pacote-emissao-real/" + sha256(base);
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String escapeXml(String value) {
        return value == null ? "" : value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private String trim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private boolean possuiDigitos(String value, int quantidade) {
        return value != null && value.replaceAll("\\D", "").length() == quantidade;
    }

    private boolean ufValida(String value) {
        return value != null && value.trim().toUpperCase().matches("[A-Z]{2}");
    }

    private boolean percentualInvalido(BigDecimal value) {
        return value != null && (value.compareTo(BigDecimal.ZERO) < 0 || value.compareTo(BigDecimal.valueOf(100)) > 0);
    }

    private String decimalOuVazio(BigDecimal value) {
        return value == null ? "" : value.toPlainString();
    }

    private String valorOuPadrao(String value, String defaultValue) {
        String trimmed = trim(value);
        return trimmed != null ? trimmed : defaultValue;
    }

    private String formatarPendencias(List<String> pendencias) {
        if (pendencias == null || pendencias.isEmpty()) {
            return null;
        }
        return String.join("\n", pendencias);
    }

    private String gerarChaveHomologacao(DocumentoFiscal documento) {
        String empresa = documento.getEmpresa() != null && documento.getEmpresa().getId() != null
                ? documento.getEmpresa().getId().toString().replace("-", "")
                : "00000000000000000000000000000000";
        String serie = documento.getSerie() != null ? documento.getSerie().replaceAll("\\D", "") : "0";
        String numero = String.format("%09d", documento.getNumero() != null ? documento.getNumero() : 0);
        return "HOM" + empresa.substring(0, Math.min(14, empresa.length())) + serie + numero;
    }

    private DocumentoFiscalResponse toResponse(DocumentoFiscal documento) {
        return DocumentoFiscalResponse.builder()
                .id(documento.getId())
                .pedidoId(documento.getPedido() != null ? documento.getPedido().getId() : null)
                .pedidoNumero(documento.getPedido() != null ? documento.getPedido().getNumero() : null)
                .configuracaoFiscalId(documento.getConfiguracaoFiscal() != null ? documento.getConfiguracaoFiscal().getId() : null)
                .modelo(documento.getModelo())
                .ambiente(documento.getAmbiente())
                .status(documento.getStatus())
                .serie(documento.getSerie())
                .numero(documento.getNumero())
                .chaveAcesso(documento.getChaveAcesso())
                .protocolo(documento.getProtocolo())
                .provedor(documento.getProvedor())
                .payloadJson(documento.getPayloadJson())
                .xmlEnvio(documento.getXmlEnvio())
                .xmlRetorno(documento.getXmlRetorno())
                .danfeHtml(documento.getDanfeHtml())
                .cartaCorrecaoXml(documento.getCartaCorrecaoXml())
                .cartaCorrecaoTexto(documento.getCartaCorrecaoTexto())
                .cartaCorrecaoSequencia(documento.getCartaCorrecaoSequencia())
                .mensagemRetorno(documento.getMensagemRetorno())
                .pendenciasFiscais(documento.getPendenciasFiscais())
                .observacao(documento.getObservacao())
                .criadoEm(documento.getCriadoEm())
                .atualizadoEm(documento.getAtualizadoEm())
                .build();
    }

    private DocumentoFiscalResumoResponse toResumoResponse(DocumentoFiscal documento) {
        return DocumentoFiscalResumoResponse.builder()
                .id(documento.getId())
                .pedidoId(documento.getPedido() != null ? documento.getPedido().getId() : null)
                .pedidoNumero(documento.getPedido() != null ? documento.getPedido().getNumero() : null)
                .modelo(documento.getModelo())
                .ambiente(documento.getAmbiente())
                .status(documento.getStatus())
                .serie(documento.getSerie())
                .numero(documento.getNumero())
                .chaveAcesso(documento.getChaveAcesso())
                .protocolo(documento.getProtocolo())
                .possuiPayloadJson(!isBlank(documento.getPayloadJson()))
                .possuiXmlEnvio(!isBlank(documento.getXmlEnvio()))
                .possuiXmlRetorno(!isBlank(documento.getXmlRetorno()))
                .possuiDanfeHtml(!isBlank(documento.getDanfeHtml()))
                .possuiCartaCorrecao(!isBlank(documento.getCartaCorrecaoXml()))
                .possuiPendenciasFiscais(!isBlank(documento.getPendenciasFiscais()))
                .totalArquivosDisponiveis(totalArquivosDisponiveis(documento))
                .totalPendenciasFiscais(listaPendencias(documento).size())
                .criadoEm(documento.getCriadoEm())
                .atualizadoEm(documento.getAtualizadoEm())
                .build();
    }

    private DocumentoFiscalConsultaResponse toConsultaResponse(DocumentoFiscal documento) {
        List<String> pendencias = listaPendencias(documento);
        List<String> acoes = acoesDisponiveis(documento);
        return DocumentoFiscalConsultaResponse.builder()
                .id(documento.getId())
                .pedidoId(documento.getPedido() != null ? documento.getPedido().getId() : null)
                .pedidoNumero(documento.getPedido() != null ? documento.getPedido().getNumero() : null)
                .modelo(documento.getModelo())
                .ambiente(documento.getAmbiente())
                .status(documento.getStatus())
                .serie(documento.getSerie())
                .numero(documento.getNumero())
                .chaveAcesso(documento.getChaveAcesso())
                .protocolo(documento.getProtocolo())
                .provedor(documento.getProvedor())
                .autorizado(StatusDocumentoFiscal.AUTORIZADO.equals(documento.getStatus()))
                .possuiChaveAcesso(!isBlank(documento.getChaveAcesso()))
                .possuiProtocolo(!isBlank(documento.getProtocolo()))
                .possuiPayloadJson(!isBlank(documento.getPayloadJson()))
                .possuiXmlEnvio(!isBlank(documento.getXmlEnvio()))
                .possuiXmlRetorno(!isBlank(documento.getXmlRetorno()))
                .possuiDanfeHtml(!isBlank(documento.getDanfeHtml()))
                .possuiCartaCorrecao(!isBlank(documento.getCartaCorrecaoXml()))
                .possuiPendenciasFiscais(!isBlank(documento.getPendenciasFiscais()))
                .totalArquivosDisponiveis(totalArquivosDisponiveis(documento))
                .totalPendenciasFiscais(pendencias.size())
                .totalAcoesDisponiveis(acoes.size())
                .mensagemRetorno(documento.getMensagemRetorno())
                .pendenciasFiscais(pendencias)
                .proximaAcao(proximaAcaoFiscal(documento))
                .acoesDisponiveis(acoes)
                .consultadoEm(LocalDateTime.now())
                .atualizadoEm(documento.getAtualizadoEm())
                .build();
    }

    private int totalArquivosDisponiveis(DocumentoFiscal documento) {
        int total = 0;
        total += !isBlank(documento.getPayloadJson()) ? 1 : 0;
        total += !isBlank(documento.getXmlEnvio()) ? 1 : 0;
        total += !isBlank(documento.getXmlRetorno()) ? 1 : 0;
        total += !isBlank(documento.getDanfeHtml()) ? 1 : 0;
        total += !isBlank(documento.getCartaCorrecaoXml()) ? 1 : 0;
        return total;
    }

    private List<String> listaPendencias(DocumentoFiscal documento) {
        if (documento == null || isBlank(documento.getPendenciasFiscais())) {
            return List.of();
        }
        return documento.getPendenciasFiscais()
                .lines()
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
    }

    private String proximaAcaoFiscal(DocumentoFiscal documento) {
        if (documento == null || documento.getStatus() == null) {
            return "Localizar documento fiscal.";
        }
        if (!isBlank(documento.getPendenciasFiscais())
                && (StatusDocumentoFiscal.EM_PROCESSAMENTO.equals(documento.getStatus())
                || StatusDocumentoFiscal.XML_VALIDADO.equals(documento.getStatus()))) {
            return "Corrigir cadastro fiscal, baixar TXT de pendencias e revalidar.";
        }
        return switch (documento.getStatus()) {
            case PREPARADO_HOMOLOGACAO -> "Gerar XML de homologacao.";
            case EM_PROCESSAMENTO -> "Validar XML internamente.";
            case XML_VALIDADO -> "Transmitir ao provedor fiscal ou registrar contingencia.";
            case CONTINGENCIA -> "Regularizar contingencia quando o provedor estiver disponivel.";
            case AUTORIZADO -> isBlank(documento.getDanfeHtml())
                    ? "Gerar DANFE/DANFCE/DANFSe de homologacao para conferencia."
                    : "Documento autorizado; conferir chave, protocolo e documento auxiliar.";
            case REJEITADO -> "Conferir retorno fiscal, corrigir dados e reprocessar ou inutilizar numeracao.";
            case CANCELADO -> "Documento cancelado; manter XML de retorno para auditoria.";
            case INUTILIZADO -> "Numeracao inutilizada; manter retorno para auditoria.";
        };
    }

    private List<String> acoesDisponiveis(DocumentoFiscal documento) {
        if (documento == null || documento.getStatus() == null) {
            return List.of();
        }
        List<String> acoes = new ArrayList<>();
        if (!isBlank(documento.getPayloadJson())) {
            acoes.add("Baixar payload JSON");
        }
        if (!isBlank(documento.getXmlEnvio())) {
            acoes.add("Baixar XML de envio");
        }
        if (!isBlank(documento.getXmlRetorno())) {
            acoes.add("Baixar XML de retorno");
        }
        if (!isBlank(documento.getDanfeHtml())) {
            acoes.add("Baixar DANFE/DANFCE/DANFSe");
        }
        if (!isBlank(documento.getCartaCorrecaoXml())) {
            acoes.add("Baixar CC-e");
        }
        if (!isBlank(documento.getPendenciasFiscais())) {
            acoes.add("Baixar TXT de pendencias");
        }
        switch (documento.getStatus()) {
            case PREPARADO_HOMOLOGACAO -> acoes.add("Gerar XML");
            case EM_PROCESSAMENTO -> acoes.add("Validar XML");
            case XML_VALIDADO -> {
                acoes.add("Transmitir");
                acoes.add("Registrar contingencia");
                acoes.add("Autorizar/Rejeitar manualmente");
            }
            case CONTINGENCIA -> {
                acoes.add("Regularizar contingencia");
                acoes.add("Gerar DANFE de contingencia");
            }
            case AUTORIZADO -> {
                acoes.add("Cancelar");
                acoes.add("Gerar DANFE");
                if (ModeloDocumentoFiscal.NFE.equals(documento.getModelo())) {
                    acoes.add("Emitir CC-e");
                }
            }
            case REJEITADO -> {
                acoes.add("Reprocessar rejeicao");
                acoes.add("Inutilizar numeracao");
            }
            case CANCELADO, INUTILIZADO -> acoes.add("Consultar auditoria/retorno");
        }
        return acoes;
    }
}
