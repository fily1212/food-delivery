"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { productsByRestaurant, restaurants as allRestaurants } from "@/lib/data";
import { createOrder, getOrderById } from "@/lib/api";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuantityInput } from "@/components/QuantityInput";

import { toast } from "sonner"; // 🔔 Sonner toast

import { Loader2, CheckCircle, XCircle, ShoppingCart, ArrowLeft } from "lucide-react";

const CUSTOMER_ID = 1; // Simulazione di un ID cliente fisso per il test

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

    const totalAmount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    }, [cart]);

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

    const handleCreateOrder = async () => {
        if (cart.length === 0) {
            toast.error("Carrello vuoto. Aggiungi prodotti per ordinare.");
            return;
        }

        setIsLoadingOrder(true);
        setOrderError(null);
        setOrderResult(null);

        const orderPayload: CreateOrderRequest = {
            customerId: CUSTOMER_ID,
            restaurantId: restaurantId,
            items: cart.map((item) => ({
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
        };

        const response = await createOrder(orderPayload);

        if (response.success) {
            const orderData = response.data as OrderDTO;
            setOrderResult(orderData);

            toast.success(`Ordine #${orderData.id} inviato! Stato iniziale: ${orderData.status}`);

            setCart([]);

            if (orderData.status === "PENDING_VALIDATION" || orderData.status === "SENT_TO_KITCHEN") {
                await pollOrderStatus(orderData.id);
            }
        } else {
            console.error("Errore creazione ordine:", response.error);
            const errorMessage = `${response.error?.message}${response.error?.details ? ` (Dettagli: ${JSON.stringify(response.error.details)})` : ""}`;
            setOrderError(errorMessage);
            toast.error(`Errore Ordine (Status: ${response.status}): ${errorMessage}`);
        }
        setIsLoadingOrder(false);
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

                <aside className="lg:col-span-1 sticky top-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl">
                                <ShoppingCart className="mr-3 h-6 w-6" /> Il Tuo Carrello
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {cart.length === 0 ? (
                                <p className="text-muted-foreground">Il carrello è vuoto.</p>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.productId} className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    €{item.unitPrice.toFixed(2)} x {item.quantity} = €{(item.unitPrice * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                            <QuantityInput
                                                quantity={item.quantity}
                                                onQuantityChange={(newQuantity) => {
                                                    const product = availableProducts.find(p => p.id === item.productId);
                                                    if (product) handleUpdateCart(product, newQuantity);
                                                }}
                                                min={0}
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
                                        <> <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Elaborazione... </>
                                    ) : isPollingStatus ? (
                                        <> <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Controllo Stato... </>
                                    ) : "Conferma Ordine"}
                                </Button>
                            </CardFooter>
                        )}
                    </Card>

                    {orderError && !orderResult && ( // Show error only if there's no successful result yet
                        <Alert variant="destructive">
                            <XCircle className="h-5 w-5" />
                            <AlertTitle>Errore Ordine</AlertTitle>
                            <AlertDescription>{orderError}</AlertDescription>
                        </Alert>
                    )}

                    {orderResult && (
                        <Alert variant={orderResult.status === "FAILED" || orderResult.status === "CANCELLED" ? "destructive" : "default"}>
                            <CheckCircle className="h-5 w-5" />
                            <AlertTitle>
                                {orderResult.status === "FAILED" || orderResult.status === "CANCELLED" ? "Ordine Non Riuscito" : "Dettagli Ordine"}
                            </AlertTitle>
                            <AlertDescription>
                                <p>ID Ordine: <strong>#{orderResult.id}</strong></p>
                                <p>Stato: <strong className={
                                    orderResult.status === "FAILED" || orderResult.status === "CANCELLED" ? "text-red-600" :
                                        orderResult.status === "DELIVERED" || orderResult.status === "READY_FOR_PICKUP" ? "text-green-600" : ""
                                }>{orderResult.status}</strong></p>
                                <p>Totale: €{orderResult.totalAmount.toFixed(2)}</p>
                                <p className="text-xs mt-2">Creato il: {new Date(orderResult.createdAt).toLocaleString()}</p>
                                <p className="text-xs">Ultimo Aggiornamento: {new Date(orderResult.updatedAt).toLocaleString()}</p>
                                {isPollingStatus && orderResult.status !== "DELIVERED" && orderResult.status !== "READY_FOR_PICKUP" && orderResult.status !== "CANCELLED" && orderResult.status !== "FAILED" && (
                                    <div className="flex items-center text-sm mt-2 text-blue-600">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Aggiornamento stato in corso...
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                </aside>
            </div>
        </main>
    );
}
