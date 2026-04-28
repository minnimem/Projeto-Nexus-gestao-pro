    package br.com.diego.projectoads.controller;


    import br.com.diego.projectoads.dto.ClienteResponse;
    import br.com.diego.projectoads.exception.BusinessException;
    import br.com.diego.projectoads.model.Cliente;
    import br.com.diego.projectoads.repository.ClienteRepository;
    import jakarta.validation.Valid;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;
    import java.util.UUID;

    @RestController
    @RequestMapping("/clientes")
    public class ClienteController {

        private final ClienteRepository clienteRepository;


        public ClienteController(ClienteRepository clienteRepository) {
            this.clienteRepository = clienteRepository;
        }

        @PostMapping
        public ResponseEntity<ClienteResponse> salvar(@RequestBody @Valid Cliente cliente){

            if(clienteRepository.existsByCpf(cliente.getCpf())){
                throw new BusinessException("CPF já cadastrado");
            }

            if(clienteRepository.existsByEmail(cliente.getEmail())){
                throw new BusinessException("Email já cadastrado");
            }

            Cliente salvo = clienteRepository.save(cliente);
            return ResponseEntity.status(201).body(new ClienteResponse(salvo));
        }

        @GetMapping
        public ResponseEntity<List<ClienteResponse>> listar(){
            return ResponseEntity.ok(
                    clienteRepository.findAll()
                            .stream()
                            .map(ClienteResponse::new)
                            .toList()
            );
        }

        @PutMapping("/{id}")
        public ResponseEntity<ClienteResponse> atualizar(@PathVariable UUID id,
                                                         @RequestBody @Valid Cliente cliente){

            if(clienteRepository.existsByCpfAndIdClienteNot(cliente.getCpf(), id)){
                throw new BusinessException("CPF já cadastrado");
            }

            if(clienteRepository.existsByEmailAndIdClienteNot(cliente.getEmail(), id)){
                throw new BusinessException("Email já cadastrado");
            }

            return clienteRepository.findById(id)
                    .map(c -> {
                        cliente.setIdCliente(id);
                        return ResponseEntity.ok(new ClienteResponse(clienteRepository.save(cliente)));
                    })
                    .orElse(ResponseEntity.notFound().build());
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deletar (@PathVariable UUID id){
            if(!clienteRepository.existsById(id)){
                return ResponseEntity.notFound().build();
            }
            clienteRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }

    }
