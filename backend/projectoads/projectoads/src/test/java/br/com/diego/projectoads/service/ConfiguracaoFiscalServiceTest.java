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
import br.com.diego.projectoads.service.fiscal.ControlledFiscalServiceStatusChecker;
import br.com.diego.projectoads.service.fiscal.FiscalSecretResolver;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ConfiguracaoFiscalServiceTest {

    private final ConfiguracaoFiscalRepository configuracaoFiscalRepository = mock(ConfiguracaoFiscalRepository.class);
    private final EmpresaRepository empresaRepository = mock(EmpresaRepository.class);
    private final FilialRepository filialRepository = mock(FilialRepository.class);
    private final ConfiguracaoFiscalService service = new ConfiguracaoFiscalService(
            configuracaoFiscalRepository,
            empresaRepository,
            filialRepository,
            new FiscalSecretResolver(Map.of(
                    "FISCAL_CERT_FILE", "C:\\certificados\\homologacao.pfx",
                    "FISCAL_CERT_PASSWORD", "senha-homologacao",
                    "FISCAL_NFCE_CSC_TOKEN", "token-homologacao"
            )),
            new ControlledFiscalServiceStatusChecker()
    );

    @Test
    void deveCriarConfiguracaoFiscalComDefaultsSeguros() {
        Empresa empresa = empresa("Empresa Fiscal");
        ConfiguracaoFiscalRequest request = request(empresa.getId(), null, ModeloDocumentoFiscal.NFE);
        request.setSerie(" 1 ");
        request.setCertificadoArquivoEnv(" FISCAL_CERT_FILE ");
        request.setCertificadoSenhaEnv(" FISCAL_CERT_PASSWORD ");
        request.setCertificadoValidoAte(LocalDate.now().plusYears(1));
        when(empresaRepository.findById(empresa.getId())).thenReturn(Optional.of(empresa));
        when(configuracaoFiscalRepository.findFirstByEmpresaIdAndFilialIsNullAndModelo(empresa.getId(), ModeloDocumentoFiscal.NFE))
                .thenReturn(Optional.empty());
        when(configuracaoFiscalRepository.save(any(ConfiguracaoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ConfiguracaoFiscalResponse response = service.salvar(request);

        assertEquals(empresa.getId(), response.getEmpresaId());
        assertEquals(ModeloDocumentoFiscal.NFE, response.getModelo());
        assertEquals(AmbienteFiscal.HOMOLOGACAO, response.getAmbiente());
        assertFalse(response.getAtivo());
        assertEquals("1", response.getSerie());
        assertEquals("FISCAL_CERT_FILE", response.getCertificadoArquivoEnv());
        assertEquals("FISCAL_CERT_PASSWORD", response.getCertificadoSenhaEnv());
        assertEquals(LocalDate.now().plusYears(1), response.getCertificadoValidoAte());
    }

    @Test
    void deveAtualizarConfiguracaoFiscalExistenteDaFilial() {
        Empresa empresa = empresa("Empresa Fiscal");
        Filial filial = filial(empresa);
        ConfiguracaoFiscal existente = new ConfiguracaoFiscal();
        existente.setEmpresa(empresa);
        existente.setFilial(filial);
        existente.setModelo(ModeloDocumentoFiscal.NFCE);
        ConfiguracaoFiscalRequest request = request(empresa.getId(), filial.getId(), ModeloDocumentoFiscal.NFCE);
        request.setAtivo(true);
        request.setAmbiente(AmbienteFiscal.PRODUCAO);
        request.setProximoNumero(10L);
        when(empresaRepository.findById(empresa.getId())).thenReturn(Optional.of(empresa));
        when(filialRepository.findById(filial.getId())).thenReturn(Optional.of(filial));
        when(configuracaoFiscalRepository.findFirstByEmpresaIdAndFilialIdAndModelo(empresa.getId(), filial.getId(), ModeloDocumentoFiscal.NFCE))
                .thenReturn(Optional.of(existente));
        when(configuracaoFiscalRepository.save(any(ConfiguracaoFiscal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ConfiguracaoFiscalResponse response = service.salvar(request);

        assertEquals(filial.getId(), response.getFilialId());
        assertEquals(AmbienteFiscal.PRODUCAO, response.getAmbiente());
        assertEquals(true, response.getAtivo());
        assertEquals(10L, response.getProximoNumero());
    }

    @Test
    void deveBloquearFilialDeOutraEmpresa() {
        Empresa empresa = empresa("Empresa A");
        Empresa outraEmpresa = empresa("Empresa B");
        Filial filial = filial(outraEmpresa);
        ConfiguracaoFiscalRequest request = request(empresa.getId(), filial.getId(), ModeloDocumentoFiscal.NFSE);
        when(empresaRepository.findById(empresa.getId())).thenReturn(Optional.of(empresa));
        when(filialRepository.findById(filial.getId())).thenReturn(Optional.of(filial));

        assertThrows(BusinessException.class, () -> service.salvar(request));

        verify(configuracaoFiscalRepository, never()).save(any());
    }

    @Test
    void deveRejeitarProximoNumeroInvalido() {
        ConfiguracaoFiscalRequest request = request(UUID.randomUUID(), null, ModeloDocumentoFiscal.NFE);
        request.setProximoNumero(0L);

        assertThrows(BusinessException.class, () -> service.salvar(request));

        verify(empresaRepository, never()).findById(any());
    }

    @Test
    void deveValidarStatusProntoParaHomologacao() {
        Empresa empresa = empresa("Empresa Fiscal");
        ConfiguracaoFiscal configuracao = configuracaoCompleta(empresa, ModeloDocumentoFiscal.NFE);
        when(configuracaoFiscalRepository.findById(configuracao.getId())).thenReturn(Optional.of(configuracao));

        ConfiguracaoFiscalStatusResponse response = service.status(configuracao.getId());

        assertTrue(response.getProntoHomologacao());
        assertEquals("PRONTO_HOMOLOGACAO", response.getStatus());
        assertTrue(response.getPendencias().isEmpty());
    }

    @Test
    void deveApontarPendenciasEspecificasDaNfce() {
        Empresa empresa = empresa("Empresa Fiscal");
        ConfiguracaoFiscal configuracao = configuracaoCompleta(empresa, ModeloDocumentoFiscal.NFCE);
        configuracao.setAtivo(false);
        configuracao.setCscId(null);
        configuracao.setCscTokenEnv(null);
        when(configuracaoFiscalRepository.findById(configuracao.getId())).thenReturn(Optional.of(configuracao));

        ConfiguracaoFiscalStatusResponse response = service.status(configuracao.getId());

        assertFalse(response.getProntoHomologacao());
        assertEquals("PENDENTE", response.getStatus());
        assertTrue(response.getPendencias().contains("Ativar a configuracao fiscal."));
        assertTrue(response.getPendencias().contains("Informar o CSC id para NFC-e."));
        assertTrue(response.getPendencias().contains("Informar o nome da variavel do token CSC para NFC-e."));
    }

    @Test
    void deveBloquearConfiguracaoComCertificadoVencidoOuPertoDoVencimento() {
        Empresa empresa = empresa("Empresa Fiscal");
        ConfiguracaoFiscal configuracao = configuracaoCompleta(empresa, ModeloDocumentoFiscal.NFE);
        configuracao.setCertificadoValidoAte(LocalDate.now().plusDays(15));
        when(configuracaoFiscalRepository.findById(configuracao.getId())).thenReturn(Optional.of(configuracao));

        ConfiguracaoFiscalStatusResponse response = service.status(configuracao.getId());

        assertFalse(response.getProntoHomologacao());
        assertTrue(response.getPendencias().contains("Certificado digital A1 vence em ate 30 dias."));
    }

    @Test
    void deveRetornarStatusServicoDisponivelQuandoConfiguracaoEstaPronta() {
        Empresa empresa = empresa("Empresa Fiscal");
        ConfiguracaoFiscal configuracao = configuracaoCompleta(empresa, ModeloDocumentoFiscal.NFE);
        when(configuracaoFiscalRepository.findById(configuracao.getId())).thenReturn(Optional.of(configuracao));

        StatusServicoFiscalResponse response = service.statusServico(configuracao.getId());

        assertTrue(response.getDisponivel());
        assertEquals("DISPONIVEL_HOMOLOGACAO_CONTROLADA", response.getStatus());
        assertEquals("https://homologacao.sefaz.example", response.getEndpoint());
        assertTrue(response.getPendencias().isEmpty());
    }

    @Test
    void deveRetornarStatusServicoIndisponivelQuandoConfiguracaoTemPendencias() {
        Empresa empresa = empresa("Empresa Fiscal");
        ConfiguracaoFiscal configuracao = configuracaoCompleta(empresa, ModeloDocumentoFiscal.NFE);
        configuracao.setEndpointHomologacao(null);
        when(configuracaoFiscalRepository.findById(configuracao.getId())).thenReturn(Optional.of(configuracao));

        StatusServicoFiscalResponse response = service.statusServico(configuracao.getId());

        assertFalse(response.getDisponivel());
        assertEquals("INDISPONIVEL_CONFIGURACAO", response.getStatus());
        assertTrue(response.getPendencias().contains("Informar o endpoint do ambiente fiscal."));
    }

    @Test
    void deveRetornarStatusServicoIndisponivelQuandoSegredoNaoExisteNoAmbiente() {
        ConfiguracaoFiscalService serviceSemSegredo = new ConfiguracaoFiscalService(
                configuracaoFiscalRepository,
                empresaRepository,
                filialRepository,
                new FiscalSecretResolver(Map.of()),
                new ControlledFiscalServiceStatusChecker()
        );
        Empresa empresa = empresa("Empresa Fiscal");
        ConfiguracaoFiscal configuracao = configuracaoCompleta(empresa, ModeloDocumentoFiscal.NFE);
        when(configuracaoFiscalRepository.findById(configuracao.getId())).thenReturn(Optional.of(configuracao));

        StatusServicoFiscalResponse response = serviceSemSegredo.statusServico(configuracao.getId());

        assertFalse(response.getDisponivel());
        assertEquals("INDISPONIVEL_CONFIGURACAO", response.getStatus());
        assertTrue(response.getPendencias().contains("Definir a variavel de ambiente do arquivo do certificado."));
        assertTrue(response.getPendencias().contains("Definir a variavel de ambiente da senha do certificado."));
    }

    private ConfiguracaoFiscalRequest request(UUID empresaId, UUID filialId, ModeloDocumentoFiscal modelo) {
        ConfiguracaoFiscalRequest request = new ConfiguracaoFiscalRequest();
        request.setEmpresaId(empresaId);
        request.setFilialId(filialId);
        request.setModelo(modelo);
        return request;
    }

    private Empresa empresa(String nome) {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        empresa.setNome(nome);
        return empresa;
    }

    private Filial filial(Empresa empresa) {
        Filial filial = new Filial();
        filial.setId(UUID.randomUUID());
        filial.setNome("Filial " + empresa.getNome());
        filial.setEmpresa(empresa);
        return filial;
    }

    private ConfiguracaoFiscal configuracaoCompleta(Empresa empresa, ModeloDocumentoFiscal modelo) {
        ConfiguracaoFiscal configuracao = new ConfiguracaoFiscal();
        configuracao.setId(UUID.randomUUID());
        configuracao.setEmpresa(empresa);
        configuracao.setModelo(modelo);
        configuracao.setAmbiente(AmbienteFiscal.HOMOLOGACAO);
        configuracao.setAtivo(true);
        configuracao.setSerie("1");
        configuracao.setProximoNumero(1L);
        configuracao.setCertificadoAlias("certificado-a1");
        configuracao.setCertificadoArquivoEnv("FISCAL_CERT_FILE");
        configuracao.setCertificadoSenhaEnv("FISCAL_CERT_PASSWORD");
        configuracao.setCertificadoValidoAte(LocalDate.now().plusYears(1));
        configuracao.setEndpointHomologacao("https://homologacao.sefaz.example");
        if (modelo == ModeloDocumentoFiscal.NFCE) {
            configuracao.setCscId("000001");
            configuracao.setCscTokenEnv("FISCAL_NFCE_CSC_TOKEN");
        }
        return configuracao;
    }
}
