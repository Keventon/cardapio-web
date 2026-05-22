import {
  ArrowRightIcon,
  BackpackIcon,
  Cross2Icon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import * as Separator from "@radix-ui/react-separator";
import type { ReactNode } from "react";
import type { OrderItem } from "../../types/menu";

type CartDrawerProps = {
  children: ReactNode;
  items: OrderItem[];
  onCheckout: () => void;
  total: string;
};

export function CartDrawer({
  children,
  items,
  onCheckout,
  total,
}: CartDrawerProps) {
  return (
    <Dialog.Root>
      {children}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-107.5 flex-col bg-surface shadow-[-20px_0_45px_rgba(44,29,22,0.25)] focus:outline-none">
          <header className="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-card-title font-extrabold text-text-main">
                <BackpackIcon className="h-5 w-5 text-primary-dark" />
                Seu Pedido
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-body-sm font-medium text-text-muted">
                Revise seus itens antes de finalizar.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                aria-label="Fechar pedido"
                className="grid h-10 w-10 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem item={item} key={item.name} />
              ))}
            </div>
          </div>

          <footer className="border-t border-border bg-white px-6 py-5">
            <div className="space-y-3 text-body-sm font-semibold text-text-muted">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="text-text-main">{total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Taxa de entrega</span>
                <span className="text-text-main">$0.00</span>
              </div>
            </div>

            <Separator.Root className="my-4 h-px bg-border-muted" />

            <div className="flex items-center justify-between">
              <span className="font-bold text-text-main">Total do pedido</span>
              <strong className="text-total font-extrabold text-accent">
                {total}
              </strong>
            </div>

            <Dialog.Close asChild>
              <button
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover"
                onClick={onCheckout}
              >
                Finalizar Pedido
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CartItem({ item }: { item: OrderItem }) {
  return (
    <article className="rounded-lg border border-border-muted bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-body-sm font-extrabold text-text-main">
            {item.name}
          </h3>
          <p className="mt-1 text-caption font-medium text-text-muted">
            Quantidade: {item.quantity}
          </p>
        </div>
        <strong className="shrink-0 text-body-sm font-extrabold text-accent">
          {item.price}
        </strong>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center rounded-full border border-border bg-surface">
          <button
            aria-label={`Diminuir quantidade de ${item.name}`}
            className="grid h-8 w-8 place-items-center text-primary-dark transition hover:bg-surface-hover"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="min-w-8 text-center text-caption font-extrabold text-text-main">
            {item.quantity}
          </span>
          <button
            aria-label={`Aumentar quantidade de ${item.name}`}
            className="grid h-8 w-8 place-items-center text-primary-dark transition hover:bg-surface-hover"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        <button
          aria-label={`Remover ${item.name}`}
          className="grid h-8 w-8 place-items-center rounded-full text-danger transition hover:bg-surface-hover"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
