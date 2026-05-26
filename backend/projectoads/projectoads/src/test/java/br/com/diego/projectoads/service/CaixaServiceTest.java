package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.Perfil;
import br.com.diego.projectoads.config.Enum.StatusCaixa;
import br.com.diego.projectoads.config.Enum.TipoMovimentoCaixa;
import br.com.diego.projectoads.dto.CaixaAberturaRequest;
import br.com.diego.projectoads.dto.CaixaMovimentoRequest;
import br.com.diego.projectoads.dto.CaixaResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Caixa;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.MovimentoCaixa;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.CaixaRepository;
import br.com.diego.projectoads.repository.MovimentoCaixaRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CaixaServiceTest {

    private final CaixaRepository caixaRepository = mock(CaixaRepository.class);
    private final MovimentoCaixaRepository movimentoCaixaRepository = mock(MovimentoCaixaRepository.class);
    private final UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
    private final AuditoriaService auditoriaService = mock(AuditoriaService.class);
    private final PlanoComercialService planoComercialService = mock(PlanoComercialService.class);
    private final CaixaService service = new CaixaService(
            caixaRepository,
            movimentoCaixaRepository,
            usuarioRepository,
            auditoriaService,
            planoComercialService
    );

    @AfterEach
    void limparContextoSeguranca() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deveNormalizarMetodoMistoAntesDeRegistrarMovimentoDeVenda() {
        Empresa empresa = empresa();
        Usuario usuario = usuario(empresa);
        Caixa caixa = caixa(usuario, empresa);
        Pedido pedido = pedido(empresa);
        String detalhesPagamento = "Pix: R$ 80,00 | Dinheiro: R$ 20,00";

        when(caixaRepository.findFirstByUsuarioAndStatusOrderByDataAberturaDesc(usuario, StatusCaixa.ABERTO))
                .thenReturn(Optional.of(caixa));
        when(movimentoCaixaRepository.existsByCaixaIdAndPedidoIdAndTipo(caixa.getId(), pedido.getId(), TipoMovimentoCaixa.VENDA))
                .thenReturn(false);
        when(movimentoCaixaRepository.save(any(MovimentoCaixa.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.registrarVendaPedido(pedido, usuario, detalhesPagamento);

        ArgumentCaptor<MovimentoCaixa> captor = ArgumentCaptor.forClass(MovimentoCaixa.class);
        verify(movimentoCaixaRepository).save(captor.capture());
        MovimentoCaixa movimento = captor.getValue();
        assertNotEquals(MetodoPagamento.MISTO, movimento.getMetodoPagamento());
        assertEquals(MetodoPagamento.PIX, movimento.getMetodoPagamento());
        assertEquals(1, movimento.getParcelas());
        assertTrue(movimento.getObservacao().contains("Pagamento misto: " + detalhesPagamento));
    }

    @Test
    void deveNormalizarMetodoMistoAoReceberPagamentoNoCaixa() {
        Empresa empresa = empresa();
        Usuario usuario = usuario(empresa);
        Caixa caixa = caixa(usuario, empresa);
        CaixaMovimentoRequest request = new CaixaMovimentoRequest();
        request.setValor(BigDecimal.valueOf(100));
        request.setMetodoPagamento(MetodoPagamento.MISTO);
        request.setParcelas(1);
        request.setDescricao("Pagamento recebido");
        request.setObservacao("Pagamento misto: Dinheiro: R$ 40,00 | Pix: R$ 60,00");

        when(caixaRepository.findById(caixa.getId())).thenReturn(Optional.of(caixa));
        when(usuarioRepository.findByLoginIgnoreCase(usuario.getLogin())).thenReturn(Optional.of(usuario));
        when(movimentoCaixaRepository.save(any(MovimentoCaixa.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(movimentoCaixaRepository.somarPorCaixaETipo(any(UUID.class), any(TipoMovimentoCaixa.class)))
                .thenReturn(BigDecimal.ZERO);
        when(movimentoCaixaRepository.findByCaixaOrderByDataMovimentoDesc(caixa))
                .thenReturn(java.util.List.of());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuario.getLogin(), null)
        );

        CaixaResponse response = service.pagamentoRecebido(caixa.getId(), request);

        ArgumentCaptor<MovimentoCaixa> captor = ArgumentCaptor.forClass(MovimentoCaixa.class);
        verify(movimentoCaixaRepository, org.mockito.Mockito.times(2)).save(captor.capture());
        MovimentoCaixa movimento = captor.getAllValues().get(1);
        assertEquals(caixa.getId(), response.getId());
        assertNotEquals(MetodoPagamento.MISTO, movimento.getMetodoPagamento());
        assertEquals(MetodoPagamento.DINHEIRO, movimento.getMetodoPagamento());
        assertEquals(1, movimento.getParcelas());
    }

    @Test
    void deveBloquearVendedorAoAbrirCaixa() {
        Empresa empresa = empresa();
        Usuario vendedor = usuario(empresa, Perfil.VENDEDOR);
        CaixaAberturaRequest request = new CaixaAberturaRequest();
        request.setValorInicial(BigDecimal.valueOf(50));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(vendedor.getLogin(), null)
        );
        when(usuarioRepository.findByLoginIgnoreCase(vendedor.getLogin())).thenReturn(Optional.of(vendedor));

        BusinessException exception = assertThrows(BusinessException.class, () -> service.abrir(request));

        assertEquals("Perfil sem permissao para abrir caixa.", exception.getMessage());
        verify(caixaRepository, never()).save(any(Caixa.class));
    }

    private Empresa empresa() {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        empresa.setNome("Empresa Teste");
        return empresa;
    }

    private Usuario usuario(Empresa empresa) {
        return usuario(empresa, Perfil.OPERADOR_CAIXA);
    }

    private Usuario usuario(Empresa empresa, Perfil perfil) {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setNome("Operador Caixa");
        usuario.setLogin("usuario-" + perfil.name().toLowerCase());
        usuario.setPerfil(perfil);
        usuario.setEmpresa(empresa);
        return usuario;
    }

    private Caixa caixa(Usuario usuario, Empresa empresa) {
        Caixa caixa = new Caixa();
        caixa.setId(UUID.randomUUID());
        caixa.setUsuario(usuario);
        caixa.setEmpresa(empresa);
        caixa.setPerfil(usuario.getPerfil());
        caixa.setStatus(StatusCaixa.ABERTO);
        caixa.setValorInicial(BigDecimal.valueOf(150));
        return caixa;
    }

    private Pedido pedido(Empresa empresa) {
        Pedido pedido = new Pedido();
        pedido.setId(UUID.randomUUID());
        pedido.setNumero("PED-TESTE");
        pedido.setEmpresa(empresa);
        pedido.setValorTotalPedido(BigDecimal.valueOf(100));
        pedido.setMetodoPagamento(MetodoPagamento.MISTO);
        pedido.setParcelasPagamento(1);
        return pedido;
    }
}
