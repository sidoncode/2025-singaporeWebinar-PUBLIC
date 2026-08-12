import OrderList from "./components/OrderList.jsx";

export default function App() {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 640, margin: "40px auto" }}>
      <h1>Live Orders</h1>
      <OrderList />
    </div>
  );
}
