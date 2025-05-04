package it.unito.kitchenservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "kitchen_tickets")
@Getter @Setter
public class Ticket {
    @Id // Usiamo l'ID dell'ordine come ID del ticket per semplicità
    private Long orderId;

    @Column(nullable = false)
    private Long restaurantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items;

    @CreationTimestamp
    private LocalDateTime createdAt;
    // Aggiungere @UpdateTimestamp se si modifica spesso
}
