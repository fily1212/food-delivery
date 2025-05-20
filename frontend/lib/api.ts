// lib/api.ts
import { fetchHandler, FetchOptions } from "./handlers/fetch";

const API_BASE =    process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

/* ---------- ORDER SERVICE ------------------------------------------------ */

export async function createOrder(
    payload: CreateOrderRequest
): Promise<ActionResponse<OrderDTO>> {
    const url = `${API_BASE}/order/orders`;
    const options: FetchOptions = { method: "POST", body: JSON.stringify(payload) };
    return fetchHandler<OrderDTO>(url, options);
}

export async function getOrderById(
    orderId: number
): Promise<ActionResponse<OrderDTO>> {
    const url = `${API_BASE}/order/orders/${orderId}`;
    return fetchHandler<OrderDTO>(url, { method: "GET" });
}

/* ---------- KITCHEN SERVICE --------------------------------------------- */

export async function fetchTickets(): Promise<ActionResponse<TicketDTO[]>> {
    const url = `${API_BASE}/kitchen/tickets`;
    return fetchHandler<TicketDTO[]>(url, { method: "GET" });
}

export async function markTicketReady(
    orderId: number
): Promise<ActionResponse<void>> {
    const url = `${API_BASE}/kitchen/tickets/ready/${orderId}`;
    return fetchHandler<void>(url, { method: "GET" });
}
