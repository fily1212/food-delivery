export {};
declare global {
    type ActionResponse<T = null> = {
        success: boolean;
        data?: T;
        error?: {
            message: string;
            details?: Record<string, string[]>;
        };
        status?: number;
    };


    type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
    type ErrorResponse = ActionResponse<undefined> & { success: false };

    type APIErrorResponse = NextResponse<ErrorResponse>;
    type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

    export interface Restaurant {
        id: number;
        name: string;
    }

    export interface Product {
        id: string;
        productName: string;
        unitPrice: number;
        restaurantId: number;
    }

    export interface CartItem {
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
    }

    export interface CreateOrderRequestItem {
        productName: string;
        quantity: number;
        unitPrice: number;
    }

    export interface CreateOrderRequest {
        customerId: number;
        restaurantId: number;
        items: CreateOrderRequestItem[];
    }

    export interface OrderDTOItem {
        productName: string;
        quantity: number;
        unitPrice: number;
    }

    export type OrderStatus =
        | "PENDING_VALIDATION"
        | "SENT_TO_KITCHEN"
        | "PREPARING"
        | "READY_FOR_PICKUP"
        | "DELIVERED"
        | "CANCELLED"
        | "FAILED";

    export interface OrderDTO {
        id: number;
        customerId: number;
        restaurantId: number;
        items: OrderDTOItem[];
        status: OrderStatus;
        totalAmount: number;
        createdAt: string; // ISO Date string
        updatedAt: string; // ISO Date string
    }

    export interface TicketItemDTO {
        id: number;
        productName: string;
        quantity: number;
    }

    export interface TicketDTO {
        orderId: number;
        restaurantId: number;
        status: string;          // puoi fare enum se preferisci
        items: TicketItemDTO[];
        createdAt: string;
    }

    export class RequestError extends Error {
        status?: number;
        details?: any;

        constructor(message: string, status?: number, details?: any) {
            super(message);
            this.name = "RequestError";
            this.status = status;
            this.details = details;
            // Set the prototype explicitly.
            Object.setPrototypeOf(this, RequestError.prototype);
        }
    }
}