package it.unito.kitchenservice.service;

import it.unito.kitchenservice.model.Ticket;
import it.unito.kitchenservice.model.TicketStatus;
import it.unito.kitchenservice.repository.TicketRepository;
import it.unito.orderservice.dto.ReadyTicketDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j // Lombok: Logger SLF4j
public class TicketService {

    private final RabbitTemplate rabbitTemplate;

    @Value("${app.rabbitmq.exchange}")
    private String exchangeName;

    @Value("${app.rabbitmq.routingkey.ready-ticket}")
    private String readyTicketRoutingKey;

    private final TicketRepository ticketRepository;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public void setTicketCompleted(Long orderId) {
        Ticket ticket = ticketRepository.findById(orderId).orElseThrow();
        ticket.setStatus(TicketStatus.READY_FOR_PICKUP);
        ticketRepository.save(ticket);
        try{
            ReadyTicketDTO readyTicketDTO = ReadyTicketDTO.builder()
                    .orderId(ticket.getOrderId())
                    .restaurantId(ticket.getRestaurantId())
                    .status(ticket.getStatus().name())
                    .build();
            rabbitTemplate.convertAndSend(exchangeName, readyTicketRoutingKey, readyTicketDTO);
        }catch(Exception e){
            log.error("Failed to send message to RabbitMQ: {}", e.getMessage(), e);
        }
    }
}
