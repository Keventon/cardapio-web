import { BackpackIcon, ClipboardIcon, Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getApiErrorMessage } from "../../api/http";
import { listClientOrders } from "../../api/orders";
import { useUserClient } from "../../hooks/useUserClient";
import type { ApiOrder, ApiOrderStatus, ApiPaymentMethod } from "../../types/api";
import { formatCurrency } from "../../utils/currency";
import { OrderTrackingDialog } from "./OrderTrackingDialog";

const nonTrackableStatuses: ApiOrderStatus[] = [
  "CANCELED",
  "COMPLETED",
  "REJECTED",
];

function isTrackable(status: ApiOrderStatus) {
  return !nonTrackableStatuses.includes(status);
}

const statusLabels: Record<ApiOrderStatus, string> = {
  CANCELED: "Cancelado",
  COMPLETED: "Finalizado",
  DELIVERED: "Entregue",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  PENDING: "Pendente",
  PREPARING: "Em preparo",
  READY: "Pronto",
  REJECTED: "Rejeitado",
};

const statusBadgeClasses: Record<ApiOrderStatus, string> = {
  CANCELED: "bg-surface-soft text-text-muted",
  COMPLETED: "bg-surface-soft text-text-muted",
  DELIVERED: "bg-surface-soft text-text-muted",
  OUT_FOR_DELIVERY: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-red-100 text-danger",
  PREPARING: "bg-accent-soft text-rating-text",
  READY: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-danger",
};

const paymentLabels: Record<ApiPaymentMethod, string> = {
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  MEAL_VOUCHER: "Vale-refeição",
  PIX: "Pix",
};

export function OrderHistoryDrawer() {
  const { isAuthenticated, session } = useUserClient();
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<ApiOrder | null>(null);

  useEffect(() => {
    if (!open || !session) {
      return;
    }

    let isIgnored = false;

    listClientOrders(session.token)
      .then((data) => {
        if (isIgnored) {
          return;
        }

        setOrders(data);
        setError("");
      })
      .catch((requestError) => {
        if (!isIgnored) {
          setError(
            getApiErrorMessage(
              requestError,
              "Não foi possível carregar seus pedidos.",
            ),
          );
        }
      })
      .finally(() => {
        if (!isIgnored) {
          setIsLoading(false);
        }
      });

    return () => {
      isIgnored = true;
    };
  }, [open, session]);

  return (
    <Dialog.Root
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          setIsLoading(true);
        } else {
          setTrackedOrder(null);
        }
      }}
      open={open}
    >
      <Dialog.Trigger asChild>
        <button
          aria-label="Meus pedidos"
          className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-surface-hover"
          type="button"
        >
          <ClipboardIcon className="h-5 w-5" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-125 flex-col bg-surface shadow-[-20px_0_45px_rgba(44,29,22,0.25)] focus:outline-none">
          <header className="flex items-start justify-between border-b border-border px-6 py-5">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-card-title font-extrabold text-text-main">
                <ClipboardIcon className="h-5 w-5 text-primary-dark" />
                Meus Pedidos
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-body-sm font-medium text-text-muted">
                Acompanhe o histórico dos seus pedidos.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                aria-label="Fechar meus pedidos"
                className="grid h-10 w-10 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {!isAuthenticated ? (
              <EmptyState message="Entre na sua conta para ver seus pedidos.">
                Você ainda não entrou
              </EmptyState>
            ) : isLoading ? (
              <p className="text-center text-body-sm font-semibold text-text-muted">
                Carregando pedidos...
              </p>
            ) : error ? (
              <p className="text-center text-body-sm font-semibold text-danger">
                {error}
              </p>
            ) : orders.length === 0 ? (
              <EmptyState message="Seus pedidos vão aparecer aqui assim que você finalizar uma compra.">
                Nenhum pedido ainda
              </EmptyState>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderHistoryCard
                    key={order.id}
                    onTrack={setTrackedOrder}
                    order={order}
                  />
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {open && trackedOrder && session ? (
        <OrderTrackingDialog
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setTrackedOrder(null);
            }
          }}
          open={Boolean(trackedOrder)}
          order={trackedOrder}
          token={session.token}
        />
      ) : null}
    </Dialog.Root>
  );
}

function EmptyState({
  children,
  message,
}: {
  children: ReactNode;
  message: string;
}) {
  return (
    <div className="grid min-h-70 place-items-center rounded-lg border border-dashed border-border-muted bg-white px-6 text-center">
      <div>
        <BackpackIcon className="mx-auto h-9 w-9 text-primary-dark" />
        <p className="mt-4 text-body-sm font-extrabold text-text-main">
          {children}
        </p>
        <p className="mt-2 text-caption font-medium leading-relaxed text-text-muted">
          {message}
        </p>
      </div>
    </div>
  );
}

function OrderHistoryCard({
  onTrack,
  order,
}: {
  onTrack: (order: ApiOrder) => void;
  order: ApiOrder;
}) {
  return (
    <article className="rounded-lg border border-border-muted bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-body-sm font-extrabold text-text-main">
            {order.store?.name ?? "Loja"}
          </p>
          <p className="mt-1 text-caption font-medium text-text-muted">
            #{order.number}
            {order.createdAt ? ` · ${formatOrderDate(order.createdAt)}` : ""}
          </p>
        </div>
        <span
          className={`shrink-0 rounded px-2 py-1 text-micro font-extrabold uppercase ${statusBadgeClasses[order.status]}`}
        >
          {statusLabels[order.status]}
        </span>
      </div>

      {order.items && order.items.length > 0 ? (
        <p className="mt-3 line-clamp-2 text-caption font-medium leading-relaxed text-text-muted">
          {order.items
            .map((item) => `${item.quantity}x ${item.product?.name ?? "Item"}`)
            .join(", ")}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between border-t border-border-muted pt-3">
        <span className="text-caption font-semibold text-text-muted">
          {order.paymentMethod ? paymentLabels[order.paymentMethod] : ""}
        </span>
        <strong className="text-body-sm font-extrabold text-accent">
          {formatCurrency(order.total)}
        </strong>
      </div>

      {isTrackable(order.status) ? (
        <button
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary/30 text-caption font-extrabold text-primary-dark transition hover:bg-surface-hover"
          onClick={() => onTrack(order)}
          type="button"
        >
          Acompanhar pedido
        </button>
      ) : null}
    </article>
  );
}

function formatOrderDate(createdAt: string) {
  return new Date(createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
