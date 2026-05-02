package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.config.Enum.TipoCategoria;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Categoria;
import br.com.diego.projectoads.repository.CategoriaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    public CategoriaController ( CategoriaRepository categoriaRepository){
        this.categoriaRepository = categoriaRepository;
    }

    @PostMapping
    public Categoria salvar(    @RequestBody Categoria categoria){
        validarCategoria(categoria, null);
        return categoriaRepository.save(categoria);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categoria> buscarPorId(@PathVariable UUID id){
        return categoriaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Categoria> listar(@RequestParam(required = false) TipoCategoria tipo){
        if (tipo != null) {
            return categoriaRepository.findByTipoAndAtivoTrueOrderByNomeAsc(tipo);
        }
        return categoriaRepository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> atualizar(@PathVariable UUID id,
                                               @RequestBody Categoria categoria){

        return categoriaRepository.findById(id)
                    .map(c -> {
                    validarCategoria(categoria, id);
                    categoria.setId(id);
                    return ResponseEntity.ok(categoriaRepository.save(categoria));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id){

        if(!categoriaRepository.existsById(id)){
            return ResponseEntity.notFound().build();
        }

        categoriaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void validarCategoria(Categoria categoria, UUID idAtual) {
        if (categoria == null || categoria.getNome() == null || categoria.getNome().trim().isEmpty()) {
            throw new BusinessException("Nome da categoria e obrigatorio");
        }

        TipoCategoria tipo = categoria.getTipo() != null ? categoria.getTipo() : TipoCategoria.GERAL;
        boolean duplicada = idAtual == null
                ? categoriaRepository.existsByNomeIgnoreCaseAndTipo(categoria.getNome().trim(), tipo)
                : categoriaRepository.existsByNomeIgnoreCaseAndTipoAndIdNot(categoria.getNome().trim(), tipo, idAtual);

        if (duplicada) {
            throw new BusinessException("Categoria ja cadastrada para este tipo");
        }
    }
}
