// app/ordine/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { OrderSidebarClient } from "@/components/OrderSidebarClient"; // Re-using for display

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function OrderStatusPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = parseInt(params.id as string, 10);

    const [order, setOrder] = useState<OrderDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isNaN(orderId)) {
            setError("ID Ordine non valido.");
            setIsLoading(false);
            return;
        }

        const fetchOrder = async () => {
            setIsLoading(true);
            setError(null);
            const response = await getOrderById(orderId);
            if (response.success) {
                setOrder(response.data as OrderDTO);
            } else {
                setError(response.error?.message || "Impossibile recuperare i dettagli dell'ordine.");
            }
            setIsLoading(false);
        };

        fetchOrder();
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Caricamento dettagli ordine...</p>
            </div>
        );
    }

    if (error) {
        return (
            <main className="container mx-auto px-4 py-8 flex flex-col items-center">
                <Button variant="outline" onClick={() => router.push('/')} className="mb-6 self-start">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Torna alla Home
                </Button>
                <Alert variant="destructive" className="w-full max-w-lg">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle>Errore</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </main>
        );
    }

    if (!order) {
        return (
            <main className="container mx-auto px-4 py-8 flex flex-col items-center">
                <Button variant="outline" onClick={() => router.push('/')} className="mb-6 self-start">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Torna alla Home
                </Button>
                <p className="text-muted-foreground">Ordine non trovato.</p>
            </main>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Torna alla Home
            </Button>
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight">Stato Ordine #{order.id}</h1>
            </header>
            <div className="max-w-2xl mx-auto">
                {/* We can reuse OrderSidebarClient for a consistent display of order details */}
                {/* It's primarily a display component here, cart interactions won't be used */}
                <OrderSidebarClient
                    restaurantId={order.restaurantId} // Required prop, but not crucial for display-only
                    cart={[]} // Empty cart as we are not ordering
                    setCart={() => {}}// No-op
                    availableProducts={[]} // Not needed for display
                    onUpdateCart={() => {}} // No-op
                    initialOrderResult={order}
                    isStandaloneOrderView={true}
                />
            </div>
        </main>
    );
}
