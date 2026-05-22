import {
  Cross2Icon,
  PersonIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import * as Separator from "@radix-ui/react-separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AddressCard } from "./AddressCard";
import { CepFeedback } from "../forms/CepFeedback";
import { Field } from "../forms/Field";
import {
  addressSchema,
  emptyAddressForm,
  profileSchema,
} from "../../forms/profileForm";
import type { AddressForm, ProfileForm } from "../../forms/profileForm";
import { useCepLookup } from "../../hooks/useCepLookup";
import type { Address } from "../../types/profile";
import { formatPhone } from "../../utils/phone";
import { formatPostalCode } from "../../utils/postalCode";
import {
  getNextAddressId,
  readSavedProfile,
  writeSavedProfile,
} from "../../utils/profileStorage";

export function ProfileDialog() {
  const [savedProfile] = useState(readSavedProfile);
  const [addresses, setAddresses] = useState<Address[]>(savedProfile.addresses);
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
  const fillAddressFromCep = useCallback(
    (address: {
      bairro?: string;
      complemento?: string;
      localidade?: string;
      logradouro?: string;
      uf?: string;
    }) => {
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
    },
    [setAddressValue],
  );
  const { resetStatus: resetCepStatus, status: cepStatus } = useCepLookup({
    onFound: fillAddressFromCep,
    postalCode: addressPostalCode,
  });

  useEffect(() => {
    writeSavedProfile({
      addresses,
      name: profileValues.name ?? "",
      phone: profileValues.phone ?? "",
    });
  }, [addresses, profileValues.name, profileValues.phone]);

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
      resetCepStatus();
      return;
    }

    setAddresses((currentAddresses) => [
      ...currentAddresses,
      {
        ...addressForm,
        id: getNextAddressId(currentAddresses),
        isDefault: currentAddresses.length === 0,
      },
    ]);
    resetAddress(emptyAddressForm);
    resetCepStatus();
  }

  function removeAddress(id: number) {
    if (editingAddressId === id) {
      setEditingAddressId(null);
      resetAddress(emptyAddressForm);
      resetCepStatus();
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
    resetCepStatus();
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
                        resetCepStatus();
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
                <CepFeedback className="sm:col-span-2" status={cepStatus} />
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
