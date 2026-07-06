import {
  BackpackIcon,
  CheckIcon,
  Cross2Icon,
  DrawingPinFilledIcon,
  EyeOpenIcon,
  IdCardIcon,
  MagnifyingGlassIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  FulfillmentType,
  OrderStatus,
  PaymentMethod,
  StoreOrder,
} from "../../types/storeOrder";
import { formatCurrency } from "../../utils/currency";
import { getStoreOrders, updateStoreOrderStatus } from "../../services/storeApi";
import { useStoreOrdersStream } from "../../hooks/useStoreOrdersStream";
import { useStoreAuthStore } from "../../stores/storeAuthStore";
import { StoreSidebar } from "./StoreSidebar";

type StoreOrdersPageProps = {
  onLogout: () => void;
};

type FilterKey =
  | "all"
  | "canceled"
  | "completed"
  | "delivered"
  | "pending"
  | "preparing"
  | "ready"
  | "rejected";

const filterStatusGroups: Record<Exclude<FilterKey, "all">, OrderStatus[]> = {
  canceled: ["CANCELED"],
  completed: ["COMPLETED"],
  delivered: ["DELIVERED"],
  pending: ["PENDING"],
  preparing: ["PREPARING"],
  ready: ["READY", "OUT_FOR_DELIVERY"],
  rejected: ["REJECTED"],
};

const filterLabels: Record<FilterKey, string> = {
  all: "Todo",
  pending: "Pendente",
  preparing: "Em Preparo",
  ready: "Pronto",
  rejected: "Rejeitado",
  canceled: "Cancelado",
  delivered: "Entregue",
  completed: "Finalizado",
};

const statusLabels: Record<OrderStatus, string> = {
  CANCELED: "Cancelado",
  COMPLETED: "Finalizado",
  DELIVERED: "Entregue",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  PENDING: "Pendente",
  PREPARING: "Em Preparo",
  READY: "Pronto",
  REJECTED: "Rejeitado",
};

const statusBadgeClasses: Record<OrderStatus, string> = {
  CANCELED: "bg-surface-soft text-text-muted",
  COMPLETED: "bg-surface-soft text-text-muted",
  DELIVERED: "bg-surface-soft text-text-muted",
  OUT_FOR_DELIVERY: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-red-100 text-danger",
  PREPARING: "bg-accent-soft text-rating-text",
  READY: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-danger",
};

const borderColorByStatus: Record<OrderStatus, string> = {
  CANCELED: "border-l-text-muted",
  COMPLETED: "border-l-text-muted",
  DELIVERED: "border-l-text-muted",
  OUT_FOR_DELIVERY: "border-l-primary",
  PENDING: "border-l-danger",
  PREPARING: "border-l-primary-dark",
  READY: "border-l-primary",
  REJECTED: "border-l-danger",
};

const kanbanColumns: { statuses: OrderStatus[]; title: string }[] = [
  { statuses: ["PENDING"], title: "Novos" },
  { statuses: ["PREPARING"], title: "Em Preparo" },
  { statuses: ["READY", "OUT_FOR_DELIVERY"], title: "Prontos" },
];

const emptyColumnMessages: Record<string, string> = {
  Cancelado: "Nenhum pedido cancelado.",
  "Em Preparo": "Nenhum pedido em preparo.",
  Entregue: "Nenhum pedido entregue.",
  Finalizado: "Nenhum pedido finalizado.",
  Novos: "Nenhum pedido novo no momento.",
  Prontos: "Nenhum pedido aguardando despacho.",
  Rejeitado: "Nenhum pedido rejeitado.",
};

function getPrimaryAction(
  order: StoreOrder,
): { label: string; nextStatus: OrderStatus } | null {
  if (order.status === "PENDING") {
    return { label: "Aceitar", nextStatus: "PREPARING" };
  }

  if (order.status === "PREPARING") {
    return order.fulfillmentType === "DELIVERY"
      ? { label: "Saiu p/ entrega", nextStatus: "OUT_FOR_DELIVERY" }
      : { label: "Pronto", nextStatus: "READY" };
  }

  if (order.status === "READY" || order.status === "DELIVERED") {
    return { label: "Finalizar", nextStatus: "COMPLETED" };
  }

  if (order.status === "OUT_FOR_DELIVERY") {
    return { label: "Marcar entregue", nextStatus: "DELIVERED" };
  }

  return null;
}

function getSecondaryAction(
  order: StoreOrder,
): { label: string; nextStatus: OrderStatus } | null {
  if (order.status === "PENDING") {
    return { label: "Recusar", nextStatus: "REJECTED" };
  }

  if (order.status === "PREPARING" || order.status === "READY") {
    return { label: "Cancelar", nextStatus: "CANCELED" };
  }

  return null;
}

export function StoreOrdersPage({ onLogout }: StoreOrdersPageProps) {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [lastMovedOrderId, setLastMovedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      const data = await getStoreOrders();

      setOrders(data);
      setLoadError("");
    } catch {
      setLoadError("Não foi possível carregar os pedidos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isIgnored = false;

    getStoreOrders()
      .then((data) => {
        if (isIgnored) {
          return;
        }

        setOrders(data);
        setLoadError("");
      })
      .catch(() => {
        if (!isIgnored) {
          setLoadError("Não foi possível carregar os pedidos.");
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
  }, []);

  useStoreOrdersStream({
    onOrderCreated: (order) => {
      setOrders((current) =>
        current.some((existing) => existing.id === order.id)
          ? current
          : [order, ...current],
      );
    },
    onOrderStatusChanged: (orderId, status) => {
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );
    },
  });

  const visibleColumns =
    filter === "all"
      ? kanbanColumns
      : [{ statuses: filterStatusGroups[filter], title: filterLabels[filter] }];
  const filteredOrders = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    return orders.filter((order) => {
      const matchesFilter =
        filter === "all" || filterStatusGroups[filter].includes(order.status);
      const searchableText = normalizeSearchText(
        [
          order.number,
          order.client.name,
          order.client.phone,
          order.items.map((item) => item.product.name).join(" "),
        ].join(" "),
      );

      return matchesFilter && searchableText.includes(normalizedQuery);
    });
  }, [filter, orders, searchQuery]);
  const counts = useMemo(() => {
    const result: Record<FilterKey, number> = {
      all: orders.length,
      canceled: 0,
      completed: 0,
      delivered: 0,
      pending: 0,
      preparing: 0,
      ready: 0,
      rejected: 0,
    };

    for (const order of orders) {
      for (const key of Object.keys(filterStatusGroups) as Array<
        Exclude<FilterKey, "all">
      >) {
        if (filterStatusGroups[key].includes(order.status)) {
          result[key] += 1;
        }
      }
    }

    return result;
  }, [orders]);

  async function moveOrder(order: StoreOrder, nextStatus: OrderStatus) {
    if (nextStatus === "REJECTED" || nextStatus === "CANCELED") {
      const confirmed = window.confirm(
        nextStatus === "REJECTED"
          ? "Tem certeza que deseja recusar este pedido?"
          : "Tem certeza que deseja cancelar este pedido?",
      );

      if (!confirmed) {
        return;
      }
    }

    setLastMovedOrderId(order.id);

    try {
      await updateStoreOrderStatus(order.id, nextStatus);

      setOrders((current) =>
        current.map((current_) =>
          current_.id === order.id
            ? { ...current_, status: nextStatus }
            : current_,
        ),
      );
    } catch {
      await loadOrders();
    } finally {
      window.setTimeout(() => setLastMovedOrderId(null), 520);
    }
  }

  function handleLogout() {
    useStoreAuthStore.getState().clearAuth();
    onLogout();
  }

  return (
    <div className="min-h-screen bg-surface-checkout text-text-strong">
      <div className="grid min-h-screen xl:grid-cols-[16rem_minmax(0,1fr)]">
        <StoreSidebar onLogout={handleLogout} />

        <main className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-border-light bg-surface/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 lg:pb-0">
                {(Object.keys(filterLabels) as FilterKey[]).map((key) => (
                  <FilterButton
                    count={counts[key]}
                    isActive={filter === key}
                    key={key}
                    label={filterLabels[key]}
                    onClick={() => setFilter(key)}
                  />
                ))}
              </div>

              <label className="relative block w-full lg:max-w-90">
                <span className="sr-only">Buscar pedidos</span>
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                <input
                  className="h-10 w-full rounded-lg border border-border-input bg-white px-10 text-body-sm font-medium text-text-strong shadow-sm outline-none transition placeholder:text-placeholder focus:border-primary"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar por nome ou ID..."
                  type="search"
                  value={searchQuery}
                />
              </label>
            </div>
          </header>

          {isLoading ? (
            <div className="grid min-h-96 place-items-center px-4 py-6">
              <p className="text-body-sm font-semibold text-text-muted">
                Carregando pedidos...
              </p>
            </div>
          ) : loadError ? (
            <div className="grid min-h-96 place-items-center px-4 py-6 text-center">
              <div>
                <p className="text-body-sm font-semibold text-danger">
                  {loadError}
                </p>
                <button
                  className="mt-4 h-10 rounded-lg border border-border-input bg-white px-4 text-caption font-extrabold text-primary-dark transition hover:bg-surface-hover"
                  onClick={loadOrders}
                  type="button"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : (
            <section className="grid gap-5 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:px-8 xl:grid-cols-3 xl:py-8">
              {visibleColumns.map((column) => {
                const columnOrders = filteredOrders.filter((order) =>
                  column.statuses.includes(order.status),
                );

                return (
                  <OrderColumn
                    key={column.title}
                    lastMovedOrderId={lastMovedOrderId}
                    onMoveOrder={moveOrder}
                    orders={columnOrders}
                    title={column.title}
                  />
                );
              })}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterButton({
  count,
  isActive,
  label,
  onClick,
}: {
  count: number;
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-10 min-w-28 items-center justify-center gap-2 rounded-full border px-4 text-caption font-extrabold transition ${
        isActive
          ? "border-primary bg-primary text-white shadow-sm"
          : "border-border-input bg-white text-text-muted hover:bg-surface-hover"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
      <span
        className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-micro ${
          isActive ? "bg-white/20 text-white" : "bg-surface-soft text-text-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function OrderColumn({
  lastMovedOrderId,
  onMoveOrder,
  orders,
  title,
}: {
  lastMovedOrderId: string | null;
  onMoveOrder: (order: StoreOrder, nextStatus: OrderStatus) => void;
  orders: StoreOrder[];
  title: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-[1.125rem] font-extrabold leading-tight">
          {title}
          {title === "Novos" ? (
            <span className="h-2.5 w-2.5 rounded-full bg-danger" />
          ) : null}
        </h2>
        <span className="grid h-6 min-w-6 place-items-center rounded bg-surface-soft px-2 text-caption font-extrabold text-text-muted">
          {orders.length}
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <StoreOrderCard
            isMoving={order.id === lastMovedOrderId}
            key={order.id}
            onMoveOrder={onMoveOrder}
            order={order}
          />
        ))}
        {orders.length === 0 ? <EmptyColumn title={title} /> : null}
      </div>
    </section>
  );
}

function StoreOrderCard({
  isMoving,
  onMoveOrder,
  order,
}: {
  isMoving: boolean;
  onMoveOrder: (order: StoreOrder, nextStatus: OrderStatus) => void;
  order: StoreOrder;
}) {
  const primaryAction = getPrimaryAction(order);
  const secondaryAction = getSecondaryAction(order);

  return (
    <Dialog.Root>
      <article
        className={`store-order-card rounded-lg border border-border-light border-l-4 bg-white p-4 shadow-[0_12px_28px_rgba(94,54,30,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(94,54,30,0.12)] ${borderColorByStatus[order.status]} ${
          isMoving ? "store-order-card--moved" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <span
            className={`rounded px-2 py-1 text-micro font-extrabold uppercase ${statusBadgeClasses[order.status]}`}
          >
            {statusLabels[order.status]}
          </span>
          <span className="text-caption font-semibold text-text-muted">
            {formatOrderAge(order.createdAt)}
          </span>
        </div>

        <h3 className="mt-3 text-[1rem] font-extrabold leading-tight text-text-strong">
          #{order.number} - {order.client.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-caption font-medium leading-relaxed text-text-muted sm:text-body-sm">
          {getOrderSummary(order)}
        </p>
        <p className="mt-2 truncate text-caption font-semibold text-text-muted">
          {getAddressLine(order)}
        </p>

        <div className="my-3 h-px bg-border-muted" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <strong className="text-[1rem] font-extrabold text-text-strong">
            {formatCurrency(order.total)}
          </strong>
          <div className="flex flex-wrap gap-2">
            <Dialog.Trigger asChild>
              <button
                className="flex h-9 items-center gap-2 rounded-lg border border-border-input bg-white px-3 text-caption font-extrabold text-text-muted transition hover:bg-surface-checkout"
                type="button"
              >
                <EyeOpenIcon className="h-4 w-4" />
                Detalhes
              </button>
            </Dialog.Trigger>
            {secondaryAction ? (
              <button
                className="flex h-9 items-center gap-2 rounded-lg border border-danger/30 bg-white px-3 text-caption font-extrabold text-danger transition hover:bg-red-50"
                onClick={() => onMoveOrder(order, secondaryAction.nextStatus)}
                type="button"
              >
                {secondaryAction.label}
              </button>
            ) : null}
            {primaryAction ? (
              <button
                className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-caption font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-primary-hover"
                onClick={() => onMoveOrder(order, primaryAction.nextStatus)}
                type="button"
              >
                {primaryAction.label}
                <CheckIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </article>
      <OrderDetailsDialog order={order} onMoveOrder={onMoveOrder} />
    </Dialog.Root>
  );
}

function OrderDetailsDialog({
  onMoveOrder,
  order,
}: {
  onMoveOrder: (order: StoreOrder, nextStatus: OrderStatus) => void;
  order: StoreOrder;
}) {
  const primaryAction = getPrimaryAction(order);
  const secondaryAction = getSecondaryAction(order);

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(92dvh,760px)] w-[min(94vw,680px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-white shadow-2xl focus:outline-none">
        <header className="flex items-start justify-between gap-4 border-b border-border-light px-5 py-4 sm:px-6">
          <div>
            <span
              className={`rounded px-2 py-1 text-micro font-extrabold uppercase ${statusBadgeClasses[order.status]}`}
            >
              {statusLabels[order.status]}
            </span>
            <Dialog.Title className="mt-3 text-[1.25rem] font-extrabold leading-tight text-text-strong">
              Pedido #{order.number}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-body-sm font-medium text-text-muted">
              {formatOrderAge(order.createdAt)} -{" "}
              {formatFulfillment(order.fulfillmentType)}
            </Dialog.Description>
          </div>

          <Dialog.Close asChild>
            <button
              aria-label="Fechar detalhes do pedido"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
              type="button"
            >
              <Cross2Icon className="h-5 w-5" />
            </button>
          </Dialog.Close>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="grid gap-3 sm:grid-cols-2">
            <DetailBlock
              icon={<PersonIcon className="h-4 w-4" />}
              label="Cliente"
              value={order.client.name}
            />
            <DetailBlock
              icon={<IdCardIcon className="h-4 w-4" />}
              label="Telefone"
              value={order.client.phone}
            />
            <DetailBlock
              icon={<DrawingPinFilledIcon className="h-4 w-4" />}
              label="Endereço"
              value={getAddressLine(order)}
            />
            <DetailBlock
              icon={<BackpackIcon className="h-4 w-4" />}
              label="Pagamento"
              value={formatPayment(order)}
            />
          </section>

          {order.observation ? (
            <div className="mt-3 rounded-lg border border-border-light bg-surface px-4 py-3">
              <p className="text-caption font-extrabold uppercase text-primary-dark">
                Observação do pedido
              </p>
              <p className="mt-2 text-body-sm font-semibold leading-relaxed text-text-strong">
                {order.observation}
              </p>
            </div>
          ) : null}

          <div className="my-5 h-px bg-border-muted" />

          <section>
            <h3 className="text-[1rem] font-extrabold text-text-strong">
              Itens do pedido
            </h3>
            <div className="mt-3 space-y-3">
              {order.items.map((item) => (
                <article
                  className="rounded-lg border border-border-light bg-surface p-4"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-body-sm font-extrabold text-text-strong">
                        {item.quantity}x {item.product.name}
                      </p>
                      {item.observation ? (
                        <p className="mt-2 text-caption font-medium leading-relaxed text-text-muted">
                          Obs: {item.observation}
                        </p>
                      ) : null}
                    </div>
                    <strong className="shrink-0 text-body-sm font-extrabold text-accent">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="my-5 h-px bg-border-muted" />

          <section className="space-y-2">
            <div className="flex justify-between text-body-sm font-semibold text-text-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 ? (
              <div className="flex justify-between text-body-sm font-semibold text-text-muted">
                <span>Taxa de entrega</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
            ) : null}
            {order.discount > 0 ? (
              <div className="flex justify-between text-body-sm font-semibold text-text-muted">
                <span>Desconto</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            ) : null}
          </section>
        </div>

        <footer className="border-t border-border-light bg-surface px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-body-sm font-bold text-text-muted">Total</span>
            <strong className="text-[1.125rem] font-extrabold text-primary">
              {formatCurrency(order.total)}
            </strong>
          </div>
          {primaryAction || secondaryAction ? (
            <div className="mt-4 flex gap-2">
              {secondaryAction ? (
                <Dialog.Close asChild>
                  <button
                    className="h-11 flex-1 rounded-lg border border-danger/30 bg-white text-button font-extrabold text-danger transition hover:bg-red-50"
                    onClick={() => onMoveOrder(order, secondaryAction.nextStatus)}
                    type="button"
                  >
                    {secondaryAction.label}
                  </button>
                </Dialog.Close>
              ) : null}
              {primaryAction ? (
                <Dialog.Close asChild>
                  <button
                    className="h-11 flex-1 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover"
                    onClick={() => onMoveOrder(order, primaryAction.nextStatus)}
                    type="button"
                  >
                    {primaryAction.label}
                  </button>
                </Dialog.Close>
              ) : null}
            </div>
          ) : null}
        </footer>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

function DetailBlock({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border-light bg-surface px-4 py-3">
      <p className="flex items-center gap-2 text-caption font-extrabold uppercase text-primary-dark">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-body-sm font-semibold leading-relaxed text-text-strong">
        {value || "Não informado"}
      </p>
    </div>
  );
}

function EmptyColumn({ title }: { title: string }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-border-muted bg-surface px-6 text-center">
      <div>
        <BackpackIcon className="mx-auto h-8 w-8 text-border-input" />
        <p className="mt-4 text-body-sm font-semibold leading-relaxed text-text-muted">
          {emptyColumnMessages[title] ?? "Nenhum pedido aqui."}
        </p>
      </div>
    </div>
  );
}

function getAddressLine(order: StoreOrder) {
  if (order.fulfillmentType === "PICKUP" || !order.address) {
    return "Retirada no balcão";
  }

  const { city, complement, neighborhood, number, state, street } =
    order.address;

  return [
    `${street}, ${number}`,
    complement,
    neighborhood,
    [city, state].filter(Boolean).join(" - "),
  ]
    .filter(Boolean)
    .join(" - ");
}

function getOrderSummary(order: StoreOrder) {
  return order.items
    .map(
      (item) =>
        `${item.quantity}x ${item.product.name} - ${formatCurrency(item.unitPrice * item.quantity)}`,
    )
    .join(", ");
}

function formatOrderAge(createdAt: string) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return "Agora";
  }

  if (diffMinutes < 60) {
    return `Há ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  return `Há ${diffHours} h`;
}

function formatFulfillment(fulfillmentType: FulfillmentType) {
  return fulfillmentType === "DELIVERY" ? "Entrega" : "Retirada";
}

const paymentLabels: Record<PaymentMethod, string> = {
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  MEAL_VOUCHER: "Vale-refeição",
  PIX: "Pix",
};

function formatPayment(order: StoreOrder) {
  if (order.paymentMethod === "CASH" && order.changeFor) {
    return `${paymentLabels.CASH} - troco para ${formatCurrency(order.changeFor)}`;
  }

  return paymentLabels[order.paymentMethod];
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
