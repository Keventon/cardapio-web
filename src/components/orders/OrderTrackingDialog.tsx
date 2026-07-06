import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useOrderStatusStream } from "../../hooks/useOrderStatusStream";
import type { ApiOrder, ApiOrderStatus } from "../../types/api";

type OrderTrackingDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  order: ApiOrder;
  token: string;
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

export function OrderTrackingDialog({
  onOpenChange,
  open,
  order,
  token,
}: OrderTrackingDialogProps) {
  const [status, setStatus] = useState(order.status);

  useOrderStatusStream({
    onStatusChanged: setStatus,
    orderId: open ? order.id : null,
    token,
  });

  const steps = order.fulfillmentType === "DELIVERY" ? deliverySteps : pickupSteps;
  const isCanceled = status === "CANCELED" || status === "REJECTED";
  const currentIndex = steps.indexOf(status);

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-60 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-70 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-5">
            <div>
              <Dialog.Title className="text-section-title font-extrabold leading-tight text-text-strong">
                Pedido #{order.number}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-body-sm font-medium text-text-muted">
                Acompanhamento em tempo real
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Fechar acompanhamento"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {isCanceled ? (
            <p className="mt-6 rounded-lg bg-red-100 px-4 py-3 text-body-sm font-bold text-danger">
              Este pedido foi {stepLabels[status].toLowerCase()} pela loja.
            </p>
          ) : currentIndex === -1 ? (
            <p className="mt-6 rounded-lg bg-surface-soft px-4 py-3 text-body-sm font-bold text-text-strong">
              Status atual: {stepLabels[status]}
            </p>
          ) : (
            <ol className="mt-6 space-y-5">
              {steps.map((step, index) => {
                const isLastStep = index === steps.length - 1;
                const isDone = index < currentIndex || (index === currentIndex && isLastStep);
                const isCurrent = index === currentIndex && !isLastStep;

                return (
                  <li className="flex items-center gap-3" key={step}>
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-micro font-extrabold ${
                        isDone
                          ? "bg-primary text-white"
                          : isCurrent
                            ? "bg-white text-primary-dark ring-2 ring-primary"
                            : "bg-surface-soft text-text-muted"
                      }`}
                    >
                      {isDone ? "✓" : index + 1}
                    </span>
                    <span
                      className={`text-body-sm font-bold ${
                        isDone || isCurrent ? "text-text-strong" : "text-text-muted"
                      }`}
                    >
                      {stepLabels[step]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
