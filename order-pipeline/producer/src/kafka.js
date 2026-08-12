import { Kafka } from "kafkajs";
import "dotenv/config";

const kafka = new Kafka({
  clientId: "order-producer",
  brokers: [process.env.KAFKA_BROKER],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_API_KEY,
    password: process.env.KAFKA_API_SECRET,
  },
});

const producer = kafka.producer();
let connected = false;

async function ensureConnected() {
  if (!connected) {
    await producer.connect();
    connected = true;
  }
}

/**
 * TODO-2: Implement publishOrderCreated(order).
 *
 * Requirements:
 *  - Ensure the producer is connected (use ensureConnected()).
 *  - Send a single message to process.env.KAFKA_TOPIC.
 *  - Use order.orderId as the message key (so all events for the same
 *    order land on the same partition).
 *  - JSON.stringify the order object as the message value.
 *  - Return the result of producer.send(...).
 */
export async function publishOrderCreated(order) {
  // your implementation here
  throw new Error("publishOrderCreated is not implemented yet (TODO-2)");
}

export async function disconnectProducer() {
  if (connected) {
    await producer.disconnect();
    connected = false;
  }
}
