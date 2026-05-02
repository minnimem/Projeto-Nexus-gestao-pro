package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.StatusFollowUpCobranca;
import br.com.diego.projectoads.dto.FollowUpCobrancaRequest;
import br.com.diego.projectoads.dto.FollowUpCobrancaResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.model.Financeiro;
import br.com.diego.projectoads.model.FollowUpCobranca;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.FinanceiroRepository;
import br.com.diego.projectoads.repository.FollowUpCobrancaRepository;
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
public class FollowUpCobrancaService {

    private final FollowUpCobrancaRepository repository;
    private final FinanceiroRepository financeiroRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public FollowUpCobrancaService(FollowUpCobrancaRepository repository,
                                   FinanceiroRepository financeiroRepository,
                                   UsuarioRepository usuarioRepository,
                                   AuditoriaService auditoriaService) {
        this.repository = repository;
        this.financeiroRepository = financeiroRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<FollowUpCobrancaResponse> listar(Boolean vencidos) {
        List<FollowUpCobranca> followUps = Boolean.TRUE.equals(vencidos)
                ? repository.findByStatusAndProximaAcaoLessThanEqualOrderByProximaAcaoAscCriadoEmDesc(
                        StatusFollowUpCobranca.PENDENTE,
                        LocalDate.now()
                )
                : repository.findTop100ByOrderByProximaAcaoAscCriadoEmDesc();

        return followUps.stream().map(this::toResponse).toList();
    }

    @Transactional
    public FollowUpCobrancaResponse criar(FollowUpCobrancaRequest request) {
        if (request == null || request.getFinanceiroId() == null) {
            throw new BusinessException("Lancamento financeiro obrigatorio para follow-up.");
        }

        Financeiro financeiro = financeiroRepository.findById(request.getFinanceiroId())
                .orElseThrow(() -> new BusinessException("Lancamento financeiro nao encontrado."));
        Usuario usuario = resolverUsuarioAtual();

        FollowUpCobranca followUp = new FollowUpCobranca();
        followUp.setFinanceiro(financeiro);
        followUp.setCanal(normalizar(request.getCanal()));
        followUp.setProximaAcao(request.getProximaAcao() != null ? request.getProximaAcao() : LocalDate.now().plusDays(1));
        followUp.setObservacao(normalizar(request.getObservacao()));
        followUp.setUsuario(usuario);
        followUp.setEmpresa(financeiro.getEmpresa() != null ? financeiro.getEmpresa() : usuario != null ? usuario.getEmpresa() : null);
        followUp.setFilial(financeiro.getFilial());

        Pedido pedido = financeiro.getPedido();
        Cliente cliente = pedido != null ? pedido.getCliente() : null;
        if (cliente != null) {
            followUp.setClienteId(cliente.getIdCliente());
            followUp.setClienteNome(cliente.getNome());
        }

        if (followUp.getEmpresa() == null) {
            throw new BusinessException("Empresa obrigatoria para follow-up de cobranca.");
        }

        FollowUpCobranca salvo = repository.save(followUp);
        auditoriaService.registrar("Financeiro", "CRIAR_FOLLOW_UP_COBRANCA", "Follow-up de cobranca agendado", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public FollowUpCobrancaResponse concluir(UUID id) {
        FollowUpCobranca followUp = buscarEntidade(id);
        followUp.setStatus(StatusFollowUpCobranca.CONCLUIDO);
        followUp.setConcluidoEm(LocalDateTime.now());
        FollowUpCobranca salvo = repository.save(followUp);
        auditoriaService.registrar("Financeiro", "CONCLUIR_FOLLOW_UP_COBRANCA", "Follow-up de cobranca concluido", salvo.getId());
        return toResponse(salvo);
    }

    @Transactional
    public FollowUpCobrancaResponse cancelar(UUID id) {
        FollowUpCobranca followUp = buscarEntidade(id);
        followUp.setStatus(StatusFollowUpCobranca.CANCELADO);
        FollowUpCobranca salvo = repository.save(followUp);
        auditoriaService.registrar("Financeiro", "CANCELAR_FOLLOW_UP_COBRANCA", "Follow-up de cobranca cancelado", salvo.getId());
        return toResponse(salvo);
    }

    private FollowUpCobranca buscarEntidade(UUID id) {
        if (id == null) {
            throw new BusinessException("ID do follow-up e obrigatorio.");
        }
        return repository.findById(id)
                .orElseThrow(() -> new BusinessException("Follow-up de cobranca nao encontrado."));
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

    private FollowUpCobrancaResponse toResponse(FollowUpCobranca followUp) {
        Financeiro financeiro = followUp.getFinanceiro();
        Usuario usuario = followUp.getUsuario();

        return FollowUpCobrancaResponse.builder()
                .id(followUp.getId())
                .financeiroId(financeiro != null ? financeiro.getId() : null)
                .financeiroDescricao(financeiro != null ? financeiro.getDescricao() : null)
                .valor(financeiro != null ? financeiro.getValor() : null)
                .vencimento(financeiro != null ? financeiro.getDataVencimento() : null)
                .clienteId(followUp.getClienteId())
                .clienteNome(followUp.getClienteNome())
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
