# Trainer Guide — Order Pipeline

Companion to `student-guide.md`. For each TODO: **Why** it matters, **What**
it technically requires, what to have students **Observe**, and the full
reference solution.

Use this to seed the BMAD PM/SM agents' story descriptions ahead of time, or
to sanity-check what the Dev agent produces live.

---

## TODO-1 — Avro schema `status` field

**Why:** Schema-first design is one of BMAD's core habits — the Architect
agent defines contracts before any service code exists. It also foreshadows
why schema evolution matters: adding a field with a default is backward
compatible; students will hit this again if they later rename a field.

**What:** Add a `status` field, type `string`, default `"CREATED"`.

**Observe:** Ask *"what breaks if we don't give this field a default?"*
Answer: old producers publishing without `status` would fail schema
validation once the field is required — the default avoids that.

**Solution:**
```json
{
  "type": "record",
  "name": "OrderCreated",
  "namespace": "com.training.orders",
  "fields": [
    { "name": "orderId", "type": "string" },
    { "name": "customerId", "type": "string" },
    { "name": "amount", "type": "double" },
    { "name": "createdAt", "type": "string" },
    { "name": "status", "type": "string", "default": "CREATED" }
  ]
}
```

---

## TODO-2 — `publishOrderCreated` in `producer/src/kafka.js`

**Why:** This is the first real integration point with Confluent. Keying by
`orderId` is the teaching moment: Kafka guarantees order *within* a
partition, so all events for one order should land on the same partition —
this is why the key matters, not just the value.

**What:** Connect once (idempotent connect), send a message to
`process.env.KAFKA_TOPIC` with `key: order.orderId` and a JSON-stringified
value.

**Observe:** Have students check the Confluent Cloud UI — message count on
`orders.created` increments after a POST. Ask them to predict (correctly)
that two orders from the same customer but different `orderId`s might land
on different partitions.

**Solution:**
```javascript
export async function publishOrderCreated(order) {
  await ensureConnected();
  return producer.send({
    topic: process.env.KAFKA_TOPIC,
    messages: [
      {
        key: order.orderId,
        value: JSON.stringify(order),
      },
    ],
  });
}
```

---

## TODO-3 — `POST /orders` in `producer/src/index.js`

**Why:** This connects the HTTP world to the event world — the moment a
client-facing action becomes an event. It's also the first place students
see BMAD's acceptance criteria translate directly into an implementation
(the story literally specifies status codes and field names).

**What:** Build the order object, call `publishOrderCreated`, return 201 or
500.

**Observe:** Have students POST a malformed body (missing `amount`) and
discuss what should happen — this is a good moment to note the current
implementation doesn't validate input, and ask "would this pass your BMAD
QA agent's review?"

**Solution:**
```javascript
app.post("/orders", async (req, res) => {
  try {
    const { customerId, amount } = req.body;
    const order = {
      orderId: uuidv4(),
      customerId,
      amount,
      createdAt: new Date().toISOString(),
      status: "CREATED",
    };
    await publishOrderCreated(order);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## TODO-4 — Consume loop in `consumer/consumer.py`

**Why:** Demonstrates the at-least-once delivery model Kafka consumers
typically use — `poll()` returning `None` isn't an error, and message-level
errors shouldn't crash the whole loop. This is the "boring but essential"
part of stream processing that's easy to get wrong.

**What:** Poll with a timeout, skip `None`, log-and-continue on
`msg.error()`, otherwise parse and persist.

**Observe:** Kill and restart the consumer while orders keep being
produced — `auto.offset.reset: earliest` plus the group ID means it should
pick back up without losing messages. Point out `ON CONFLICT DO NOTHING`
(TODO-5) is what makes reprocessing safe.

**Solution:**
```python
while True:
    msg = consumer.poll(1.0)
    if msg is None:
        continue
    if msg.error():
        print(f"Consumer error: {msg.error()}")
        continue

    order = json.loads(msg.value())
    save_order(conn, order)
    print(f"Saved order {order['orderId']} for {order['customerId']}")
```

---

## TODO-5 — `save_order` in `consumer/db.py`

**Why:** Idempotent writes are the safety net for TODO-4's at-least-once
delivery. This is a good spot to discuss exactly-once vs. at-least-once
semantics without going deep into Kafka transactions.

**What:** Parameterized INSERT with `ON CONFLICT (order_id) DO NOTHING`,
then commit.

**Observe:** Re-run the same message through the consumer manually (or
replay from an earlier offset) and confirm no duplicate row and no error.

**Solution:**
```python
def save_order(conn, order: dict):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO orders (order_id, customer_id, amount, status, created_at)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (order_id) DO NOTHING
            """,
            (
                order["orderId"],
                order["customerId"],
                order["amount"],
                order["status"],
                order["createdAt"],
            ),
        )
    conn.commit()
```

---

## TODO-6 — Polling effect in `dashboard/src/components/OrderList.jsx`

**Why:** Ties the whole pipeline together visually — this is the moment
non-technical stakeholders in the room see the payoff. Also a natural spot
to discuss polling vs. websockets/SSE as a follow-up architecture decision
(good Architect-agent discussion prompt).

**What:** Fetch on mount, `setInterval` every 3s, cleanup on unmount, catch
errors into state.

**Observe:** Open two browser tabs, POST an order from the terminal, and
watch both tabs update within 3 seconds without a refresh.

**Solution:**
```javascript
useEffect(() => {
  let cancelled = false;

  async function load() {
    try {
      const data = await fetchOrders();
      if (!cancelled) setOrders(data);
    } catch (err) {
      if (!cancelled) setError(err.message);
    }
  }

  load();
  const interval = setInterval(load, 3000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, []);
```

---

## TODO-7 — Postgres healthcheck in `docker-compose.yml`

**Why:** A small but real "ops" habit — services that start faster than
their dependencies cause flaky first-run demos. Worth connecting back to
the Architect agent's job of specifying non-functional requirements, not
just data flow.

**What:** Add a `healthcheck` block using `pg_isready`.

**Observe:** Run `docker compose ps` and show the `healthy` status
transition — good visual for "the infra is part of the design too."

**Solution:**
```yaml
services:
  postgres:
    image: postgres:16
    container_name: order-pipeline-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: orders
      POSTGRES_PASSWORD: orders
      POSTGRES_DB: orders
    ports:
      - "5432:5432"
    volumes:
      - order_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orders -d orders"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  order_pg_data:
```

---

## Session flow suggestion

1. Run TODO-1 and TODO-2 together as a live BMAD Dev-agent demo (Architect → SM → Dev → Jira ticket closes).
2. Split into pairs for TODO-3 through TODO-6, each pair claiming a different Jira ticket.
3. Regroup, run the full pipeline end-to-end, and open the dashboard together.
4. TODO-7 as a stretch/homework item if time runs short.
