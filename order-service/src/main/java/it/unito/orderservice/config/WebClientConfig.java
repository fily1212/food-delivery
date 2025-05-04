package it.unito.orderservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
@Configuration
public class WebClientConfig {

    @Value("${services.restaurant.url}") // Prenderemo da application.properties
    private String restaurantServiceUrl;

    @Value("${services.accounting.url}") // Prenderemo da application.properties
    private String accountingServiceUrl;

    @Bean
    public WebClient restaurantWebClient(WebClient.Builder builder) {
        return builder.baseUrl(restaurantServiceUrl).build();
    }

    @Bean
    public WebClient accountingWebClient(WebClient.Builder builder) {
        return builder.baseUrl(accountingServiceUrl).build();
    }
}
