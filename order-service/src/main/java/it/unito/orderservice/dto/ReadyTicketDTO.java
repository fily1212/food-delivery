package it.unito.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadyTicketDTO implements Serializable {
    private Long orderId;
    private Long restaurantId;
    private String status;
}
