import express from "express";
import "dotenv/config";
import { v4 as uuidv4 } from "uuid";
import { publishOrderCreated, disconnectProducer } from "./kafka.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

/**
 * TODO-3: Implement POST /orders
 *
 * Requirements:
 *  - Read customerId and amount from req.body.
 *  - Build an order object matching the OrderCreated schema:
 *      { orderId, customerId, amount, createdAt, status }
 *    (orderId: generate with uuidv4(); createdAt: new Date().toISOString();
 *     status: "CREATED")
 *  - Call publishOrderCreated(order) from ./kafka.js
 *  - Respond 201 with the created order as JSON.
 *  - On failure, respond 500 with { error: message }.
 */
app.post("/orders", async (req, res) => {
  res.status(501).json({ error: "POST /orders is not implemented yet (TODO-3)" });
});

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Order producer listening on :${port}`);
});

process.on("SIGINT", async () => {
  await disconnectProducer();
  server.close(() => process.exit(0));
});
