package it.unito.orderservice.service;
import com.rabbitmq.client.Channel;
import it.unito.orderservice.dto.ReadyTicketDTO;
import it.unito.orderservice.model.Order;
import it.unito.orderservice.model.OrderStatus;
import it.unito.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReadyTicketMessageListener {

    private final OrderRepository orderRepository;


    @RabbitListener(queues = "${app.rabbitmq.queue.ready-ticket}")
    public void handleReadyTicketCommand(ReadyTicketDTO readyTicketDTO, Channel ch,
                                         @Header(AmqpHeaders.DELIVERY_TAG) long tag) throws IOException {
        log.info("Received PrepareTicketCommand for order ID: {}", readyTicketDTO.getOrderId());
        try {
            if (orderRepository.existsById(readyTicketDTO.getOrderId())) {
                Order order = orderRepository.findById(readyTicketDTO.getOrderId()).orElseThrow();
                order.setStatus(OrderStatus.READY_FOR_PICKUP);
                orderRepository.save(order);
            }
            ch.basicAck(tag, false);                // OK
        } catch (DataIntegrityViolationException ex) {
            log.error("Violato constraint status: {}", ex.getMessage());
            // Scarta il messaggio (no requeue) altrimenti rimane d'ostaggio
            ch.basicReject(tag, false);
        } catch (Exception ex) {
            log.error("Errore imprevisto, requeue...", ex);
            ch.basicNack(tag, false, true);         // lo ritenterai più tardi
        }

     }
}
