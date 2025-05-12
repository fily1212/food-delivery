"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Loader2 } from "lucide-react";

interface OrderStatusAlertProps {
    order: OrderDTO;
    isPolling: boolean;
}

const failStates = ["FAILED", "CANCELLED"];
const successStates = ["DELIVERED", "READY_FOR_PICKUP"];

export function OrderStatusAlert({ order, isPolling }: OrderStatusAlertProps) {
    const variant = failStates.includes(order.status) ? "destructive" : "default";

    return (
        <Alert variant={variant}>
            <CheckCircle className="h-5 w-5" />
            <AlertTitle>
                {failStates.includes(order.status) ? "Ordine Non Riuscito" : "Dettagli Ordine"}
            </AlertTitle>

            <AlertDescription>
                <p>ID Ordine: <strong>#{order.id}</strong></p>
                <p>
                    Stato:{" "}
                    <strong
                        className={
                            failStates.includes(order.status)
                                ? "text-red-600"
                                : successStates.includes(order.status)
                                    ? "text-green-600"
                                    : ""
                        }
                    >
                        {order.status}
                    </strong>
                </p>
                <p>Totale: €{order.totalAmount.toFixed(2)}</p>
                <p>Cliente ID: {order.customerId}</p>
                <p>Ristorante ID: {order.restaurantId}</p>

                <h4 className="font-semibold mt-2 mb-1">Articoli:</h4>
                <ul className="list-disc pl-5 text-xs">
                    {order.items.map((it, i) => (
                        <li key={i}>
                            {it.productName} (x{it.quantity}) – €{it.unitPrice.toFixed(2)} cad.
                        </li>
                    ))}
                </ul>

                <p className="text-xs mt-2">
                    Creato il: {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-xs">
                    Ultimo Aggiornamento: {new Date(order.updatedAt).toLocaleString()}
                </p>

                {isPolling && ![...successStates, ...failStates].includes(order.status) && (
                    <div className="flex items-center text-sm mt-2 text-blue-600">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Aggiornamento stato in corso…
                    </div>
                )}
            </AlertDescription>
        </Alert>
    );
}
