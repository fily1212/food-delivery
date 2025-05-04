package it.unito.orderservice.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data // Lombok: genera getter, setter, toString, equals, hashCode
public class CreateOrderRequest {
    @NotNull
    private Long customerId;
    @NotNull
    private Long restaurantId;
    @NotEmpty
    private List<OrderItemDTO> items;
    // Aggiungere dettagli di pagamento se necessario subito,
    // ma per ora l'accounting service li gestirà
}