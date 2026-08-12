import json
import os

from confluent_kafka import Consumer
from dotenv import load_dotenv

from db import get_connection, init_schema, save_order

load_dotenv()


def build_consumer() -> Consumer:
    return Consumer(
        {
            "bootstrap.servers": os.environ["KAFKA_BROKER"],
            "security.protocol": "SASL_SSL",
            "sasl.mechanisms": "PLAIN",
            "sasl.username": os.environ["KAFKA_API_KEY"],
            "sasl.password": os.environ["KAFKA_API_SECRET"],
            "group.id": os.environ["KAFKA_GROUP_ID"],
            "auto.offset.reset": "earliest",
        }
    )


def run():
    conn = get_connection()
    init_schema(conn)

    consumer = build_consumer()
    consumer.subscribe([os.environ["KAFKA_TOPIC"]])
    print(f"Listening on topic '{os.environ['KAFKA_TOPIC']}'...")

    try:
        while True:
            # TODO-4: Implement the consume loop.
            #
            # Requirements:
            #  - Poll the consumer for a message with a 1.0 second timeout:
            #      msg = consumer.poll(1.0)
            #  - If msg is None, continue the loop.
            #  - If msg.error(), print the error and continue.
            #  - Otherwise, parse msg.value() as JSON into `order`.
            #  - Call save_order(conn, order) from db.py.
            #  - Print a confirmation line, e.g.
            #      f"Saved order {order['orderId']} for {order['customerId']}"
            raise NotImplementedError(
                "Kafka consume loop is not implemented yet (TODO-4)"
            )
    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()
        conn.close()


if __name__ == "__main__":
    run()
