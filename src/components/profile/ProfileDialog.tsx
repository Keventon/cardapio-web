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
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import type { Address } from "../../types/profile";
import { formatPhone } from "../../utils/phone";
import { formatPostalCode } from "../../utils/postalCode";
import { readSavedProfile, writeSavedProfile } from "../../utils/profileStorage";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
  phone: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length >= 10, {
      message: "Informe um telefone válido.",
    }),
});

const addressSchema = z.object({
  city: z.string(),
  complement: z.string(),
  district: z.string().trim().min(1, "Informe o bairro."),
  label: z.string().trim().min(1, "Informe um apelido."),
  number: z.string().trim().min(1, "Informe o número."),
  postalCode: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length === 8, {
      message: "Informe um CEP válido.",
    }),
  state: z.string(),
  street: z.string().trim().min(1, "Informe a rua."),
});

type ProfileForm = z.infer<typeof profileSchema>;
type AddressForm = z.infer<typeof addressSchema>;

const emptyAddressForm: AddressForm = {
  city: "",
  complement: "",
  district: "",
  label: "",
  number: "",
  postalCode: "",
  state: "",
  street: "",
};

type ViaCepResponse = {
  bairro?: string;
  cep?: string;
  complemento?: string;
  erro?: boolean;
  localidade?: string;
  logradouro?: string;
  uf?: string;
};

type CepStatus = "idle" | "loading" | "found" | "not-found" | "error";

export function ProfileDialog() {
  const [savedProfile] = useState(readSavedProfile);
  const [addresses, setAddresses] = useState<Address[]>(savedProfile.addresses);
  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const {
    control: profileControl,
    formState: { errors: profileErrors },
    register: registerProfile,
    setValue: setProfileValue,
  } = useForm<ProfileForm>({
    defaultValues: {
      name: savedProfile.name,
      phone: savedProfile.phone,
    },
    mode: "onChange",
    resolver: zodResolver(profileSchema),
  });
  const {
    control: addressControl,
    formState: { errors: addressErrors },
    handleSubmit: handleAddressSubmit,
    register: registerAddress,
    reset: resetAddress,
    setValue: setAddressValue,
  } = useForm<AddressForm>({
    defaultValues: emptyAddressForm,
    resolver: zodResolver(addressSchema),
  });
  const profileValues = useWatch({ control: profileControl });
  const addressPostalCode = useWatch({
    control: addressControl,
    name: "postalCode",
  });

  useEffect(() => {
    writeSavedProfile({
      addresses,
      name: profileValues.name ?? "",
      phone: profileValues.phone ?? "",
    });
  }, [addresses, profileValues.name, profileValues.phone]);

  useEffect(() => {
    const cepDigits = (addressPostalCode ?? "").replace(/\D/g, "");

    if (cepDigits.length !== 8) {
      return;
    }

    const controller = new AbortController();

    async function fetchAddressByCep() {
      setCepStatus("loading");

      try {
        const { data: address } = await axios.get<ViaCepResponse>(
          `https://viacep.com.br/ws/${cepDigits}/json/`,
          { signal: controller.signal },
        );

        if (address.erro) {
          setCepStatus("not-found");
          return;
        }

        setAddressValue("street", address.logradouro ?? "", {
          shouldDirty: true,
          shouldValidate: true,
        });
        setAddressValue("district", address.bairro ?? "", {
          shouldDirty: true,
          shouldValidate: true,
        });
        setAddressValue("complement", address.complemento ?? "", {
          shouldDirty: true,
        });
        setAddressValue("city", address.localidade ?? "", {
          shouldDirty: true,
        });
        setAddressValue("state", address.uf ?? "", {
          shouldDirty: true,
        });
        setCepStatus("found");
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        setCepStatus("error");
      }
    }

    fetchAddressByCep();

    return () => controller.abort();
  }, [addressPostalCode, setAddressValue]);

  function saveAddress(addressForm: AddressForm) {
    if (editingAddressId) {
      setAddresses((currentAddresses) =>
        currentAddresses.map((address) =>
          address.id === editingAddressId
            ? {
                ...address,
                ...addressForm,
              }
            : address,
        ),
      );
      setEditingAddressId(null);
      resetAddress(emptyAddressForm);
      setCepStatus("idle");
      return;
    }

    setAddresses((currentAddresses) => [
      ...currentAddresses,
      {
        ...addressForm,
        id: Date.now(),
        isDefault: currentAddresses.length === 0,
      },
    ]);
    resetAddress(emptyAddressForm);
    setCepStatus("idle");
  }

  function removeAddress(id: number) {
    if (editingAddressId === id) {
      setEditingAddressId(null);
      resetAddress(emptyAddressForm);
      setCepStatus("idle");
    }

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

  function editAddress(address: Address) {
    setEditingAddressId(address.id);
    resetAddress({
      complement: address.complement,
      city: address.city,
      district: address.district,
      label: address.label,
      number: address.number,
      postalCode: address.postalCode,
      state: address.state,
      street: address.street,
    });
  }

  function cancelAddressEdit() {
    setEditingAddressId(null);
    resetAddress(emptyAddressForm);
    setCepStatus("idle");
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
                  error={profileErrors.name?.message}
                  label="Nome para os pedidos"
                  placeholder="Ex: João Silva"
                  registration={registerProfile("name")}
                />
                <Field
                  error={profileErrors.phone?.message}
                  label="Telefone"
                  onChange={(value) =>
                    setProfileValue("phone", formatPhone(value), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  placeholder="(11) 99999-9999"
                  value={profileValues.phone}
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
                    onEdit={editAddress}
                    onRemove={removeAddress}
                    onSetDefault={setDefaultAddress}
                  />
                ))}
              </div>
            </section>

            <Separator.Root className="my-6 h-px bg-border-muted" />

            <section>
              <h2 className="text-card-title font-extrabold text-text-strong">
                {editingAddressId ? "Editar Endereço" : "Adicionar Endereço"}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  className="sm:col-span-2"
                  error={addressErrors.postalCode?.message}
                  label="CEP"
                  onChange={(value) =>
                    {
                      if (value.replace(/\D/g, "").length !== 8) {
                        setCepStatus("idle");
                      }

                      setAddressValue("postalCode", formatPostalCode(value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }
                  placeholder="00000-000"
                  value={addressPostalCode}
                />
                <CepFeedback status={cepStatus} />
                <Field
                  error={addressErrors.label?.message}
                  label="Apelido"
                  placeholder="Casa, trabalho..."
                  registration={registerAddress("label")}
                />
                <Field
                  error={addressErrors.district?.message}
                  label="Bairro"
                  placeholder="Centro"
                  registration={registerAddress("district")}
                />
                <Field
                  className="sm:col-span-2"
                  error={addressErrors.street?.message}
                  label="Rua/Avenida"
                  placeholder="Rua das Flores"
                  registration={registerAddress("street")}
                />
                <Field
                  error={addressErrors.number?.message}
                  label="Número"
                  placeholder="123"
                  registration={registerAddress("number")}
                />
                <Field
                  label="Complemento"
                  placeholder="Apto, bloco..."
                  registration={registerAddress("complement")}
                />
                <Field
                  label="Cidade"
                  placeholder="Cidade"
                  registration={registerAddress("city")}
                />
                <Field
                  label="UF"
                  placeholder="UF"
                  registration={registerAddress("state")}
                />
              </div>

              <button
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover"
                onClick={handleAddressSubmit(saveAddress)}
                type="button"
              >
                <PlusIcon className="h-4 w-4" />
                {editingAddressId ? "Atualizar endereço" : "Salvar endereço"}
              </button>

              {editingAddressId ? (
                <button
                  className="mt-3 h-11 w-full rounded-lg border border-border-input bg-white text-button font-extrabold text-text-muted transition hover:bg-surface-checkout"
                  onClick={cancelAddressEdit}
                  type="button"
                >
                  Cancelar edição
                </button>
              ) : null}
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  className = "",
  error,
  label,
  onChange,
  placeholder,
  registration,
  value,
}: {
  className?: string;
  error?: string;
  label: string;
  onChange?: (value: string) => void;
  placeholder: string;
  registration?: UseFormRegisterReturn;
  value?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-caption font-extrabold text-text-strong">{label}</span>
      <input
        aria-invalid={error ? "true" : "false"}
        className="h-12 w-full rounded-lg border border-border-input bg-surface px-4 text-body-sm font-medium text-text-strong outline-none transition placeholder:text-placeholder focus:border-primary focus:bg-white aria-[invalid=true]:border-danger"
        placeholder={placeholder}
        {...registration}
        onChange={(event) => {
          registration?.onChange(event);
          onChange?.(event.target.value);
        }}
        value={value}
      />
      {error ? (
        <span className="mt-2 block text-caption font-bold text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function CepFeedback({ status }: { status: CepStatus }) {
  if (status === "idle") {
    return null;
  }

  const feedback = {
    error: "Não foi possível consultar o CEP agora.",
    found: "Endereço preenchido automaticamente.",
    loading: "Buscando endereço...",
    "not-found": "CEP não encontrado.",
  }[status];

  return (
    <p
      className={`-mt-2 text-caption font-bold sm:col-span-2 ${
        status === "found" || status === "loading"
          ? "text-primary-dark"
          : "text-danger"
      }`}
    >
      {feedback}
    </p>
  );
}

function AddressCard({
  address,
  onEdit,
  onRemove,
  onSetDefault,
}: {
  address: Address;
  onEdit: (address: Address) => void;
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
