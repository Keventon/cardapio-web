import { useEffect, useRef } from "react";
import { apiConfig } from "../api/config";
import { getClientOrderStreamTicket } from "../api/orders";
import type { ApiOrderStatus } from "../types/api";

type UseOrderStatusStreamOptions = {
  onStatusChanged: (status: ApiOrderStatus) => void;
  orderId: string | null;
  token: string | null;
};

const reconnectDelayMs = 2000;

export function useOrderStatusStream({
  onStatusChanged,
  orderId,
  token,
}: UseOrderStatusStreamOptions) {
  const callbackRef = useRef(onStatusChanged);

  useEffect(() => {
    callbackRef.current = onStatusChanged;
  });

  useEffect(() => {
    if (!orderId || !token) {
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimer: number | undefined;
    let isCancelled = false;

    async function connect() {
      try {
        const { ticket } = await getClientOrderStreamTicket(token!);

        if (isCancelled) {
          return;
        }

        eventSource = new EventSource(
          `${apiConfig.baseUrl}/orders/${orderId}/stream?ticket=${ticket}`,
        );

        eventSource.onmessage = (event) => {
          const payload = JSON.parse(event.data) as { status: ApiOrderStatus };

          callbackRef.current(payload.status);
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
  }, [orderId, token]);
}
