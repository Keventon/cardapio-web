import {
  ArrowLeftIcon,
  BackpackIcon,
  ChevronRightIcon,
  ClipboardIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/http";
import { listClientOrders } from "../../api/orders";
import { useCloseDrawerOnBack } from "../../hooks/useCloseDrawerOnBack";
import { useOrderStatusStream } from "../../hooks/useOrderStatusStream";
import { useUserClient } from "../../hooks/useUserClient";
import type {
  ApiOrder,
  ApiOrderStatus,
  ApiPaymentMethod,
} from "../../types/api";
import { formatCurrency } from "../../utils/currency";
import { resolveStoreImageUrl } from "../../utils/imageUrl";
import { ProfileDialog } from "../profile/ProfileDialog";

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

const pickupSteps: ApiOrderStatus[] = [
  "PENDING",
  "PREPARING",
  "READY",
  "COMPLETED",
];

const deliverySteps: ApiOrderStatus[] = [
  "PENDING",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
];

const stepLabels: Record<ApiOrderStatus, string> = {
  CANCELED: "Cancelado",
  COMPLETED: "Concluído",
  DELIVERED: "Entregue",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  PENDING: "Pedido recebido",
  PREPARING: "Em preparo",
  READY: "Pronto para retirada",
  REJECTED: "Rejeitado",
};

export function ClientOrdersPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, session } = useUserClient();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(session));
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [lastSession, setLastSession] = useState(session);

  if (session !== lastSession) {
    setLastSession(session);

    if (session) {
      setIsLoading(true);
    } else {
      setOrders([]);
      setSelectedOrderId(null);
    }
  }

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;

  useCloseDrawerOnBack({
    isOpen: Boolean(selectedOrder),
    onClose: () => setSelectedOrderId(null),
  });

  useEffect(() => {
    if (!session) {
      return;
    }

    let isIgnored = false;

    listClientOrders(session.token)
      .then((data) => {
        if (!isIgnored) {
          setOrders(data);
          setError("");
        }
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
  }, [session]);

  // Live tracking only for the opened order: each stream is its own SSE
  // connection, so streaming the whole list would not scale past the
  // browser's per-host connection limit.
  useOrderStatusStream({
    onStatusChanged: (status) => {
      setOrders((current) =>
        current.map((order) =>
          order.id === selectedOrderId ? { ...order, status } : order,
        ),
      );
    },
    orderId:
      selectedOrder && isTrackable(selectedOrder.status)
        ? selectedOrder.id
        : null,
    token: session?.token ?? null,
  });

  return (
    <div className="min-h-screen bg-surface-page text-text-main">
      <div className="mx-auto flex min-h-screen w-full max-w-375 flex-col bg-surface shadow-2xl">
        <header className="sticky top-0 z-40 border-b border-border bg-surface/95 px-5 py-4 backdrop-blur sm:px-8 lg:px-16">
          <div className="mx-auto flex max-w-342.5 items-center gap-3">
            <Link
              aria-label="Voltar para o cardápio"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
              to={`/${slug}`}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-card-title font-extrabold text-text-main">
                <ClipboardIcon className="h-5 w-5 shrink-0 text-primary-dark" />
                Meus Pedidos
              </h1>
              <p className="mt-0.5 truncate text-caption font-medium text-text-muted">
                Acompanhe o histórico dos seus pedidos
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-190 flex-1 px-5 py-6 sm:px-8">
          {!isAuthenticated ? (
            <EmptyState message="Entre na sua conta para ver seus pedidos.">
              <ProfileDialog triggerLabel="Entrar na conta" />
            </EmptyState>
          ) : isLoading ? (
            <p className="mt-10 text-center text-body-sm font-semibold text-text-muted">
              Carregando pedidos...
            </p>
          ) : error ? (
            <p className="mt-10 text-center text-body-sm font-semibold text-danger">
              {error}
            </p>
          ) : orders.length === 0 ? (
            <EmptyState message="Seus pedidos vão aparecer aqui assim que você finalizar uma compra.">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-button font-extrabold text-white transition hover:bg-primary-hover"
                to={`/${slug}`}
              >
                Ver cardápio
              </Link>
            </EmptyState>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderListCard
                  key={order.id}
                  onOpen={() => setSelectedOrderId(order.id)}
                  order={order}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog.Root
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setSelectedOrderId(null);
          }
        }}
        open={Boolean(selectedOrder)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="drawer-overlay fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]" />
          <Dialog.Content className="drawer-panel fixed right-0 top-0 z-50 flex h-dvh w-full max-w-125 flex-col bg-surface shadow-[-20px_0_45px_rgba(44,29,22,0.25)] focus:outline-none">
            <header className="flex items-start justify-between border-b border-border px-6 py-5">
              <div>
                <Dialog.Title className="flex items-center gap-2 text-card-title font-extrabold text-text-main">
                  <ClipboardIcon className="h-5 w-5 text-primary-dark" />
                  Pedido #{selectedOrder?.number}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-body-sm font-medium text-text-muted">
                  Detalhes e acompanhamento do pedido.
                </Dialog.Description>
              </div>

              <Dialog.Close asChild>
                <button
                  aria-label="Fechar detalhes do pedido"
                  className="grid h-10 w-10 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
                >
                  <Cross2Icon className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {selectedOrder ? <OrderDetails order={selectedOrder} /> : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function EmptyState({
  children,
  message,
}: {
  children: React.ReactNode;
  message: string;
}) {
  return (
    <div className="grid min-h-70 place-items-center rounded-lg border border-dashed border-border-muted bg-white px-6 py-10 text-center">
      <div>
        <BackpackIcon className="mx-auto h-9 w-9 text-primary-dark" />
        <p className="mt-2 mb-6 text-caption font-medium leading-relaxed text-text-muted">
          {message}
        </p>
        {children}
      </div>
    </div>
  );
}

function OrderListCard({
  onOpen,
  order,
}: {
  onOpen: () => void;
  order: ApiOrder;
}) {
  return (
    <button
      className="group w-full rounded-lg border border-border-muted bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
      onClick={onOpen}
      type="button"
    >
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
        <span className="flex items-center gap-1 text-body-sm font-extrabold text-accent">
          {formatCurrency(order.total)}
          <ChevronRightIcon className="h-4 w-4 text-border-input transition group-hover:text-primary" />
        </span>
      </div>
    </button>
  );
}

function OrderDetails({ order }: { order: ApiOrder }) {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border-muted bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-body-sm font-extrabold text-text-main">
              {order.store?.name ?? "Loja"}
            </h2>
            {order.createdAt ? (
              <p className="mt-1 text-caption font-medium text-text-muted">
                Feito em {formatOrderDate(order.createdAt)}
              </p>
            ) : null}
          </div>
          <span
            className={`shrink-0 rounded px-2 py-1 text-micro font-extrabold uppercase ${statusBadgeClasses[order.status]}`}
          >
            {statusLabels[order.status]}
          </span>
        </div>

        <OrderTimeline order={order} />
      </section>

      <section className="rounded-lg border border-border-muted bg-white p-5">
        <h2 className="text-body-sm font-extrabold text-text-main">
          Itens do pedido
        </h2>

        <ul className="mt-4 divide-y divide-border-muted">
          {(order.items ?? []).map((item) => (
            <li className="flex items-center gap-3 py-3" key={item.id}>
              {item.product?.imageUrl ? (
                <img
                  alt={item.product?.name ?? "Item"}
                  className="h-14 w-14 shrink-0 rounded-lg bg-surface-soft object-cover"
                  src={resolveStoreImageUrl(item.product.imageUrl)}
                />
              ) : (
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-surface-soft text-text-muted">
                  <BackpackIcon className="h-5 w-5" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-extrabold text-text-main">
                  {item.product?.name ?? "Item"}
                </p>
                <p className="mt-0.5 text-caption font-medium text-text-muted">
                  {item.quantity}x {formatCurrency(item.unitPrice)}
                </p>
                {item.observation ? (
                  <p className="mt-0.5 truncate text-caption font-medium italic text-text-muted">
                    {item.observation}
                  </p>
                ) : null}
              </div>

              <strong className="shrink-0 text-body-sm font-extrabold text-text-strong">
                {formatCurrency(item.unitPrice * item.quantity)}
              </strong>
            </li>
          ))}
        </ul>

        <dl className="mt-2 space-y-2 border-t border-border-muted pt-4 text-body-sm">
          {typeof order.subtotal === "number" ? (
            <div className="flex items-center justify-between font-medium text-text-muted">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(order.subtotal)}</dd>
            </div>
          ) : null}
          {order.deliveryFee ? (
            <div className="flex items-center justify-between font-medium text-text-muted">
              <dt>Taxa de entrega</dt>
              <dd>{formatCurrency(order.deliveryFee)}</dd>
            </div>
          ) : null}
          {order.discount ? (
            <div className="flex items-center justify-between font-medium text-text-muted">
              <dt>Desconto</dt>
              <dd>-{formatCurrency(order.discount)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between font-extrabold text-text-strong">
            <dt>Total</dt>
            <dd className="text-accent">{formatCurrency(order.total)}</dd>
          </div>
          {order.fulfillmentType ? (
            <div className="flex items-center justify-between font-medium text-text-muted">
              <dt>Recebimento</dt>
              <dd>
                {order.fulfillmentType === "DELIVERY"
                  ? "Entrega"
                  : "Retirada no local"}
              </dd>
            </div>
          ) : null}
          {order.paymentMethod ? (
            <div className="flex items-center justify-between font-medium text-text-muted">
              <dt>Pagamento</dt>
              <dd>
                {paymentLabels[order.paymentMethod]}
                {order.changeFor
                  ? ` (troco para ${formatCurrency(order.changeFor)})`
                  : ""}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>
    </div>
  );
}

function OrderTimeline({ order }: { order: ApiOrder }) {
  const steps =
    order.fulfillmentType === "DELIVERY" ? deliverySteps : pickupSteps;
  const isCanceled = order.status === "CANCELED" || order.status === "REJECTED";
  const currentIndex = steps.indexOf(order.status);

  if (isCanceled) {
    return (
      <p className="mt-5 rounded-lg bg-red-100 px-4 py-3 text-body-sm font-bold text-danger">
        Este pedido foi {stepLabels[order.status].toLowerCase()} pela loja.
      </p>
    );
  }

  if (currentIndex === -1) {
    return (
      <p className="mt-5 rounded-lg bg-surface-soft px-4 py-3 text-body-sm font-bold text-text-strong">
        Status atual: {stepLabels[order.status]}
      </p>
    );
  }

  const isFinished = currentIndex === steps.length - 1;

  return (
    <div className="mt-5">
      <div className="flex items-center gap-1.5">
        {steps.map((step, index) => (
          <span
            className={`h-1.5 flex-1 rounded-full ${
              index < currentIndex || isFinished
                ? "bg-primary"
                : index === currentIndex
                  ? "order-step-current"
                  : "bg-surface-soft"
            }`}
            key={step}
          />
        ))}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="text-body-sm font-extrabold text-text-strong">
          {stepLabels[order.status]}
        </p>
        <span className="shrink-0 text-caption font-semibold text-text-muted">
          Etapa {currentIndex + 1} de {steps.length}
        </span>
      </div>

      {!isFinished ? (
        <p className="mt-0.5 text-caption font-medium text-text-muted">
          Próxima etapa: {stepLabels[steps[currentIndex + 1]]}
        </p>
      ) : null}
    </div>
  );
}

function formatOrderDate(createdAt: string) {
  return new Date(createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
