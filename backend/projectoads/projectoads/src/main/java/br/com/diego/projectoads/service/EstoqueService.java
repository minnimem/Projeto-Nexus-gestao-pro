package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.TipoMovimentacao;
import br.com.diego.projectoads.dto.EstoqueBaixoResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Estoque;
import br.com.diego.projectoads.model.EstoqueMovimentacao;
import br.com.diego.projectoads.model.Produto;
import br.com.diego.projectoads.repository.EstoqueMovimentacaoRepository;
import br.com.diego.projectoads.repository.EstoqueRepository;
import br.com.diego.projectoads.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class EstoqueService {

    private static final int ESTOQUE_MINIMO_PADRAO = 5;

    private final EstoqueRepository estoqueRepository;
    private final EstoqueMovimentacaoRepository movimentacaoRepository;
    private final ProdutoRepository produtoRepository;
    private final AuditoriaService auditoriaService;

    public EstoqueService(EstoqueRepository estoqueRepository,
                           EstoqueMovimentacaoRepository movimentacaoRepository,
                           ProdutoRepository produtoRepository,
                           AuditoriaService auditoriaService) {
        this.estoqueRepository = estoqueRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.produtoRepository = produtoRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    public void retirar(UUID produtoId, int quantidade) {
        validarQuantidade(quantidade);

        Estoque estoque = buscarOuCriarEstoquePorProduto(produtoId);
        estoque.retirarEstoque(quantidade);
        estoqueRepository.save(estoque);

        registrarMovimentacao(estoque, quantidade, TipoMovimentacao.SAIDA, "VENDA");
        auditoriaService.registrar("Estoque", "SAIDA", "Saida de " + quantidade + " un. do produto " + estoque.getProduto().getNomeProduto(), produtoId);
    }

    @Transactional
    public void adicionar(UUID produtoId, int quantidade) {
        validarQuantidade(quantidade);

        Estoque estoque = buscarOuCriarEstoquePorProduto(produtoId);
        estoque.aumentarEstoque(quantidade);
        estoqueRepository.save(estoque);

        registrarMovimentacao(estoque, quantidade, TipoMovimentacao.ENTRADA, "REPOSIÇÃO");
        auditoriaService.registrar("Estoque", "ENTRADA", "Entrada de " + quantidade + " un. do produto " + estoque.getProduto().getNomeProduto(), produtoId);
    }

    public List<EstoqueBaixoResponse> estoqueBaixo() {
        return estoqueRepository.buscarEstoqueBaixo()
                .stream()
                .map(estoque -> new EstoqueBaixoResponse(estoque, ESTOQUE_MINIMO_PADRAO))
                .toList();
    }

    private Estoque buscarEstoquePorProduto(UUID produtoId) {
        if (produtoId == null) {
            throw new BusinessException("Produto obrigatório");
        }

        return estoqueRepository.findByProdutoIdProduto(produtoId)
                .orElseThrow(() -> new BusinessException("Estoque não encontrado para o produto informado"));
    }

    private Estoque buscarOuCriarEstoquePorProduto(UUID produtoId) {
        if (produtoId == null) {
            throw new BusinessException("Produto obrigatorio");
        }

        return estoqueRepository.findByProdutoIdProduto(produtoId)
                .orElseGet(() -> criarEstoqueZerado(produtoId));
    }

    private Estoque criarEstoqueZerado(UUID produtoId) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new BusinessException("Produto nao encontrado"));

        Estoque estoque = new Estoque();
        estoque.setProduto(produto);
        estoque.setQuantidade(0);
        estoque.setQtaMinimo(ESTOQUE_MINIMO_PADRAO);
        estoque.setLocalizacao("GERAL");

        return estoque;
    }

    private void registrarMovimentacao(Estoque estoque,
                                       int quantidade,
                                       TipoMovimentacao tipo,
                                       String motivo) {
        EstoqueMovimentacao mov = new EstoqueMovimentacao();
        mov.setProduto(estoque.getProduto());
        mov.setQuantidade(quantidade);
        mov.setTipo(tipo);
        mov.setMotivo(motivo);
        movimentacaoRepository.save(mov);
    }

    private void validarQuantidade(int quantidade) {
        if (quantidade <= 0) {
            throw new BusinessException("Quantidade deve ser maior que zero");
        }
    }
}
