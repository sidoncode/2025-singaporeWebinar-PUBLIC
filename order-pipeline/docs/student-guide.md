# Student Guide — Order Pipeline

Welcome. You'll complete this project by working through the BMAD agent
chain: use the **Architect** and **Dev** agents to help you implement each
TODO below, story by story. Don't just fill in code from memory — practice
handing each TODO to a BMAD Dev agent as a story and reviewing its output.

Each TODO corresponds to one BMAD story. Check them off as you go.

---

## Setup

- [ ] Run `docker compose up -d` to start local Postgres
- [ ] `cd producer && npm install && cp .env.example .env` — fill in your Confluent credentials
- [ ] `cd consumer && pip install -r requirements.txt && cp .env.example .env`
- [ ] `cd dashboard && npm install`
- [ ] Create a Kafka topic in Confluent Cloud named `orders.created`

---

## TODOs

- [ ] **TODO-1** — `schemas/order-created.avsc`
  Add a `status` field to the Avro schema (string, default `"CREATED"`).

- [ ] **TODO-2** — `producer/src/kafka.js`
  Implement `publishOrderCreated(order)` — connect the Kafka producer and
  send the order as a JSON message, keyed by `orderId`.

- [ ] **TODO-3** — `producer/src/index.js`
  Implement the `POST /orders` route — build an order object and publish it
  via `publishOrderCreated`.

- [ ] **TODO-4** — `consumer/consumer.py`
  Implement the Kafka consume loop — poll, handle errors, parse JSON, save
  to the database.

- [ ] **TODO-5** — `consumer/db.py`
  Implement `save_order(conn, order)` — insert the order into Postgres,
  ignoring duplicates.

- [ ] **TODO-6** — `dashboard/src/components/OrderList.jsx`
  Implement the polling effect — fetch orders on mount and every 3 seconds.

- [ ] **TODO-7** — `docker-compose.yml`
  Add a healthcheck to the `postgres` service using `pg_isready`.

---

## How to work each TODO with BMAD

1. Find the TODO comment in the file.
2. Open the SM agent and turn it into a story (or use the story already
   drafted in Jira, if your trainer pre-loaded the backlog).
3. Hand the story to the Dev agent inside the relevant file/folder.
4. Review the generated code against the requirements in the TODO comment.
5. Run the relevant service and confirm it behaves as expected (see
   "Checkpoints" below).
6. Mark the Jira ticket Done and check the box above.

---

## Checkpoints (how to know it worked)

- **After TODO-2/3:** `curl -X POST localhost:4000/orders -H "Content-Type: application/json" -d '{"customerId":"c1","amount":42.5}'` returns a 201 with an order object.
- **After TODO-4/5:** running `python consumer.py` prints a "Saved order ..." line after you POST an order, and the row appears in Postgres (`psql -h localhost -U orders -d orders -c "select * from orders;"`).
- **After TODO-6:** the dashboard at `localhost:5173` shows the order within 3 seconds, no manual refresh needed.

---

## Stretch goals

- Add a `GET /orders` endpoint to the producer (or a separate read service) backed by Postgres, so the dashboard has something real to call.
- Add a schema registry check so the producer rejects a payload that doesn't match `order-created.avsc`.
- Wire a script that updates the corresponding Jira ticket to "Done" automatically when a story's tests pass.
