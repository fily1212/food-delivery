package it.unito.kitchenservice.controller;

import it.unito.kitchenservice.model.Ticket;
import it.unito.kitchenservice.service.TicketService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/tickets")
@AllArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/ready/{orderId}")
    public void setTicketCompleted(@PathVariable Long orderId) {
        ticketService.setTicketCompleted(orderId);
    }
}
