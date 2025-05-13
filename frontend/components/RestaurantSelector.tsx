// components/RestaurantSelector.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface RestaurantSelectorProps {
    restaurants: Restaurant[];
}

export function RestaurantSelector({ restaurants }: RestaurantSelectorProps) {
    const router = useRouter();

    return (
        <div className="w-full max-w-2xl space-y-6">
            <h2 className="text-3xl font-semibold text-center mb-8">Scegli un Ristorante</h2>
            {restaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {restaurants.map((restaurant) => (
                        <Card key={restaurant.id} className="hover:shadow-xl transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle>{restaurant.name}</CardTitle>
                                <CardDescription>ID: {restaurant.id}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Pronto per i tuoi ordini!</p>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => router.push(`/ristorante/${restaurant.id}`)} className="w-full">
                                    Scegli Prodotti
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground">Nessun ristorante disponibile al momento.</p>
            )}
        </div>
    );
}