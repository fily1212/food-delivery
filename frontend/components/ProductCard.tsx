// components/ProductCard.tsx
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuantityInput } from "./QuantityInput";
import { useState } from "react";

interface ProductCardProps {
    product: Product;
    onUpdateCart: (item: Product, newQuantity: number) => void;
    currentQuantityInCart: number;
}

export function ProductCard({ product, onUpdateCart, currentQuantityInCart }: ProductCardProps) {
    // La quantità gestita qui è quella che l'utente sta per aggiungere/modificare,
    // non necessariamente quella già nel carrello.
    const [quantityToModify, setQuantityToModify] = useState(1); // Inizia sempre da 1 per una nuova aggiunta

    const handleQuantityChange = (newQuantity: number) => {
        setQuantityToModify(newQuantity);
    };

    const handleAddToCartClick = () => {
        if (quantityToModify > 0) {
            // Comunica il prodotto e la *nuova quantità totale desiderata* nel carrello
            onUpdateCart(product, currentQuantityInCart + quantityToModify);
            setQuantityToModify(1); // Resetta per la prossima interazione
        }
    };

    const handleSetQuantityClick = () => {
        // Comunica il prodotto e la *nuova quantità esatta* nel carrello
        onUpdateCart(product, quantityToModify);
        // Non resettare quantityToModify se l'utente sta modificando la quantità di un item già nel carrello
    };


    return (
        <Card className="w-full flex flex-col">
            <CardHeader>
                <CardTitle>{product.productName}</CardTitle>
                <CardDescription>€{product.unitPrice.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                {/* Se il prodotto è già nel carrello, mostriamo un modo per modificarne la quantità */}
                {currentQuantityInCart > 0 ? (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Nel carrello: {currentQuantityInCart}</p>
                        <QuantityInput
                            quantity={quantityToModify}
                            onQuantityChange={handleQuantityChange}
                            min={0} // Permetti 0 per rimuovere
                        />
                        <Button onClick={handleSetQuantityClick} className="w-full mt-2" variant="outline">
                            Aggiorna Quantità
                        </Button>
                    </div>
                ) : (
                    <QuantityInput quantity={quantityToModify} onQuantityChange={handleQuantityChange} min={1} />
                )}
            </CardContent>
            <CardFooter>
                {currentQuantityInCart === 0 && (
                    <Button onClick={handleAddToCartClick} className="w-full" disabled={quantityToModify === 0}>
                        Aggiungi al Carrello
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}