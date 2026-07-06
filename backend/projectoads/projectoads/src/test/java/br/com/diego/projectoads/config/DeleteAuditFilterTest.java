package br.com.diego.projectoads.config;

import br.com.diego.projectoads.service.AuditoriaService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class DeleteAuditFilterTest {

    private final AuditoriaService auditoriaService = mock(AuditoriaService.class);
    private final DeleteAuditFilter filter = new DeleteAuditFilter(auditoriaService);

    @Test
    void registraAuditoriaQuandoDeleteRetornaSucesso() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("DELETE", "/api/clientes/123");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> ((MockHttpServletResponse) res).setStatus(204);

        filter.doFilter(request, response, chain);

        verify(auditoriaService).registrarExclusao("Clientes", "123", null, "/api/clientes/123");
    }

    @Test
    void naoRegistraAuditoriaQuandoDeleteFalha() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("DELETE", "/api/produtos/456");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> ((MockHttpServletResponse) res).setStatus(404);

        filter.doFilter(request, response, chain);

        verify(auditoriaService, never()).registrarExclusao("Produtos", "456", null, "/api/produtos/456");
    }

    @Test
    void naoRegistraAuditoriaQuandoMetodoNaoForDelete() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/clientes/123");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> ((MockHttpServletResponse) res).setStatus(200);

        filter.doFilter(request, response, chain);

        verify(auditoriaService, never()).registrarExclusao("Clientes", "123", null, "/api/clientes/123");
    }
}
