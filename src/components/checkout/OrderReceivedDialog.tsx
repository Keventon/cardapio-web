import { CheckCircledIcon, Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import type { ApiOrder } from "../../types/api";

type OrderReceivedDialogProps = {
  onClose: () => void;
  open: boolean;
  order: ApiOrder | null;
  phone: string;
};

export function OrderReceivedDialog({
  onClose,
  open,
  order,
  phone,
}: OrderReceivedDialogProps) {
  return (
    <Dialog.Root
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface-soft text-primary">
              <CheckCircledIcon className="h-7 w-7" />
            </div>

            <Dialog.Close asChild>
              <button
                aria-label="Fechar aviso do pedido"
                className="grid h-9 w-9 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Title className="mt-5 text-section-title font-extrabold leading-tight text-text-strong">
            Pedido recebido pela loja
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-body-sm font-medium leading-relaxed text-text-muted">
            Seu pedido
            {order ? (
              <strong className="text-accent"> #{order.number}</strong>
            ) : null}{" "}
            foi enviado para a loja. Vamos avisar pelo WhatsApp
            {phone ? (
              <>
                {" "}
                <strong className="text-text-strong">{phone}</strong>
              </>
            ) : null}{" "}
            quando a loja atualizar os status.
          </Dialog.Description>

          <div className="mt-5 rounded-lg border border-border-light bg-surface-checkout px-4 py-3">
            <p className="text-caption font-extrabold uppercase tracking-normal text-primary-dark">
              Mensagem da loja
            </p>
            <p className="mt-2 text-body-sm font-medium leading-relaxed text-text-muted">
              Recebemos seu pedido e ele já está na fila de preparo. Em breve
              você receberá as próximas atualizações por WhatsApp.
            </p>
          </div>

          <button
            className="mt-6 h-11 w-full rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover"
            onClick={onClose}
            type="button"
          >
            Entendi
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
