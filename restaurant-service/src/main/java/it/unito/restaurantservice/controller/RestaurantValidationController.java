package it.unito.restaurantservice.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/restaurants")
@Slf4j
public class RestaurantValidationController {

    // Simula la validazione del ristorante (es. esiste? è aperto?)
    @GetMapping("/{id}/validate")
    public ResponseEntity<Void> validateRestaurant(@PathVariable Long id) {
        log.info("Validating restaurant with ID: {}", id);
        // Logica di validazione fittizia
        if (id > 0 && id < 100) { // Assume ristoranti validi < 100
            log.info("Restaurant {} is valid.", id);
            return ResponseEntity.ok().build(); // HTTP 200 OK
        } else {
            log.warn("Restaurant {} validation failed.", id);
            return ResponseEntity.notFound().build(); // HTTP 404 Not Found
        }
    }
}