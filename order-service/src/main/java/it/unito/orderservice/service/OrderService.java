package it.unito.orderservice.service;

import it.unito.orderservice.dto.CreateOrderRequest;
import it.unito.orderservice.dto.OrderDTO;
import it.unito.orderservice.dto.OrderItemDTO;
import it.unito.orderservice.model.Order;
import it.unito.orderservice.model.OrderItem;
import it.unito.orderservice.model.OrderStatus;
import it.unito.orderservice.repository.OrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper; // Per serializzare items
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor // Lombok: Inietta dipendenze final nel costruttore
@Slf4j // Lombok: Logger SLF4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper; // Spring Boot configura un bean ObjectMapper

    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request) {
        log.info("Received request to create order: {}", request);

        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setRestaurantId(request.getRestaurantId());
        order.setStatus(OrderStatus.PENDING_VALIDATION);

        // Mappa i DTO in entità OrderItem e calcola il totale
        List<OrderItem> items = request.getItems().stream().map(dto -> {
            OrderItem item = new OrderItem();
            item.setOrder(order); // Imposta la relazione inversa
            item.setProductName(dto.getProductName());
            item.setQuantity(dto.getQuantity());
            item.setUnitPrice(dto.getUnitPrice());
            return item;
        }).toList();

        order.setItems(items);

        // Calcola il totale
        BigDecimal total = items.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);
        log.info("Order created with ID: {} and status: {}", savedOrder.getId(), savedOrder.getStatus());

        return mapEntityToDto(savedOrder);
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


    // Metodo per trovare un ordine (utile per il frontend dopo)
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId)); // Gestire meglio con eccezione custom e @ExceptionHandler
        return mapEntityToDto(order);
    }
}
