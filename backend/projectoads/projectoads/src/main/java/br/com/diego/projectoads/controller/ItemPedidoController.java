package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.model.ItemPedido;
import br.com.diego.projectoads.repository.ItemPedidoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/Itens-Pedido")
public class ItemPedidoController {

    private final ItemPedidoRepository itemPedidoRepository;

    public ItemPedidoController(ItemPedidoRepository itemPerdidoRepository) {
        this.itemPedidoRepository = itemPerdidoRepository;
    }

    @GetMapping
    public ResponseEntity<List<ItemPedido>> listar() {
        return ResponseEntity.ok(itemPedidoRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<ItemPedido> salvar(@RequestBody ItemPedido itemPedido) {
        ItemPedido salvo = itemPedidoRepository.save(itemPedido);
        return ResponseEntity.status(201).body(salvo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemPedido> buscarPorId(@PathVariable UUID id) {
        return itemPedidoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping ("/{id}")
    public ResponseEntity <ItemPedido> atualizar (@PathVariable UUID id,
                                                  @RequestBody ItemPedido itemPedido){
        return itemPedidoRepository.findById(id)
                .map(i ->{
                    i.setQuantidade(itemPedido.getQuantidade());
                    i.setPrecoUnit(itemPedido.getPrecoUnit());
                    i.setProduto(itemPedido.getProduto());
                    return ResponseEntity.ok(itemPedidoRepository.save(i));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping ("/{id}")

    public ResponseEntity<Void> deletar (@PathVariable UUID id){

        if(!itemPedidoRepository.existsById(id)){
            return ResponseEntity.notFound().build();
        }
        itemPedidoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}