import {
  BackpackIcon,
  CheckIcon,
  Cross2Icon,
  DrawingPinFilledIcon,
  EyeOpenIcon,
  IdCardIcon,
  MagnifyingGlassIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { StoreOrder, StoreOrderStatus } from "../../types/storeOrder";
import { formatCurrency, getOrderItemTotalCents } from "../../utils/currency";
import {
  readStoreOrders,
  storeOrdersStorageKey,
  updateStoreOrderStatus,
} from "../../utils/orderStorage";
import { clearStoreSession } from "../../utils/storeAuth";

type StoreOrdersPageProps = {
  onBackToMenu: () => void;
  onLogout: () => void;
};

type Filter = StoreOrderStatus | "all";

const statusLabels: Record<StoreOrderStatus, string> = {
  finished: "Finalizado",
  pending: "Pendente",
  preparing: "Em Preparo",
  ready: "Pronto",
};

const statusBadgeClasses: Record<StoreOrderStatus, string> = {
  finished: "bg-surface-soft text-text-muted",
  pending: "bg-red-100 text-danger",
  preparing: "bg-accent-soft text-rating-text",
  ready: "bg-emerald-100 text-emerald-700",
};

const columns: { status: StoreOrderStatus; title: string }[] = [
  { status: "pending", title: "Novos" },
  { status: "preparing", title: "Em Preparo" },
  { status: "ready", title: "Prontos" },
];

export function StoreOrdersPage({
  onBackToMenu,
  onLogout,
}: StoreOrdersPageProps) {
  const [orders, setOrders] = useState(readStoreOrders);
  const [filter, setFilter] = useState<Filter>("all");
  const [lastMovedOrderId, setLastMovedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const visibleColumns =
    filter === "finished" ? [{ status: "finished" as const, title: "Finalizados" }] : columns;
  const filteredOrders = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    return orders.filter((order) => {
      const matchesFilter = filter === "all" || order.status === filter;
      const searchableText = normalizeSearchText(
        [
          order.number,
          order.customerName,
          order.customerPhone,
          order.items.map((item) => item.name).join(" "),
        ].join(" "),
      );

      return matchesFilter && searchableText.includes(normalizedQuery);
    });
  }, [filter, orders, searchQuery]);
  const counts = useMemo(
    () => ({
      all: orders.length,
      finished: orders.filter((order) => order.status === "finished").length,
      pending: orders.filter((order) => order.status === "pending").length,
      preparing: orders.filter((order) => order.status === "preparing").length,
      ready: orders.filter((order) => order.status === "ready").length,
    }),
    [orders],
  );

  useEffect(() => {
    function syncOrders(event: StorageEvent) {
      if (event.key === storeOrdersStorageKey) {
        setOrders(readStoreOrders());
      }
    }

    window.addEventListener("storage", syncOrders);

    return () => window.removeEventListener("storage", syncOrders);
  }, []);

  function moveOrder(order: StoreOrder) {
    const nextStatusByCurrent: Partial<Record<StoreOrderStatus, StoreOrderStatus>> = {
      pending: "preparing",
      preparing: "ready",
      ready: "finished",
    };
    const nextStatus = nextStatusByCurrent[order.status];

    if (!nextStatus) {
      return;
    }

    setLastMovedOrderId(order.id);
    setOrders(updateStoreOrderStatus(order.id, nextStatus));
    window.setTimeout(() => setLastMovedOrderId(null), 520);
  }

  function handleLogout() {
    clearStoreSession();
    onLogout();
  }

  return (
    <div className="min-h-screen bg-surface-checkout text-text-strong">
      <div className="grid min-h-screen xl:grid-cols-[16rem_minmax(0,1fr)]">
        <StoreSidebar onBackToMenu={onBackToMenu} onLogout={handleLogout} />

        <main className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-border-light bg-surface/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 lg:pb-0">
                <FilterButton
                  count={counts.all}
                  isActive={filter === "all"}
                  label="Todo"
                  onClick={() => setFilter("all")}
                />
                <FilterButton
                  count={counts.pending}
                  isActive={filter === "pending"}
                  label="Pendente"
                  onClick={() => setFilter("pending")}
                />
                <FilterButton
                  count={counts.preparing}
                  isActive={filter === "preparing"}
                  label="Em Preparo"
                  onClick={() => setFilter("preparing")}
                />
                <FilterButton
                  count={counts.finished}
                  isActive={filter === "finished"}
                  label="Finalizado"
                  onClick={() => setFilter("finished")}
                />
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

          <section className="grid gap-5 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:px-8 xl:grid-cols-3 xl:py-8">
            {visibleColumns.map((column) => {
              const columnOrders = filteredOrders.filter(
                (order) => order.status === column.status,
              );

              return (
                <OrderColumn
                  key={column.status}
                  lastMovedOrderId={lastMovedOrderId}
                  onMoveOrder={moveOrder}
                  orders={columnOrders}
                  status={column.status}
                  title={column.title}
                />
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
}

function StoreSidebar({
  onBackToMenu,
  onLogout,
}: {
  onBackToMenu: () => void;
  onLogout: () => void;
}) {
  return (
    <aside className="border-b border-border-light bg-white xl:flex xl:min-h-screen xl:flex-col xl:border-b-0 xl:border-r">
      <div className="flex h-16 items-center gap-3 border-b border-border-light px-4 sm:px-6 xl:h-20">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-[1rem] font-extrabold text-white">
          F
        </span>
        <div className="min-w-0">
          <p className="truncate text-[1rem] font-extrabold text-text-strong">
            Fast Burguer
          </p>
          <p className="text-caption font-bold text-primary">Área da loja</p>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6 xl:block xl:space-y-2 xl:overflow-visible">
        <SidebarItem icon={<RocketIcon className="h-5 w-5" />} label="Dashboard" />
        <SidebarItem active icon={<BackpackIcon className="h-5 w-5" />} label="Pedidos" />
        <button
          className="flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-body-sm font-extrabold text-text-muted transition hover:bg-surface-checkout xl:w-full"
          onClick={onBackToMenu}
          type="button"
        >
          <IdCardIcon className="h-5 w-5" />
          Cardápio
        </button>
        <SidebarItem icon={<PersonIcon className="h-5 w-5" />} label="Relatórios" />
      </nav>

      <div className="hidden border-t border-border-light p-4 xl:mt-auto xl:block">
        <button
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-body-sm font-extrabold text-text-muted transition hover:bg-surface-checkout"
          onClick={onLogout}
          type="button"
        >
          <Cross2Icon className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({
  active = false,
  icon,
  label,
}: {
  active?: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <span
      className={`flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-body-sm font-extrabold xl:w-full ${
        active
          ? "bg-primary text-white"
          : "text-text-muted hover:bg-surface-checkout"
      }`}
    >
      {icon}
      {label}
    </span>
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
  status,
  title,
}: {
  lastMovedOrderId: string | null;
  onMoveOrder: (order: StoreOrder) => void;
  orders: StoreOrder[];
  status: StoreOrderStatus;
  title: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-[1.125rem] font-extrabold leading-tight">
          {title}
          {status === "pending" ? (
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
        {orders.length === 0 ? <EmptyColumn status={status} /> : null}
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
  onMoveOrder: (order: StoreOrder) => void;
  order: StoreOrder;
}) {
  const actionLabelByStatus: Partial<Record<StoreOrderStatus, string>> = {
    pending: "Aceitar",
    preparing: "Pronto",
    ready: "Finalizar",
  };
  const borderColorByStatus: Record<StoreOrderStatus, string> = {
    finished: "border-l-text-muted",
    pending: "border-l-danger",
    preparing: "border-l-primary-dark",
    ready: "border-l-primary",
  };
  const actionLabel = actionLabelByStatus[order.status];

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
          #{order.number} - {order.customerName}
        </h3>
        <p className="mt-2 line-clamp-2 text-caption font-medium leading-relaxed text-text-muted sm:text-body-sm">
          {getOrderSummary(order)}
        </p>
        <p className="mt-2 truncate text-caption font-semibold text-text-muted">
          {order.addressLine}
        </p>

        <div className="my-3 h-px bg-border-muted" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <strong className="text-[1rem] font-extrabold text-text-strong">
            {formatCurrency(order.totalCents)}
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
            {actionLabel ? (
              <button
                className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-caption font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-primary-hover"
                onClick={() => onMoveOrder(order)}
                type="button"
              >
                {actionLabel}
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
  onMoveOrder: (order: StoreOrder) => void;
  order: StoreOrder;
}) {
  const actionLabelByStatus: Partial<Record<StoreOrderStatus, string>> = {
    pending: "Aceitar pedido",
    preparing: "Marcar como pronto",
    ready: "Finalizar pedido",
  };
  const actionLabel = actionLabelByStatus[order.status];

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
              {formatOrderAge(order.createdAt)} - {formatFulfillment(order.fulfillment)}
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
              value={order.customerName}
            />
            <DetailBlock
              icon={<IdCardIcon className="h-4 w-4" />}
              label="Telefone"
              value={order.customerPhone}
            />
            <DetailBlock
              icon={<DrawingPinFilledIcon className="h-4 w-4" />}
              label="Endereço"
              value={order.addressLine}
            />
            <DetailBlock
              icon={<BackpackIcon className="h-4 w-4" />}
              label="Pagamento"
              value={formatPayment(order)}
            />
          </section>

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
                        {item.quantity}x {item.name}
                      </p>
                      {item.extras.length > 0 ? (
                        <p className="mt-2 text-caption font-medium leading-relaxed text-text-muted">
                          Adicionais:{" "}
                          {item.extras
                            .map(
                              (extra) =>
                                `${extra.name} (+${formatCurrency(extra.priceCents)})`,
                            )
                            .join(", ")}
                        </p>
                      ) : null}
                      {item.instructions ? (
                        <p className="mt-2 text-caption font-medium leading-relaxed text-text-muted">
                          Obs: {item.instructions}
                        </p>
                      ) : null}
                    </div>
                    <strong className="shrink-0 text-body-sm font-extrabold text-accent">
                      {formatCurrency(getOrderItemTotalCents(item))}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer className="border-t border-border-light bg-surface px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-body-sm font-bold text-text-muted">Total</span>
            <strong className="text-[1.125rem] font-extrabold text-primary">
              {formatCurrency(order.totalCents)}
            </strong>
          </div>
          {actionLabel ? (
            <Dialog.Close asChild>
              <button
                className="mt-4 h-11 w-full rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover"
                onClick={() => onMoveOrder(order)}
                type="button"
              >
                {actionLabel}
              </button>
            </Dialog.Close>
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

function EmptyColumn({ status }: { status: StoreOrderStatus }) {
  const messageByStatus: Record<StoreOrderStatus, string> = {
    finished: "Nenhum pedido finalizado.",
    pending: "Nenhum pedido novo no momento.",
    preparing: "Nenhum pedido em preparo.",
    ready: "Nenhum pedido aguardando despacho.",
  };

  return (
    <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-border-muted bg-surface px-6 text-center">
      <div>
        <BackpackIcon className="mx-auto h-8 w-8 text-border-input" />
        <p className="mt-4 text-body-sm font-semibold leading-relaxed text-text-muted">
          {messageByStatus[status]}
        </p>
      </div>
    </div>
  );
}

function getOrderSummary(order: StoreOrder) {
  return order.items
    .map((item) => {
      const extras = item.extras.map((extra) => extra.name).join(", ");
      const totalCents = getOrderItemTotalCents(item);

      return `${item.quantity}x ${item.name}${extras ? ` (${extras})` : ""} - ${formatCurrency(totalCents)}`;
    })
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

function formatFulfillment(fulfillment: StoreOrder["fulfillment"]) {
  return fulfillment === "delivery" ? "Entrega" : "Retirada";
}

function formatPayment(order: StoreOrder) {
  const paymentLabels: Record<StoreOrder["payment"], string> = {
    card: "Cartão",
    cash: "Dinheiro",
    pix: "Pix",
  };

  if (order.payment === "cash" && order.cashChangeFor) {
    return `${paymentLabels[order.payment]} - troco para ${order.cashChangeFor}`;
  }

  return paymentLabels[order.payment];
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
