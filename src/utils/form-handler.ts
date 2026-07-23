// src/utils/form-handler.ts
import { fetchClient } from "@/services/fetch-client";

export type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

interface FormSubmitOptions<TResponse> {
  onSuccess?: (response: TResponse) => void;
  onError?: (error: any) => void;
}

/**
 * Dynamic Global Form Submit using Fetch API
 */
export async function handleFormSubmit<TData, TResponse>(
  url: string,
  data: TData,
  method: HttpMethod = "POST",
  options?: FormSubmitOptions<TResponse>,
): Promise<TResponse | null> {
  try {
    const isDelete = method.toUpperCase() === "DELETE";
    let targetUrl = url;

    // Convert data object to URL query parameters for DELETE requests
    if (isDelete && data && Object.keys(data).length > 0) {
      const queryParams = new URLSearchParams(data as any).toString();
      targetUrl = `${url}?${queryParams}`;
    }

    // Trigger fetch request
    const responseData = await fetchClient.request<TResponse>(targetUrl, {
      method,
      data: isDelete ? undefined : data,
    });

    if (options?.onSuccess) {
      options.onSuccess(responseData);
    }

    return responseData;
  } catch (error) {
    console.error(`[Fetch Form Error] Failed to ${method} to ${url}:`, error);

    if (options?.onError) {
      options.onError(error);
    }

    throw error;
  }
}
