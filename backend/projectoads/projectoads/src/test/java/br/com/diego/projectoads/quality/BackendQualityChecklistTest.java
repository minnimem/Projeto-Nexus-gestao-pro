package br.com.diego.projectoads.quality;

import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class BackendQualityChecklistTest {

    private static final Path PROJECT_ROOT = Path.of("").toAbsolutePath();
    private static final Path MAIN = PROJECT_ROOT.resolve("src/main");
    private static final Path JAVA = MAIN.resolve("java/br/com/diego/projectoads");
    private static final Path RESOURCES = MAIN.resolve("resources");

    @Test
    void applicationYmlMantemPostgresConfiguravel() throws IOException {
        String yaml = read(RESOURCES.resolve("application.yml"));

        assertThat(yaml).contains("jdbc:postgresql://localhost:5432/TB_ADS");
        assertThat(yaml).contains("${DB_URL:");
        assertThat(yaml).contains("${DB_USERNAME:");
        assertThat(yaml).contains("${DB_PASSWORD:");
        assertThat(yaml).contains("ddl-auto: ${JPA_DDL_AUTO:update}");
        assertThat(yaml).contains("show-sql: ${JPA_SHOW_SQL:false}");
        assertThat(yaml).contains("format_sql: ${JPA_FORMAT_SQL:false}");
        assertThat(yaml).contains("driver-class-name: org.postgresql.Driver");
    }

    @Test
    void entidadesJpaPossuemIdETabelasMapeadas() throws IOException {
        List<Path> entities = javaFiles(JAVA.resolve("model"));

        assertThat(entities).isNotEmpty();
        for (Path entity : entities) {
            String source = read(entity);
            if (!source.contains("@Entity")) {
                continue;
            }

            assertThat(source)
                    .as(entity.getFileName() + " deve declarar @Table para schema/nome previsivel")
                    .contains("@Table");
            assertThat(source)
                    .as(entity.getFileName() + " deve declarar @Id")
                    .contains("@Id");
        }
    }

    @Test
    void enumsJpaSaoPersistidosComoString() throws IOException {
        List<Path> entities = javaFiles(JAVA.resolve("model"));

        for (Path entity : entities) {
            String source = read(entity);
            if (!source.contains("@Enumerated")) {
                continue;
            }

            assertThat(source)
                    .as(entity.getFileName() + " deve usar EnumType.STRING para evitar quebra por ordinal")
                    .doesNotContain("@Enumerated(EnumType.ORDINAL)")
                    .contains("EnumType.STRING");
        }
    }

    @Test
    void cascadesComRemocaoSaoRestritosAAgregadosConhecidos() throws IOException {
        List<String> allowed = List.of(
                "CompraEstoque.java",
                "Pedido.java",
                "OrdemServico.java"
        );

        for (Path entity : javaFiles(JAVA.resolve("model"))) {
            String source = read(entity);
            boolean destructiveCascade = source.contains("CascadeType.REMOVE")
                    || source.contains("CascadeType.ALL")
                    || source.contains("orphanRemoval = true");

            if (destructiveCascade) {
                assertThat(allowed)
                        .as("Cascade destrutivo deve ficar apenas em agregados pai-filho controlados")
                        .contains(entity.getFileName().toString());
            }
        }
    }

    @Test
    void dtosDeRequestPossuemValidacoesDeEntrada() throws IOException {
        Set<String> criticalRequests = Set.of(
                "CaixaAberturaRequest.java",
                "CaixaFechamentoRequest.java",
                "CaixaMovimentoRequest.java",
                "CompraEstoqueRequest.java",
                "ComissaoConfigRequest.java",
                "ConfiguracaoAutomacaoComercialRequest.java",
                "ConfiguracaoFiscalRequest.java",
                "ContratoEmpresaRequest.java",
                "DocumentoFiscalCartaCorrecaoRequest.java",
                "FinanceiroRequest.java",
                "FollowUpCobrancaRequest.java",
                "FollowUpComercialRequest.java",
                "LoginRequest.java",
                "OrdemServicoRequest.java",
                "OrdemServicoPecaRequest.java",
                "OrdemServicoStatusRequest.java",
                "RecorrenciaFinanceiraRequest.java",
                "UsuarioRequest.java"
        );
        List<Path> requests = javaFiles(JAVA.resolve("dto")).stream()
                .filter(path -> criticalRequests.contains(path.getFileName().toString()))
                .toList();

        assertThat(requests).hasSize(criticalRequests.size());
        for (Path request : requests) {
            String source = read(request);
            assertThat(source)
                    .as(request.getFileName() + " deve ter pelo menos uma anotacao de validacao")
                    .containsAnyOf(
                            "@NotBlank", "@NotNull", "@Positive", "@Min", "@Size", "@Email", "@Pattern", "@Valid",
                            "@NotEmpty", "@DecimalMin", "@DecimalMax"
                    );
        }
    }

    @Test
    void businessExceptionEGlobalExceptionHandlerMantemContrato() {
        BusinessException exception = new BusinessException("Regra de negocio violada");
        assertThat(exception).isInstanceOf(RuntimeException.class);
        assertThat(exception.getMessage()).isEqualTo("Regra de negocio violada");

        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        ResponseEntity<?> response = handler.handleBusiness(exception);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isInstanceOf(Map.class);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("erro")).isEqualTo("Regra de negocio violada");
    }

    @Test
    void bancoPossuiDocumentacaoScriptsDeBackupECargaInicial() throws IOException {
        Path databaseReadme = RESOURCES.resolve("db/README.md");
        Path migrationsReadme = RESOURCES.resolve("db/migration/README.md");
        Path backupScript = PROJECT_ROOT.resolve("scripts/backup_tb_ads.ps1");
        Path seedScript = PROJECT_ROOT.resolve("scripts/seed_tb_ads_minimo.sql");

        assertThat(databaseReadme).exists();
        assertThat(migrationsReadme).exists();
        assertThat(backupScript).exists();
        assertThat(seedScript).exists();

        assertThat(read(databaseReadme))
                .contains("TB_ADS")
                .contains("JPA_DDL_AUTO")
                .contains("backup_tb_ads.ps1")
                .contains("seed_tb_ads_minimo.sql");
        assertThat(read(backupScript))
                .contains("pg_dump")
                .contains("PGPASSWORD")
                .doesNotContain("231247");
        assertThat(read(seedScript))
                .contains("INSERT INTO empresa")
                .contains("WHERE NOT EXISTS")
                .contains("MasterBootstrapConfig");
    }

    private static List<Path> javaFiles(Path root) throws IOException {
        try (Stream<Path> stream = Files.walk(root)) {
            return stream
                    .filter(path -> path.toString().endsWith(".java"))
                    .toList();
        }
    }

    private static String read(Path path) throws IOException {
        return Files.readString(path, StandardCharsets.UTF_8);
    }
}
