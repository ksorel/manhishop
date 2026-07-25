const BASE_URL = "https://api.paystack.co";

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY ?? ""}`,
    "Content-Type": "application/json",
  };
}

export async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });

  const json = await response.json();
  if (!response.ok || json.status === false) {
    throw new Error(`paystack_error: ${json.message ?? response.statusText}`);
  }

  return json as T;
}
