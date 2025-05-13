"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { productsByRestaurant, restaurants as allRestaurants } from "@/lib/data";
import { getOrderById } from "@/lib/api";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // 🔔 Sonner toast

import { Loader2,  ArrowLeft } from "lucide-react";
import {OrderSidebarClient} from "@/components/OrderSidebarClient";


export default function RestaurantPage() {
    const params = useParams();
    const router = useRouter();

    const restaurantId = parseInt(params.id as string, 10);

    const [restaurant, setRestaurant] = useState<Restaurant | undefined>();
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);
    const [orderResult, setOrderResult] = useState<OrderDTO | null>(null);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [isPollingStatus, setIsPollingStatus] = useState(false);


    useEffect(() => {
        const currentRestaurant = allRestaurants.find((r) => r.id === restaurantId);
        if (currentRestaurant) {
            setRestaurant(currentRestaurant);
            setAvailableProducts(productsByRestaurant[restaurantId] || []);
        } else {
            toast.error("Ristorante non trovato.");
            router.push("/");
        }
    }, [restaurantId, router]);

    const handleUpdateCart = (product: Product, newQuantity: number) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((item) => item.productId === product.id);
            if (newQuantity <= 0) {
                if (existingItemIndex > -1) {
                    toast(`${product.productName} rimosso dal carrello.`);
                    return prevCart.filter((item) => item.productId !== product.id);
                }
                return prevCart;
            }

            if (existingItemIndex > -1) {
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex].quantity = newQuantity;
                toast(`${product.productName} quantità aggiornata a ${newQuantity}.`);
                return updatedCart;
            } else {
                toast(`${product.productName} (x${newQuantity}) aggiunto al carrello.`);
                return [
                    ...prevCart,
                    { productId: product.id, productName: product.productName, unitPrice: product.unitPrice, quantity: newQuantity },
                ];
            }
        });
    };


    const pollOrderStatus = async (orderId: number) => {
        setIsPollingStatus(true);
        toast.info(`Controllo stato ordine #${orderId}...`);

        const intervalId = setInterval(async () => {
            const response = await getOrderById(orderId);
            if (response.success) {
                const currentOrder = response.data as OrderDTO;
                setOrderResult(currentOrder);

                toast.info(`Ordine #${currentOrder.id} aggiornato – stato: ${currentOrder.status}`);

                if (["SENT_TO_KITCHEN", "PREPARING", "READY_FOR_PICKUP", "DELIVERED", "CANCELLED", "FAILED"].includes(currentOrder.status)) {
                    clearInterval(intervalId);
                    setIsPollingStatus(false);

                    if (currentOrder.status === "DELIVERED" || currentOrder.status === "READY_FOR_PICKUP") {
                        toast.success(`Ordine #${currentOrder.id} finalizzato – ${currentOrder.status}`);
                    } else {
                        toast(`Ordine #${currentOrder.id} finalizzato – ${currentOrder.status}`);
                    }
                }
            } else {
                console.error("Errore durante il polling dello stato dell'ordine:", response.error);
                toast.error(`Errore aggiornamento stato ordine #${orderId}: ${response.error?.message}`);
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

    if (!restaurant) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Torna ai Ristoranti
            </Button>

            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">{restaurant.name}</h1>
                <p className="text-lg text-muted-foreground">Scegli i tuoi prodotti preferiti.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <section className="lg:col-span-2">
                    <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Menù</h2>
                    {availableProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {availableProducts.map(product => {
                                const cartItem = cart.find(item => item.productId === product.id);
                                return (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onUpdateCart={handleUpdateCart}
                                        currentQuantityInCart={cartItem?.quantity || 0}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Nessun prodotto disponibile per questo ristorante al momento.</p>
                    )}
                </section>
                <OrderSidebarClient restaurantId={restaurantId}
                                    cart={cart} setCart={setCart}
                                    availableProducts={availableProducts} onUpdateCart={handleUpdateCart}
                                     />
            </div>
        </main>
    );
}
