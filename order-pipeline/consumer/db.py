import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    return psycopg2.connect(
        host=os.environ["PGHOST"],
        port=os.environ["PGPORT"],
        dbname=os.environ["PGDATABASE"],
        user=os.environ["PGUSER"],
        password=os.environ["PGPASSWORD"],
    )


def init_schema(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                order_id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                amount NUMERIC NOT NULL,
                status TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL
            )
            """
        )
    conn.commit()


def save_order(conn, order: dict):
    """
    TODO-5: Implement save_order(conn, order).

    Requirements:
      - Insert the order into the `orders` table using the fields:
        order_id, customer_id, amount, status, created_at
        (these come from order["orderId"], order["customerId"], etc.)
      - Use "ON CONFLICT (order_id) DO NOTHING" so re-processing the same
        Kafka message (e.g. after a consumer restart) doesn't error out.
      - Commit the transaction.
    """
    raise NotImplementedError("save_order is not implemented yet (TODO-5)")
