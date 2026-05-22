import { CheckIcon } from "@radix-ui/react-icons";
import * as RadioGroup from "@radix-ui/react-radio-group";
import type { Address } from "../../types/profile";

type DeliveryOptionProps = {
  label: string;
  time: string;
  value: string;
};

type PaymentOptionProps = {
  label: string;
  value: string;
};

type AddressOptionProps = {
  address: Address;
  value: string;
};

export function DeliveryOption({ label, time, value }: DeliveryOptionProps) {
  return (
    <RadioGroup.Item
      className="group relative rounded-lg border border-border-input bg-surface p-4 text-left outline-none transition data-[state=checked]:border-primary data-[state=checked]:bg-surface-selected"
      value={value}
    >
      <span className="block text-body-sm font-extrabold text-text-strong">
        {label}
      </span>
      <span className="mt-2 block text-body-sm font-medium text-text-muted">
        {time}
      </span>
      <RadioCheck />
    </RadioGroup.Item>
  );
}

export function PaymentOption({ label, value }: PaymentOptionProps) {
  return (
    <RadioGroup.Item
      className="rounded-lg border border-border-input bg-surface px-4 py-3 text-center text-button font-extrabold text-text-muted outline-none transition data-[state=checked]:border-primary data-[state=checked]:bg-surface-selected data-[state=checked]:text-primary-dark"
      value={value}
    >
      {label}
    </RadioGroup.Item>
  );
}

export function AddressOption({ address, value }: AddressOptionProps) {
  return (
    <RadioGroup.Item
      className="group relative rounded-lg border border-border-input bg-surface p-4 pr-12 text-left outline-none transition data-[state=checked]:border-primary data-[state=checked]:bg-surface-selected"
      value={value}
    >
      <span className="flex flex-wrap items-center gap-2 text-body-sm font-extrabold text-text-strong">
        {address.label}
        {address.isDefault ? (
          <span className="rounded-full bg-surface-soft px-2 py-1 text-micro font-extrabold text-primary-dark">
            Padrão
          </span>
        ) : null}
      </span>
      <span className="mt-2 block text-caption font-medium leading-relaxed text-text-muted">
        {address.postalCode}
        <br />
        {address.street}, {address.number}
        {address.complement ? ` - ${address.complement}` : ""}
        <br />
        {[address.district, address.city, address.state].filter(Boolean).join(" - ")}
      </span>
      <RadioCheck />
    </RadioGroup.Item>
  );
}

export function NewAddressOption() {
  return (
    <RadioGroup.Item
      className="group relative rounded-lg border border-border-input bg-surface p-4 text-left outline-none transition data-[state=checked]:border-primary data-[state=checked]:bg-surface-selected"
      value="new"
    >
      <span className="block text-body-sm font-extrabold text-text-strong">
        Cadastrar novo endereço
      </span>
      <span className="mt-2 block text-caption font-medium text-text-muted">
        Use outro local para esta entrega.
      </span>
      <RadioCheck />
    </RadioGroup.Item>
  );
}

function RadioCheck() {
  return (
    <span className="absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border border-border-input text-white group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary">
      <CheckIcon className="h-3.5 w-3.5" />
    </span>
  );
}
