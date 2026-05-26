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
import br.com.diego.projectoads.service.fiscal.ControlledFiscalXmlSigner;
import br.com.diego.projectoads.service.fiscal.ControlledHomologationFiscalProvider;
import br.com.diego.projectoads.service.fiscal.FiscalProvider;
import br.com.diego.projectoads.service.fiscal.FiscalSecretResolver;
import br.com.diego.projectoads.service.fiscal.FiscalTransmissionResult;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DocumentoFiscalServiceTest {

    private final DocumentoFiscalRepository documentoFiscalRepository = mock(DocumentoFiscalRepository.class);
    private final ConfiguracaoFiscalRepository configuracaoFiscalRepository = mock(ConfiguracaoFiscalRepository.class);
    private final PedidoRepository pedidoRepository = mock(PedidoRepository.class);
    private final ConfiguracaoFiscalService configuracaoFiscalService = mock(ConfiguracaoFiscalService.class);
    private final AuditoriaService auditoriaService = mock(AuditoriaService.class);
    private final FiscalSecretResolver fiscalSecretResolver = new FiscalSecretResolver(Map.of(
            "FISCAL_CERT_FILE", "C:\\certificados\\homologacao.pfx",
            "FISCAL_CERT_PASSWORD", "senha-homologacao",
            "FISCAL_NFCE_CSC_TOKEN", "token-homologacao"
    ));
    private final DocumentoFiscalService service = new DocumentoFiscalService(
            documentoFiscalRepository,
            configuracaoFiscalRepository,
            pedidoRepository,
            configuracaoFiscalService,
            auditoriaService,
            List.of(new ControlledHomologationFiscalProvider(fiscalSecretResolver)),
            new ControlledFiscalXmlSigner(fiscalSecretResolver)
    );

    @Test
    void devePrepararDocumentoFiscalEmHomologacaoEAvancarNumeracao() {
        Empresa empresa = empresa();
        Pedido pedido = pedido(empresa);
        ConfiguracaoFiscal configuracao = configuracao(empresa);
        DocumentoFiscalHomologacaoRequest request = request(pedido.getId(), configuracao.getId());
        when(pedidoRepository.findDetailedByIdAndEmpresaId(pedido.getId(), empresa.getId())).thenReturn(Optional.of(pedido));
        when(configuracaoFiscalRepository.findById(configuracao.getId())).thenReturn(Optional.of(configuracao));
        when(configuracaoFiscalService.status(configuracao.getId())).thenReturn(statusPronto(configuracao));
        when(documentoFiscalRepository.findFirstByPedidoIdAndModeloAndAmbienteOrderByCriadoEmDesc(
                pedido.getId(),
                ModeloDocumentoFiscal.NFE,
                AmbienteFiscal.HOMOLOGACAO
        )).thenReturn(Optional.empty());
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.prepararHomologacao(request);

        assertEquals(ModeloDocumentoFiscal.NFE, response.getModelo());
        assertEquals(AmbienteFiscal.HOMOLOGACAO, response.getAmbiente());
        assertEquals(StatusDocumentoFiscal.PREPARADO_HOMOLOGACAO, response.getStatus());
        assertEquals("1", response.getSerie());
        assertEquals(10L, response.getNumero());
        assertEquals(11L, configuracao.getProximoNumero());
        assertTrue(response.getPayloadJson().contains("\"pedido\":\"PED-1\""));
        assertTrue(response.getPayloadJson().contains("\"numero\":10"));
        assertTrue(response.getPayloadJson().contains("\"emitente\""));
        assertTrue(response.getPayloadJson().contains("\"destinatario\""));
        assertTrue(response.getPayloadJson().contains("\"pendenciasFiscais\""));
        assertTrue(response.getPayloadJson().contains("sem NCM fiscal real"));
        assertTrue(response.getPayloadJson().contains("sem CFOP fiscal real"));
        assertTrue(response.getPayloadJson().contains("Inscricao estadual do emitente pendente"));
        assertTrue(response.getPayloadJson().contains("CRT/regime tributario do emitente pendente"));
        assertTrue(response.getPayloadJson().contains("Cidade do destinatario pendente"));
        assertTrue(response.getPayloadJson().contains("Codigo do municipio do destinatario pendente"));
        assertTrue(response.getPendenciasFiscais().contains("Inscricao estadual do emitente pendente"));
        assertTrue(response.getPendenciasFiscais().contains("Cidade do destinatario pendente"));
        verify(auditoriaService).registrar("Fiscal", "PREPARAR_HOMOLOGACAO", "Documento fiscal preparado para homologacao", response.getId());
    }

    @Test
    void deveListarDocumentosAgrupadosPorPedido() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setPendenciasFiscais("NCM pendente");
        when(documentoFiscalRepository.findByPedidoIdsOrderByPedidoAndCriadoEmDesc(List.of(documento.getPedido().getId())))
                .thenReturn(List.of(documento));

        Map<UUID, List<DocumentoFiscalResumoResponse>> response = service.listarPorPedidos(List.of(documento.getPedido().getId()));

        assertEquals(1, response.size());
        assertEquals(documento.getId(), response.get(documento.getPedido().getId()).getFirst().getId());
        assertEquals(false, response.get(documento.getPedido().getId()).getFirst().getPossuiPayloadJson());
        assertEquals(true, response.get(documento.getPedido().getId()).getFirst().getPossuiPendenciasFiscais());
        assertEquals(0, response.get(documento.getPedido().getId()).getFirst().getTotalArquivosDisponiveis());
        assertEquals(1, response.get(documento.getPedido().getId()).getFirst().getTotalPendenciasFiscais());
    }

    @Test
    void deveRetornarMapaVazioSemPedidos() {
        Map<UUID, List<DocumentoFiscalResumoResponse>> response = service.listarPorPedidos(List.of());

        assertTrue(response.isEmpty());
        verify(documentoFiscalRepository, never()).findByPedidoIdsOrderByPedidoAndCriadoEmDesc(any());
    }

    @Test
    void deveBuscarDocumentoCompletoPorId() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setXmlEnvio("<xml />");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        DocumentoFiscalResponse response = service.buscar(documento.getId());

        assertEquals(documento.getId(), response.getId());
        assertEquals("<xml />", response.getXmlEnvio());
    }

    @Test
    void deveConsultarSituacaoDaHomologacaoFiscal() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.AUTORIZADO);
        documento.setPayloadJson("{\"numero\":10}");
        documento.setXmlEnvio("<xmlEnvio />");
        documento.setXmlRetorno("<xmlRetorno />");
        documento.setChaveAcesso("CHAVE-123");
        documento.setProtocolo("PROTO-123");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        DocumentoFiscalConsultaResponse response = service.consultarHomologacao(documento.getId());

        assertEquals(documento.getId(), response.getId());
        assertEquals(StatusDocumentoFiscal.AUTORIZADO, response.getStatus());
        assertEquals(true, response.getAutorizado());
        assertEquals(true, response.getPossuiChaveAcesso());
        assertEquals(true, response.getPossuiProtocolo());
        assertEquals(true, response.getPossuiXmlEnvio());
        assertEquals(true, response.getPossuiXmlRetorno());
        assertEquals(3, response.getTotalArquivosDisponiveis());
        assertEquals(0, response.getTotalPendenciasFiscais());
        assertEquals(response.getAcoesDisponiveis().size(), response.getTotalAcoesDisponiveis());
        assertTrue(response.getProximaAcao().contains("Gerar DANFE"));
        assertTrue(response.getAcoesDisponiveis().contains("Baixar XML de envio"));
        assertTrue(response.getAcoesDisponiveis().contains("Cancelar"));
        assertTrue(response.getPendenciasFiscais().isEmpty());
    }

    @Test
    void deveConsultarPendenciasFiscaisComProximaAcaoDeRevalidacao() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setPendenciasFiscais("Produto sem NCM fiscal real.\nCliente sem CEP fiscal.");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        DocumentoFiscalConsultaResponse response = service.consultarHomologacao(documento.getId());

        assertEquals(true, response.getPossuiPendenciasFiscais());
        assertEquals(2, response.getPendenciasFiscais().size());
        assertEquals(2, response.getTotalPendenciasFiscais());
        assertEquals(response.getAcoesDisponiveis().size(), response.getTotalAcoesDisponiveis());
        assertTrue(response.getProximaAcao().contains("revalidar"));
        assertTrue(response.getAcoesDisponiveis().contains("Baixar TXT de pendencias"));
    }

    @Test
    void deveGerarDossieFiscalDeHomologacao() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.AUTORIZADO);
        documento.setPayloadJson("{\"numero\":10}");
        documento.setXmlEnvio("<xmlEnvio />");
        documento.setXmlRetorno("<xmlRetorno />");
        documento.setDanfeHtml("<html>DANFE</html>");
        documento.setChaveAcesso("CHAVE-123");
        documento.setProtocolo("PROTO-123");
        documento.setCartaCorrecaoSequencia(1);
        documento.setCartaCorrecaoTexto("Corrigir informacao complementar.");
        documento.setCartaCorrecaoXml("<CartaCorrecaoHomologacao />");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        String dossie = service.gerarDossieHomologacao(documento.getId());

        assertTrue(dossie.contains("DOSSIE FISCAL DE HOMOLOGACAO"));
        assertTrue(dossie.contains("CHAVE-123"));
        assertTrue(dossie.contains("PROTO-123"));
        assertTrue(dossie.contains("Arquivos disponiveis: 5"));
        assertTrue(dossie.contains("Pendencias fiscais: 0"));
        assertTrue(dossie.contains("Acoes disponiveis:"));
        assertTrue(dossie.contains("- CC-e: SIM"));
        assertTrue(dossie.contains("Sequencia CC-e: 1"));
        assertTrue(dossie.contains("Nenhuma pendencia fiscal persistida"));
    }

    @Test
    void deveGerarChecklistDeEmissaoFiscalReal() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setXmlEnvio(xmlHomologacaoValido());
        documento.setConfiguracaoFiscal(configuracao(documento.getEmpresa()));
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        String checklist = service.gerarChecklistEmissaoReal(documento.getId());

        assertTrue(checklist.contains("CHECKLIST DE EMISSAO FISCAL REAL"));
        assertTrue(checklist.contains("Prontidao estimada"));
        assertTrue(checklist.contains("Itens prontos:"));
        assertTrue(checklist.contains("Pendencias:"));
        assertTrue(checklist.contains("Proxima acao: Criar/selecionar configuracao fiscal de PRODUCAO"));
        assertTrue(checklist.contains("XML de envio gerado"));
        assertTrue(checklist.contains("Criar/selecionar configuracao fiscal de PRODUCAO"));
        assertTrue(checklist.contains("Informar endpoint de producao"));
    }

    @Test
    void deveConsultarStatusEstruturadoDeEmissaoFiscalReal() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setXmlEnvio(xmlHomologacaoValido());
        documento.setConfiguracaoFiscal(configuracao(documento.getEmpresa()));
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        DocumentoFiscalEmissaoRealStatusResponse response = service.statusEmissaoReal(documento.getId());

        assertEquals(false, response.getProntoEmissaoReal());
        assertTrue(response.getPercentualProntidao() > 0);
        assertTrue(response.getItensProntos().contains("XML de envio gerado"));
        assertTrue(response.getPendencias().contains("Criar/selecionar configuracao fiscal de PRODUCAO para emissao oficial."));
        assertEquals(response.getItensProntos().size(), response.getTotalItensProntos());
        assertEquals(response.getPendencias().size(), response.getTotalPendencias());
        assertEquals(response.getItensProntos().size(), response.getItensProntos().stream().distinct().count());
        assertEquals(response.getPendencias().size(), response.getPendencias().stream().distinct().count());
        assertEquals(response.getPendenciasExternas().size(), response.getTotalPendenciasExternas());
        assertTrue(response.getPendenciasExternas().stream().anyMatch(item -> item.contains("credenciamento fiscal")));
        assertTrue(response.getPendenciasExternas().stream().anyMatch(item -> item.contains("contador")));
        assertTrue(response.getProximaAcao().contains("PRODUCAO"));
    }

    @Test
    void deveBloquearEmissaoRealComCertificadoVencendoEmAteTrintaDias() {
        DocumentoFiscal documento = documentoPreparado();
        ConfiguracaoFiscal configuracao = configuracao(documento.getEmpresa());
        configuracao.setAmbiente(AmbienteFiscal.PRODUCAO);
        configuracao.setEndpointProducao("https://producao.sefaz.example");
        configuracao.setProvedorTokenEnv("FISCAL_PROVIDER_TOKEN");
        configuracao.setCertificadoValidoAte(LocalDate.now().plusDays(10));
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setXmlEnvio(xmlHomologacaoValido());
        documento.setConfiguracaoFiscal(configuracao);
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        DocumentoFiscalEmissaoRealStatusResponse response = service.statusEmissaoReal(documento.getId());

        assertEquals(false, response.getProntoEmissaoReal());
        assertTrue(response.getItensProntos().contains("Validade do certificado A1 informada"));
        assertTrue(response.getPendencias().contains("Certificado A1 vencido ou vencendo em ate 30 dias; renovar antes da emissao real."));
    }

    @Test
    void deveGerarPacoteDeEmissaoFiscalReal() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setPayloadJson("{\"numero\":10}");
        documento.setXmlEnvio(xmlHomologacaoValido());
        documento.setConfiguracaoFiscal(configuracao(documento.getEmpresa()));
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        DocumentoFiscalPacoteEmissaoRealResponse response = service.pacoteEmissaoReal(documento.getId());

        assertEquals(documento.getId(), response.getId());
        assertEquals(ModeloDocumentoFiscal.NFE, response.getModelo());
        assertEquals("{\"numero\":10}", response.getPayloadJson());
        assertEquals(xmlHomologacaoValido(), response.getXmlEnvio());
        assertEquals(64, response.getPayloadJsonSha256().length());
        assertEquals(64, response.getXmlEnvioSha256().length());
        assertTrue(response.getPacoteReferencia().startsWith("nexus-one://pacote-emissao-real/"));
        assertEquals(false, response.getProntoEmissaoReal());
        assertTrue(response.getPendencias().contains("Criar/selecionar configuracao fiscal de PRODUCAO para emissao oficial."));
        assertEquals(response.getItensProntos().size(), response.getTotalItensProntos());
        assertEquals(response.getPendencias().size(), response.getTotalPendencias());
        assertEquals(response.getPendenciasExternas().size(), response.getTotalPendenciasExternas());
        assertTrue(response.getPendenciasExternas().stream().anyMatch(item -> item.contains("SEFAZ")));
        assertTrue(response.getProximaAcao().contains("PRODUCAO"));
        assertTrue(response.getObservacao().contains("nao transmite"));
    }

    @Test
    void deveGerarManifestoDeIntegridadeDoPacoteReal() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setPayloadJson("{\"numero\":10}");
        documento.setXmlEnvio(xmlHomologacaoValido());
        documento.setConfiguracaoFiscal(configuracao(documento.getEmpresa()));
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        String manifesto = service.gerarManifestoPacoteEmissaoReal(documento.getId());

        assertTrue(manifesto.contains("MANIFESTO DE INTEGRIDADE"));
        assertTrue(manifesto.contains("nexus-one://pacote-emissao-real/"));
        assertTrue(manifesto.contains("Payload SHA-256: "));
        assertTrue(manifesto.contains("XML SHA-256: "));
        assertTrue(manifesto.contains("Itens prontos:"));
        assertTrue(manifesto.contains("Pendencias:"));
        assertTrue(manifesto.contains("Proxima acao: Criar/selecionar configuracao fiscal de PRODUCAO"));
        assertTrue(manifesto.contains("Criar/selecionar configuracao fiscal de PRODUCAO"));
    }

    @Test
    void deveValidarIntegridadeDoPacoteReal() {
        DocumentoFiscal documento = documentoPreparado();
        ConfiguracaoFiscal configuracao = configuracao(documento.getEmpresa());
        configuracao.setAmbiente(AmbienteFiscal.PRODUCAO);
        configuracao.setEndpointProducao("https://producao.sefaz.example");
        configuracao.setProvedorTokenEnv("FISCAL_PROVIDER_TOKEN");
        configuracao.setCertificadoValidoAte(LocalDate.now().plusDays(60));
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setPayloadJson("{\"numero\":10}");
        documento.setXmlEnvio(xmlHomologacaoValido());
        documento.setConfiguracaoFiscal(configuracao);
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        DocumentoFiscalPacoteIntegridadeResponse response = service.validarIntegridadePacoteEmissaoReal(documento.getId());

        assertEquals(true, response.getValido());
        assertEquals(64, response.getPayloadJsonSha256().length());
        assertEquals(64, response.getXmlEnvioSha256().length());
        assertTrue(response.getPacoteReferencia().startsWith("nexus-one://pacote-emissao-real/"));
        assertTrue(response.getPendencias().isEmpty());
        assertTrue(response.getTotalItensProntos() > 0);
        assertEquals(0, response.getTotalPendencias());
        assertEquals(100, response.getPercentualProntidao());
        assertTrue(response.getProximaAcao().contains("Pacote integro"));
    }

    @Test
    void deveInvalidarIntegridadeDoPacoteRealComPendenciasDoChecklist() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setPayloadJson("{\"numero\":10}");
        documento.setXmlEnvio(xmlHomologacaoValido());
        documento.setConfiguracaoFiscal(configuracao(documento.getEmpresa()));
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        DocumentoFiscalPacoteIntegridadeResponse response = service.validarIntegridadePacoteEmissaoReal(documento.getId());

        assertEquals(false, response.getValido());
        assertTrue(response.getPendencias().contains("Criar/selecionar configuracao fiscal de PRODUCAO para emissao oficial."));
        assertEquals(response.getPendencias().size(), response.getTotalPendencias());
        assertTrue(response.getPercentualProntidao() < 100);
        assertTrue(response.getProximaAcao().contains("PRODUCAO"));
    }

    @Test
    void deveApontarPacoteRealIncompletoSemXml() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setPayloadJson("{\"numero\":10}");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        DocumentoFiscalPacoteIntegridadeResponse response = service.validarIntegridadePacoteEmissaoReal(documento.getId());

        assertEquals(false, response.getValido());
        assertTrue(response.getPendencias().contains("XML de envio fiscal ainda nao foi gerado."));
        assertEquals(response.getPendencias().size(), response.getTotalPendencias());
        assertEquals(response.getPendencias().size(), response.getPendencias().stream().distinct().count());
        assertTrue(response.getProximaAcao().contains("XML de envio fiscal"));
    }

    @Test
    void deveBloquearConfiguracaoComPendencias() {
        Empresa empresa = empresa();
        Pedido pedido = pedido(empresa);
        ConfiguracaoFiscal configuracao = configuracao(empresa);
        DocumentoFiscalHomologacaoRequest request = request(pedido.getId(), configuracao.getId());
        when(pedidoRepository.findDetailedByIdAndEmpresaId(pedido.getId(), empresa.getId())).thenReturn(Optional.of(pedido));
        when(configuracaoFiscalRepository.findById(configuracao.getId())).thenReturn(Optional.of(configuracao));
        when(configuracaoFiscalService.status(configuracao.getId())).thenReturn(
                ConfiguracaoFiscalStatusResponse.builder()
                        .id(configuracao.getId())
                        .prontoHomologacao(false)
                        .pendencias(List.of("Informar o endpoint do ambiente fiscal."))
                        .build()
        );

        assertThrows(BusinessException.class, () -> service.prepararHomologacao(request));

        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveBloquearPreparacaoDeHomologacaoComConfiguracaoDeProducao() {
        Empresa empresa = empresa();
        Pedido pedido = pedido(empresa);
        ConfiguracaoFiscal configuracao = configuracao(empresa);
        configuracao.setAmbiente(AmbienteFiscal.PRODUCAO);
        DocumentoFiscalHomologacaoRequest request = request(pedido.getId(), configuracao.getId());
        when(pedidoRepository.findDetailedByIdAndEmpresaId(pedido.getId(), empresa.getId())).thenReturn(Optional.of(pedido));
        when(configuracaoFiscalRepository.findById(configuracao.getId())).thenReturn(Optional.of(configuracao));
        when(configuracaoFiscalService.status(configuracao.getId())).thenReturn(statusPronto(configuracao));

        assertThrows(BusinessException.class, () -> service.prepararHomologacao(request));

        assertEquals(10L, configuracao.getProximoNumero());
        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveAutorizarDocumentoPreparadoEmHomologacao() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        DocumentoFiscalRetornoRequest request = new DocumentoFiscalRetornoRequest();
        request.setProtocolo("PROTO-123");
        request.setMensagemRetorno("Autorizado no provedor homologacao.");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.autorizarHomologacao(documento.getId(), request);

        assertEquals(StatusDocumentoFiscal.AUTORIZADO, response.getStatus());
        assertEquals("PROTO-123", response.getProtocolo());
        assertEquals("Autorizado no provedor homologacao.", response.getMensagemRetorno());
        assertTrue(response.getChaveAcesso().startsWith("HOM"));
        assertTrue(response.getXmlRetorno().contains("<Status>AUTORIZADO</Status>"));
        assertTrue(response.getXmlRetorno().contains("<Protocolo>PROTO-123</Protocolo>"));
        verify(auditoriaService).registrar("Fiscal", "AUTORIZAR_HOMOLOGACAO", "Documento fiscal autorizado em homologacao", response.getId());
    }

    @Test
    void deveGerarXmlHomologacaoEDefinirProcessamento() {
        DocumentoFiscal documento = documentoPreparado();
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.gerarXmlHomologacao(documento.getId());

        assertEquals(StatusDocumentoFiscal.EM_PROCESSAMENTO, response.getStatus());
        assertTrue(response.getXmlEnvio().contains("<NFeHomologacao>"));
        assertTrue(response.getXmlEnvio().contains("<Pedido>PED-1</Pedido>"));
        assertTrue(response.getXmlEnvio().contains("<Emitente>"));
        assertTrue(response.getXmlEnvio().contains("<Destinatario>"));
        assertTrue(response.getXmlEnvio().contains("<CodigoMunicipio>"));
        assertTrue(response.getXmlEnvio().contains("<InscricaoEstadual>"));
        assertTrue(response.getXmlEnvio().contains("<Crt>"));
        assertTrue(response.getXmlEnvio().contains("<Ncm>PENDENTE</Ncm>"));
        assertTrue(response.getXmlEnvio().contains("<Cfop>PENDENTE</Cfop>"));
        assertTrue(response.getXmlEnvio().contains("sem NCM fiscal real"));
        assertTrue(response.getPendenciasFiscais().contains("sem NCM fiscal real"));
        assertTrue(response.getXmlEnvio().contains("<DanfePendente>true</DanfePendente>"));
        assertTrue(response.getXmlEnvio().contains("<AssinaturaHomologacao>"));
        assertTrue(response.getXmlEnvio().contains("<Digest>"));
        assertEquals("XML de homologacao gerado e aguardando transmissao externa.", response.getMensagemRetorno());
        verify(auditoriaService).registrar("Fiscal", "GERAR_XML_HOMOLOGACAO", "XML fiscal de homologacao gerado", response.getId());
    }

    @Test
    void deveUsarCamposFiscaisDoProdutoNoXmlHomologacao() {
        DocumentoFiscal documento = documentoPreparado();
        Produto produto = documento.getPedido().getItens().getFirst().getProduto();
        produto.setNcm("84713012");
        produto.setCfop("5102");
        produto.setCest("0100100");
        produto.setOrigemFiscal("0");
        produto.setUnidadeComercial("UN");
        produto.setCstIcms("000");
        produto.setCsosn("102");
        produto.setAliquotaIcms(BigDecimal.valueOf(18));
        produto.setAliquotaPis(BigDecimal.valueOf(1.65));
        produto.setAliquotaCofins(BigDecimal.valueOf(7.6));
        produto.setAliquotaIpi(BigDecimal.ZERO);
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.gerarXmlHomologacao(documento.getId());

        assertTrue(response.getXmlEnvio().contains("<Ncm>84713012</Ncm>"));
        assertTrue(response.getXmlEnvio().contains("<Cfop>5102</Cfop>"));
        assertTrue(response.getXmlEnvio().contains("<Cest>0100100</Cest>"));
        assertTrue(response.getXmlEnvio().contains("<OrigemFiscal>0</OrigemFiscal>"));
        assertTrue(response.getXmlEnvio().contains("<UnidadeComercial>UN</UnidadeComercial>"));
        assertTrue(response.getXmlEnvio().contains("<Tributacao>"));
        assertTrue(response.getXmlEnvio().contains("<CstIcms>000</CstIcms>"));
        assertTrue(response.getXmlEnvio().contains("<Csosn>102</Csosn>"));
        assertTrue(response.getXmlEnvio().contains("<AliquotaIcms>18</AliquotaIcms>"));
        assertTrue(response.getXmlEnvio().contains("<AliquotaPis>1.65</AliquotaPis>"));
        assertTrue(response.getXmlEnvio().contains("<AliquotaCofins>7.6</AliquotaCofins>"));
        assertTrue(response.getXmlEnvio().contains("<AliquotaIpi>0</AliquotaIpi>"));
        assertTrue(response.getXmlEnvio().contains("<PendenciasFiscais>"));
    }

    @Test
    void deveApontarDadosFiscaisMalFormatadosNasPendencias() {
        DocumentoFiscal documento = documentoPreparado();
        documento.getEmpresa().setCnpj("123");
        documento.getEmpresa().setUf("SPO");
        documento.getEmpresa().setCep("123");
        documento.getEmpresa().setCodigoMunicipio("355");
        Cliente cliente = documento.getPedido().getCliente();
        cliente.setCpf("123");
        cliente.setUf("SPO");
        cliente.setCep("123");
        cliente.setCodigoMunicipio("355");
        Produto produto = documento.getPedido().getItens().getFirst().getProduto();
        produto.setNcm("123");
        produto.setCfop("51");
        produto.setCest("123");
        produto.setOrigemFiscal("9");
        produto.setCstIcms("1");
        produto.setCsosn("12");
        produto.setAliquotaIcms(BigDecimal.valueOf(101));
        produto.setAliquotaPis(BigDecimal.valueOf(-1));
        produto.setAliquotaCofins(BigDecimal.valueOf(101));
        produto.setAliquotaIpi(BigDecimal.valueOf(-1));
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.gerarXmlHomologacao(documento.getId());

        assertTrue(response.getPendenciasFiscais().contains("CNPJ do emitente invalido"));
        assertTrue(response.getPendenciasFiscais().contains("UF do emitente invalida"));
        assertTrue(response.getPendenciasFiscais().contains("CEP do emitente invalido"));
        assertTrue(response.getPendenciasFiscais().contains("Codigo do municipio do emitente invalido"));
        assertTrue(response.getPendenciasFiscais().contains("CPF do destinatario invalido"));
        assertTrue(response.getPendenciasFiscais().contains("UF do destinatario invalida"));
        assertTrue(response.getPendenciasFiscais().contains("CEP do destinatario invalido"));
        assertTrue(response.getPendenciasFiscais().contains("Codigo do municipio do destinatario invalido"));
        assertTrue(response.getPendenciasFiscais().contains("NCM invalido"));
        assertTrue(response.getPendenciasFiscais().contains("CFOP invalido"));
        assertTrue(response.getPendenciasFiscais().contains("CEST invalido"));
        assertTrue(response.getPendenciasFiscais().contains("origem fiscal invalida"));
        assertTrue(response.getPendenciasFiscais().contains("CST ICMS invalido"));
        assertTrue(response.getPendenciasFiscais().contains("CSOSN invalido"));
        assertTrue(response.getPendenciasFiscais().contains("aliquota ICMS invalida"));
        assertTrue(response.getPendenciasFiscais().contains("aliquota PIS invalida"));
        assertTrue(response.getPendenciasFiscais().contains("aliquota COFINS invalida"));
        assertTrue(response.getPendenciasFiscais().contains("aliquota IPI invalida"));
    }

    @Test
    void deveGerarXmlHomologacaoNfceComCamposDoModelo() {
        DocumentoFiscal documento = documentoPreparado();
        ConfiguracaoFiscal configuracao = configuracao(documento.getEmpresa());
        configuracao.setModelo(ModeloDocumentoFiscal.NFCE);
        configuracao.setCscId("000001");
        configuracao.setCscTokenEnv("FISCAL_NFCE_CSC_TOKEN");
        documento.setConfiguracaoFiscal(configuracao);
        documento.setModelo(ModeloDocumentoFiscal.NFCE);
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.gerarXmlHomologacao(documento.getId());

        assertTrue(response.getXmlEnvio().contains("<NFCeHomologacao>"));
        assertTrue(response.getXmlEnvio().contains("<CscId>000001</CscId>"));
        assertTrue(response.getXmlEnvio().contains("<QrCodeHomologacao>nexus-one://nfce-homologacao/"));
        assertTrue(response.getXmlEnvio().contains("<QrCodePendente>true</QrCodePendente>"));
    }

    @Test
    void deveGerarXmlHomologacaoNfseComDadosDeServico() {
        DocumentoFiscal documento = documentoPreparado();
        documento.getEmpresa().setInscricaoMunicipal("12345");
        documento.getEmpresa().setCodigoMunicipio("3550308");
        ConfiguracaoFiscal configuracao = configuracao(documento.getEmpresa());
        configuracao.setModelo(ModeloDocumentoFiscal.NFSE);
        configuracao.setProvedor("MUNICIPAL");
        documento.setConfiguracaoFiscal(configuracao);
        documento.setModelo(ModeloDocumentoFiscal.NFSE);
        documento.setProvedor("MUNICIPAL");
        Produto servico = documento.getPedido().getItens().getFirst().getProduto();
        servico.setNcm(null);
        servico.setCfop(null);
        servico.setOrigemFiscal(null);
        servico.setCstIcms(null);
        servico.setCsosn(null);
        servico.setCodigoServicoMunicipal("14.01");
        servico.setCodigoServicoNacional("1401");
        servico.setAliquotaIss(BigDecimal.valueOf(5));
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.gerarXmlHomologacao(documento.getId());

        assertTrue(response.getXmlEnvio().contains("<NFSeHomologacao>"));
        assertTrue(response.getXmlEnvio().contains("<Provedor>MUNICIPAL</Provedor>"));
        assertTrue(response.getXmlEnvio().contains("<Servico>"));
        assertTrue(response.getXmlEnvio().contains("<CodigoServicoMunicipal>14.01</CodigoServicoMunicipal>"));
        assertTrue(response.getXmlEnvio().contains("<CodigoServicoNacional>1401</CodigoServicoNacional>"));
        assertTrue(response.getXmlEnvio().contains("<MunicipioIncidencia>3550308</MunicipioIncidencia>"));
        assertTrue(response.getXmlEnvio().contains("<AliquotaIss>5</AliquotaIss>"));
        assertTrue(response.getXmlEnvio().contains("<ServicoPendente>false</ServicoPendente>"));
        assertFalse(response.getPendenciasFiscais().contains("sem NCM fiscal real"));
        assertFalse(response.getPendenciasFiscais().contains("sem CST/CSOSN de ICMS"));
    }

    @Test
    void deveValidarXmlHomologacaoGerado() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.EM_PROCESSAMENTO);
        documento.setXmlEnvio(xmlHomologacaoValido());
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.validarXmlHomologacao(documento.getId());

        assertEquals(StatusDocumentoFiscal.XML_VALIDADO, response.getStatus());
        assertEquals("XML de homologacao validado internamente e aguardando transmissao externa.", response.getMensagemRetorno());
        verify(auditoriaService).registrar("Fiscal", "VALIDAR_XML_HOMOLOGACAO", "XML fiscal de homologacao validado", response.getId());
    }

    @Test
    void deveTransmitirHomologacaoComProvedorControlado() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setConfiguracaoFiscal(configuracao(documento.getEmpresa()));
        documento.setXmlEnvio(xmlHomologacaoValido());
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.transmitirHomologacao(documento.getId());

        assertEquals(StatusDocumentoFiscal.AUTORIZADO, response.getStatus());
        assertTrue(response.getChaveAcesso().startsWith("CTRL"));
        assertTrue(response.getProtocolo().startsWith("CTRL-NFE"));
        assertTrue(response.getXmlRetorno().contains("<RetornoTransmissaoFiscal>"));
        verify(auditoriaService).registrar(
                "Fiscal",
                "TRANSMITIR_HOMOLOGACAO_AUTORIZADA",
                "Transmissao de homologacao controlada autorizada. Substituir por provedor fiscal real.",
                response.getId()
        );
    }

    @Test
    void deveBloquearTransmissaoSemValidacaoInternaDoXml() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.EM_PROCESSAMENTO);
        documento.setConfiguracaoFiscal(configuracao(documento.getEmpresa()));
        documento.setXmlEnvio(xmlHomologacaoValido());
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        BusinessException exception = assertThrows(BusinessException.class, () -> service.transmitirHomologacao(documento.getId()));

        assertTrue(exception.getMessage().contains("XML validado internamente"));
        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveBloquearTransmissaoComPendenciasFiscais() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setConfiguracaoFiscal(configuracao(documento.getEmpresa()));
        documento.setXmlEnvio(xmlHomologacaoValido());
        documento.setPendenciasFiscais("Produto sem NCM fiscal real.");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        BusinessException exception = assertThrows(BusinessException.class, () -> service.transmitirHomologacao(documento.getId()));

        assertTrue(exception.getMessage().contains("pendencias cadastrais"));
        assertTrue(exception.getMessage().contains("Produto sem NCM fiscal real"));
        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveRevalidarPendenciasFiscaisAposCorrecaoCadastral() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setConfiguracaoFiscal(configuracao(documento.getEmpresa()));
        documento.setXmlEnvio(xmlHomologacaoValido());
        documento.setPendenciasFiscais("Produto sem NCM fiscal real.");
        completarCadastroFiscal(documento);
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.revalidarPendenciasHomologacao(documento.getId());

        assertEquals(StatusDocumentoFiscal.EM_PROCESSAMENTO, response.getStatus());
        assertEquals(null, response.getPendenciasFiscais());
        assertTrue(response.getXmlEnvio().contains("<PendenciasFiscais></PendenciasFiscais>"));
        assertTrue(response.getMensagemRetorno().contains("aguardando validacao interna"));
        verify(auditoriaService).registrar("Fiscal", "REVALIDAR_PENDENCIAS_HOMOLOGACAO", "Pendencias fiscais revalidadas", response.getId());
    }

    @Test
    void deveReprocessarDocumentoFiscalRejeitadoAposCorrecao() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.REJEITADO);
        documento.setConfiguracaoFiscal(configuracao(documento.getEmpresa()));
        documento.setChaveAcesso("CHAVE-REJEITADA");
        documento.setProtocolo("PROTO-REJEITADO");
        documento.setXmlRetorno("<retorno>rejeitado</retorno>");
        documento.setDanfeHtml("<html>antigo</html>");
        completarCadastroFiscal(documento);
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.reprocessarRejeicaoHomologacao(documento.getId());

        assertEquals(StatusDocumentoFiscal.EM_PROCESSAMENTO, response.getStatus());
        assertEquals(null, response.getChaveAcesso());
        assertEquals(null, response.getProtocolo());
        assertEquals(null, response.getXmlRetorno());
        assertEquals(null, response.getDanfeHtml());
        assertEquals(null, response.getPendenciasFiscais());
        assertTrue(response.getXmlEnvio().contains("<NFeHomologacao>"));
        assertTrue(response.getXmlEnvio().contains("<AssinaturaHomologacao>"));
        assertTrue(response.getMensagemRetorno().contains("aguardando validacao interna"));
        verify(auditoriaService).registrar("Fiscal", "REPROCESSAR_REJEICAO_HOMOLOGACAO", "Documento fiscal rejeitado reprocessado", response.getId());
    }

    @Test
    void deveBloquearReprocessamentoQuandoDocumentoNaoEstaRejeitado() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.AUTORIZADO);
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        assertThrows(BusinessException.class, () -> service.reprocessarRejeicaoHomologacao(documento.getId()));

        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void devePersistirDanfeRetornadoPeloProvedorNaTransmissao() {
        DocumentoFiscalRepository repository = mock(DocumentoFiscalRepository.class);
        AuditoriaService auditoria = mock(AuditoriaService.class);
        DocumentoFiscalService serviceComDanfe = new DocumentoFiscalService(
                repository,
                configuracaoFiscalRepository,
                pedidoRepository,
                configuracaoFiscalService,
                auditoria,
                List.of(new FiscalProvider() {
                    @Override
                    public boolean supports(ConfiguracaoFiscal configuracao) {
                        return true;
                    }

                    @Override
                    public FiscalTransmissionResult transmitirHomologacao(DocumentoFiscal documento) {
                        return new FiscalTransmissionResult(
                                true,
                                "CHAVE-HTTP-123",
                                "PROTO-HTTP-123",
                                "Autorizado pelo provedor HTTP.",
                                "<retorno />",
                                "<html>DANFE autorizado pelo provedor</html>"
                        );
                    }
                }),
                new ControlledFiscalXmlSigner(fiscalSecretResolver)
        );
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setXmlEnvio(xmlHomologacaoValido());
        when(repository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(repository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = serviceComDanfe.transmitirHomologacao(documento.getId());

        assertEquals(StatusDocumentoFiscal.AUTORIZADO, response.getStatus());
        assertEquals("CHAVE-HTTP-123", response.getChaveAcesso());
        assertEquals("PROTO-HTTP-123", response.getProtocolo());
        assertEquals("<html>DANFE autorizado pelo provedor</html>", response.getDanfeHtml());
        verify(auditoria).registrar(
                "Fiscal",
                "TRANSMITIR_HOMOLOGACAO_AUTORIZADA",
                "Autorizado pelo provedor HTTP.",
                response.getId()
        );
    }

    @Test
    void deveRegistrarContingenciaComXmlEmProcessamento() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setXmlEnvio(xmlHomologacaoValido());
        DocumentoFiscalRetornoRequest request = new DocumentoFiscalRetornoRequest();
        request.setMensagemRetorno("Provedor fiscal indisponivel.");
        request.setObservacao("Regularizar quando o servico voltar.");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.contingenciaHomologacao(documento.getId(), request);

        assertEquals(StatusDocumentoFiscal.CONTINGENCIA, response.getStatus());
        assertEquals("Provedor fiscal indisponivel.", response.getMensagemRetorno());
        assertEquals("Regularizar quando o servico voltar.", response.getObservacao());
        assertTrue(response.getXmlRetorno().contains("<Status>CONTINGENCIA</Status>"));
        verify(auditoriaService).registrar("Fiscal", "CONTINGENCIA_HOMOLOGACAO", "Provedor fiscal indisponivel.", response.getId());
    }

    @Test
    void deveRegularizarContingenciaEmHomologacao() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.CONTINGENCIA);
        documento.setXmlEnvio(xmlHomologacaoValido());
        documento.setMensagemRetorno("Provedor fiscal indisponivel.");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.regularizarContingenciaHomologacao(documento.getId());

        assertEquals(StatusDocumentoFiscal.AUTORIZADO, response.getStatus());
        assertTrue(response.getChaveAcesso().startsWith("CTRL"));
        assertTrue(response.getProtocolo().startsWith("CTRL-NFE"));
        assertTrue(response.getXmlRetorno().contains("<RetornoTransmissaoFiscal>"));
        verify(auditoriaService).registrar(
                eq("Fiscal"),
                eq("REGULARIZAR_CONTINGENCIA_HOMOLOGACAO"),
                contains("Transmissao de homologacao controlada autorizada"),
                eq(response.getId())
        );
    }

    @Test
    void deveGerarDanfeDeContingenciaSemProtocolo() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.CONTINGENCIA);
        documento.setChaveAcesso(null);
        documento.setProtocolo(null);
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.gerarDanfeHomologacao(documento.getId());

        assertEquals(StatusDocumentoFiscal.CONTINGENCIA, response.getStatus());
        assertTrue(response.getDanfeHtml().contains("Contingencia"));
        assertTrue(response.getDanfeHtml().contains("regularizacao posterior"));
    }

    @Test
    void deveBloquearValidacaoXmlSemEstruturaObrigatoria() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.EM_PROCESSAMENTO);
        documento.setXmlEnvio("<NFeHomologacao><Modelo>NFE</Modelo></NFeHomologacao>");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        assertThrows(BusinessException.class, () -> service.validarXmlHomologacao(documento.getId()));

        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveBloquearValidacaoXmlSemTributacaoDoItem() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.EM_PROCESSAMENTO);
        documento.setXmlEnvio(xmlHomologacaoValido().replace("<Tributacao>", "<TributacaoAusente>"));
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        BusinessException exception = assertThrows(BusinessException.class, () -> service.validarXmlHomologacao(documento.getId()));

        assertTrue(exception.getMessage().contains("<Tributacao>"));
        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveBloquearGeracaoXmlQuandoDocumentoNaoEstaPreparado() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.AUTORIZADO);
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        assertThrows(BusinessException.class, () -> service.gerarXmlHomologacao(documento.getId()));

        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveGerarDanfeHomologacaoParaDocumentoAutorizado() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.AUTORIZADO);
        documento.setChaveAcesso("HOM123");
        documento.setProtocolo("PROTO-123");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.gerarDanfeHomologacao(documento.getId());

        assertEquals(StatusDocumentoFiscal.AUTORIZADO, response.getStatus());
        assertTrue(response.getDanfeHtml().contains("DANFE Homologacao"));
        assertTrue(response.getDanfeHtml().contains("SEM VALOR FISCAL"));
        assertTrue(response.getDanfeHtml().contains("HOM123"));
        assertEquals("Documento auxiliar de homologacao gerado para conferencia.", response.getMensagemRetorno());
        verify(auditoriaService).registrar("Fiscal", "GERAR_DANFE_HOMOLOGACAO", "Documento auxiliar fiscal de homologacao gerado", response.getId());
    }

    @Test
    void deveGerarDanfceComQrCodeHomologacao() {
        DocumentoFiscal documento = documentoPreparado();
        ConfiguracaoFiscal configuracao = configuracao(documento.getEmpresa());
        configuracao.setModelo(ModeloDocumentoFiscal.NFCE);
        configuracao.setCscId("000001");
        documento.setConfiguracaoFiscal(configuracao);
        documento.setModelo(ModeloDocumentoFiscal.NFCE);
        documento.setStatus(StatusDocumentoFiscal.AUTORIZADO);
        documento.setChaveAcesso("HOM-NFCE");
        documento.setProtocolo("PROTO-NFCE");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.gerarDanfeHomologacao(documento.getId());

        assertTrue(response.getDanfeHtml().contains("DANFCE Homologacao"));
        assertTrue(response.getDanfeHtml().contains("QR Code NFC-e"));
        assertTrue(response.getDanfeHtml().contains("nexus-one://nfce-homologacao/"));
    }

    @Test
    void deveBloquearDanfeHomologacaoParaDocumentoNaoAutorizado() {
        DocumentoFiscal documento = documentoPreparado();
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        assertThrows(BusinessException.class, () -> service.gerarDanfeHomologacao(documento.getId()));

        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveRejeitarDocumentoPreparadoEmHomologacao() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        DocumentoFiscalRetornoRequest request = new DocumentoFiscalRetornoRequest();
        request.setMensagemRetorno("CFOP invalido.");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.rejeitarHomologacao(documento.getId(), request);

        assertEquals(StatusDocumentoFiscal.REJEITADO, response.getStatus());
        assertEquals("CFOP invalido.", response.getMensagemRetorno());
        assertTrue(response.getXmlRetorno().contains("<Status>REJEITADO</Status>"));
        assertTrue(response.getXmlRetorno().contains("<Mensagem>CFOP invalido.</Mensagem>"));
        verify(auditoriaService).registrar("Fiscal", "REJEITAR_HOMOLOGACAO", "Documento fiscal rejeitado em homologacao", response.getId());
    }

    @Test
    void deveBloquearRetornoManualSemValidacaoInternaDoXml() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.EM_PROCESSAMENTO);
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        BusinessException exception = assertThrows(BusinessException.class, () -> service.autorizarHomologacao(documento.getId(), new DocumentoFiscalRetornoRequest()));

        assertTrue(exception.getMessage().contains("XML validado internamente"));
        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveBloquearRetornoManualComPendenciasFiscais() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        documento.setPendenciasFiscais("Cliente sem codigo municipio.");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        BusinessException exception = assertThrows(BusinessException.class, () -> service.autorizarHomologacao(documento.getId(), new DocumentoFiscalRetornoRequest()));

        assertTrue(exception.getMessage().contains("pendencias cadastrais"));
        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveBloquearRetornoDeDocumentoJaAutorizado() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.AUTORIZADO);
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        assertThrows(BusinessException.class, () -> service.rejeitarHomologacao(documento.getId(), new DocumentoFiscalRetornoRequest()));

        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveCancelarDocumentoAutorizadoEmHomologacao() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.AUTORIZADO);
        DocumentoFiscalRetornoRequest request = new DocumentoFiscalRetornoRequest();
        request.setMensagemRetorno("Cancelado por erro operacional.");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.cancelarHomologacao(documento.getId(), request);

        assertEquals(StatusDocumentoFiscal.CANCELADO, response.getStatus());
        assertEquals("Cancelado por erro operacional.", response.getMensagemRetorno());
        assertTrue(response.getXmlRetorno().contains("<Status>CANCELADO</Status>"));
        verify(auditoriaService).registrar("Fiscal", "CANCELAR_HOMOLOGACAO", "Documento fiscal cancelado em homologacao", response.getId());
    }

    @Test
    void deveBloquearCancelamentoDeDocumentoNaoAutorizado() {
        DocumentoFiscal documento = documentoPreparado();
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        assertThrows(BusinessException.class, () -> service.cancelarHomologacao(documento.getId(), new DocumentoFiscalRetornoRequest()));

        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveRegistrarCartaCorrecaoParaNfeAutorizada() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.AUTORIZADO);
        documento.setChaveAcesso("CHAVE-NFE-123");
        documento.setProtocolo("PROTO-123");
        DocumentoFiscalCartaCorrecaoRequest request = new DocumentoFiscalCartaCorrecaoRequest();
        request.setTextoCorrecao("Corrigir informacao complementar do endereco de entrega.");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.emitirCartaCorrecaoHomologacao(documento.getId(), request);

        assertEquals(StatusDocumentoFiscal.AUTORIZADO, response.getStatus());
        assertEquals(1, response.getCartaCorrecaoSequencia());
        assertEquals(request.getTextoCorrecao(), response.getCartaCorrecaoTexto());
        assertTrue(response.getCartaCorrecaoXml().contains("<CartaCorrecaoHomologacao>"));
        assertTrue(response.getCartaCorrecaoXml().contains("<ChaveAcesso>CHAVE-NFE-123</ChaveAcesso>"));
        assertTrue(response.getCartaCorrecaoXml().contains("<SequenciaEvento>1</SequenciaEvento>"));
        verify(auditoriaService).registrar("Fiscal", "CARTA_CORRECAO_HOMOLOGACAO", "Carta de correcao fiscal registrada em homologacao", response.getId());
    }

    @Test
    void deveBloquearCartaCorrecaoSemNfeAutorizada() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.XML_VALIDADO);
        DocumentoFiscalCartaCorrecaoRequest request = new DocumentoFiscalCartaCorrecaoRequest();
        request.setTextoCorrecao("Corrigir informacao complementar do endereco de entrega.");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        assertThrows(BusinessException.class, () -> service.emitirCartaCorrecaoHomologacao(documento.getId(), request));

        verify(documentoFiscalRepository, never()).save(any());
    }

    @Test
    void deveInutilizarDocumentoRejeitadoEmHomologacao() {
        DocumentoFiscal documento = documentoPreparado();
        documento.setStatus(StatusDocumentoFiscal.REJEITADO);
        DocumentoFiscalRetornoRequest request = new DocumentoFiscalRetornoRequest();
        request.setMensagemRetorno("Inutilizado apos rejeicao controlada.");
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));
        when(documentoFiscalRepository.save(any(DocumentoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentoFiscalResponse response = service.inutilizarHomologacao(documento.getId(), request);

        assertEquals(StatusDocumentoFiscal.INUTILIZADO, response.getStatus());
        assertEquals("Inutilizado apos rejeicao controlada.", response.getMensagemRetorno());
        assertTrue(response.getXmlRetorno().contains("<Status>INUTILIZADO</Status>"));
        verify(auditoriaService).registrar("Fiscal", "INUTILIZAR_HOMOLOGACAO", "Numeracao fiscal inutilizada em homologacao", response.getId());
    }

    @Test
    void deveBloquearInutilizacaoDeDocumentoNaoRejeitado() {
        DocumentoFiscal documento = documentoPreparado();
        when(documentoFiscalRepository.findById(documento.getId())).thenReturn(Optional.of(documento));

        assertThrows(BusinessException.class, () -> service.inutilizarHomologacao(documento.getId(), new DocumentoFiscalRetornoRequest()));

        verify(documentoFiscalRepository, never()).save(any());
    }

    private DocumentoFiscalHomologacaoRequest request(UUID pedidoId, UUID configuracaoId) {
        DocumentoFiscalHomologacaoRequest request = new DocumentoFiscalHomologacaoRequest();
        request.setPedidoId(pedidoId);
        request.setConfiguracaoFiscalId(configuracaoId);
        request.setModelo(ModeloDocumentoFiscal.NFE);
        return request;
    }

    private ConfiguracaoFiscalStatusResponse statusPronto(ConfiguracaoFiscal configuracao) {
        return ConfiguracaoFiscalStatusResponse.builder()
                .id(configuracao.getId())
                .prontoHomologacao(true)
                .status("PRONTO_HOMOLOGACAO")
                .pendencias(List.of())
                .build();
    }

    private Empresa empresa() {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        empresa.setNome("Empresa Fiscal");
        empresa.setRazaoSocial("Empresa Fiscal LTDA");
        empresa.setCnpj("12345678000190");
        empresa.setUf("SP");
        return empresa;
    }

    private Pedido pedido(Empresa empresa) {
        Pedido pedido = new Pedido();
        pedido.setId(UUID.randomUUID());
        pedido.setNumero("PED-1");
        pedido.setEmpresa(empresa);
        pedido.setCliente(cliente());
        pedido.setValorTotalPedido(BigDecimal.valueOf(100));

        Produto produto = new Produto();
        produto.setIdProduto(UUID.randomUUID());
        produto.setNomeProduto("Produto Fiscal");
        produto.setDescricao("Descricao fiscal do produto");
        produto.setSku("SKU-1");
        produto.setCodBarras("789000000001");

        ItemPedido item = new ItemPedido();
        item.setProduto(produto);
        item.setQuantidade(2);
        item.setPrecoUnit(BigDecimal.valueOf(50));
        pedido.adicionarItem(item);
        return pedido;
    }

    private Cliente cliente() {
        Cliente cliente = new Cliente();
        cliente.setIdCliente(UUID.randomUUID());
        cliente.setNome("Cliente Fiscal");
        cliente.setCpf("12345678909");
        cliente.setEmail("cliente@nexus.test");
        cliente.setTelefone("11999999999");
        cliente.setEndereco("Rua Fiscal");
        return cliente;
    }

    private ConfiguracaoFiscal configuracao(Empresa empresa) {
        ConfiguracaoFiscal configuracao = new ConfiguracaoFiscal();
        configuracao.setId(UUID.randomUUID());
        configuracao.setEmpresa(empresa);
        configuracao.setModelo(ModeloDocumentoFiscal.NFE);
        configuracao.setAmbiente(AmbienteFiscal.HOMOLOGACAO);
        configuracao.setAtivo(true);
        configuracao.setSerie("1");
        configuracao.setProximoNumero(10L);
        configuracao.setProvedor("SEFAZ");
        configuracao.setCertificadoAlias("certificado-a1");
        configuracao.setCertificadoArquivoEnv("FISCAL_CERT_FILE");
        configuracao.setCertificadoSenhaEnv("FISCAL_CERT_PASSWORD");
        configuracao.setEndpointHomologacao("https://homologacao.sefaz.example");
        return configuracao;
    }

    private DocumentoFiscal documentoPreparado() {
        Empresa empresa = empresa();
        Pedido pedido = pedido(empresa);
        DocumentoFiscal documento = new DocumentoFiscal();
        documento.setId(UUID.randomUUID());
        documento.setEmpresa(empresa);
        documento.setPedido(pedido);
        documento.setModelo(ModeloDocumentoFiscal.NFE);
        documento.setAmbiente(AmbienteFiscal.HOMOLOGACAO);
        documento.setStatus(StatusDocumentoFiscal.PREPARADO_HOMOLOGACAO);
        documento.setSerie("1");
        documento.setNumero(10L);
        documento.setConfiguracaoFiscal(configuracao(empresa));
        return documento;
    }

    private void completarCadastroFiscal(DocumentoFiscal documento) {
        Empresa empresa = documento.getEmpresa();
        empresa.setInscricaoEstadual("123456789");
        empresa.setCrt("1");
        empresa.setCep("01001000");
        empresa.setCodigoMunicipio("3550308");
        Cliente cliente = documento.getPedido().getCliente();
        cliente.setCidade("Sao Paulo");
        cliente.setUf("SP");
        cliente.setCep("01001000");
        cliente.setCodigoMunicipio("3550308");
        Produto produto = documento.getPedido().getItens().getFirst().getProduto();
        produto.setNcm("84713012");
        produto.setCfop("5102");
        produto.setOrigemFiscal("0");
        produto.setCstIcms("000");
    }

    private String xmlHomologacaoValido() {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<NFeHomologacao>"
                + "<Modelo>NFE</Modelo>"
                + "<Ambiente>HOMOLOGACAO</Ambiente>"
                + "<Serie>1</Serie>"
                + "<Numero>10</Numero>"
                + "<Pedido>PED-1</Pedido>"
                + "<Emitente><Nome>Empresa Fiscal</Nome></Emitente>"
                + "<Destinatario><Nome>Cliente Fiscal</Nome></Destinatario>"
                + "<Itens>"
                + "<Item>"
                + "<Produto>Produto Fiscal</Produto>"
                + "<Descricao>Descricao fiscal</Descricao>"
                + "<Sku>SKU-1</Sku>"
                + "<CodigoBarras>789000000001</CodigoBarras>"
                + "<Ncm>84713012</Ncm>"
                + "<Cfop>5102</Cfop>"
                + "<Cest></Cest>"
                + "<OrigemFiscal>0</OrigemFiscal>"
                + "<UnidadeComercial>UN</UnidadeComercial>"
                + "<Tributacao>"
                + "<CstIcms>000</CstIcms>"
                + "<Csosn>102</Csosn>"
                + "<AliquotaIcms>18</AliquotaIcms>"
                + "<AliquotaPis>1.65</AliquotaPis>"
                + "<AliquotaCofins>7.6</AliquotaCofins>"
                + "<AliquotaIpi>0</AliquotaIpi>"
                + "<CodigoServicoMunicipal></CodigoServicoMunicipal>"
                + "<CodigoServicoNacional></CodigoServicoNacional>"
                + "<AliquotaIss></AliquotaIss>"
                + "</Tributacao>"
                + "<Quantidade>2</Quantidade>"
                + "<PrecoUnit>50</PrecoUnit>"
                + "<Total>100</Total>"
                + "</Item>"
                + "</Itens>"
                + "<PendenciasFiscais></PendenciasFiscais>"
                + "<NFe><DanfePendente>true</DanfePendente></NFe>"
                + "<AssinaturaHomologacao><Digest>abc</Digest><AssinaturaRealPendente>true</AssinaturaRealPendente></AssinaturaHomologacao>"
                + "</NFeHomologacao>";
    }
}
