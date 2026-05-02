package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import br.com.diego.projectoads.config.Enum.TipoMovimentacao;
import br.com.diego.projectoads.dto.CompraEstoqueRequest;
import br.com.diego.projectoads.dto.CompraEstoqueResponse;
import br.com.diego.projectoads.dto.FinanceiroRequest;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.*;
import br.com.diego.projectoads.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CompraEstoqueService {

    private final CompraEstoqueRepository compraRepository;
    private final FornecedorRepository fornecedorRepository;
    private final ProdutoRepository produtoRepository;
    private final EstoqueRepository estoqueRepository;
    private final EstoqueMovimentacaoRepository movimentacaoRepository;
    private final FinanceiroService financeiroService;
    private final AuditoriaService auditoriaService;

    public CompraEstoqueService(CompraEstoqueRepository compraRepository,
                                FornecedorRepository fornecedorRepository,
                                ProdutoRepository produtoRepository,
                                EstoqueRepository estoqueRepository,
                                EstoqueMovimentacaoRepository movimentacaoRepository,
                                FinanceiroService financeiroService,
                                AuditoriaService auditoriaService) {
        this.compraRepository = compraRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.produtoRepository = produtoRepository;
        this.estoqueRepository = estoqueRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.financeiroService = financeiroService;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<CompraEstoqueResponse> listar() {
        return compraRepository.findTop50ByOrderByDataCompraDesc()
                .stream()
                .map(CompraEstoqueResponse::new)
                .toList();
    }

    @Transactional
    public CompraEstoqueResponse criar(CompraEstoqueRequest request) {
        validar(request);

        Fornecedor fornecedor = fornecedorRepository.findById(request.getFornecedorId())
                .orElseThrow(() -> new BusinessException("Fornecedor obrigatorio para compra"));

        CompraEstoque compra = new CompraEstoque();
        compra.setFornecedor(fornecedor);
        compra.setDataCompra(LocalDateTime.now());
        compra.setDataVencimento(request.getDataVencimento());
        compra.setNumeroDocumento(normalizarTexto(request.getNumeroDocumento()));
        compra.setMetodoPagamento(request.getMetodoPagamento() != null ? request.getMetodoPagamento() : MetodoPagamento.BOLETO);
        compra.setStatusPagamento(request.getStatus() != null ? request.getStatus() : StatusPagamento.PENDENTE);
        compra.setObservacao(normalizarTexto(request.getObservacao()));

        BigDecimal total = BigDecimal.ZERO;
        for (CompraEstoqueRequest.ItemRequest itemRequest : request.getItens()) {
            Produto produto = produtoRepository.findById(itemRequest.getProdutoId())
                    .orElseThrow(() -> new BusinessException("Produto nao encontrado na compra"));

            ItemCompraEstoque item = new ItemCompraEstoque();
            item.setProduto(produto);
            item.setQuantidade(itemRequest.getQuantidade());
            item.setPrecoUnitario(itemRequest.getPrecoUnitario());
            item.calcularSubtotal();
            total = total.add(item.getSubtotal());
            compra.adicionarItem(item);
        }
        compra.setValorTotal(total);

        CompraEstoque salva = compraRepository.save(compra);
        salva.getItens().forEach(this::registrarEntradaEstoque);
        registrarFinanceiro(salva);

        auditoriaService.registrar(
                "Compras",
                "CRIAR",
                "Compra de estoque registrada com " + salva.getItens().size() + " item(ns) para " + fornecedor.getNome(),
                salva.getId()
        );

        return new CompraEstoqueResponse(salva);
    }

    private void registrarEntradaEstoque(ItemCompraEstoque item) {
        Estoque estoque = estoqueRepository.findByProdutoIdProduto(item.getProduto().getIdProduto())
                .orElseGet(() -> criarEstoqueZerado(item.getProduto()));
        estoque.aumentarEstoque(item.getQuantidade());
        estoqueRepository.save(estoque);

        EstoqueMovimentacao movimentacao = new EstoqueMovimentacao();
        movimentacao.setProduto(item.getProduto());
        movimentacao.setQuantidade(item.getQuantidade());
        movimentacao.setTipo(TipoMovimentacao.ENTRADA);
        movimentacao.setMotivo("COMPRA " + (item.getCompra().getNumeroDocumento() != null ? item.getCompra().getNumeroDocumento() : item.getCompra().getId()));
        movimentacaoRepository.save(movimentacao);
    }

    private Estoque criarEstoqueZerado(Produto produto) {
        Estoque estoque = new Estoque();
        estoque.setProduto(produto);
        estoque.setQuantidade(0);
        estoque.setQtaMinimo(5);
        estoque.setLocalizacao("GERAL");
        return estoque;
    }

    private void registrarFinanceiro(CompraEstoque compra) {
        if (compra.getValorTotal() == null || compra.getValorTotal().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        FinanceiroRequest financeiro = new FinanceiroRequest();
        financeiro.setDescricao("Compra de estoque - " + compra.getFornecedor().getNome());
        financeiro.setTipo(TipoFinanceiro.DESPESA);
        financeiro.setCategoria("Compra de estoque");
        financeiro.setValor(compra.getValorTotal());
        financeiro.setMetodoPagamento(compra.getMetodoPagamento());
        financeiro.setStatus(compra.getStatusPagamento());
        financeiro.setDataVencimento(compra.getDataVencimento());
        financeiro.setObservacao("Compra " + compra.getId()
                + (compra.getNumeroDocumento() != null ? " | Documento: " + compra.getNumeroDocumento() : ""));
        financeiroService.criar(financeiro);
    }

    private void validar(CompraEstoqueRequest request) {
        if (request == null) {
            throw new BusinessException("Dados da compra obrigatorios");
        }
        if (request.getFornecedorId() == null) {
            throw new BusinessException("Fornecedor obrigatorio");
        }
        if (request.getItens() == null || request.getItens().isEmpty()) {
            throw new BusinessException("Informe ao menos um item na compra");
        }
        for (CompraEstoqueRequest.ItemRequest item : request.getItens()) {
            if (item.getProdutoId() == null) {
                throw new BusinessException("Produto obrigatorio na compra");
            }
            if (item.getQuantidade() == null || item.getQuantidade() <= 0) {
                throw new BusinessException("Quantidade da compra deve ser maior que zero");
            }
            if (item.getPrecoUnitario() == null || item.getPrecoUnitario().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Preco unitario da compra deve ser maior que zero");
            }
        }
    }

    private String normalizarTexto(String valor) {
        return valor == null || valor.trim().isEmpty() ? null : valor.trim();
    }
}
