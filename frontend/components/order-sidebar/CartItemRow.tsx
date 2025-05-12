"use client";

import { QuantityInput } from "@/components/QuantityInput";

interface CartItemRowProps {
    item: CartItem;
    availableProducts: Product[];
    onUpdateCart: (product: Product, newQty: number) => void;
}

export function CartItemRow({
                                item,
                                availableProducts,
                                onUpdateCart,
                            }: CartItemRowProps) {
    const product = availableProducts.find(p => p.id === item.productId);

    return (
        <div className="flex justify-between items-start">
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
                onQuantityChange={qty => product && onUpdateCart(product, qty)}
            />
        </div>
    );
}
