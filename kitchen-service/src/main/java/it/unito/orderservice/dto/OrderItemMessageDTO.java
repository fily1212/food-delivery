package it.unito.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// DTO interno per gli item nel messaggio
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemMessageDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private String menuItemId;
    private int quantity;
}