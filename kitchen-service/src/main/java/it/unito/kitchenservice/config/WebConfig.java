package it.unito.kitchenservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Applica a tutti gli endpoint ("/**")
                        .allowedOrigins("http://localhost:3000") // Permette richieste da questo origine (frontend Next.js)
                        .allowedOrigins("http://192.168.49.2:31830")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Metodi HTTP permessi
                        .allowedHeaders("*") // Headers permessi
                        .allowCredentials(true); // Permette cookies/auth headers se usati
            }
        };
    }
}
