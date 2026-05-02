package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.dto.FinanceiroResponse;
import br.com.diego.projectoads.dto.RecorrenciaFinanceiraRequest;
import br.com.diego.projectoads.dto.RecorrenciaFinanceiraResponse;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Filial;
import br.com.diego.projectoads.model.RecorrenciaFinanceira;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.RecorrenciaFinanceiraRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class RecorrenciaFinanceiraService {

    private final RecorrenciaFinanceiraRepository recorrenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final FilialRepository filialRepository;
    private final FinanceiroService financeiroService;
    private final AuditoriaService auditoriaService;

    public RecorrenciaFinanceiraService(RecorrenciaFinanceiraRepository recorrenciaRepository,
                                         UsuarioRepository usuarioRepository,
                                         FilialRepository filialRepository,
                                         FinanceiroService financeiroService,
                                         AuditoriaService auditoriaService) {
        this.recorrenciaRepository = recorrenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.filialRepository = filialRepository;
        this.financeiroService = financeiroService;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<RecorrenciaFinanceiraResponse> listar() {
        return recorrenciaRepository.findAllByOrderByAtivoDescProximaGeracaoAscDescricaoAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RecorrenciaFinanceiraResponse criar(RecorrenciaFinanceiraRequest request) {
        validarRequest(request);

        Usuario usuario = resolverUsuarioResponsavel(request.getUsuarioId());
        if (usuario == null || usuario.getEmpresa() == null) {
            throw new BusinessException("Usuario com empresa e obrigatorio para recorrencia financeira.");
        }

        RecorrenciaFinanceira recorrencia = new RecorrenciaFinanceira();
        preencher(recorrencia, request, usuario);

        RecorrenciaFinanceira salva = recorrenciaRepository.save(recorrencia);
        auditoriaService.registrar("Financeiro", "CRIAR_RECORRENCIA", "Regra de recorrencia financeira criada", salva.getId());

        if (Boolean.TRUE.equals(request.getGerarPrimeiroLancamento())) {
            gerarLancamentos(salva, 1);
        }

        return toResponse(recorrenciaRepository.save(salva));
    }

    @Transactional
    public RecorrenciaFinanceiraResponse atualizarStatus(UUID id, boolean ativo) {
        RecorrenciaFinanceira recorrencia = buscarEntidade(id);
        recorrencia.setAtivo(ativo);
        RecorrenciaFinanceira salva = recorrenciaRepository.save(recorrencia);
        auditoriaService.registrar(
                "Financeiro",
                ativo ? "ATIVAR_RECORRENCIA" : "PAUSAR_RECORRENCIA",
                ativo ? "Recorrencia financeira ativada" : "Recorrencia financeira pausada",
                salva.getId()
        );
        return toResponse(salva);
    }

    @Transactional
    public List<FinanceiroResponse> gerarProximos(UUID id, Integer quantidade) {
        RecorrenciaFinanceira recorrencia = buscarEntidade(id);
        int total = quantidade != null ? quantidade : 1;

        if (total < 1 || total > 24) {
            throw new BusinessException("Quantidade para gerar deve ficar entre 1 e 24.");
        }

        List<FinanceiroResponse> gerados = gerarLancamentos(recorrencia, total);
        recorrenciaRepository.save(recorrencia);
        return gerados;
    }

    private List<FinanceiroResponse> gerarLancamentos(RecorrenciaFinanceira recorrencia, int quantidade) {
        if (!Boolean.TRUE.equals(recorrencia.getAtivo())) {
            throw new BusinessException("Recorrencia financeira pausada.");
        }

        List<FinanceiroResponse> gerados = new ArrayList<>();
        for (int i = 0; i < quantidade; i++) {
            if (recorrencia.getTotalGeracoes() != null
                    && recorrencia.getGeracoesRealizadas() >= recorrencia.getTotalGeracoes()) {
                recorrencia.setAtivo(false);
                break;
            }

            int sequencia = recorrencia.getGeracoesRealizadas() + 1;
            LocalDate vencimento = recorrencia.getProximaGeracao();
            gerados.add(financeiroService.criarPorRecorrencia(recorrencia, vencimento, sequencia));
            recorrencia.setGeracoesRealizadas(sequencia);
            recorrencia.setProximaGeracao(vencimento.plusMonths(recorrencia.getIntervaloMeses()));
        }

        if (gerados.isEmpty()) {
            throw new BusinessException("Recorrencia ja atingiu o total de geracoes.");
        }

        auditoriaService.registrar(
                "Financeiro",
                "GERAR_RECORRENCIA",
                gerados.size() + " lancamento(s) gerado(s) pela recorrencia financeira",
                recorrencia.getId()
        );
        return gerados;
    }

    private void preencher(RecorrenciaFinanceira recorrencia,
                           RecorrenciaFinanceiraRequest request,
                           Usuario usuario) {
        recorrencia.setDescricao(request.getDescricao().trim());
        recorrencia.setTipo(request.getTipo());
        recorrencia.setCategoria(normalizarTexto(request.getCategoria()));
        recorrencia.setValor(request.getValor());
        recorrencia.setMetodoPagamento(request.getMetodoPagamento());
        recorrencia.setStatusLancamento(request.getStatusLancamento() != null
                ? request.getStatusLancamento()
                : StatusPagamento.PENDENTE);
        recorrencia.setDataInicio(request.getDataInicio());
        recorrencia.setProximaGeracao(request.getDataInicio());
        recorrencia.setIntervaloMeses(request.getIntervaloMeses() != null ? request.getIntervaloMeses() : 1);
        recorrencia.setTotalGeracoes(request.getTotalGeracoes());
        recorrencia.setAtivo(true);
        recorrencia.setObservacao(normalizarTexto(request.getObservacao()));
        recorrencia.setUsuario(usuario);
        recorrencia.setEmpresa(usuario.getEmpresa());
        recorrencia.setFilial(resolverFilial(request.getFilialId(), usuario));
    }

    private Filial resolverFilial(UUID filialId, Usuario usuario) {
        if (filialId == null) {
            return usuario != null ? usuario.getFilial() : null;
        }

        Filial filial = filialRepository.findById(filialId)
                .orElseThrow(() -> new BusinessException("Filial nao encontrada"));

        UUID empresaUsuarioId = usuario != null && usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null;
        UUID empresaFilialId = filial.getEmpresa() != null ? filial.getEmpresa().getId() : null;
        if (empresaUsuarioId == null || !empresaUsuarioId.equals(empresaFilialId)) {
            throw new BusinessException("Filial nao pertence a empresa da recorrencia financeira");
        }

        return filial;
    }

    private void validarRequest(RecorrenciaFinanceiraRequest request) {
        if (request == null) {
            throw new BusinessException("Dados da recorrencia financeira sao obrigatorios.");
        }
        if (request.getDescricao() == null || request.getDescricao().trim().isEmpty()) {
            throw new BusinessException("Descricao da recorrencia e obrigatoria.");
        }
        if (request.getTipo() == null) {
            throw new BusinessException("Tipo financeiro da recorrencia e obrigatorio.");
        }
        if (request.getMetodoPagamento() == null) {
            request.setMetodoPagamento(MetodoPagamento.PIX);
        }
        if (request.getStatusLancamento() == StatusPagamento.ESTORNADO
                || request.getStatusLancamento() == StatusPagamento.CANCELADO) {
            throw new BusinessException("Status da recorrencia deve gerar lancamentos pendentes, aprovados ou recusados.");
        }
        if (request.getDataInicio() == null) {
            throw new BusinessException("Data inicial da recorrencia e obrigatoria.");
        }
    }

    private Usuario resolverUsuarioResponsavel(UUID usuarioId) {
        if (usuarioId != null) {
            return usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new BusinessException("Usuario nao encontrado"));
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return null;
        }

        return usuarioRepository.findByLoginIgnoreCase(authentication.getName())
                .orElse(null);
    }

    private RecorrenciaFinanceira buscarEntidade(UUID id) {
        if (id == null) {
            throw new BusinessException("ID da recorrencia financeira e obrigatorio.");
        }

        return recorrenciaRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Recorrencia financeira nao encontrada."));
    }

    private RecorrenciaFinanceiraResponse toResponse(RecorrenciaFinanceira recorrencia) {
        MetodoPagamento metodo = recorrencia.getMetodoPagamento();
        return RecorrenciaFinanceiraResponse.builder()
                .id(recorrencia.getId())
                .descricao(recorrencia.getDescricao())
                .tipo(recorrencia.getTipo())
                .categoria(recorrencia.getCategoria())
                .valor(recorrencia.getValor())
                .metodoPagamento(metodo)
                .metodoPagamentoDescricao(metodo != null ? metodo.getDescricao() : null)
                .statusLancamento(recorrencia.getStatusLancamento())
                .dataInicio(recorrencia.getDataInicio())
                .proximaGeracao(recorrencia.getProximaGeracao())
                .intervaloMeses(recorrencia.getIntervaloMeses())
                .totalGeracoes(recorrencia.getTotalGeracoes())
                .geracoesRealizadas(recorrencia.getGeracoesRealizadas())
                .ativo(recorrencia.getAtivo())
                .usuarioId(recorrencia.getUsuario() != null ? recorrencia.getUsuario().getId() : null)
                .filialId(recorrencia.getFilial() != null ? recorrencia.getFilial().getId() : null)
                .filial(recorrencia.getFilial() != null ? recorrencia.getFilial().getNome() : null)
                .observacao(recorrencia.getObservacao())
                .criadoEm(recorrencia.getCriadoEm())
                .atualizadoEm(recorrencia.getAtualizadoEm())
                .build();
    }

    private String normalizarTexto(String valor) {
        return valor == null || valor.trim().isEmpty() ? null : valor.trim();
    }
}
