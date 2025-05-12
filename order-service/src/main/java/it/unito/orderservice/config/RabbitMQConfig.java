package it.unito.orderservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchange}")
    private String exchangeName;

    @Value("${app.rabbitmq.routingkey.ready-ticket}")
    private String readyTicketRoutingKey;

    @Value("${app.rabbitmq.queue.ready-ticket}")
    private String readyTicketQueue;

    @Bean
    public Exchange foodDeliveryExchange() {
        return new DirectExchange(exchangeName, true, false);
    }

    @Bean
    Queue readyTicketQueue() {
        return new Queue(readyTicketQueue, true);
    }
    @Bean
    public Binding readyTicketBinding(Queue readyTicketQueue, Exchange foodDeliveryExchange) {
        return BindingBuilder.bind(readyTicketQueue)
                .to(foodDeliveryExchange)
                .with(readyTicketRoutingKey) // La chiave usata da order-service per inviare
                .noargs(); // Necessario per DirectExchange
    }

    @Bean
    public MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
