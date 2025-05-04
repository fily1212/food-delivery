package it.unito.kitchenservice.dto;

import it.unito.kitchenservice.model.OrderItem;
import it.unito.kitchenservice.model.Ticket;
import it.unito.kitchenservice.model.TicketStatus;
import it.unito.kitchenservice.repository.TicketRepository;
import it.unito.orderservice.dto.PrepareTicketCommand;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketMessageListener {

    private final TicketRepository ticketRepository;

    public static final String KITCHEN_QUEUE_NAME = "q.kitchen.prepare-ticket";

    @RabbitListener(queues = KITCHEN_QUEUE_NAME)
    @Transactional
    public void handlePrepareTicketCommand(PrepareTicketCommand command) {
        log.info("Received PrepareTicketCommand for order ID: {}", command.getOrderId());

        if (ticketRepository.existsById(command.getOrderId())) {
            log.warn("Ticket for order ID {} already exists. Ignoring message.", command.getOrderId());
            return;
        }

        Ticket ticket = new Ticket();
        ticket.setOrderId(command.getOrderId());
        ticket.setRestaurantId(command.getRestaurantId());
        ticket.setStatus(TicketStatus.ACCEPTED);

        List<OrderItem> items = command.getItems().stream().map(dto -> {
            OrderItem item = new OrderItem();
            item.setProductName(dto.getMenuItemId()); // usa il campo corretto del DTO
            item.setQuantity(dto.getQuantity());
            return item;
        }).collect(Collectors.toList());

        ticket.setItems(items);
        for (OrderItem item : items) {
            item.setOrder(ticket);
        }

        try {
            ticketRepository.save(ticket);
            log.info("Ticket created for order ID {} with status {}", ticket.getOrderId(), ticket.getStatus());
        } catch (Exception e) {
            log.error("Failed to save ticket for order ID {}. Error: {}", command.getOrderId(), e.getMessage(), e);
            throw e;
        }
    }
}
