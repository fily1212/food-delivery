"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { CartSection } from "./order-sidebar/CartSection";
import { OrderErrorAlert } from "./order-sidebar/OrderErrorAlert";
import { OrderStatusAlert } from "./order-sidebar/OrderStatusAlert";

import { createOrder, getOrderById } from "@/lib/api";
import {useCustomer} from "@/context/CustomerContext";


interface OrderSidebarClientProps {
    restaurantId: number;
    cart: CartItem[];
    setCart: (cart: CartItem[]) => void;
    availableProducts: Product[];
    onUpdateCart: (product: Product, newQty: number) => void;
    initialOrderResult?: OrderDTO | null;
    isStandaloneOrderView?: boolean;
}

export function OrderSidebarClient({
                                       restaurantId,
                                       cart,
                                       setCart,
                                       availableProducts,
                                       onUpdateCart,
                                       initialOrderResult = null,
                                       isStandaloneOrderView = false,
                                   }: OrderSidebarClientProps) {
    /* ----------------------------- state ----------------------------- */
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<OrderDTO | null>(initialOrderResult);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    const { customerId, setCustomerId } = useCustomer();

    const totalAmount = useMemo(
        () => cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
        [cart]
    );

    /* --------------------------- polling ----------------------------- */
    useEffect(() => {
        if (!initialOrderResult) return;

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialOrderResult, isStandaloneOrderView]);

    const pollOrderStatus = async (orderId: number) => {
        if (isPolling) return;
        setIsPolling(true);

        if (!isStandaloneOrderView) toast.info(`Controllo stato ordine #${orderId}…`);

        const interval = setInterval(async () => {
            const res = await getOrderById(orderId);

            if (res.success) {
                const updated = res.data as OrderDTO;
                setCurrentOrder(updated);
                toast.info(`Ordine #${updated.id} aggiornato – stato: ${updated.status}`);

                if (["READY_FOR_PICKUP", "DELIVERED", "CANCELLED", "FAILED"].includes(updated.status)) {
                    clearInterval(interval);
                    setIsPolling(false);

                    toast[updated.status === "DELIVERED" || updated.status === "READY_FOR_PICKUP"
                        ? "success"
                        : "warning"](
                        `Ordine #${updated.id} finalizzato – ${updated.status}`
                    );
                }
            } else {
                console.error("Polling error:", res.error?.message);
                toast.error(`Errore aggiornamento stato #${orderId}: ${res.error?.message}`);

                if (res.status === 404) {
                    clearInterval(interval);
                    setIsPolling(false);
                }
            }
        }, 5000);
    };

    /* ------------------------ create order --------------------------- */
    const handleCreateOrder = async () => {
        if (cart.length === 0) {
            toast.error("Carrello vuoto. Aggiungi prodotti per ordinare.");
            return;
        }

        setIsLoadingOrder(true);
        setOrderError(null);
        setCurrentOrder(null);

        const payload: CreateOrderRequest = {
            customerId: customerId,
            restaurantId,
            items: cart.map(i => ({
                productName: i.productName,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
            })),
        };

        const res = await createOrder(payload);

        if (res.success) {
            const order = res.data as OrderDTO;
            setCurrentOrder(order);
            toast.success(`Ordine #${order.id} inviato! Stato iniziale: ${order.status}`);

            if (["PENDING_VALIDATION", "SENT_TO_KITCHEN"].includes(order.status)) pollOrderStatus(order.id);
        } else {
            const msg = `${res.error?.message}${
                res.error?.details ? ` (Dettagli: ${JSON.stringify(res.error.details)})` : ""
            }`;
            setOrderError(msg);
            toast.error(`Errore ordine (status ${res.status}): ${msg}`);
        }
        setCart([]);
        setIsPolling(false);
        setIsLoadingOrder(false);
    };

    /* ---------------------------- UI -------------------------------- */
    return (
        <aside className="lg:col-span-1 sticky top-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <ShoppingCart className="mr-3 h-6 w-6" />
                        {isStandaloneOrderView ? "Dettagli Ordine" : "Il Tuo Carrello"}
                    </CardTitle>
                </CardHeader>

                {/* Carrello */}
                {!isStandaloneOrderView && (
                    <CartSection
                        cart={cart}
                        availableProducts={availableProducts}
                        totalAmount={totalAmount}
                        isLoading={isLoadingOrder}
                        isPolling={isPolling}
                        onUpdateCart={onUpdateCart}
                        onCreateOrder={handleCreateOrder}
                    />
                )}
            </Card>

            {/* Error */}
            {orderError && !currentOrder && <OrderErrorAlert message={orderError} />}

            {/* Order result */}
            {currentOrder && (
                <OrderStatusAlert
                    order={currentOrder}
                    isPolling={isPolling}
                />
            )}
        </aside>
    );
}
