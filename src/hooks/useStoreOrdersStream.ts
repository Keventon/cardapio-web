import { useEffect, useRef } from "react";
import { getStoreOrdersStreamTicket } from "../services/storeApi";
import type { OrderStatus, StoreOrder } from "../types/storeOrder";

type StoreOrderStreamEvent =
  | { type: "created"; order: StoreOrder }
  | { type: "status_changed"; orderId: string; status: OrderStatus };

type UseStoreOrdersStreamOptions = {
  onOrderCreated: (order: StoreOrder) => void;
  onOrderStatusChanged: (orderId: string, status: OrderStatus) => void;
};

const reconnectDelayMs = 2000;

export function useStoreOrdersStream({
  onOrderCreated,
  onOrderStatusChanged,
}: UseStoreOrdersStreamOptions) {
  const callbacksRef = useRef({ onOrderCreated, onOrderStatusChanged });

  useEffect(() => {
    callbacksRef.current = { onOrderCreated, onOrderStatusChanged };
  });

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: number | undefined;
    let isCancelled = false;

    async function connect() {
      try {
        const { ticket } = await getStoreOrdersStreamTicket();

        if (isCancelled) {
          return;
        }

        eventSource = new EventSource(
          `${import.meta.env.VITE_API_BASE_URL}/store/orders/stream?ticket=${ticket}`,
        );

        eventSource.onmessage = (event) => {
          const payload = JSON.parse(event.data) as StoreOrderStreamEvent;

          if (payload.type === "created") {
            callbacksRef.current.onOrderCreated(payload.order);
          } else {
            callbacksRef.current.onOrderStatusChanged(
              payload.orderId,
              payload.status,
            );
          }
        };

        eventSource.onerror = () => {
          eventSource?.close();

          if (!isCancelled) {
            reconnectTimer = window.setTimeout(connect, reconnectDelayMs);
          }
        };
      } catch {
        if (!isCancelled) {
          reconnectTimer = window.setTimeout(connect, reconnectDelayMs);
        }
      }
    }

    connect();

    return () => {
      isCancelled = true;
      eventSource?.close();
      window.clearTimeout(reconnectTimer);
    };
  }, []);
}
