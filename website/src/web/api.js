const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
export async function api(path, { method = "GET", body, signal } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort);
  try {
    const token = sessionStorage.getItem("userToken");
    const response = await fetch(base + path, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    return data;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
