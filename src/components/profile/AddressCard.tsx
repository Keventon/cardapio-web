import {
  CheckIcon,
  DrawingPinFilledIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import type { Address } from "../../types/profile";

type AddressCardProps = {
  address: Address;
  onEdit: (address: Address) => void;
  onRemove: (id: number) => void;
  onSetDefault: (id: number) => void;
};

export function AddressCard({
  address,
  onEdit,
  onRemove,
  onSetDefault,
}: AddressCardProps) {
  return (
    <article className="rounded-lg border border-border-muted bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-body-sm font-extrabold text-text-main">{address.label}</h3>
            {address.isDefault ? (
              <span className="rounded-full bg-surface-soft px-2 py-1 text-micro font-extrabold text-primary-dark">
                Padrão
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-body-sm font-medium leading-relaxed text-text-muted">
            {address.postalCode ? `${address.postalCode}` : "CEP não informado"}
            <br />
            {address.street}, {address.number}
            {address.complement ? ` - ${address.complement}` : ""}
            <br />
            {address.district}
            {address.city || address.state ? (
              <>
                <br />
                {[address.city, address.state].filter(Boolean).join(" - ")}
              </>
            ) : null}
          </p>
        </div>

        <DrawingPinFilledIcon className="mt-1 h-5 w-5 shrink-0 text-primary-dark" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="flex h-9 items-center gap-2 rounded-full border border-border-input px-3 text-caption font-extrabold text-text-muted transition hover:bg-surface-checkout"
          onClick={() => onEdit(address)}
          type="button"
        >
          <Pencil1Icon className="h-3.5 w-3.5" />
          Editar
        </button>
        {!address.isDefault ? (
          <button
            className="flex h-9 items-center gap-2 rounded-full border border-border-input px-3 text-caption font-extrabold text-primary-dark transition hover:bg-surface-hover"
            onClick={() => onSetDefault(address.id)}
            type="button"
          >
            <CheckIcon className="h-3.5 w-3.5" />
            Usar como padrão
          </button>
        ) : null}
        <button
          className="flex h-9 items-center gap-2 rounded-full border border-border-input px-3 text-caption font-extrabold text-danger transition hover:bg-surface-checkout"
          onClick={() => onRemove(address.id)}
          type="button"
        >
          <TrashIcon className="h-3.5 w-3.5" />
          Remover
        </button>
      </div>
    </article>
  );
}
