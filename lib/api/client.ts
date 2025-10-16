/**
 * Base API Client
 * Handles authentication and common request logic
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, headers: customHeaders, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420", // Skip ngrok browser warning
    ...(customHeaders as Record<string, string>),
  };

  // Add authorization header if token is provided
  if (token) {
    console.log("🔑 Clerk Bearer Token:", token);
    console.log("🔑 Token length:", token.length);
    console.log("🔑 Token preview:", token.substring(0, 20) + "...");
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn("⚠️ No token provided for API request");
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log("🌐 API Request:", fetchOptions.method || "GET", url);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle non-2xx responses
    if (!response.ok) {
      console.error("❌ API Error Response:", response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Error data:", errorData);
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }
    
    console.log("✅ API Response:", response.status, response.statusText);

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Check content type before parsing
    const contentType = response.headers.get("content-type");
    console.log("📄 Content-Type:", contentType);
    
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text();
      console.error("❌ Non-JSON response received:");
      console.error("Response preview:", responseText.substring(0, 200));
      throw new ApiError(
        `Expected JSON but received ${contentType || 'unknown content type'}. The API might be returning an error page.`,
        response.status,
        { responsePreview: responseText.substring(0, 500) }
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(
      error instanceof Error ? error.message : "Network request failed"
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "GET", token }),

  post: <T>(endpoint: string, data?: any, token?: string) =>
    request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      token,
    }),

  put: <T>(endpoint: string, data?: any, token?: string) =>
    request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      token,
    }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "DELETE", token }),
};

export { ApiError };
export default apiClient;
