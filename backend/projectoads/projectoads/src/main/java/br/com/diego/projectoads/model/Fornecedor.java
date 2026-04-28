package br.com.diego.projectoads.model;

import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.config.Enum.TipoDocumento;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "fornecedor")
public class Fornecedor {

    @Id
    @Column(name = "id_fornecedor", nullable = false)
    @GeneratedValue (strategy = GenerationType.UUID)
    private UUID id;

    @Column (name = "nome", length = 180, nullable = false )
    private String nome;

    @Column(name = "documento", length = 14, nullable = false, unique = true)
    private String documento;

    @Column (name = "telefone", length = 20)
    private String telefone;

    @Column (name = "email",length = 120, unique = true)
    private String email;

    @Column (name = "endereco", length = 255)
    private String endereco;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_documento", nullable = false)
    private TipoDocumento tipoDocumento;

    @PrePersist
    @PreUpdate
    public void preSave() {
        validarDocumento();
    }

    public void validarDocumento() {

        if (documento == null || tipoDocumento == null) {
            throw new BusinessException("Documento ou tipo não informado");
        }

        if(this.tipoDocumento == TipoDocumento.CPF && documento.length() != 11){
            throw new BusinessException("CPF inválido");
        }

        if(this.tipoDocumento == TipoDocumento.CNPJ && documento.length() != 14){
            throw new BusinessException("CNPJ inválido");
        }
    }


}