package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Fornecedor;
import br.com.diego.projectoads.repository.FornecedorRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping ("/fornecedores")
public class FornecedorController {

    private final FornecedorRepository fornecedorRepository;

    public FornecedorController (FornecedorRepository fornecedorRepository)
    {this.fornecedorRepository = fornecedorRepository; }

    @GetMapping
    public ResponseEntity <List<Fornecedor>> listar (){
        return  ResponseEntity.ok(fornecedorRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Fornecedor> salvar(@RequestBody @Valid Fornecedor fornecedor) {

        if (fornecedorRepository.existsByDocumento(fornecedor.getDocumento())) {
            throw new BusinessException("Documento já cadastrado");
        }

        Fornecedor salvo = fornecedorRepository.save(fornecedor);

        return ResponseEntity
                .created(URI.create("/fornecedores/" + salvo.getId()))
                .body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fornecedor> atualizar(@PathVariable UUID id,
                                                @RequestBody @Valid Fornecedor fornecedor) {

        if (fornecedorRepository.existsByDocumentoAndIdNot(fornecedor.getDocumento(), id)) {
            throw new BusinessException("Documento já cadastrado para outro fornecedor");
        }

        return fornecedorRepository.findById(id)
                .map(f -> {
                    f.setNome(fornecedor.getNome());
                    f.setDocumento(fornecedor.getDocumento());
                    f.setTipoDocumento(fornecedor.getTipoDocumento());
                    f.setTelefone(fornecedor.getTelefone());
                    f.setEmail(fornecedor.getEmail());
                    f.setEndereco(fornecedor.getEndereco());

                    return ResponseEntity.ok(fornecedorRepository.save(f));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {

        Optional<Fornecedor> fornecedor = fornecedorRepository.findById(id);

        if (fornecedor.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        fornecedorRepository.delete(fornecedor.get());
        return ResponseEntity.noContent().build();
    }

}
