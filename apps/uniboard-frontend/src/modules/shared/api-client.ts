type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5174";

class ApiClient {
  private async request<T>(
    path: string,
    options: RequestInit & { method: HttpMethod },
  ): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const payload = await response.json();
        if (typeof payload?.title === "string") {
          message = payload.title;
        } else if (typeof payload?.error === "string") {
          message = payload.error;
        }
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  get<T>(path: string, token?: string) {
    return this.request<T>(path, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  }

  post<T>(path: string, body: unknown, token?: string) {
    return this.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  }

  put<T>(path: string, body: unknown, token?: string) {
    return this.request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  }

  delete<T>(path: string, token?: string) {
    return this.request<T>(path, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  }
}

export const apiClient = new ApiClient();
