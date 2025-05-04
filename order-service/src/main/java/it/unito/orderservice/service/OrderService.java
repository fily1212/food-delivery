package it.unito.orderservice.service;

import it.unito.orderservice.dto.CreateOrderRequest;
import it.unito.orderservice.dto.OrderDTO;
import it.unito.orderservice.dto.OrderItemDTO;
import it.unito.orderservice.model.Order;
import it.unito.orderservice.model.OrderStatus;
import it.unito.orderservice.repository.OrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper; // Per serializzare items
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Lombok: Inietta dipendenze final nel costruttore
@Slf4j // Lombok: Logger SLF4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper; // Spring Boot configura un bean ObjectMapper

    @Transactional // Assicura atomicità a livello di DB per questa operazione
    public OrderDTO createOrder(CreateOrderRequest request) {
        log.info("Received request to create order: {}", request);

        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setRestaurantId(request.getRestaurantId());
        order.setStatus(OrderStatus.PENDING_VALIDATION); // Stato iniziale

        // Serializza gli items in JSON per salvarli nel campo TEXT
        try {
            order.setItemsJson(objectMapper.writeValueAsString(request.getItems()));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize order items for request: {}", request, e);
            // Qui si dovrebbe lanciare un'eccezione specifica o gestire l'errore
            // Per semplicità, potremmo impostare uno stato FAILED o lanciare RuntimeException
            throw new RuntimeException("Failed to process order items", e);
        }

        // Calcolo totale (semplificato, assumiamo prezzo sia negli item o lo recupereremo dopo)
        // order.setTotalAmount(calculateTotal(request.getItems()));

        Order savedOrder = orderRepository.save(order);
        log.info("Order created with ID: {} and status: {}", savedOrder.getId(), savedOrder.getStatus());

        // Converti l'entità salvata in DTO per la risposta
        return mapEntityToDto(savedOrder);
    }

    // Metodo helper per mappare Entity a DTO
    private OrderDTO mapEntityToDto(Order order) {
        // Deserializza itemsJson per popolare il DTO
        List<OrderItemDTO> items = null;
        try {
            if (order.getItemsJson() != null) {
                items = objectMapper.readValue(order.getItemsJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, OrderItemDTO.class));
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize items for order ID: {}", order.getId(), e);
            // Gestire l'errore, magari restituendo una lista vuota o null
        }

        return OrderDTO.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .restaurantId(order.getRestaurantId())
                .status(order.getStatus())
                .items(items) // Usa la lista deserializzata
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    // Metodo per trovare un ordine (utile per il frontend dopo)
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId)); // Gestire meglio con eccezione custom e @ExceptionHandler
        return mapEntityToDto(order);
    }
}
