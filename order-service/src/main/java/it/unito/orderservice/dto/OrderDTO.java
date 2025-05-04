package it.unito.orderservice.dto;

import it.unito.orderservice.model.OrderStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder // Lombok: pattern builder
public class OrderDTO {
    private Long id;
    private Long customerId;
    private Long restaurantId;
    private List<OrderItemDTO> items;
    private OrderStatus status;
    private BigDecimal totalAmount; // Calcolato magari in seguito
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}