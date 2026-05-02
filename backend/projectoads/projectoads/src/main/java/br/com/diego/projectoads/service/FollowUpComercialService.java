package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.StatusFollowUpCobranca;
import br.com.diego.projectoads.dto.FollowUpComercialRequest;
import br.com.diego.projectoads.dto.FollowUpComercialResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.model.FollowUpComercial;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.FollowUpComercialRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FollowUpComercialService {

    private final FollowUpComercialRepository repository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public FollowUpComercialService(FollowUpComercialRepository repository,
                                    PedidoRepository pedidoRepository,
                                    UsuarioRepository usuarioRepository,
                                    AuditoriaService auditoriaService) {
        this.repository = repository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<FollowUpComercialResponse> listar(Boolean vencidos) {
        List<FollowUpComercial> followUps = Boolean.TRUE.equals(vencidos)
                ? repository.findByStatusAndProximaAcaoLessThanEqualOrderByProximaAcaoAscCriadoEmDesc(
                        StatusFollowUpCobranca.PENDENTE,
                        LocalDate.now()
                )
                : repository.findTop100ByOrderByProximaAcaoAscCriadoEmDesc();

        return followUps.stream().map(this::toResponse).toList();
    }

    @Transactional
    public FollowUpComercialResponse criar(FollowUpComercialRequest request) {
        if (request == null || request.getPedidoId() == null) {
            throw new BusinessException("Pedido obrigatorio para follow-up comercial.");
        }

        Pedido pedido = pedidoRepository.findById(request.getPedidoId())
                .orElseThrow(() -> new BusinessException("Pedido nao encontrado."));
        Usuario usuario = resolverUsuarioAtual();

        FollowUpComercial followUp = new FollowUpComercial();
        followUp.setPedido(pedido);
        followUp.setCanal(normalizar(request.getCanal()));
        followUp.setProximaAcao(request.getProximaAcao() != null ? request.getProximaAcao() : LocalDate.now().plusDays(1));
        followUp.setObservacao(normalizar(request.getObservacao()));
        followUp.setUsuario(usuario);
        followUp.setEmpresa(pedido.getEmpresa() != null ? pedido.getEmpresa() : usuario != null ? usuario.getEmpresa() : null);
        followUp.setFilial(pedido.getFilial());

        Cliente cliente = pedido.getCliente();
        if (cliente != null) {
            followUp.setClienteId(cliente.getIdCliente());
            followUp.setClienteNome(cliente.getNome());
        }

        if (followUp.getEmpresa() == null) {
            throw new BusinessException("Empresa obrigatoria para follow-up comercial.");
        }

        FollowUpComercial salvo = repository.save(followUp);
        auditoriaService.registrar("Pedidos", "CRIAR_FOLLOW_UP_COMERCIAL", "Follow-up comercial agendado", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public FollowUpComercialResponse concluir(UUID id) {
        FollowUpComercial followUp = buscarEntidade(id);
        followUp.setStatus(StatusFollowUpCobranca.CONCLUIDO);
        followUp.setConcluidoEm(LocalDateTime.now());
        FollowUpComercial salvo = repository.save(followUp);
        auditoriaService.registrar("Pedidos", "CONCLUIR_FOLLOW_UP_COMERCIAL", "Follow-up comercial concluido", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public FollowUpComercialResponse cancelar(UUID id) {
        FollowUpComercial followUp = buscarEntidade(id);
        followUp.setStatus(StatusFollowUpCobranca.CANCELADO);
        FollowUpComercial salvo = repository.save(followUp);
        auditoriaService.registrar("Pedidos", "CANCELAR_FOLLOW_UP_COMERCIAL", "Follow-up comercial cancelado", salvo.getId());
        return toResponse(salvo);
    }

    private FollowUpComercial buscarEntidade(UUID id) {
        if (id == null) {
            throw new BusinessException("ID do follow-up e obrigatorio.");
        }
        return repository.findById(id)
                .orElseThrow(() -> new BusinessException("Follow-up comercial nao encontrado."));
    }

    private Usuario resolverUsuarioAtual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return usuarioRepository.findByLoginIgnoreCase(authentication.getName()).orElse(null);
    }

    private String normalizar(String valor) {
        return valor == null || valor.trim().isEmpty() ? null : valor.trim();
    }

    private FollowUpComercialResponse toResponse(FollowUpComercial followUp) {
        Pedido pedido = followUp.getPedido();
        Usuario usuario = followUp.getUsuario();
        Usuario vendedor = pedido != null ? pedido.getUsuario() : null;

        return FollowUpComercialResponse.builder()
                .id(followUp.getId())
                .pedidoId(pedido != null ? pedido.getId() : null)
                .pedidoNumero(pedido != null ? pedido.getNumero() : null)
                .pedidoStatus(pedido != null ? pedido.getStatus() : null)
                .valor(pedido != null ? pedido.getValorTotalPedido() : null)
                .clienteId(followUp.getClienteId())
                .clienteNome(followUp.getClienteNome())
                .vendedor(vendedor != null ? vendedor.getNome() : null)
                .canal(followUp.getCanal())
                .proximaAcao(followUp.getProximaAcao())
                .status(followUp.getStatus())
                .observacao(followUp.getObservacao())
                .criadoEm(followUp.getCriadoEm())
                .concluidoEm(followUp.getConcluidoEm())
                .notificacaoExternaEm(followUp.getNotificacaoExternaEm())
                .usuarioId(usuario != null ? usuario.getId() : null)
                .usuarioNome(usuario != null ? usuario.getNome() : null)
                .filialId(followUp.getFilial() != null ? followUp.getFilial().getId() : null)
                .filial(followUp.getFilial() != null ? followUp.getFilial().getNome() : null)
                .build();
    }
}
