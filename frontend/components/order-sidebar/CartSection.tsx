"use client";

import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { CartItemRow } from "./CartItemRow";

interface CartSectionProps {
    cart: CartItem[];
    availableProducts: Product[];
    totalAmount: number;
    isLoading: boolean;
    onUpdateCart: (product: Product, newQty: number) => void;
    onCreateOrder: () => void;
}

export function CartSection({
                                cart,
                                availableProducts,
                                totalAmount,
                                isLoading,
                                onUpdateCart,
                                onCreateOrder,
                            }: CartSectionProps) {
    if (cart.length === 0) {
        return (
            <CardContent>
                <p className="text-muted-foreground">Il carrello è vuoto.</p>
            </CardContent>
        );
    }

    return (
        <>
            <CardContent className="space-y-4">
                {cart.map(item => (
                    <CartItemRow
                        key={item.productId}
                        item={item}
                        availableProducts={availableProducts}
                        onUpdateCart={onUpdateCart}
                    />
                ))}

                <Separator className="my-4" />

                <div className="flex justify-between items-center font-semibold text-lg">
                    <p>Totale:</p>
                    <p>€{totalAmount.toFixed(2)}</p>
                </div>
            </CardContent>

            <CardFooter>
                <Button
                    onClick={onCreateOrder}
                    disabled={isLoading}
                    className="w-full text-base py-3"
                    size="lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Elaborazione…
                        </>
                    ) : (
                        "Conferma Ordine"
                    )}
                </Button>
            </CardFooter>
        </>
    );
}
