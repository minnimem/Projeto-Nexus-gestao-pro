package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPedido;
import br.com.diego.projectoads.config.Enum.TipoEntrega;
import br.com.diego.projectoads.dto.PedidoFinalizacaoRequest;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.ItemPedido;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.model.Produto;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.ClienteRepository;
import br.com.diego.projectoads.repository.EntregaRepository;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.ItemPedidoRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import br.com.diego.projectoads.repository.ProdutoRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PedidoServiceTest {

    private final PedidoRepository pedidoRepository = mock(PedidoRepository.class);
    private final ItemPedidoRepository itemPedidoRepository = mock(ItemPedidoRepository.class);
    private final ProdutoRepository produtoRepository = mock(ProdutoRepository.class);
    private final ClienteRepository clienteRepository = mock(ClienteRepository.class);
    private final UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
    private final EntregaRepository entregaRepository = mock(EntregaRepository.class);
    private final FilialRepository filialRepository = mock(FilialRepository.class);
    private final EstoqueService estoqueService = mock(EstoqueService.class);
    private final FinanceiroService financeiroService = mock(FinanceiroService.class);
    private final CaixaService caixaService = mock(CaixaService.class);
    private final AuditoriaService auditoriaService = mock(AuditoriaService.class);

    private final PedidoService service = new PedidoService(
            pedidoRepository,
            itemPedidoRepository,
            produtoRepository,
            clienteRepository,
            usuarioRepository,
            entregaRepository,
            filialRepository,
            estoqueService,
            financeiroService,
            caixaService,
            auditoriaService
    );

    @AfterEach
    void limparContextoSeguranca() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void finalizarPedidoDeEntregaBaixaEstoqueRegistraReceitaECaixa() {
        Empresa empresa = empresa();
        Usuario usuario = usuario(empresa);
        Produto produto = produto();
        Pedido pedido = pedido(empresa, produto, StatusPedido.PENDENTE, TipoEntrega.ENTREGA);
        PedidoFinalizacaoRequest request = new PedidoFinalizacaoRequest();
        request.setMetodoPagamento(MetodoPagamento.PIX);
        request.setParcelas(1);
        request.setDetalhesPagamento("Pix: R$ 120,00");

        autenticar(usuario);
        when(pedidoRepository.findDetailedByIdAndEmpresaId(pedido.getId(), empresa.getId()))
                .thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(entregaRepository.existsByPedidoId(pedido.getId())).thenReturn(false);

        Pedido finalizado = service.finalizar(pedido.getId(), request);

        assertEquals(StatusPedido.FINALIZADA, finalizado.getStatus());
        verify(estoqueService).retirar(produto.getIdProduto(), 2);
        verify(financeiroService).registrarReceitaPedido(
                eq(finalizado),
                eq(MetodoPagamento.PIX),
                eq(new BigDecimal("120.00")),
                eq(usuario),
                eq("Pix: R$ 120,00")
        );
        verify(caixaService).registrarVendaPedido(finalizado, usuario, "Pix: R$ 120,00");
        verify(entregaRepository).save(any());
    }

    @Test
    void concluirSeparacaoDeRetiradaBaixaEstoqueSemDuplicarFinanceiroECaixa() {
        Empresa empresa = empresa();
        Usuario usuario = usuario(empresa);
        Produto produto = produto();
        Pedido pedido = pedido(empresa, produto, StatusPedido.SEPARACAO, TipoEntrega.RETIRADA_LOJA);

        autenticar(usuario);
        when(pedidoRepository.findDetailedByIdAndEmpresaId(pedido.getId(), empresa.getId()))
                .thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Pedido finalizado = service.concluirSeparacao(pedido.getId());

        assertEquals(StatusPedido.CONCLUIDO, finalizado.getStatus());
        verify(estoqueService).retirar(produto.getIdProduto(), 2);
        verify(financeiroService, never()).registrarReceitaPedido(any(), any(), any(), any(), any());
        verify(caixaService, never()).registrarVendaPedido(any(), any(), any());
    }

    private void autenticar(Usuario usuario) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuario.getLogin(), "senha")
        );
        when(usuarioRepository.findByLoginIgnoreCase(usuario.getLogin())).thenReturn(Optional.of(usuario));
    }

    private Empresa empresa() {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        empresa.setNome("Empresa Teste");
        return empresa;
    }

    private Usuario usuario(Empresa empresa) {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setNome("Operador");
        usuario.setLogin("operador");
        usuario.setEmpresa(empresa);
        return usuario;
    }

    private Produto produto() {
        Produto produto = new Produto();
        produto.setIdProduto(UUID.randomUUID());
        produto.setNomeProduto("Camiseta");
        produto.setPrecoCompra(new BigDecimal("60.00"));
        produto.setPrecoVenda(new BigDecimal("60.00"));
        return produto;
    }

    private Pedido pedido(Empresa empresa, Produto produto, StatusPedido status, TipoEntrega tipoEntrega) {
        Pedido pedido = new Pedido();
        pedido.setId(UUID.randomUUID());
        pedido.setNumero("PED-1");
        pedido.setEmpresa(empresa);
        pedido.setStatus(status);
        pedido.setTipoEntrega(tipoEntrega);
        pedido.setMetodoPagamento(MetodoPagamento.PIX);
        pedido.setValorTotalPedido(new BigDecimal("120.00"));

        ItemPedido item = new ItemPedido();
        item.setProduto(produto);
        item.setQuantidade(2);
        item.setPrecoUnit(new BigDecimal("60.00"));
        pedido.adicionarItem(item);

        return pedido;
    }
}
