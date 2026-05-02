package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import br.com.diego.projectoads.dto.ConfiguracaoFiscalRequest;
import br.com.diego.projectoads.dto.ConfiguracaoFiscalResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Filial;
import br.com.diego.projectoads.repository.ConfiguracaoFiscalRepository;
import br.com.diego.projectoads.repository.EmpresaRepository;
import br.com.diego.projectoads.repository.FilialRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
            filialRepository
    );

    @Test
    void deveCriarConfiguracaoFiscalComDefaultsSeguros() {
        Empresa empresa = empresa("Empresa Fiscal");
        ConfiguracaoFiscalRequest request = request(empresa.getId(), null, ModeloDocumentoFiscal.NFE);
        request.setSerie(" 1 ");
        request.setCertificadoSenhaEnv(" FISCAL_CERT_PASSWORD ");
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
        assertEquals("FISCAL_CERT_PASSWORD", response.getCertificadoSenhaEnv());
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
}
