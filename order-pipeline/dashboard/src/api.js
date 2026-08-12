// Assumes a simple read API exposes GET /orders (add this endpoint to the
// producer service, or point this at a small read service of your own).
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function fetchOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
  return res.json();
}
