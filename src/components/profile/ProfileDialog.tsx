import {
  CheckIcon,
  Cross2Icon,
  DrawingPinFilledIcon,
  Pencil1Icon,
  PersonIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import * as Separator from "@radix-ui/react-separator";
import { useState } from "react";

type Address = {
  id: number;
  label: string;
  street: string;
  number: string;
  district: string;
  complement: string;
  isDefault: boolean;
};

const initialAddresses: Address[] = [
  {
    id: 1,
    label: "Casa",
    street: "Rua das Flores",
    number: "123",
    district: "Centro",
    complement: "Apto 42",
    isDefault: true,
  },
];

export function ProfileDialog() {
  const [name, setName] = useState("João Silva");
  const [phone, setPhone] = useState("(11) 99999-9999");
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [draft, setDraft] = useState({
    complement: "",
    district: "",
    label: "",
    number: "",
    street: "",
  });

  function addAddress() {
    if (!draft.label.trim() || !draft.street.trim()) {
      return;
    }

    setAddresses((currentAddresses) => [
      ...currentAddresses,
      {
        ...draft,
        id: Date.now(),
        isDefault: currentAddresses.length === 0,
      },
    ]);
    setDraft({ complement: "", district: "", label: "", number: "", street: "" });
  }

  function removeAddress(id: number) {
    setAddresses((currentAddresses) => {
      const nextAddresses = currentAddresses.filter((address) => address.id !== id);

      if (nextAddresses.some((address) => address.isDefault) || nextAddresses.length === 0) {
        return nextAddresses;
      }

      return nextAddresses.map((address, index) => ({
        ...address,
        isDefault: index === 0,
      }));
    });
  }

  function setDefaultAddress(id: number) {
    setAddresses((currentAddresses) =>
      currentAddresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      })),
    );
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          aria-label="Abrir perfil"
          className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-surface-hover"
        >
          <PersonIcon className="h-5 w-5" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-125 flex-col bg-surface shadow-[-20px_0_45px_rgba(44,29,22,0.25)] focus:outline-none">
          <header className="flex items-start justify-between border-b border-border px-6 py-5">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-card-title font-extrabold text-text-main">
                <PersonIcon className="h-5 w-5 text-primary-dark" />
                Meu Perfil
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-body-sm font-medium text-text-muted">
                Cadastre seus dados para agilizar os próximos pedidos.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                aria-label="Fechar perfil"
                className="grid h-10 w-10 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <section>
              <h2 className="text-card-title font-extrabold text-text-strong">Dados do Cliente</h2>
              <div className="mt-4 grid gap-4">
                <Field
                  label="Telefone"
                  onChange={setPhone}
                  placeholder="(11) 99999-9999"
                  value={phone}
                />
                <Field
                  label="Nome para os pedidos"
                  onChange={setName}
                  placeholder="Ex: João Silva"
                  value={name}
                />
              </div>
            </section>

            <Separator.Root className="my-6 h-px bg-border-muted" />

            <section>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-card-title font-extrabold text-text-strong">
                  Meus Endereços
                </h2>
                <span className="rounded-full bg-surface-soft px-3 py-1 text-caption font-extrabold text-primary-dark">
                  {addresses.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {addresses.map((address) => (
                  <AddressCard
                    address={address}
                    key={address.id}
                    onRemove={removeAddress}
                    onSetDefault={setDefaultAddress}
                  />
                ))}
              </div>
            </section>

            <Separator.Root className="my-6 h-px bg-border-muted" />

            <section>
              <h2 className="text-card-title font-extrabold text-text-strong">
                Adicionar Endereço
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Apelido"
                  onChange={(value) => setDraft((current) => ({ ...current, label: value }))}
                  placeholder="Casa, trabalho..."
                  value={draft.label}
                />
                <Field
                  label="Bairro"
                  onChange={(value) => setDraft((current) => ({ ...current, district: value }))}
                  placeholder="Centro"
                  value={draft.district}
                />
                <Field
                  className="sm:col-span-2"
                  label="Rua/Avenida"
                  onChange={(value) => setDraft((current) => ({ ...current, street: value }))}
                  placeholder="Rua das Flores"
                  value={draft.street}
                />
                <Field
                  label="Número"
                  onChange={(value) => setDraft((current) => ({ ...current, number: value }))}
                  placeholder="123"
                  value={draft.number}
                />
                <Field
                  label="Complemento"
                  onChange={(value) => setDraft((current) => ({ ...current, complement: value }))}
                  placeholder="Apto, bloco..."
                  value={draft.complement}
                />
              </div>

              <button
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover"
                onClick={addAddress}
                type="button"
              >
                <PlusIcon className="h-4 w-4" />
                Salvar endereço
              </button>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  className = "",
  label,
  onChange,
  placeholder,
  value,
}: {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-caption font-extrabold text-text-strong">{label}</span>
      <input
        className="h-12 w-full rounded-lg border border-border-input bg-surface px-4 text-body-sm font-medium text-text-strong outline-none transition placeholder:text-placeholder focus:border-primary focus:bg-white"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function AddressCard({
  address,
  onRemove,
  onSetDefault,
}: {
  address: Address;
  onRemove: (id: number) => void;
  onSetDefault: (id: number) => void;
}) {
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
            {address.street}, {address.number}
            {address.complement ? ` - ${address.complement}` : ""}
            <br />
            {address.district}
          </p>
        </div>

        <DrawingPinFilledIcon className="mt-1 h-5 w-5 shrink-0 text-primary-dark" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="flex h-9 items-center gap-2 rounded-full border border-border-input px-3 text-caption font-extrabold text-text-muted transition hover:bg-surface-checkout"
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
