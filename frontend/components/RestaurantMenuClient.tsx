// components/RestaurantMenuClient.tsx
"use client";

import { ProductCard } from "@/components/ProductCard";

interface RestaurantMenuClientProps {
    availableProducts: Product[];
    cart: CartItem[];
    onUpdateCart: (product: Product, newQuantity: number) => void;
}

export function RestaurantMenuClient({
                                         availableProducts,
                                         cart,
                                         onUpdateCart,
                                     }: RestaurantMenuClientProps) {
    if (availableProducts.length === 0) {
        return <p className="text-muted-foreground">Nessun prodotto disponibile per questo ristorante al momento.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableProducts.map(product => {
                const cartItem = cart.find(item => item.productId === product.id);
                return (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onUpdateCart={onUpdateCart}
                        currentQuantityInCart={cartItem?.quantity || 0}
                    />
                );
            })}
        </div>
    );
}
