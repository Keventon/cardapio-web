import { BackpackIcon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";

type FloatingCartButtonProps = {
  count: number;
  visible: boolean;
};

export function FloatingCartButton({ count, visible }: FloatingCartButtonProps) {
  return (
    <Dialog.Trigger asChild>
      <button
        aria-label="Abrir pedido"
        className={`fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_14px_34px_rgba(94,54,30,0.28)] transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-primary-hover hover:shadow-[0_18px_40px_rgba(94,54,30,0.34)] sm:bottom-8 sm:right-8 ${
          visible
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        }`}
      >
        <BackpackIcon className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-primary-dark px-1 text-caption font-extrabold text-white ring-2 ring-surface">
          {count}
        </span>
      </button>
    </Dialog.Trigger>
  );
}
