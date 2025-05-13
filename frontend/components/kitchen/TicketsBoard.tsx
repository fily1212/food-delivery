"use client";

import { useEffect, useState } from "react";
import { fetchTickets, markTicketReady } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TicketsBoard() {
    const [tickets, setTickets] = useState<TicketDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTickets = async () => {
        setLoading(true);
        const res = await fetchTickets();
        if (res.success)
            setTickets((res.data ?? []) as TicketDTO[]);
        else toast.error(`Errore caricamento: ${res.error?.message}`);
        setLoading(false);
    };

    useEffect(() => {
        loadTickets();
        const t = setInterval(loadTickets, 5000); // auto-refresh
        return () => clearInterval(t);
    }, []);

    const handleReady = async (orderId: number) => {
        const res = await markTicketReady(orderId);
        if (res.success) {
            toast.success(`Ordine #${orderId} segnato come pronto`);
            await loadTickets();
        } else {
            toast.error(`Errore: ${res.error?.message}`);
        }
    };

    if (loading) return <p>Caricamento ordini…</p>;
    if (!tickets.length) return <p>Nessun ordine.</p>;

    return (
        <ul className="space-y-4">
            {tickets.map((t) => (
                <li
                    key={t.orderId}
                    className="rounded-xl border p-4 shadow-sm dark:bg-dark-400"
                >
                    <header className="flex justify-between">
                        <div className="font-semibold">
                            Ordine #{t.orderId} – {t.status}
                        </div>
                        {t.status === "ACCEPTED" && (
                            <Button onClick={() => handleReady(t.orderId)}>Pronto</Button>
                        )}
                    </header>

                    <ul className="mt-2 list-disc pl-5 text-sm">
                        {t.items.map((i) => (
                            <li key={i.id}>
                                {i.quantity}× {i.productName}
                            </li>
                        ))}
                    </ul>

                    <p className="mt-2 text-xs opacity-70">
                        {new Date(t.createdAt).toLocaleTimeString("it-IT")} –
                        ristorante&nbsp;{t.restaurantId}
                    </p>
                </li>
            ))}
        </ul>
    );
}
