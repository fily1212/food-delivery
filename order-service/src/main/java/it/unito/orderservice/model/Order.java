package it.unito.orderservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
// Nota: @Convert non è strettamente necessario per Enum semplici con JPA 2.1+
// Ma utile per tipi complessi o JSON
// import jakarta.persistence.Convert;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
// import java.util.List; // Vediamo se gestire gli items come entità separate o JSON

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Long restaurantId;

    @Enumerated(EnumType.STRING) // Salva l'enum come stringa nel DB
    @Column(name = "status", nullable = false)
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items;

    @Column // Lasciare nullable per ora, calcolato dopo
    private BigDecimal totalAmount;

    @CreationTimestamp // Hibernate popola automaticamente
    private LocalDateTime createdAt;

    @UpdateTimestamp // Hibernate popola automaticamente
    private LocalDateTime updatedAt;
}