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

    const { customerId, setCustomerId } = useCustomer();

    const totalAmount = useMemo(
        () => cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
        [cart]
    );


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

        } else {
            const msg = `${res.error?.message}${
                res.error?.details ? ` (Dettagli: ${JSON.stringify(res.error.details)})` : ""
            }`;
            setOrderError(msg);
            toast.error(`Errore ordine (status ${res.status}): ${msg}`);
        }
        setCart([]);
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
                />
            )}
        </aside>
    );
}
