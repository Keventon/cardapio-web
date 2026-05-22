import { CheckCircledIcon, Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { formatCurrency } from "../../utils/currency";

type ConfirmOrderDialogProps = {
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  totalCents: number;
};

export function ConfirmOrderDialog({
  onConfirm,
  onOpenChange,
  open,
  totalCents,
}: ConfirmOrderDialogProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,430px)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-soft text-primary">
              <CheckCircledIcon className="h-6 w-6" />
            </div>

            <Dialog.Close asChild>
              <button
                aria-label="Fechar confirmação"
                className="grid h-9 w-9 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Title className="mt-5 text-section-title font-extrabold leading-tight text-text-strong">
            Confirmar pedido?
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-body-sm font-medium leading-relaxed text-text-muted">
            Revise os dados antes de continuar. Ao confirmar, o pedido no valor
            de <strong className="text-accent">{formatCurrency(totalCents)}</strong> será enviado
            para preparo.
          </Dialog.Description>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Dialog.Close asChild>
              <button className="h-11 rounded-lg border border-border-input bg-white text-button font-extrabold text-text-muted transition hover:bg-surface-checkout">
                Voltar e revisar
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                className="h-11 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover"
                onClick={onConfirm}
                type="button"
              >
                Sim, confirmar
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
