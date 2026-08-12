import { useEffect, useState } from "react";
import { fetchOrders } from "../api.js";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  /**
   * TODO-6: Implement live-updating order list.
   *
   * Requirements:
   *  - On mount, call fetchOrders() and store the result in `orders`.
   *  - Poll fetchOrders() every 3 seconds (setInterval) so new orders
   *    show up without a manual refresh.
   *  - Catch errors and store them in `error`.
   *  - Clean up the interval on unmount.
   */
  useEffect(() => {
    // your implementation here
  }, []);

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <table width="100%" cellPadding="8">
      <thead>
        <tr>
          <th align="left">Order ID</th>
          <th align="left">Customer</th>
          <th align="left">Amount</th>
          <th align="left">Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.order_id}>
            <td>{o.order_id}</td>
            <td>{o.customer_id}</td>
            <td>${Number(o.amount).toFixed(2)}</td>
            <td>{o.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
