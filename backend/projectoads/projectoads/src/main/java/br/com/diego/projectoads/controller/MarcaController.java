package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.model.Marca;
import br.com.diego.projectoads.repository.MarcaRepository;
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
        return ResponseEntity.ok(marcaRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Marca> salvar(@RequestBody Marca marca){
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



}
