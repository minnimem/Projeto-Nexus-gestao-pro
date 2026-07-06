package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.TipoMovimentacao;
import br.com.diego.projectoads.dto.EstoqueTransferenciaRequest;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Estoque;
import br.com.diego.projectoads.model.EstoqueMovimentacao;
import br.com.diego.projectoads.model.Produto;
import br.com.diego.projectoads.repository.EstoqueMovimentacaoRepository;
import br.com.diego.projectoads.repository.EstoqueRepository;
import br.com.diego.projectoads.repository.FornecedorRepository;
import br.com.diego.projectoads.repository.ProdutoRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EstoqueServiceTest {

    private final EstoqueRepository estoqueRepository = mock(EstoqueRepository.class);
    private final EstoqueMovimentacaoRepository movimentacaoRepository = mock(EstoqueMovimentacaoRepository.class);
    private final ProdutoRepository produtoRepository = mock(ProdutoRepository.class);
    private final FornecedorRepository fornecedorRepository = mock(FornecedorRepository.class);
    private final FinanceiroService financeiroService = mock(FinanceiroService.class);
    private final AuditoriaService auditoriaService = mock(AuditoriaService.class);

    private final EstoqueService service = new EstoqueService(
            estoqueRepository,
            movimentacaoRepository,
            produtoRepository,
            fornecedorRepository,
            financeiroService,
            auditoriaService
    );

    @Test
    void adicionarDeveAumentarSaldoERegistrarEntrada() {
        UUID produtoId = UUID.randomUUID();
        Produto produto = produto(produtoId, "Cabo HDMI");
        Estoque estoque = estoque(produto, 5, "GERAL");

        when(estoqueRepository.findByProdutoIdProdutoAndLocalizacaoIgnoreCase(produtoId, "GERAL"))
                .thenReturn(Optional.of(estoque));

        service.adicionar(produtoId, 3);

        assertThat(estoque.getQuantidade()).isEqualTo(8);
        verify(estoqueRepository).save(estoque);

        ArgumentCaptor<EstoqueMovimentacao> movimentacao = ArgumentCaptor.forClass(EstoqueMovimentacao.class);
        verify(movimentacaoRepository).save(movimentacao.capture());
        assertThat(movimentacao.getValue().getProduto()).isEqualTo(produto);
        assertThat(movimentacao.getValue().getQuantidade()).isEqualTo(3);
        assertThat(movimentacao.getValue().getTipo()).isEqualTo(TipoMovimentacao.ENTRADA);
    }

    @Test
    void retirarDeveBloquearQuandoSaldoInsuficiente() {
        UUID produtoId = UUID.randomUUID();
        Estoque estoque = estoque(produto(produtoId, "Mouse"), 2, "GERAL");

        when(estoqueRepository.findByProdutoIdProdutoOrderByLocalizacaoAsc(produtoId))
                .thenReturn(List.of(estoque));

        assertThatThrownBy(() -> service.retirar(produtoId, 5))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Estoque insuficiente");

        assertThat(estoque.getQuantidade()).isEqualTo(2);
        verify(estoqueRepository, never()).save(any());
        verify(movimentacaoRepository, never()).save(any());
    }

    @Test
    void transferirDeveBloquearOrigemIgualAoDestino() {
        EstoqueTransferenciaRequest request = new EstoqueTransferenciaRequest();
        request.setProdutoId(UUID.randomUUID());
        request.setOrigem("geral");
        request.setDestino("GERAL");
        request.setQuantidade(1);

        assertThatThrownBy(() -> service.transferir(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Origem e destino devem ser diferentes");

        verify(estoqueRepository, never()).save(any());
        verify(movimentacaoRepository, never()).save(any());
    }

    private Produto produto(UUID id, String nome) {
        Produto produto = new Produto();
        produto.setIdProduto(id);
        produto.setNomeProduto(nome);
        produto.setCodBarras(id.toString().substring(0, 20));
        return produto;
    }

    private Estoque estoque(Produto produto, int quantidade, String localizacao) {
        Estoque estoque = new Estoque();
        estoque.setProduto(produto);
        estoque.setQuantidade(quantidade);
        estoque.setQtaMinimo(5);
        estoque.setLocalizacao(localizacao);
        return estoque;
    }
}
