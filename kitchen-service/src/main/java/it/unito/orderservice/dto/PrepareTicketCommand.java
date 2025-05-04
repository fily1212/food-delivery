package it.unito.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrepareTicketCommand implements Serializable {
    private static final long serialVersionUID = 1L; // Buona pratica per Serializable

    private Long orderId;
    private Long restaurantId;
    // Potremmo includere anche gli items o solo l'ID ordine se Kitchen li recupera altrove
    private List<OrderItemMessageDTO> items; // Usiamo un DTO specifico per il messaggio
}


