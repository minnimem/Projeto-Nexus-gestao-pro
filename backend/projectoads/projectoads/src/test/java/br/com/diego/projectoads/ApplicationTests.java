package br.com.diego.projectoads;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootTest
class ApplicationTests {

	@Test
	void gerarSenha() {
		String hash = new BCryptPasswordEncoder().encode("123456");
		System.out.println(hash);
	}
}