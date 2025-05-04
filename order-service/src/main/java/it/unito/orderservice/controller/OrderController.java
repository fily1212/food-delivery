package it.unito.orderservice.controller;
import it.unito.orderservice.dto.CreateOrderRequest;
import it.unito.orderservice.dto.OrderDTO;
import it.unito.orderservice.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders") // Base path per tutte le operazioni sugli ordini
@RequiredArgsConstructor
public class OrderController {

    private final it.unito.orderservice.service.OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderDTO createdOrder = orderService.createOrder(request);
        // Restituisce 201 Created con l'oggetto creato nel body e l'URL nei Headers
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        // Alternativa più RESTful: return ResponseEntity.created(URI.create("/orders/" + createdOrder.getId())).body(createdOrder);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long id) {
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }
}