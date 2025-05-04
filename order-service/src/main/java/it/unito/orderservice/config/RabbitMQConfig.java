package it.unito.orderservice.config;

import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Exchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchange}")
    private String exchangeName;

    // Definisce l'exchange se non esiste già sul broker
    @Bean
    public Exchange foodDeliveryExchange() {
        // Usiamo un Direct Exchange: i messaggi vanno alle code la cui binding key
        // corrisponde esattamente alla routing key del messaggio.
        // Alternative: Fanout (broadcast), Topic (pattern matching)
        return new DirectExchange(exchangeName, true, false); // (name, durable, autoDelete)
    }
}