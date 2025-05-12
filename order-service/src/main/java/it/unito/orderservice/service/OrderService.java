package it.unito.orderservice.service;

import it.unito.orderservice.dto.*;
import it.unito.orderservice.model.Order;
import it.unito.orderservice.model.OrderItem;
import it.unito.orderservice.model.OrderStatus;
import it.unito.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import java.util.ArrayList;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Lombok: Inietta dipendenze final nel costruttore
@Slf4j // Lombok: Logger SLF4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final WebClient restaurantWebClient; // Inietta i WebClient Beans
    private final WebClient accountingWebClient;
    private final RabbitTemplate rabbitTemplate; // Inietta RabbitTemplate


    @Value("${app.rabbitmq.exchange}")
    private String exchangeName;

    @Value("${app.rabbitmq.routingkey.prepare-ticket}")
    private String prepareTicketRoutingKey;

    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request) {
        log.info("Received request to create order: {}", request);

        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setRestaurantId(request.getRestaurantId());
        order.setStatus(OrderStatus.PENDING_VALIDATION);

        // Mappa i DTO in entità OrderItem e calcola il totale
        List<OrderItem> items;
        items = request.getItems().stream().map(dto -> {
            OrderItem item = new OrderItem();
            item.setOrder(order); // Imposta la relazione inversa
            item.setProductName(dto.getProductName());
            item.setQuantity(dto.getQuantity());
            item.setUnitPrice(dto.getUnitPrice());
            return item;
        }).collect(Collectors.toCollection(ArrayList::new));


        order.setItems(items);

        // Calcola il totale
        BigDecimal total = items.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);
        log.info("Order created with ID: {} and status: {}", savedOrder.getId(), savedOrder.getStatus());

        // 2. Chiama servizi esterni per validazione (Sincrono con WebClient block())
        // Nota: In un'app reattiva pura, non useremmo block(), ma gestiremo la catena Mono/Flux
        boolean restaurantValid = validateRestaurant(savedOrder.getRestaurantId());
        boolean paymentAuthorized = false;
        if (restaurantValid) {
            paymentAuthorized = authorizePayment(savedOrder.getCustomerId(), savedOrder.getTotalAmount());
        }

        // 3. Aggiorna stato ordine in base alle risposte
        OrderStatus finalStatus;
        if (restaurantValid && paymentAuthorized) {
            try {
                // Mappa DTO per messaggio RabbitMQ
                List<OrderItemDTO> itemDTOs = savedOrder.getItems().stream().map(item ->
                        new OrderItemDTO(item.getProductName(), item.getQuantity(), item.getUnitPrice())
                ).toList();

                List<OrderItemMessageDTO> itemMessages = itemDTOs.stream()
                        .map(item -> new OrderItemMessageDTO(item.getProductName(), item.getQuantity())) // Usa productName come id logico
                        .collect(Collectors.toList());

                PrepareTicketCommand command = new PrepareTicketCommand(
                        savedOrder.getId(),
                        savedOrder.getRestaurantId(),
                        itemMessages
                );

                log.info("Order {} approved. Publishing PrepareTicketCommand to exchange '{}' with key '{}'",
                        savedOrder.getId(), exchangeName, prepareTicketRoutingKey);

                // Invia il messaggio all'exchange con la routing key specificata
                rabbitTemplate.setMandatory(true);          // notifica se non c’è una route
                rabbitTemplate.setReturnsCallback(ret ->    // logga eventuali drop
                        log.error("Messaggio UNROUTED: {}", ret));
                rabbitTemplate.setConfirmCallback((cd,ack,c) ->
                        log.info("Broker ack? {}  cause: {}", ack, c));

                rabbitTemplate.convertAndSend(exchangeName, prepareTicketRoutingKey, command);

                finalStatus = OrderStatus.SENT_TO_KITCHEN; // Aggiorna stato dopo invio
                log.info("Order {} status updated to {}", savedOrder.getId(), finalStatus);

            } catch (Exception e) {
                // Gestione errore invio messaggio o deserializzazione
                log.error("Failed to publish PrepareTicketCommand for order {}. Setting status to FAILED.", savedOrder.getId(), e);
                finalStatus = OrderStatus.FAILED; // Stato di errore generico
            }
        } else if (!restaurantValid) {
            finalStatus = OrderStatus.REJECTED_RESTAURANT;
            log.error("Order {} rejected: Restaurant validation failed.", savedOrder.getId());
        } else { // payment failed
            finalStatus = OrderStatus.REJECTED_PAYMENT;
            log.error("Order {} rejected: Payment authorization failed.", savedOrder.getId());
        }

        savedOrder.setStatus(finalStatus);
        Order updatedOrder = orderRepository.save(savedOrder); // Salva lo stato aggiornato

        return mapEntityToDto(updatedOrder);
    }

    private boolean validateRestaurant(Long restaurantId) {
        log.info("Calling Restaurant Service to validate restaurant {}", restaurantId);
        try {
            restaurantWebClient.get()
                    .uri("/restaurants/{id}/validate", restaurantId)
                    .retrieve() // Ottiene la risposta
                    .toBodilessEntity() // Non ci interessa il body, solo lo status code
                    .block(); // Blocca finché la chiamata non è completa (ATTENZIONE: non ideale in scenari high-concurrency)
            log.info("Restaurant {} validation successful", restaurantId);
            return true;
        } catch (WebClientResponseException e) {
            log.warn("Restaurant validation failed for {}: Status Code {}", restaurantId, e.getStatusCode(), e);
            // Potremmo differenziare 404 da altri errori (5xx)
            return false;
        } catch (Exception e) {
            log.error("Error calling restaurant service for restaurant {}", restaurantId, e);
            return false; // Considera qualsiasi eccezione come fallimento
        }
    }

    private boolean authorizePayment(Long customerId, BigDecimal amount) {
        log.info("Calling Accounting Service to authorize payment for customer {}, amount {}", customerId, amount);
        // Creiamo un DTO interno o Map per il body della richiesta
        var requestBody = new AccountingService.AuthorizationRequest(); // Usa la classe interna definita prima
        requestBody.setCustomerId(customerId);
        requestBody.setAmount(amount);

        try {
            accountingWebClient.post()
                    .uri("/accounts/authorize")
                    .bodyValue(requestBody) // Imposta il body
                    .retrieve()
                    .toBodilessEntity()
                    .block(); // Blocca
            log.info("Payment authorized for customer {}", customerId);
            return true;
        } catch (WebClientResponseException e) {
            log.warn("Payment authorization failed for customer {}: Status Code {}", customerId, e.getStatusCode(), e);
            return false;
        } catch (Exception e) {
            log.error("Error calling accounting service for customer {}", customerId, e);
            return false;
        }
    }

    private OrderDTO mapEntityToDto(Order order) {
        List<OrderItemDTO> items = order.getItems().stream().map(entity -> {
            OrderItemDTO dto = new OrderItemDTO();
            dto.setProductName(entity.getProductName());
            dto.setQuantity(entity.getQuantity());
            dto.setUnitPrice(entity.getUnitPrice());
            return dto;
        }).toList();

        return OrderDTO.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .restaurantId(order.getRestaurantId())
                .status(order.getStatus())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    // Metodo per trovare un ordine
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId)); // Gestire meglio con eccezione custom e @ExceptionHandler
        return mapEntityToDto(order);
    }

    public static class AccountingService {
        @lombok.Data
        public static class AuthorizationRequest {
            private Long customerId;
            private BigDecimal amount;
        }
    }


}
