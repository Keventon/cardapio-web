import { ArrowRightIcon, LockClosedIcon } from "@radix-ui/react-icons";
import * as Separator from "@radix-ui/react-separator";
import type { OrderItem } from "../../types/menu";
import { formatCurrency, getOrderItemTotalCents } from "../../utils/currency";

type OrderCheckoutSummaryProps = {
  items: OrderItem[];
  totalCents: number;
};

export function OrderCheckoutSummary({
  items,
  totalCents,
}: OrderCheckoutSummaryProps) {
  const hasItems = items.length > 0;

  return (
    <aside className="h-fit rounded-lg bg-white p-5 shadow-[0_18px_42px_rgba(94,54,30,0.12)] lg:sticky lg:top-24 sm:p-6">
      <h2 className="text-card-title font-extrabold text-text-strong">
        Resumo do Pedido
      </h2>
      <Separator.Root className="my-5 h-px bg-border-muted" />

      <div className="space-y-4">
        {items.map((item) => (
          <div
            className="flex items-start justify-between gap-4"
            key={item.id}
          >
            <div className="flex min-w-0 gap-3">
              <span className="grid h-6 min-w-6 place-items-center rounded bg-surface-soft px-1 text-caption font-extrabold text-primary-dark">
                {item.quantity}x
              </span>
              <div className="min-w-0">
                <p className="truncate text-body-sm font-extrabold text-text-strong">
                  {item.name}
                </p>
                <p className="mt-1 text-caption font-medium text-text-muted">
                  Item selecionado
                </p>
              </div>
            </div>
            <strong className="shrink-0 text-body-sm font-extrabold text-text-strong">
              {formatCurrency(getOrderItemTotalCents(item))}
            </strong>
          </div>
        ))}
      </div>

      <Separator.Root className="my-5 h-px bg-border-muted" />

      <div className="space-y-3 text-body-sm font-medium text-text-muted">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="text-text-strong">{formatCurrency(totalCents)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Taxa de Entrega</span>
          <span className="font-bold text-primary">Grátis</span>
        </div>
      </div>

      <Separator.Root className="my-5 h-px bg-border-muted" />

      <div className="flex items-center justify-between">
        <span className="text-card-title font-extrabold text-text-strong">Total</span>
        <strong className="text-card-title font-extrabold text-primary">
          {formatCurrency(totalCents)}
        </strong>
      </div>

      <button
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border-input"
        disabled={!hasItems}
        type="submit"
      >
        Confirmar Pedido
        <ArrowRightIcon className="h-4 w-4" />
      </button>

      <p className="mt-5 flex items-center justify-center gap-1 text-caption font-medium text-text-muted">
        <LockClosedIcon className="h-3.5 w-3.5" />
        Site seguro
      </p>
    </aside>
  );
}
