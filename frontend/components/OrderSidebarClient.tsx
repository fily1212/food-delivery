// components/OrderSidebarClient.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, ShoppingCart } from "lucide-react";
import { QuantityInput } from "@/components/QuantityInput";
import { createOrder, getOrderById } from "@/lib/api";
import { toast } from "sonner";          // 🔔 Sonner

const CUSTOMER_ID = 10;

interface OrderSidebarClientProps {
    restaurantId: number;
    cart: CartItem[];
    availableProducts: Product[];
    onUpdateCart: (product: Product, newQuantity: number) => void;
    onOrderCreated: (order: OrderDTO) => void;
    initialOrderResult?: OrderDTO | null;
    isStandaloneOrderView?: boolean;
}

export function OrderSidebarClient({
                                       restaurantId,
                                       cart,
                                       availableProducts,
                                       onUpdateCart,
                                       onOrderCreated,
                                       initialOrderResult = null,
                                       isStandaloneOrderView = false,
                                   }: OrderSidebarClientProps) {
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);
    const [currentOrderResult, setCurrentOrderResult] = useState<OrderDTO | null>(
        initialOrderResult
    );
    const [orderError, setOrderError] = useState<string | null>(null);
    const [isPollingStatus, setIsPollingStatus] = useState(false);

    const totalAmount = useMemo(
        () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
        [cart]
    );

    /* ------------------------------------------------------------------ */
    /* Polling                                                            */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
        if (initialOrderResult) {
            setCurrentOrderResult(initialOrderResult);

            const shouldPoll =
                (isStandaloneOrderView &&
                    ["PENDING_VALIDATION", "SENT_TO_KITCHEN", "PREPARING"].includes(
                        initialOrderResult.status
                    )) ||
                (!isStandaloneOrderView &&
                    !["DELIVERED", "READY_FOR_PICKUP", "CANCELLED", "FAILED"].includes(
                        initialOrderResult.status
                    ));

            if (shouldPoll) pollOrderStatus(initialOrderResult.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialOrderResult, isStandaloneOrderView]);

    const pollOrderStatus = async (orderId: number) => {
        if (isPollingStatus) return;
        setIsPollingStatus(true);

        if (!isStandaloneOrderView) {
            toast.info(`Controllo stato ordine #${orderId}…`);
        }

        const intervalId = setInterval(async () => {
            const response = await getOrderById(orderId);

            if (response.success) {
                const updated = response.data as OrderDTO;
                setCurrentOrderResult(updated);

                toast.info(
                    `Ordine #${updated.id} aggiornato – stato: ${updated.status}`
                );

                if (
                    ["READY_FOR_PICKUP", "DELIVERED", "CANCELLED", "FAILED"].includes(
                        updated.status
                    )
                ) {
                    clearInterval(intervalId);
                    setIsPollingStatus(false);

                    if (
                        updated.status === "DELIVERED" ||
                        updated.status === "READY_FOR_PICKUP"
                    ) {
                        toast.success(
                            `Ordine #${updated.id} finalizzato – ${updated.status}`
                        );
                    } else {
                        toast(`Ordine #${updated.id} finalizzato – ${updated.status}`);
                    }
                }
            } else {
                console.error(
                    "Errore polling stato ordine:",
                    response?.error?.message ?? response
                );

                toast.error(
                    `Errore aggiornamento stato #${orderId}: ${response.error?.message}`
                );

                if (response.status === 404) {
                    clearInterval(intervalId);
                    setIsPollingStatus(false);
                }
            }
        }, 5000);

        return () => {
            clearInterval(intervalId);
            setIsPollingStatus(false);
        };
    };

    /* ------------------------------------------------------------------ */
    /* Create order                                                       */
    /* ------------------------------------------------------------------ */
    const handleCreateOrder = async () => {
        if (cart.length === 0) {
            toast.error("Carrello vuoto. Aggiungi prodotti per ordinare.");
            return;
        }

        setIsLoadingOrder(true);
        setOrderError(null);
        setCurrentOrderResult(null);

        const orderPayload: CreateOrderRequest = {
            customerId: CUSTOMER_ID,
            restaurantId,
            items: cart.map((i) => ({
                productName: i.productName,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
            })),
        };

        const response = await createOrder(orderPayload);

        if (response.success) {
            const order = response.data as OrderDTO;
            setCurrentOrderResult(order);
            onOrderCreated(order);

            toast.success(
                `Ordine #${order.id} inviato! Stato iniziale: ${order.status}`
            );

            if (["PENDING_VALIDATION", "SENT_TO_KITCHEN"].includes(order.status)) {
                pollOrderStatus(order.id);
            }
        } else {
            console.error("Errore creazione ordine:", response.error);
            const msg = `${response.error?.message}${
                response.error?.details
                    ? ` (Dettagli: ${JSON.stringify(response.error.details)})`
                    : ""
            }`;
            setOrderError(msg);
            toast.error(`Errore ordine (status ${response.status}): ${msg}`);
        }

        setIsLoadingOrder(false);
    };

    /* ------------------------------------------------------------------ */
    /* Render                                                             */
    /* ------------------------------------------------------------------ */
    return (
        <aside className="lg:col-span-1 sticky top-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <ShoppingCart className="mr-3 h-6 w-6" />
                        {isStandaloneOrderView ? "Dettagli Ordine" : "Il Tuo Carrello"}
                    </CardTitle>
                </CardHeader>

                {/* ----------------- Carrello (non standalone) ----------------- */}
                {!isStandaloneOrderView && (
                    <>
                        <CardContent>
                            {cart.length === 0 ? (
                                <p className="text-muted-foreground">Il carrello è vuoto.</p>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div
                                            key={item.productId}
                                            className="flex justify-between items-start"
                                        >
                                            <div>
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    €{item.unitPrice.toFixed(2)} x {item.quantity} = €
                                                    {(item.unitPrice * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                            <QuantityInput
                                                quantity={item.quantity}
                                                min={0}
                                                onQuantityChange={(qty) => {
                                                    const product = availableProducts.find(
                                                        (p) => p.id === item.productId
                                                    );
                                                    if (product) onUpdateCart(product, qty);
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <Separator className="my-4" />
                                    <div className="flex justify-between items-center font-semibold text-lg">
                                        <p>Totale:</p>
                                        <p>€{totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        {cart.length > 0 && (
                            <CardFooter>
                                <Button
                                    onClick={handleCreateOrder}
                                    disabled={isLoadingOrder || isPollingStatus}
                                    className="w-full text-base py-3"
                                    size="lg"
                                >
                                    {isLoadingOrder ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Elaborazione…
                                        </>
                                    ) : isPollingStatus ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Controllo Stato…
                                        </>
                                    ) : (
                                        "Conferma Ordine"
                                    )}
                                </Button>
                            </CardFooter>
                        )}
                    </>
                )}
            </Card>

            {/* ------------------------ Error ------------------------ */}
            {orderError && !currentOrderResult && (
                <Alert variant="destructive">
                    <XCircle className="h-5 w-5" />
                    <AlertTitle>Errore Ordine</AlertTitle>
                    <AlertDescription>{orderError}</AlertDescription>
                </Alert>
            )}

            {/* ------------------------ Order result ------------------------ */}
            {currentOrderResult && (
                <Alert
                    variant={
                        ["FAILED", "CANCELLED"].includes(currentOrderResult.status)
                            ? "destructive"
                            : "default"
                    }
                >
                    <CheckCircle className="h-5 w-5" />
                    <AlertTitle>
                        {["FAILED", "CANCELLED"].includes(currentOrderResult.status)
                            ? "Ordine Non Riuscito"
                            : "Dettagli Ordine"}
                    </AlertTitle>
                    <AlertDescription>
                        <p>
                            ID Ordine: <strong>#{currentOrderResult.id}</strong>
                        </p>
                        <p>
                            Stato:{" "}
                            <strong
                                className={
                                    ["FAILED", "CANCELLED"].includes(currentOrderResult.status)
                                        ? "text-red-600"
                                        : ["DELIVERED", "READY_FOR_PICKUP"].includes(
                                            currentOrderResult.status
                                        )
                                            ? "text-green-600"
                                            : ""
                                }
                            >
                                {currentOrderResult.status}
                            </strong>
                        </p>
                        <p>Totale: €{currentOrderResult.totalAmount.toFixed(2)}</p>
                        <p>Cliente ID: {currentOrderResult.customerId}</p>
                        <p>Ristorante ID: {currentOrderResult.restaurantId}</p>

                        <h4 className="font-semibold mt-2 mb-1">Articoli:</h4>
                        <ul className="list-disc pl-5 text-xs">
                            {currentOrderResult.items.map((it, i) => (
                                <li key={i}>
                                    {it.productName} (x{it.quantity}) – €
                                    {it.unitPrice.toFixed(2)} cad.
                                </li>
                            ))}
                        </ul>

                        <p className="text-xs mt-2">
                            Creato il: {new Date(currentOrderResult.createdAt).toLocaleString()}
                        </p>
                        <p className="text-xs">
                            Ultimo Aggiornamento:{" "}
                            {new Date(currentOrderResult.updatedAt).toLocaleString()}
                        </p>

                        {isPollingStatus &&
                            ![
                                "DELIVERED",
                                "READY_FOR_PICKUP",
                                "CANCELLED",
                                "FAILED",
                            ].includes(currentOrderResult.status) && (
                                <div className="flex items-center text-sm mt-2 text-blue-600">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Aggiornamento stato in corso…
                                </div>
                            )}
                    </AlertDescription>
                </Alert>
            )}
        </aside>
    );
}
