package it.unito.orderservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import it.unito.orderservice.config.OrderControllerTestConfig;
import it.unito.orderservice.dto.CreateOrderRequest;
import it.unito.orderservice.dto.OrderDTO;
import it.unito.orderservice.dto.OrderItemDTO;
import it.unito.orderservice.model.OrderStatus;
import it.unito.orderservice.service.OrderService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@Import(OrderControllerTestConfig.class)
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderService orderService; // non più @MockBean

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateOrder() throws Exception {
        // Arrange
        CreateOrderRequest request = new CreateOrderRequest();
        request.setCustomerId(1L);
        request.setRestaurantId(100L);
        request.setItems(List.of(
                new OrderItemDTO("Panino Vegano", 2, new BigDecimal("5.50"))
        ));

        OrderDTO response = OrderDTO.builder()
                .id(10L)
                .customerId(1L)
                .restaurantId(100L)
                .status(OrderStatus.PENDING_VALIDATION)
                .totalAmount(new BigDecimal("11.00"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .items(request.getItems())
                .build();

        Mockito.when(orderService.createOrder(any(CreateOrderRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.totalAmount").value(11.00))
                .andExpect(jsonPath("$.status").value("PENDING_VALIDATION"));
    }

    @Test
    void shouldReturnOrderById() throws Exception {
        // Arrange
        Long orderId = 10L;

        OrderDTO order = OrderDTO.builder()
                .id(orderId)
                .customerId(1L)
                .restaurantId(100L)
                .status(OrderStatus.APPROVED_PENDING_KITCHEN)
                .totalAmount(new BigDecimal("9.90"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .items(List.of(
                        new OrderItemDTO("Panino Classico", 1, new BigDecimal("9.90"))
                ))
                .build();

        Mockito.when(orderService.getOrderById(orderId)).thenReturn(order);

        // Act & Assert
        mockMvc.perform(get("/orders/{id}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId))
                .andExpect(jsonPath("$.totalAmount").value(9.90))
                .andExpect(jsonPath("$.status").value("APPROVED_PENDING_KITCHEN"));
    }
}
