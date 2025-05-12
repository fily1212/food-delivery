"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle } from "lucide-react";

interface OrderErrorAlertProps {
    message: string;
}

export function OrderErrorAlert({ message }: OrderErrorAlertProps) {
    return (
        <Alert variant="destructive">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Errore Ordine</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}
