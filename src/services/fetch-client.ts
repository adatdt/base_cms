// src/services/fetch-client.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://example.com";

interface RequestConfig extends Omit<RequestInit, "body"> {
  data?: any;
}

export interface FetchError {
  status: number;
  statusText: string;
  data: any;
}

export const fetchClient = {
  async request<TResponse>(
    url: string,
    config: RequestConfig = {},
  ): Promise<TResponse> {
    const { data, ...customConfig } = config;

    // 1. Build universal headers safely
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((customConfig.headers as Record<string, string>) || {}),
    };

    // 2. Attach Authorization token if available in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    // 3. Cast into standard RequestInit option constraints
    const options: RequestInit = {
      ...(customConfig as RequestInit),
      headers,
    };

    // 4. Attach JSON body if data exists and method is not GET/DELETE
    if (
      data &&
      customConfig.method !== "GET" &&
      customConfig.method !== "DELETE"
    ) {
      options.body = JSON.stringify(data);
    }

    // 5. Execute Fetch Request safely
    const response = await fetch(`${BASE_URL}${url}`, options);

    // 6. Handle HTTP errors securely using explicit Custom Throw object structures
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorPayload: FetchError = {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      };
      throw errorPayload;
    }

    // 7. Auto-parse JSON response
    return response.json() as Promise<TResponse>;
  },
};
