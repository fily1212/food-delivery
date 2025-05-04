package it.unito.kitchenservice.config;


import com.fasterxml.jackson.databind.ObjectMapper;
import it.unito.kitchenservice.dto.TicketMessageListener;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchange:fooddelivery.exchange}") // Default se non in properties
    private String exchangeName;

    @Value("${app.rabbitmq.routingkey.prepare-ticket:order.ticket.prepare}") // Default
    private String prepareTicketRoutingKey;

    // 1. Definisce la coda per Kitchen Service
    @Bean
    public Queue kitchenQueue() {
        // (name, durable, exclusive, autoDelete)
        return new Queue(TicketMessageListener.KITCHEN_QUEUE_NAME, true, false, false);
    }

    // 2. Definisce l'exchange (deve corrispondere a quello usato da order-service)
    @Bean
    public Exchange foodDeliveryExchange() {
        return new DirectExchange(exchangeName, true, false);
    }

    // 3. Crea il Binding tra la coda e l'exchange usando la routing key
    @Bean
    public Binding kitchenBinding(Queue kitchenQueue, Exchange foodDeliveryExchange) {
        return BindingBuilder.bind(kitchenQueue)
                .to(foodDeliveryExchange)
                .with(prepareTicketRoutingKey) // La chiave usata da order-service per inviare
                .noargs(); // Necessario per DirectExchange
    }

    // 4. Configura Jackson come convertitore di messaggi (per JSON)
    // Spring Boot lo fa in parte automaticamente, ma è bene essere espliciti
    // e assicurarsi che entrambi i servizi usino lo stesso meccanismo.
    @Bean
    public MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        // Usiamo l'ObjectMapper configurato da Spring Boot
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    // Opzionale: Configurare l'ObjectMapper per essere più robusto
    // @Bean
    // public ObjectMapper objectMapper() {
    //     ObjectMapper mapper = new ObjectMapper();
    //     mapper.findAndRegisterModules(); // Registra moduli come JavaTimeModule
    //     // Aggiungere configurazioni desiderate (es. ignorare proprietà sconosciute)
    //     mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    //     return mapper;
    // }
}
