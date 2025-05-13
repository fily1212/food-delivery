// app/kitchen/orders/page.tsx
import React from "react";
import TicketsBoard from "@/components/kitchen/TicketsBoard";

export const metadata = {
    title: "Cucina – Ordini",
};

export default function KitchenOrdersPage() {
    return (
        <section className="mx-auto max-w-4xl px-6 py-32">
            <h1 className="mb-6 text-3xl font-bold">Ordini in corso</h1>
            <TicketsBoard />
        </section>
    );
}
