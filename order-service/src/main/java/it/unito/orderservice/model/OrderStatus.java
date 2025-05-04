package it.unito.orderservice.model;

public enum OrderStatus {
    PENDING_VALIDATION, // Appena creato, in attesa validazioni esterne
    APPROVED_PENDING_KITCHEN, // Validazioni OK, in attesa invio a Kitchen
    SENT_TO_KITCHEN, // Messaggio inviato a RabbitMQ per Kitchen
    KITCHEN_ACCEPTED, // Cucina ha confermato presa in carico (opzionale in questo step)
    COMPLETED,        // Ordine completato (ipotetico stato finale)
    REJECTED_RESTAURANT, // Ristorante non valido/chiuso
    REJECTED_PAYMENT,   // Pagamento fallito
    REJECTED_CUSTOMER, // Cliente non valido (aggiungere se necessario)
    FAILED             // Errore generico
}
