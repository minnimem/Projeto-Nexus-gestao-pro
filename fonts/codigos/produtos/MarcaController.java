package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.model.Marca;
import br.com.diego.projectoads.repository.MarcaRepository;
import br.com.diego.projectoads.exception.BusinessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/marcas")
public class MarcaController {

    private final MarcaRepository marcaRepository;

    public MarcaController(MarcaRepository marcaRepository) {
        this.marcaRepository = marcaRepository;
    }

    @GetMapping
    public ResponseEntity<List<Marca>> listar(){
        return ResponseEntity.ok(marcaRepository.findAllByOrderByNomeAsc());
    }

    @PostMapping
    public ResponseEntity<Marca> salvar(@RequestBody Marca marca){
        validarMarca(marca, null);
        Marca salva = marcaRepository.save(marca);
        return ResponseEntity.status(201).body(salva);
    }

    @GetMapping("/{id}")
    public ResponseEntity <Marca> buscarPorID (@PathVariable UUID id){
        return  marcaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Marca> atualizar (@PathVariable UUID id,
                                            @RequestBody Marca marca){
        return marcaRepository.findById(id)
                .map(c ->{
                    validarMarca(marca, id);
                    marca.setId(id);
                    return ResponseEntity.ok(marcaRepository.save(marca));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar (@PathVariable UUID id){

        if(!marcaRepository.existsById(id)){
            return ResponseEntity.notFound().build();
        }
        marcaRepository.deleteById(id);
        return ResponseEntity.noContent().build();

    }



    private void validarMarca(Marca marca, UUID idAtual) {
        if (marca == null || marca.getNome() == null || marca.getNome().trim().isEmpty()) {
            throw new BusinessException("Nome da marca e obrigatorio");
        }

        boolean duplicada = idAtual == null
                ? marcaRepository.existsByNomeIgnoreCase(marca.getNome().trim())
                : marcaRepository.existsByNomeIgnoreCaseAndIdNot(marca.getNome().trim(), idAtual);

        if (duplicada) {
            throw new BusinessException("Marca ja cadastrada");
        }

        marca.setNome(marca.getNome().trim());
        if (marca.getDescricao() != null) {
            marca.setDescricao(marca.getDescricao().trim());
        }
    }
}
