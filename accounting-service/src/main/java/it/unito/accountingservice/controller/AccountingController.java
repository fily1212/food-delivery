package it.unito.accountingservice.controller;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/accounts")
@Slf4j
public class AccountingController {

    @Data
    public static class AuthorizationRequest {
        private Long customerId;
        private BigDecimal amount;
        // Altri dettagli come info carta di credito sarebbero qui
    }

    // Simula l'autorizzazione di un pagamento
    @PostMapping("/authorize")
    public ResponseEntity<Void> authorizePayment(@RequestBody AuthorizationRequest request) {
        log.info("Authorizing payment for customer: {}, amount: {}", request.getCustomerId(), request.getAmount());
        // Logica di autorizzazione fittizia
        // Es: Accetta se l'importo è < 1000 e customerId non è bloccato
        if (request.getAmount() != null && request.getAmount().compareTo(BigDecimal.valueOf(1000)) < 0
                && request.getCustomerId() != 666) { // Cliente 666 è bloccato
            log.info("Payment authorized for customer {}", request.getCustomerId());
            return ResponseEntity.ok().build(); // HTTP 200 OK
        } else {
            log.warn("Payment authorization failed for customer {}", request.getCustomerId());
            return ResponseEntity.status(402).build(); // HTTP 402 Payment Required (o 400 Bad Request)
        }
    }
}