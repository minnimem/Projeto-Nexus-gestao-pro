package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.StatusOrdemServico;
import br.com.diego.projectoads.dto.OrdemServicoPecaRequest;
import br.com.diego.projectoads.dto.OrdemServicoRequest;
import br.com.diego.projectoads.dto.OrdemServicoResponse;
import br.com.diego.projectoads.dto.OrdemServicoStatusRequest;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Filial;
import br.com.diego.projectoads.model.Financeiro;
import br.com.diego.projectoads.model.OrdemServico;
import br.com.diego.projectoads.model.Produto;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.ClienteRepository;
import br.com.diego.projectoads.repository.EmpresaRepository;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.FinanceiroRepository;
import br.com.diego.projectoads.repository.OrdemServicoRepository;
import br.com.diego.projectoads.repository.ProdutoRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrdemServicoServiceTest {

    private final OrdemServicoRepository ordemServicoRepository = mock(OrdemServicoRepository.class);
    private final EmpresaRepository empresaRepository = mock(EmpresaRepository.class);
    private final FilialRepository filialRepository = mock(FilialRepository.class);
    private final ClienteRepository clienteRepository = mock(ClienteRepository.class);
    private final UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
    private final FinanceiroRepository financeiroRepository = mock(FinanceiroRepository.class);
    private final ProdutoRepository produtoRepository = mock(ProdutoRepository.class);
    private final EstoqueService estoqueService = mock(EstoqueService.class);
    private final AuditoriaService auditoriaService = mock(AuditoriaService.class);
    private final OrdemServicoService service = new OrdemServicoService(
            ordemServicoRepository,
            empresaRepository,
            filialRepository,
            clienteRepository,
            usuarioRepository,
            financeiroRepository,
            produtoRepository,
            estoqueService,
            auditoriaService
    );

    @Test
    void deveCriarOrdemServicoAberta() {
        Empresa empresa = empresa();
        Cliente cliente = cliente();
        Filial filial = filial(empresa);
        Usuario tecnico = tecnico(empresa);
        Produto produto = produto();
        OrdemServicoRequest request = request(empresa, cliente);
        request.setFilialId(filial.getId());
        request.setTecnicoId(tecnico.getId());
        OrdemServicoPecaRequest peca = new OrdemServicoPecaRequest();
        peca.setProdutoId(produto.getIdProduto());
        peca.setQuantidade(2);
        peca.setCustoUnitario(BigDecimal.valueOf(20));
        peca.setValorUnitario(BigDecimal.valueOf(50));
        request.setPecas(List.of(peca));

        when(empresaRepository.findById(empresa.getId())).thenReturn(Optional.of(empresa));
        when(clienteRepository.findById(cliente.getIdCliente())).thenReturn(Optional.of(cliente));
        when(filialRepository.findById(filial.getId())).thenReturn(Optional.of(filial));
        when(usuarioRepository.findById(tecnico.getId())).thenReturn(Optional.of(tecnico));
        when(produtoRepository.findById(produto.getIdProduto())).thenReturn(Optional.of(produto));
        when(ordemServicoRepository.save(any(OrdemServico.class))).thenAnswer(invocation -> {
            OrdemServico ordem = invocation.getArgument(0);
            ordem.setId(UUID.randomUUID());
            ordem.prePersist();
            return ordem;
        });

        OrdemServicoResponse response = service.criar(request);

        assertNotNull(response.getId());
        assertTrue(response.getNumero().startsWith("OS-"));
        assertEquals(StatusOrdemServico.ABERTA, response.getStatus());
        assertEquals("Instalacao de equipamento", response.getTitulo());
        assertEquals(BigDecimal.valueOf(350), response.getValorEstimado());
        assertEquals("Cabo HDMI; Suporte articulado", response.getPecasUtilizadas());
        assertEquals("Foto antes; Foto depois; Checklist assinado", response.getEvidencias());
        assertEquals("https://arquivos.local/os-1.pdf", response.getAnexos());
        assertEquals("RECORRENTE", response.getTipoServico());
        assertEquals(true, response.getGarantiaCoberta());
        assertEquals(LocalDate.now().plusMonths(6), response.getGarantiaAte());
        assertEquals(true, response.getRecorrente());
        assertEquals(1, response.getRecorrenciaIntervaloMeses());
        assertEquals(LocalDate.now().plusMonths(1), response.getProximaRecorrencia());
        assertEquals(true, response.getAssinaturaCliente());
        assertEquals("Maria Cliente", response.getAssinaturaClienteNome());
        assertEquals("12345678900", response.getAssinaturaClienteDocumento());
        assertEquals("Aceite coletado presencialmente.", response.getAssinaturaClienteObservacao());
        assertNotNull(response.getAssinaturaClienteRegistradaEm());
        assertEquals(1, response.getPecas().size());
        assertEquals(produto.getIdProduto(), response.getPecas().getFirst().getProdutoId());
        assertEquals(BigDecimal.valueOf(100), response.getPecas().getFirst().getValorTotal());
        assertEquals(BigDecimal.valueOf(60), response.getPecas().getFirst().getMargem());
        assertEquals(filial.getId(), response.getFilialId());
        assertEquals(tecnico.getId(), response.getTecnicoId());
        verify(auditoriaService).registrar("OrdemServico", "OS_CRIADA", "Ordem de servico criada: " + response.getNumero(), response.getId());
    }

    @Test
    void deveListarOrdensServico() {
        OrdemServico ordem = ordem();
        when(ordemServicoRepository.findAllByOrderByCriadoEmDesc()).thenReturn(List.of(ordem));

        List<OrdemServicoResponse> response = service.listar();

        assertEquals(1, response.size());
        assertEquals(ordem.getNumero(), response.getFirst().getNumero());
    }

    @Test
    void deveConcluirOrdemServicoAoAtualizarStatus() {
        OrdemServico ordem = ordem();
        OrdemServicoStatusRequest request = new OrdemServicoStatusRequest();
        request.setStatus(StatusOrdemServico.CONCLUIDA);
        request.setObservacao("Servico concluido no cliente.");
        when(ordemServicoRepository.findById(ordem.getId())).thenReturn(Optional.of(ordem));
        when(ordemServicoRepository.save(any(OrdemServico.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrdemServicoResponse response = service.atualizarStatus(ordem.getId(), request);

        assertEquals(StatusOrdemServico.CONCLUIDA, response.getStatus());
        assertEquals("Servico concluido no cliente.", response.getObservacao());
        assertNotNull(response.getDataConclusao());
        verify(auditoriaService).registrar("OrdemServico", "OS_STATUS", "Status da ordem de servico alterado para CONCLUIDA", response.getId());
    }

    @Test
    void deveFaturarOrdemServicoGerandoReceitaPendente() {
        OrdemServico ordem = ordem();
        ordem.setValorEstimado(BigDecimal.valueOf(480));
        when(ordemServicoRepository.findById(ordem.getId())).thenReturn(Optional.of(ordem));
        when(financeiroRepository.save(any(Financeiro.class))).thenAnswer(invocation -> {
            Financeiro financeiro = invocation.getArgument(0);
            financeiro.setId(UUID.randomUUID());
            financeiro.prePersist();
            return financeiro;
        });
        when(ordemServicoRepository.save(any(OrdemServico.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrdemServicoResponse response = service.faturar(ordem.getId());

        assertEquals(StatusOrdemServico.FATURADA, response.getStatus());
        assertNotNull(response.getDataConclusao());
        assertNotNull(response.getFinanceiroId());
        verify(financeiroRepository).save(any(Financeiro.class));
        verify(auditoriaService).registrar("OrdemServico", "OS_FATURADA", "Ordem de servico faturada: " + response.getNumero(), response.getId());
    }

    @Test
    void deveBloquearFaturamentoSemValor() {
        OrdemServico ordem = ordem();
        ordem.setValorEstimado(BigDecimal.ZERO);
        when(ordemServicoRepository.findById(ordem.getId())).thenReturn(Optional.of(ordem));

        assertThrows(BusinessException.class, () -> service.faturar(ordem.getId()));

        verify(financeiroRepository, never()).save(any());
    }

    @Test
    void deveBaixarPecasDaOrdemServicoNoEstoque() {
        OrdemServico ordem = ordem();
        ordem.setPecasUtilizadas("2x Cabo HDMI; Fonte 12V");
        when(ordemServicoRepository.findById(ordem.getId())).thenReturn(Optional.of(ordem));
        when(estoqueService.consumirPecasOrdemServico("2x Cabo HDMI; Fonte 12V", ordem.getNumero())).thenReturn(3);
        when(ordemServicoRepository.save(any(OrdemServico.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrdemServicoResponse response = service.baixarPecas(ordem.getId());

        assertEquals(true, response.getPecasEstoqueBaixado());
        assertNotNull(response.getPecasEstoqueBaixadoEm());
        verify(estoqueService).consumirPecasOrdemServico("2x Cabo HDMI; Fonte 12V", ordem.getNumero());
        verify(auditoriaService).registrar("OrdemServico", "OS_BAIXA_PECAS", "Baixa de 3 peca(s) no estoque pela OS " + response.getNumero(), response.getId());
    }

    @Test
    void deveBloquearBaixaDuplicadaDePecas() {
        OrdemServico ordem = ordem();
        ordem.setPecasEstoqueBaixado(true);
        when(ordemServicoRepository.findById(ordem.getId())).thenReturn(Optional.of(ordem));

        assertThrows(BusinessException.class, () -> service.baixarPecas(ordem.getId()));

        verify(estoqueService, never()).consumirPecasOrdemServico(any(), any());
    }

    @Test
    void deveAnexarArquivoNaOrdemServico() throws Exception {
        OrdemServico ordem = ordem();
        Path uploadDir = Files.createTempDirectory("os-anexos-test");
        MockMultipartFile arquivo = new MockMultipartFile(
                "file",
                "foto antes.jpg",
                "image/jpeg",
                "conteudo".getBytes()
        );
        ReflectionTestUtils.setField(service, "ordemServicoUploadDir", uploadDir.toString());
        when(ordemServicoRepository.findById(ordem.getId())).thenReturn(Optional.of(ordem));
        when(ordemServicoRepository.save(any(OrdemServico.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrdemServicoResponse response = service.anexarArquivo(ordem.getId(), arquivo);

        assertNotNull(response.getAnexos());
        assertTrue(response.getAnexos().contains("/ordens-servico/" + ordem.getId() + "/anexos/"));
        assertTrue(Files.list(uploadDir.resolve(ordem.getId().toString())).findAny().isPresent());
        verify(auditoriaService).registrar("OrdemServico", "OS_ANEXO", "Anexo incluido na ordem de servico: " + ordem.getNumero(), ordem.getId());
    }

    @Test
    void deveRegistrarAssinaturaDigitalizadaNaOrdemServico() throws Exception {
        OrdemServico ordem = ordem();
        Path uploadDir = Files.createTempDirectory("os-assinatura-test");
        MockMultipartFile arquivo = new MockMultipartFile(
                "file",
                "assinatura.png",
                "image/png",
                "imagem".getBytes()
        );
        ReflectionTestUtils.setField(service, "ordemServicoUploadDir", uploadDir.toString());
        when(ordemServicoRepository.findById(ordem.getId())).thenReturn(Optional.of(ordem));
        when(ordemServicoRepository.save(any(OrdemServico.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrdemServicoResponse response = service.registrarAssinatura(
                ordem.getId(),
                arquivo,
                "Maria Cliente",
                "12345678900",
                "Assinatura coletada no atendimento."
        );

        assertEquals(true, response.getAssinaturaCliente());
        assertEquals("Maria Cliente", response.getAssinaturaClienteNome());
        assertEquals("12345678900", response.getAssinaturaClienteDocumento());
        assertEquals("Assinatura coletada no atendimento.", response.getAssinaturaClienteObservacao());
        assertNotNull(response.getAssinaturaClienteRegistradaEm());
        assertTrue(response.getAnexos().contains("/assinatura-"));
        verify(auditoriaService).registrar("OrdemServico", "OS_ASSINATURA", "Assinatura digitalizada registrada na ordem de servico: " + ordem.getNumero(), ordem.getId());
    }

    @Test
    void deveBloquearCriacaoSemTitulo() {
        Empresa empresa = empresa();
        Cliente cliente = cliente();
        OrdemServicoRequest request = request(empresa, cliente);
        request.setTitulo(" ");

        assertThrows(BusinessException.class, () -> service.criar(request));

        verify(ordemServicoRepository, never()).save(any());
    }

    @Test
    void deveBloquearFilialDeOutraEmpresa() {
        Empresa empresa = empresa();
        Empresa outraEmpresa = empresa();
        Cliente cliente = cliente();
        Filial filial = filial(outraEmpresa);
        OrdemServicoRequest request = request(empresa, cliente);
        request.setFilialId(filial.getId());
        when(empresaRepository.findById(empresa.getId())).thenReturn(Optional.of(empresa));
        when(clienteRepository.findById(cliente.getIdCliente())).thenReturn(Optional.of(cliente));
        when(filialRepository.findById(filial.getId())).thenReturn(Optional.of(filial));

        assertThrows(BusinessException.class, () -> service.criar(request));

        verify(ordemServicoRepository, never()).save(any());
    }

    private OrdemServicoRequest request(Empresa empresa, Cliente cliente) {
        OrdemServicoRequest request = new OrdemServicoRequest();
        request.setEmpresaId(empresa.getId());
        request.setClienteId(cliente.getIdCliente());
        request.setTitulo("Instalacao de equipamento");
        request.setDescricao("Instalar e testar equipamento no cliente.");
        request.setChecklist("Validar energia; testar operacao; coletar assinatura");
        request.setPrazo(LocalDate.now().plusDays(3));
        request.setValorEstimado(BigDecimal.valueOf(350));
        request.setPecasUtilizadas("Cabo HDMI; Suporte articulado");
        request.setEvidencias("Foto antes; Foto depois; Checklist assinado");
        request.setAnexos("https://arquivos.local/os-1.pdf");
        request.setTipoServico("RECORRENTE");
        request.setGarantiaCoberta(true);
        request.setGarantiaAte(LocalDate.now().plusMonths(6));
        request.setRecorrente(true);
        request.setRecorrenciaIntervaloMeses(1);
        request.setProximaRecorrencia(LocalDate.now().plusMonths(1));
        request.setAssinaturaCliente(true);
        request.setAssinaturaClienteNome("Maria Cliente");
        request.setAssinaturaClienteDocumento("12345678900");
        request.setAssinaturaClienteObservacao("Aceite coletado presencialmente.");
        return request;
    }

    private OrdemServico ordem() {
        Empresa empresa = empresa();
        Cliente cliente = cliente();
        OrdemServico ordem = new OrdemServico();
        ordem.setId(UUID.randomUUID());
        ordem.setNumero("OS-20260503050100");
        ordem.setEmpresa(empresa);
        ordem.setCliente(cliente);
        ordem.setStatus(StatusOrdemServico.ABERTA);
        ordem.setTitulo("Instalacao de equipamento");
        ordem.prePersist();
        return ordem;
    }

    private Empresa empresa() {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        empresa.setNome("Empresa OS");
        return empresa;
    }

    private Filial filial(Empresa empresa) {
        Filial filial = new Filial();
        filial.setId(UUID.randomUUID());
        filial.setNome("Filial Centro");
        filial.setEmpresa(empresa);
        return filial;
    }

    private Cliente cliente() {
        Cliente cliente = new Cliente();
        cliente.setIdCliente(UUID.randomUUID());
        cliente.setNome("Cliente OS");
        return cliente;
    }

    private Usuario tecnico(Empresa empresa) {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setNome("Tecnico OS");
        usuario.setLogin("tecnico.os");
        usuario.setEmpresa(empresa);
        return usuario;
    }

    private Produto produto() {
        Produto produto = new Produto();
        produto.setIdProduto(UUID.randomUUID());
        produto.setNomeProduto("Cabo HDMI");
        produto.setSku("CABO-HDMI");
        produto.setCodBarras("7890000000010");
        produto.setPrecoCompra(BigDecimal.valueOf(20));
        produto.setPrecoVenda(BigDecimal.valueOf(50));
        return produto;
    }
}
