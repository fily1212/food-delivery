// components/QuantityInput.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinusIcon, PlusIcon } from "lucide-react";

interface QuantityInputProps {
    quantity: number;
    onQuantityChange: (newQuantity: number) => void;
    min?: number;
    max?: number;
}

export function QuantityInput({
                                  quantity,
                                  onQuantityChange,
                                  min = 0, // Permetti 0 per rimuovere dal carrello
                                  max = 99,
                              }: QuantityInputProps) {
    const handleDecrement = () => {
        if (quantity > min) {
            onQuantityChange(quantity - 1);
        }
    };

    const handleIncrement = () => {
        if (quantity < max) {
            onQuantityChange(quantity + 1);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(event.target.value, 10);
        if (isNaN(value)) value = min; // Se non è un numero, imposta a min
        if (value < min) value = min;
        if (value > max) value = max;
        onQuantityChange(value);
    };

    return (
        <div className="flex items-center space-x-2">
            <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={quantity <= min}
                aria-label="Diminuisci quantità"
            >
                <MinusIcon className="h-4 w-4" />
            </Button>

            <p>{quantity}</p>

            <Button
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={quantity >= max}
                aria-label="Aumenta quantità"
            >
                <PlusIcon className="h-4 w-4" />
            </Button>
        </div>
    );
}