package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.TipoMovimentacao;
import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import br.com.diego.projectoads.dto.EstoqueAjusteRequest;
import br.com.diego.projectoads.dto.EstoqueBaixoResponse;
import br.com.diego.projectoads.dto.EstoqueCompraRequest;
import br.com.diego.projectoads.dto.EstoqueSaldoResponse;
import br.com.diego.projectoads.dto.EstoqueTransferenciaRequest;
import br.com.diego.projectoads.dto.FinanceiroRequest;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Estoque;
import br.com.diego.projectoads.model.EstoqueMovimentacao;
import br.com.diego.projectoads.model.Fornecedor;
import br.com.diego.projectoads.model.Produto;
import br.com.diego.projectoads.repository.EstoqueMovimentacaoRepository;
import br.com.diego.projectoads.repository.EstoqueRepository;
import br.com.diego.projectoads.repository.FornecedorRepository;
import br.com.diego.projectoads.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class EstoqueService {

    private static final int ESTOQUE_MINIMO_PADRAO = 5;

    private final EstoqueRepository estoqueRepository;
    private final EstoqueMovimentacaoRepository movimentacaoRepository;
    private final ProdutoRepository produtoRepository;
    private final FornecedorRepository fornecedorRepository;
    private final FinanceiroService financeiroService;
    private final AuditoriaService auditoriaService;

    public EstoqueService(EstoqueRepository estoqueRepository,
                           EstoqueMovimentacaoRepository movimentacaoRepository,
                           ProdutoRepository produtoRepository,
                           FornecedorRepository fornecedorRepository,
                           FinanceiroService financeiroService,
                           AuditoriaService auditoriaService) {
        this.estoqueRepository = estoqueRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.produtoRepository = produtoRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.financeiroService = financeiroService;
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

    @Transactional
    public void registrarCompra(EstoqueCompraRequest request) {
        if (request == null) {
            throw new BusinessException("Dados da compra obrigatorios");
        }

        validarQuantidade(request.getQuantidade() == null ? 0 : request.getQuantidade());

        Fornecedor fornecedor = fornecedorRepository.findById(request.getFornecedorId())
                .orElseThrow(() -> new BusinessException("Fornecedor obrigatorio para entrada por compra"));

        Estoque estoque = buscarOuCriarEstoquePorProduto(request.getProdutoId());
        estoque.aumentarEstoque(request.getQuantidade());
        estoqueRepository.save(estoque);

        String documento = normalizarTexto(request.getNumeroDocumento());
        String motivo = "COMPRA - " + fornecedor.getNome() + (documento != null ? " - Doc " + documento : "");
        registrarMovimentacao(estoque, request.getQuantidade(), TipoMovimentacao.ENTRADA, motivo);

        BigDecimal valorTotal = request.getValorTotal();
        if (valorTotal != null && valorTotal.compareTo(BigDecimal.ZERO) > 0) {
            FinanceiroRequest financeiro = new FinanceiroRequest();
            financeiro.setDescricao("Compra de estoque - " + estoque.getProduto().getNomeProduto());
            financeiro.setTipo(TipoFinanceiro.DESPESA);
            financeiro.setCategoria("Compra de estoque");
            financeiro.setValor(valorTotal);
            financeiro.setMetodoPagamento(request.getMetodoPagamento() != null ? request.getMetodoPagamento() : MetodoPagamento.BOLETO);
            financeiro.setStatus(request.getStatus() != null ? request.getStatus() : StatusPagamento.PENDENTE);
            financeiro.setDataVencimento(request.getDataVencimento());
            financeiro.setObservacao(montarObservacaoCompra(fornecedor, documento, request.getObservacao()));
            financeiroService.criar(financeiro);
        }

        auditoriaService.registrar(
                "Estoque",
                "COMPRA",
                "Compra de " + request.getQuantidade() + " un. do produto " + estoque.getProduto().getNomeProduto() + " com fornecedor " + fornecedor.getNome(),
                request.getProdutoId()
        );
    }

    @Transactional
    public void ajustarPorInventario(EstoqueAjusteRequest request) {
        if (request == null) {
            throw new BusinessException("Dados do inventario obrigatorios");
        }

        if (request.getQuantidadeContada() == null || request.getQuantidadeContada() < 0) {
            throw new BusinessException("Quantidade contada deve ser zero ou maior");
        }

        Estoque estoque = buscarOuCriarEstoquePorProduto(request.getProdutoId());
        int saldoAnterior = estoque.getQuantidade() == null ? 0 : estoque.getQuantidade();
        int saldoContado = request.getQuantidadeContada();
        int diferenca = saldoContado - saldoAnterior;

        if (diferenca == 0) {
            auditoriaService.registrar(
                    "Estoque",
                    "INVENTARIO_SEM_DIVERGENCIA",
                    "Inventario sem divergencia para o produto " + estoque.getProduto().getNomeProduto(),
                    request.getProdutoId()
            );
            return;
        }

        estoque.setQuantidade(saldoContado);
        estoqueRepository.save(estoque);

        TipoMovimentacao tipo = diferenca > 0 ? TipoMovimentacao.ENTRADA : TipoMovimentacao.SAIDA;
        String detalhe = normalizarTexto(request.getObservacao());
        String motivo = "INVENTARIO - saldo sistema " + saldoAnterior
                + ", contado " + saldoContado
                + (detalhe == null ? "" : ". " + detalhe);
        registrarMovimentacao(estoque, Math.abs(diferenca), tipo, motivo);

        auditoriaService.registrar(
                "Estoque",
                "INVENTARIO_AJUSTE",
                "Inventario ajustou " + estoque.getProduto().getNomeProduto() + " de " + saldoAnterior + " para " + saldoContado,
                request.getProdutoId()
        );
    }

    @Transactional
    public void transferir(EstoqueTransferenciaRequest request) {
        if (request == null) {
            throw new BusinessException("Dados da transferencia obrigatorios");
        }

        validarQuantidade(request.getQuantidade() == null ? 0 : request.getQuantidade());

        String origem = normalizarLocalizacao(request.getOrigem());
        String destino = normalizarLocalizacao(request.getDestino());
        if (origem.equalsIgnoreCase(destino)) {
            throw new BusinessException("Origem e destino devem ser diferentes");
        }

        Estoque estoqueOrigem = buscarOuCriarEstoquePorProdutoELocal(request.getProdutoId(), origem);
        Estoque estoqueDestino = buscarOuCriarEstoquePorProdutoELocal(request.getProdutoId(), destino);

        estoqueOrigem.retirarEstoque(request.getQuantidade());
        estoqueDestino.aumentarEstoque(request.getQuantidade());

        estoqueRepository.save(estoqueOrigem);
        estoqueRepository.save(estoqueDestino);

        String detalhe = normalizarTexto(request.getObservacao());
        String sufixo = detalhe == null ? "" : " - " + detalhe;
        registrarMovimentacao(estoqueOrigem, request.getQuantidade(), TipoMovimentacao.SAIDA, "TRANSFERENCIA para " + destino + sufixo);
        registrarMovimentacao(estoqueDestino, request.getQuantidade(), TipoMovimentacao.ENTRADA, "TRANSFERENCIA de " + origem + sufixo);

        auditoriaService.registrar(
                "Estoque",
                "TRANSFERENCIA",
                "Transferencia de " + request.getQuantidade() + " un. do produto " + estoqueOrigem.getProduto().getNomeProduto() + " de " + origem + " para " + destino,
                request.getProdutoId()
        );
    }

    public List<EstoqueBaixoResponse> estoqueBaixo() {
        return estoqueRepository.buscarEstoqueBaixo()
                .stream()
                .map(estoque -> new EstoqueBaixoResponse(estoque, ESTOQUE_MINIMO_PADRAO))
                .toList();
    }

    public List<EstoqueSaldoResponse> saldosPorLocal() {
        return estoqueRepository.findAllByOrderByProdutoNomeProdutoAscLocalizacaoAsc()
                .stream()
                .map(EstoqueSaldoResponse::new)
                .toList();
    }

    private Estoque buscarEstoquePorProduto(UUID produtoId) {
        if (produtoId == null) {
            throw new BusinessException("Produto obrigatório");
        }

        return estoqueRepository.findByProdutoIdProdutoAndLocalizacaoIgnoreCase(produtoId, "GERAL")
                .orElseThrow(() -> new BusinessException("Estoque não encontrado para o produto informado"));
    }

    private Estoque buscarOuCriarEstoquePorProduto(UUID produtoId) {
        return buscarOuCriarEstoquePorProdutoELocal(produtoId, "GERAL");
    }

    private Estoque buscarOuCriarEstoquePorProdutoELocal(UUID produtoId, String localizacao) {
        if (produtoId == null) {
            throw new BusinessException("Produto obrigatorio");
        }

        String localNormalizado = normalizarLocalizacao(localizacao);
        return estoqueRepository.findByProdutoIdProdutoAndLocalizacaoIgnoreCase(produtoId, localNormalizado)
                .orElseGet(() -> criarEstoqueZerado(produtoId, localNormalizado));
    }

    private Estoque criarEstoqueZerado(UUID produtoId) {
        return criarEstoqueZerado(produtoId, "GERAL");
    }

    private Estoque criarEstoqueZerado(UUID produtoId, String localizacao) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new BusinessException("Produto nao encontrado"));

        Estoque estoque = new Estoque();
        estoque.setProduto(produto);
        estoque.setQuantidade(0);
        estoque.setQtaMinimo(ESTOQUE_MINIMO_PADRAO);
        estoque.setLocalizacao(normalizarLocalizacao(localizacao));

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

    private String montarObservacaoCompra(Fornecedor fornecedor, String documento, String observacao) {
        String texto = "Fornecedor: " + fornecedor.getNome();
        if (documento != null) {
            texto += " | Documento: " + documento;
        }
        String detalhe = normalizarTexto(observacao);
        return detalhe == null ? texto : texto + " | " + detalhe;
    }

    private String normalizarTexto(String valor) {
        return valor == null || valor.trim().isEmpty() ? null : valor.trim();
    }

    private String normalizarLocalizacao(String valor) {
        return valor == null || valor.trim().isEmpty() ? "GERAL" : valor.trim().toUpperCase();
    }
}
