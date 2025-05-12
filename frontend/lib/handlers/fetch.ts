

export interface FetchOptions extends RequestInit {
    timeout?: number;
}

function isError(error: unknown): error is Error {
    return error instanceof Error;
}

export async function fetchHandler<T>(
    url: string,
    options: FetchOptions = {}
): Promise<ActionResponse<T>> {
    const { timeout = 8000, headers: customHeaders = {}, ...restOptions } = options; // Increased timeout slightly
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };

    const headers: HeadersInit = {
        ...defaultHeaders,
        ...customHeaders,
    };

    const config: RequestInit = {
        ...restOptions,
        headers,
        signal: controller.signal,
    };

    try {
        const response = await fetch(url, config);
        clearTimeout(id); // Clear timeout if fetch completes (successfully or with HTTP error)

        // Attempt to parse JSON regardless of status, as error responses might have JSON bodies
        let responseData: any = null;
        try {
            const text = await response.text();
            if (text) { // Avoid parsing empty string
                responseData = JSON.parse(text);
            }
        } catch (e) {
            // JSON parsing failed, but we might still have a non-OK response
            console.warn(`Failed to parse JSON response from ${url}`, e);
            // If response is not OK and JSON parsing fails, use statusText as a fallback message
            if (!response.ok && !responseData) {
                responseData = { message: response.statusText || "Error response without JSON body" };
            }
        }

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status} for URL: ${url}`, responseData);
            return {
                success: false,
                error: {
                    message: responseData?.message || `HTTP error! status: ${response.status}`,
                    details: responseData,
                },
                status: response.status,
            };
        }

        return {
            success: true,
            data: responseData as T, // Assume responseData is of type T on success
            status: response.status,
        };

    } catch (err) {
        clearTimeout(id); // Ensure timeout is cleared on any error
        const error = isError(err) ? err : new Error("An unknown error occurred during fetch.");

        let errorDetails: { message: string };
        let status = 500; // Default status for client-side errors

        if (error.name === "AbortError") {
            console.warn(`Request to ${url} timed out after ${timeout}ms`);
            errorDetails = { message: `Request timed out after ${timeout}ms.` };
            status = 408; // Request Timeout
        } else if (err instanceof RequestError) { // If it's already a RequestError
            errorDetails = { message: err.message, details: err.details };
            status = err.status || 500;
        }
        else {
            console.error(`Error fetching ${url}:`, error);
            errorDetails = { message: error.message };
            // Could be a TypeError for network issues, etc.
            if (error.message.toLowerCase().includes('failed to fetch')) {
                status = 503; // Service Unavailable (good for network errors)
            }
        }

        return {
            success: false,
            error: errorDetails,
            status: status,
        };
    }
}
