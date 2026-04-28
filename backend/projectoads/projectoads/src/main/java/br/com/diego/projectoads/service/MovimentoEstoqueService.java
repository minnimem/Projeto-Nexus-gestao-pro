package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.TipoMovimentacao;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Estoque;
import br.com.diego.projectoads.model.MovimentoEstoque;
import br.com.diego.projectoads.model.Produto;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.EstoqueRepository;
import br.com.diego.projectoads.repository.MovimentoEstoqueRepository;
import br.com.diego.projectoads.repository.ProdutoRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class MovimentoEstoqueService {

    private final MovimentoEstoqueRepository movimentoRepository;
    private final ProdutoRepository produtoRepository;
    private final EstoqueRepository estoqueRepository;
    private final UsuarioRepository usuarioRepository;

    public MovimentoEstoqueService(MovimentoEstoqueRepository movimentoRepository,
                                   ProdutoRepository produtoRepository,
                                   EstoqueRepository estoqueRepository,
                                   UsuarioRepository usuarioRepository) {
        this.movimentoRepository = movimentoRepository;
        this.produtoRepository = produtoRepository;
        this.estoqueRepository = estoqueRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public void registrar(UUID produtoId, Integer quantidade, TipoMovimentacao tipo, String login) {
        if (produtoId == null) {
            throw new BusinessException("Produto obrigatório");
        }
        if (quantidade == null || quantidade <= 0) {
            throw new BusinessException("Quantidade deve ser maior que zero");
        }
        if (tipo == null) {
            throw new BusinessException("Tipo de movimentação obrigatório");
        }
        if (login == null || login.isBlank()) {
            throw new BusinessException("Usuário obrigatório");
        }

        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new BusinessException("Produto não encontrado"));

        Estoque estoque = estoqueRepository.findByProdutoIdProduto(produtoId)
                .orElseThrow(() -> new BusinessException("Estoque não encontrado"));

        if (tipo == TipoMovimentacao.SAIDA) {
            estoque.retirarEstoque(quantidade);
        } else {
            estoque.aumentarEstoque(quantidade);
        }

        Usuario usuario = usuarioRepository.findByLoginIgnoreCase(login)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        MovimentoEstoque mov = new MovimentoEstoque();
        mov.setProduto(produto);
        mov.setQuantidade(quantidade);
        mov.setTipo(tipo);
        mov.setUsuario(usuario);
        mov.setData(LocalDateTime.now());

        movimentoRepository.save(mov);
        estoqueRepository.save(estoque);
    }
}
