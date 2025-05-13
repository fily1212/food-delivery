// lib/api.ts
import { fetchHandler, FetchOptions } from "./handlers/fetch";

// Use NEXT_PUBLIC_ prefix for client-side environment variables
const API_SERVICE_BASE_URL = process.env.NEXT_PUBLIC_API_SERVICE_BASE_URL || "http://localhost:8090";

/**
 * Creates a new order.
 * @param payload - The order creation request data.
 * @returns A promise that resolves to an ActionResponse containing the OrderDTO or an error.
 */
export async function createOrder(
    payload: CreateOrderRequest
): Promise<ActionResponse<OrderDTO>> {
    const url = `${API_SERVICE_BASE_URL}/orders`; // Endpoint for creating orders
    const options: FetchOptions = {
        method: "POST",
        body: JSON.stringify(payload),
    };
    return fetchHandler<OrderDTO>(url, options);
}

/**
 * Fetches an order by its ID.
 * @param orderId - The ID of the order to fetch.
 * @returns A promise that resolves to an ActionResponse containing the OrderDTO or an error.
 */
export async function getOrderById(
    orderId: number
): Promise<ActionResponse<OrderDTO>> {
    const url = `${API_SERVICE_BASE_URL}/orders/${orderId}`;
    const options: FetchOptions = {
        method: "GET",
    };
    return fetchHandler<OrderDTO>(url, options);
}



const KITCHEN_SERVICE_BASE_URL =
    process.env.NEXT_PUBLIC_KITCHEN_SERVICE_BASE_URL || "http://localhost:8093";

export async function fetchTickets(): Promise<ActionResponse<TicketDTO[]>> {
    const url = `${KITCHEN_SERVICE_BASE_URL}/tickets`;
    return fetchHandler<TicketDTO[]>(url, { method: "GET" });
}

export async function markTicketReady(
    orderId: number
): Promise<ActionResponse<void>> {
    const url = `${KITCHEN_SERVICE_BASE_URL}/tickets/ready/${orderId}`;
    return fetchHandler<void>(url, { method: "GET" });
}
