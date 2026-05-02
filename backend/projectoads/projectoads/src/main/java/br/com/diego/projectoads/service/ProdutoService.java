package br.com.diego.projectoads.service;

import br.com.diego.projectoads.dto.ProdutoRequest;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Categoria;
import br.com.diego.projectoads.model.Estoque;
import br.com.diego.projectoads.model.Fornecedor;
import br.com.diego.projectoads.model.Marca;
import br.com.diego.projectoads.model.Produto;
import br.com.diego.projectoads.repository.CategoriaRepository;
import br.com.diego.projectoads.repository.EstoqueRepository;
import br.com.diego.projectoads.repository.FornecedorRepository;
import br.com.diego.projectoads.repository.MarcaRepository;
import br.com.diego.projectoads.repository.ProdutoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
public class ProdutoService {

    private static final int ESTOQUE_MINIMO_PADRAO = 5;

    private final ProdutoRepository repository;
    private final EstoqueRepository estoqueRepository;
    private final FornecedorRepository fornecedorRepository;
    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;

    public ProdutoService(ProdutoRepository repository,
                          EstoqueRepository estoqueRepository,
                          FornecedorRepository fornecedorRepository,
                          CategoriaRepository categoriaRepository,
                          MarcaRepository marcaRepository) {
        this.repository = repository;
        this.estoqueRepository = estoqueRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.categoriaRepository = categoriaRepository;
        this.marcaRepository = marcaRepository;
    }

    public List<Produto> listar() {
        return repository.findByAtivoTrue();
    }

    public Produto buscar(UUID id) {
        return repository.findByIdProdutoWithEstoques(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    @Transactional
    public Produto criar(ProdutoRequest req) {

        validar(req, null);

        Produto p = new Produto();

        p.setSku(req.sku);
        p.setCodBarras(resolverCodigoBarras(req.codBarras));
        p.setNomeProduto(req.nomeProduto);
        p.setDescricao(req.descricao);

        p.setPrecoCompra(req.precoCompra);
        p.setPrecoVenda(req.precoVenda);
        p.setDescontoPercentual(req.descontoPercentual);

        p.setGarantiaMes(req.garantiaMes);
        p.setCategoria(resolverCategoria(req.idCategoria));
        p.setMarca(resolverMarca(req.idMarca));
        p.setFornecedor(resolverFornecedor(req.idFornecedor));
        p.setAtivo(true);

        Produto produtoSalvo = repository.save(p);
        criarEstoqueInicial(produtoSalvo, req);

        return produtoSalvo;
    }

    @Transactional
    public Produto atualizar(UUID id, ProdutoRequest req) {

        Produto p = buscar(id);

        validar(req, id);

        p.setSku(req.sku);
        if (req.codBarras == null || req.codBarras.isBlank()) {
            p.setCodBarras(p.getCodBarras() == null || p.getCodBarras().isBlank()
                    ? gerarCodigoBarrasInterno()
                    : p.getCodBarras());
        } else {
            p.setCodBarras(req.codBarras.trim());
        }
        p.setNomeProduto(req.nomeProduto);
        p.setDescricao(req.descricao);

        p.setPrecoCompra(req.precoCompra);
        p.setPrecoVenda(req.precoVenda);
        p.setDescontoPercentual(req.descontoPercentual);

        p.setGarantiaMes(req.garantiaMes);
        p.setCategoria(resolverCategoria(req.idCategoria));
        p.setMarca(resolverMarca(req.idMarca));
        p.setFornecedor(resolverFornecedor(req.idFornecedor));
        atualizarLimitesEstoque(p, req);

        return repository.save(p);
    }

    @Transactional
    public void deletar(UUID id) {
        Produto p = buscar(id);
        p.setAtivo(false);
        repository.save(p);
    }

    public List<Produto> buscarPorNome(String nome) {
        return repository.findByNomeProdutoContainingIgnoreCase(nome);
    }

    private void validar(ProdutoRequest req, UUID idAtual) {

        if (req.nomeProduto == null || req.nomeProduto.isBlank()) {
            throw new BusinessException("Nome obrigatorio");
        }

        repository.findByNomeProdutoIgnoreCase(req.nomeProduto.trim())
                .filter(produto -> idAtual == null || !produto.getIdProduto().equals(idAtual))
                .ifPresent(produto -> {
                    throw new BusinessException("Produto ja cadastrado com este nome. Atualize o produto existente para evitar duplicidade.");
                });

        if (req.precoVenda == null || req.precoVenda.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Preco de venda invalido");
        }

        if (req.precoCompra == null || req.precoCompra.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Preco de compra invalido");
        }

        validarLimitesEstoque(req);
    }

    private void criarEstoqueInicial(Produto produto, ProdutoRequest req) {
        if (produto.getIdProduto() == null ||
                estoqueRepository.findByProdutoIdProdutoAndLocalizacaoIgnoreCase(produto.getIdProduto(), "GERAL").isPresent()) {
            return;
        }

        Estoque estoque = new Estoque();
        estoque.setProduto(produto);
        estoque.setQuantidade(0);
        estoque.setQtaMinimo(resolverEstoqueMinimo(req.qtaMinimo));
        estoque.setQtaMaximo(resolverEstoqueMaximo(req.qtaMaximo));
        estoque.setLocalizacao("GERAL");
        estoqueRepository.save(estoque);
    }

    private void atualizarLimitesEstoque(Produto produto, ProdutoRequest req) {
        if (produto.getIdProduto() == null) {
            return;
        }

        Estoque estoque = estoqueRepository.findByProdutoIdProdutoAndLocalizacaoIgnoreCase(produto.getIdProduto(), "GERAL")
                .orElseGet(() -> {
                    Estoque novoEstoque = new Estoque();
                    novoEstoque.setProduto(produto);
                    novoEstoque.setQuantidade(0);
                    novoEstoque.setLocalizacao("GERAL");
                    return novoEstoque;
                });

        estoque.setQtaMinimo(resolverEstoqueMinimo(req.qtaMinimo));
        estoque.setQtaMaximo(resolverEstoqueMaximo(req.qtaMaximo));
        estoqueRepository.save(estoque);
    }

    private void validarLimitesEstoque(ProdutoRequest req) {
        Integer minimo = resolverEstoqueMinimo(req.qtaMinimo);
        Integer maximo = resolverEstoqueMaximo(req.qtaMaximo);

        if (req.qtaMinimo != null && req.qtaMinimo < 0) {
            throw new BusinessException("Estoque minimo nao pode ser negativo");
        }

        if (req.qtaMaximo != null && req.qtaMaximo < 0) {
            throw new BusinessException("Estoque maximo nao pode ser negativo");
        }

        if (maximo != null && minimo > maximo) {
            throw new BusinessException("Estoque minimo nao pode ser maior que o maximo");
        }
    }

    private Integer resolverEstoqueMinimo(Integer qtaMinimo) {
        return qtaMinimo == null ? ESTOQUE_MINIMO_PADRAO : qtaMinimo;
    }

    private Integer resolverEstoqueMaximo(Integer qtaMaximo) {
        return qtaMaximo == null || qtaMaximo == 0 ? null : qtaMaximo;
    }

    private String resolverCodigoBarras(String codigoBarras) {
        if (codigoBarras != null && !codigoBarras.isBlank()) {
            return codigoBarras.trim();
        }

        return gerarCodigoBarrasInterno();
    }

    private String gerarCodigoBarrasInterno() {
        String prefixo = "NX" + Year.now().getValue();
        int proximoNumero = repository.findByCodBarrasStartingWith(prefixo)
                .stream()
                .map(Produto::getCodBarras)
                .filter(codigo -> codigo != null && codigo.startsWith(prefixo))
                .map(codigo -> codigo.substring(prefixo.length()))
                .filter(sufixo -> sufixo.matches("\\d+"))
                .mapToInt(Integer::parseInt)
                .max()
                .orElse(0) + 1;

        String codigo;
        do {
            codigo = prefixo + String.format("%05d", proximoNumero++);
        } while (repository.findByCodBarras(codigo).isPresent());

        return codigo;
    }

    private Fornecedor resolverFornecedor(UUID fornecedorId) {
        if (fornecedorId == null) {
            return null;
        }

        return fornecedorRepository.findById(fornecedorId)
                .orElseThrow(() -> new BusinessException("Fornecedor nao encontrado"));
    }

    private Categoria resolverCategoria(UUID categoriaId) {
        if (categoriaId == null) {
            return null;
        }

        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new BusinessException("Categoria nao encontrada"));
    }

    private Marca resolverMarca(UUID marcaId) {
        if (marcaId == null) {
            return null;
        }

        return marcaRepository.findById(marcaId)
                .orElseThrow(() -> new BusinessException("Marca nao encontrada"));
    }
}
