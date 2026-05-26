package br.com.diego.projectoads.config;

import br.com.diego.projectoads.config.Enum.Perfil;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Usuario;
import br.com.diego.projectoads.repository.EmpresaRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.LinkedHashSet;

@Configuration
public class MasterBootstrapConfig {

    private static final Logger log = LoggerFactory.getLogger(MasterBootstrapConfig.class);
    private static final String MASTER_LOGIN = "master";

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    @Bean
    @Order(2)
    public ApplicationRunner criarUsuarioMaster(UsuarioRepository usuarioRepository,
                                                EmpresaRepository empresaRepository,
                                                PasswordEncoder passwordEncoder) {
        return args -> {
            if (datasourceUrl != null && datasourceUrl.toLowerCase().contains(":h2:")) {
                return;
            }

            usuarioRepository.findByLoginIgnoreCase(MASTER_LOGIN).ifPresentOrElse(usuario -> {
                if (!Perfil.MASTER.equals(usuario.getPerfil())) {
                    usuario.setPerfil(Perfil.MASTER);
                    usuarioRepository.save(usuario);
                    log.info("Usuario master existente promovido para perfil MASTER.");
                }
            }, () -> {
                Empresa empresa = empresaRepository.findAll().stream()
                        .findFirst()
                        .orElseGet(() -> {
                            Empresa novaEmpresa = new Empresa();
                            novaEmpresa.setNome("Nexus Gestao Pro");
                            novaEmpresa.setRazaoSocial("Nexus Gestao Pro");
                            return empresaRepository.save(novaEmpresa);
                        });

                Usuario master = new Usuario();
                master.setNome("Master");
                master.setLogin(MASTER_LOGIN);
                master.setSenhaUsuario(passwordEncoder.encode("0123456"));
                master.setPerfil(Perfil.MASTER);
                master.setEmpresa(empresa);
                master.setAtivo(true);
                master.setTentativasLogin(0);
                master.setBloqueado(false);
                master.setPermissoesExtras(new LinkedHashSet<>());
                master.setPermissoesBloqueadas(new LinkedHashSet<>());

                usuarioRepository.save(master);
                log.info("Usuario master inicial criado com perfil MASTER.");
            });
        };
    }
}
