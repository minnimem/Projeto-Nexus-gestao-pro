package br.com.diego.projectoads.config;

import br.com.diego.projectoads.service.AuditoriaService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Component
public class DeleteAuditFilter extends OncePerRequestFilter {

    private final AuditoriaService auditoriaService;

    public DeleteAuditFilter(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        filterChain.doFilter(request, response);

        if (!"DELETE".equalsIgnoreCase(request.getMethod()) || response.getStatus() < 200 || response.getStatus() >= 300) {
            return;
        }

        String rota = request.getRequestURI();
        auditoriaService.registrarExclusao(
                resolverEntidade(rota),
                resolverRegistroId(rota),
                null,
                rota
        );
    }

    private String resolverEntidade(String rota) {
        List<String> partes = partesDaRota(rota);
        if (partes.isEmpty()) {
            return "Registro";
        }

        int index = partes.get(0).equalsIgnoreCase("api") && partes.size() > 1 ? 1 : 0;
        return normalizarEntidade(partes.get(index));
    }

    private String resolverRegistroId(String rota) {
        List<String> partes = partesDaRota(rota);
        if (partes.isEmpty()) {
            return null;
        }

        return partes.get(partes.size() - 1);
    }

    private List<String> partesDaRota(String rota) {
        return Arrays.stream(String.valueOf(rota).split("/"))
                .map(String::trim)
                .filter(parte -> !parte.isBlank())
                .toList();
    }

    private String normalizarEntidade(String valor) {
        String texto = valor.replace("-", " ").replace("_", " ").trim();
        if (texto.isBlank()) {
            return "Registro";
        }

        return texto.substring(0, 1).toUpperCase(Locale.ROOT) + texto.substring(1);
    }
}
