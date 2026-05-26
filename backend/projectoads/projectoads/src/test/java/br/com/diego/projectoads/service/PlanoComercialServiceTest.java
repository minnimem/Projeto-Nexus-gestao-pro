package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.PlanoComercial;
import br.com.diego.projectoads.config.Enum.StatusAssinatura;
import br.com.diego.projectoads.dto.PlanoEmpresaRequest;
import br.com.diego.projectoads.dto.PlanoEmpresaResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.repository.CaixaRepository;
import br.com.diego.projectoads.repository.EmpresaRepository;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.LiberacaoModuloEmpresaRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PlanoComercialServiceTest {

    private EmpresaRepository empresaRepository;
    private LiberacaoModuloEmpresaRepository liberacaoModuloRepository;
    private PlanoComercialService service;

    @BeforeEach
    void setUp() {
        empresaRepository = mock(EmpresaRepository.class);
        UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
        FilialRepository filialRepository = mock(FilialRepository.class);
        CaixaRepository caixaRepository = mock(CaixaRepository.class);
        liberacaoModuloRepository = mock(LiberacaoModuloEmpresaRepository.class);
        AuditoriaService auditoriaService = mock(AuditoriaService.class);

        when(empresaRepository.save(any(Empresa.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(liberacaoModuloRepository.findByEmpresaIdOrderByModuloAsc(any(UUID.class))).thenReturn(List.of());

        service = new PlanoComercialService(
                empresaRepository,
                usuarioRepository,
                filialRepository,
                caixaRepository,
                liberacaoModuloRepository,
                auditoriaService
        );
    }

    @Test
    void deveAtualizarDadosDeCobrancaDoPlano() {
        Empresa empresa = empresa();
        PlanoEmpresaRequest request = new PlanoEmpresaRequest();
        request.setPlanoComercial(PlanoComercial.BUSINESS);
        request.setStatusAssinatura(StatusAssinatura.ATIVA);
        request.setValorMensalPlano(BigDecimal.valueOf(299.90));
        request.setDiaVencimentoPlano(15);
        request.setUltimoPagamentoPlano(LocalDate.of(2026, 5, 24));

        PlanoEmpresaResponse response = service.atualizarPlano(empresa, request);

        assertThat(response.planoComercial).isEqualTo("BUSINESS");
        assertThat(response.statusAssinatura).isEqualTo("ATIVA");
        assertThat(response.valorMensalPlano).isEqualByComparingTo("299.90");
        assertThat(response.diaVencimentoPlano).isEqualTo(15);
        assertThat(response.ultimoPagamentoPlano).isEqualTo(LocalDate.of(2026, 5, 24));
        assertThat(empresa.getValorMensalPlano()).isEqualByComparingTo("299.90");
        assertThat(empresa.getDiaVencimentoPlano()).isEqualTo(15);
    }

    @Test
    void deveRejeitarValorMensalNegativo() {
        Empresa empresa = empresa();
        PlanoEmpresaRequest request = new PlanoEmpresaRequest();
        request.setValorMensalPlano(BigDecimal.valueOf(-1));

        BusinessException exception = assertThrows(BusinessException.class, () -> service.atualizarPlano(empresa, request));

        assertThat(exception.getMessage()).isEqualTo("Valor mensal do plano nao pode ser negativo");
    }

    @Test
    void deveRejeitarDiaDeVencimentoForaDoIntervaloOperacional() {
        Empresa empresa = empresa();
        PlanoEmpresaRequest request = new PlanoEmpresaRequest();
        request.setDiaVencimentoPlano(31);

        BusinessException exception = assertThrows(BusinessException.class, () -> service.atualizarPlano(empresa, request));

        assertThat(exception.getMessage()).isEqualTo("Dia de vencimento do plano deve ficar entre 1 e 28");
    }

    private Empresa empresa() {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        empresa.setNome("Cliente Plano");
        empresa.setPlanoComercial(PlanoComercial.STARTER);
        empresa.setStatusAssinatura(StatusAssinatura.TESTE);
        return empresa;
    }
}
