package br.com.diego.projectoads.config;



import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfiguration {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfiguration.class);

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.driver-class-name}")
    String driver;


    //@Bean
    public DataSource dataSource(){
        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setUrl(url);
        ds.setUsername(username);
        ds.setPassword(password);
        ds.setDriverClassName(driver);
        return ds;
    }

    @Bean
    public DataSource hikariDataSource(){

        HikariConfig config = new HikariConfig();
        config.setUsername(username);
        config.setUsername(username);
        config.setPassword(password);
        config.setJdbcUrl(url);

        config.setMaximumPoolSize(10); //maximo de conexão liberadas
        config.setMinimumIdle(1); // tamanho inicial
        config.setPoolName("TB_ADS");
        config.setMaxLifetime(6000000); //600 mil ms(10m apos de conexão)
        config.setConnectionTimeout(100000); // time para conseguir uma conexão
        config.setConnectionTestQuery("select 1"); //testar se esta conectado com bando

        return new HikariDataSource(config);
    }

    @Bean
    public ApplicationRunner atualizarRestricoesDoCaixa(DataSource dataSource) {
        return args -> {
            try (var connection = dataSource.getConnection();
                 var statement = connection.createStatement()) {
                statement.execute("alter table if exists public.usuario add column if not exists permissoes_extras varchar(2000)");
                statement.execute("alter table if exists public.usuario add column if not exists permissoes_bloqueadas varchar(2000)");
                statement.execute("alter table if exists public.caixa drop constraint if exists caixa_perfil_check");
                statement.execute("""
                        alter table if exists public.caixa
                        add constraint caixa_perfil_check
                        check (perfil in ('ADMIN', 'GERENTE', 'VENDEDOR', 'OPERADOR_CAIXA', 'ESTOQUISTA', 'FINANCEIRO'))
                        """);
            } catch (Exception ex) {
                log.warn("Nao foi possivel atualizar a restricao caixa_perfil_check.", ex);
            }
        };
    }
}
