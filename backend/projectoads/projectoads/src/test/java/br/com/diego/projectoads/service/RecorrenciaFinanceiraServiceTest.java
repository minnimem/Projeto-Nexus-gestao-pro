package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import br.com.diego.projectoads.dto.FinanceiroResponse;
import br.com.diego.projectoads.dto.RecorrenciaFinanceiraRequest;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.RecorrenciaFinanceira;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.RecorrenciaFinanceiraRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RecorrenciaFinanceiraServiceTest {

    private final RecorrenciaFinanceiraRepository recorrenciaRepository = mock(RecorrenciaFinanceiraRepository.class);
    private final UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
    private final FilialRepository filialRepository = mock(FilialRepository.class);
    private final FinanceiroService financeiroService = mock(FinanceiroService.class);
    private final AuditoriaService auditoriaService = mock(AuditoriaService.class);

    private final RecorrenciaFinanceiraService service = new RecorrenciaFinanceiraService(
            recorrenciaRepository,
            usuarioRepository,
            filialRepository,
            financeiroService,
            auditoriaService
    );

    @Test
    void criarDeveConfigurarRecorrenciaSemGerarPrimeiroLancamento() {
        Usuario usuario = usuarioComEmpresa();
        RecorrenciaFinanceiraRequest request = requestBase(usuario.getId());
        request.setGerarPrimeiroLancamento(false);

        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        when(recorrenciaRepository.save(any(RecorrenciaFinanceira.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.criar(request);

        ArgumentCaptor<RecorrenciaFinanceira> captor = ArgumentCaptor.forClass(RecorrenciaFinanceira.class);
        verify(recorrenciaRepository, times(2)).save(captor.capture());
        RecorrenciaFinanceira salva = captor.getAllValues().getLast();
        assertThat(salva.getDescricao()).isEqualTo("Aluguel da loja");
        assertThat(salva.getEmpresa()).isEqualTo(usuario.getEmpresa());
        assertThat(salva.getProximaGeracao()).isEqualTo(request.getDataInicio());
        assertThat(salva.getIntervaloMeses()).isEqualTo(1);
        assertThat(salva.getStatusLancamento()).isEqualTo(StatusPagamento.PENDENTE);
        verify(financeiroService, never()).criarPorRecorrencia(any(), any(), any(Integer.class));
    }

    @Test
    void gerarProximosDeveCriarLancamentosEAvancarProximaGeracao() {
        UUID recorrenciaId = UUID.randomUUID();
        RecorrenciaFinanceira recorrencia = recorrencia(recorrenciaId, true, LocalDate.of(2026, 7, 10), 2);

        when(recorrenciaRepository.findById(recorrenciaId)).thenReturn(Optional.of(recorrencia));
        when(financeiroService.criarPorRecorrencia(any(), any(), any(Integer.class)))
                .thenAnswer(invocation -> FinanceiroResponse.builder()
                        .recorrenciaId(recorrenciaId)
                        .dataVencimento(invocation.getArgument(1))
                        .build());

        List<FinanceiroResponse> gerados = service.gerarProximos(recorrenciaId, 2);

        assertThat(gerados).hasSize(2);
        assertThat(gerados.get(0).getDataVencimento()).isEqualTo(LocalDate.of(2026, 7, 10));
        assertThat(gerados.get(1).getDataVencimento()).isEqualTo(LocalDate.of(2026, 9, 10));
        assertThat(recorrencia.getGeracoesRealizadas()).isEqualTo(2);
        assertThat(recorrencia.getProximaGeracao()).isEqualTo(LocalDate.of(2026, 11, 10));
        verify(recorrenciaRepository).save(recorrencia);
    }

    @Test
    void gerarProximosDeveBloquearRecorrenciaPausada() {
        UUID recorrenciaId = UUID.randomUUID();
        RecorrenciaFinanceira recorrencia = recorrencia(recorrenciaId, false, LocalDate.of(2026, 7, 10), 1);

        when(recorrenciaRepository.findById(recorrenciaId)).thenReturn(Optional.of(recorrencia));

        assertThatThrownBy(() -> service.gerarProximos(recorrenciaId, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("pausada");

        verify(financeiroService, never()).criarPorRecorrencia(any(), any(), any(Integer.class));
        verify(recorrenciaRepository, never()).save(any());
    }

    private RecorrenciaFinanceiraRequest requestBase(UUID usuarioId) {
        RecorrenciaFinanceiraRequest request = new RecorrenciaFinanceiraRequest();
        request.setDescricao(" Aluguel da loja ");
        request.setTipo(TipoFinanceiro.DESPESA);
        request.setCategoria("Aluguel");
        request.setValor(BigDecimal.valueOf(1500));
        request.setMetodoPagamento(MetodoPagamento.PIX);
        request.setDataInicio(LocalDate.of(2026, 7, 10));
        request.setUsuarioId(usuarioId);
        return request;
    }

    private RecorrenciaFinanceira recorrencia(UUID id, boolean ativo, LocalDate proximaGeracao, int intervaloMeses) {
        RecorrenciaFinanceira recorrencia = new RecorrenciaFinanceira();
        recorrencia.setId(id);
        recorrencia.setDescricao("Mensalidade");
        recorrencia.setTipo(TipoFinanceiro.RECEITA);
        recorrencia.setValor(BigDecimal.valueOf(300));
        recorrencia.setMetodoPagamento(MetodoPagamento.PIX);
        recorrencia.setStatusLancamento(StatusPagamento.PENDENTE);
        recorrencia.setDataInicio(proximaGeracao);
        recorrencia.setProximaGeracao(proximaGeracao);
        recorrencia.setIntervaloMeses(intervaloMeses);
        recorrencia.setGeracoesRealizadas(0);
        recorrencia.setAtivo(ativo);
        return recorrencia;
    }

    private Usuario usuarioComEmpresa() {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        empresa.setNome("Nexus Teste");

        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setLogin("admin");
        usuario.setEmpresa(empresa);
        return usuario;
    }
}
