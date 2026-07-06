import {
  Cross2Icon,
  ExitIcon,
  PersonIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import * as Separator from "@radix-ui/react-separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  createClientAddress,
  deleteClientAddress,
  listClientAddresses,
  mapAddressToApiInput,
  updateClientAddress,
} from "../../api/addresses";
import {
  loginClient,
  registerClient,
  updateOwnClient,
} from "../../api/clientAuth";
import { getApiErrorMessage } from "../../api/http";
import {
  addressSchema,
  emptyAddressForm,
  profileSchema,
} from "../../forms/profileForm";
import type { AddressForm, ProfileForm } from "../../forms/profileForm";
import { useCepLookup } from "../../hooks/useCepLookup";
import { useUserClient } from "../../hooks/useUserClient";
import type { Address } from "../../types/profile";
import { notifyClientProfileChanged } from "../../utils/clientSession";
import { formatPhone } from "../../utils/phone";
import { formatPostalCode } from "../../utils/postalCode";
import { AddressCard } from "./AddressCard";
import { CepFeedback } from "../forms/CepFeedback";
import { Field } from "../forms/Field";

type ProfileDialogProps = {
  triggerClassName?: string;
  triggerLabel?: string;
};

type LoginForm = {
  email: string;
  password: string;
};

type RegisterForm = {
  email: string;
  name: string;
  password: string;
  phone: string;
};

export function ProfileDialog({
  triggerClassName,
  triggerLabel,
}: ProfileDialogProps) {
  const { clearSession, session, setSession } = useUserClient();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [addressMessage, setAddressMessage] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isAddressSubmitting, setIsAddressSubmitting] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const {
    formState: { errors: loginErrors },
    handleSubmit: handleLoginSubmit,
    register: registerLogin,
    reset: resetLogin,
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });
  const {
    control: registerControl,
    formState: { errors: registerErrors },
    handleSubmit: handleRegisterSubmit,
    register: registerRegister,
    reset: resetRegister,
    setValue: setRegisterValue,
  } = useForm<RegisterForm>({
    defaultValues: { email: "", name: "", password: "", phone: "" },
  });
  const {
    control: profileControl,
    formState: { errors: profileErrors },
    register: registerProfile,
    reset: resetProfile,
    setValue: setProfileValue,
  } = useForm<ProfileForm>({
    defaultValues: {
      name: session?.client.name ?? "",
      phone: formatPhone(session?.client.phone ?? ""),
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
  const registerPhone = useWatch({ control: registerControl, name: "phone" });
  const triggerIsText = Boolean(triggerLabel);
  const triggerButtonClass =
    triggerClassName ??
    (triggerIsText
      ? "flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-button font-extrabold text-white transition hover:bg-primary-hover"
      : "grid h-10 w-10 place-items-center rounded-full transition hover:bg-surface-hover");

  const loadAddresses = useCallback(async () => {
    if (!session) {
      setAddresses([]);
      return;
    }

    setIsLoadingAddresses(true);
    setAddressMessage("");

    try {
      const apiAddresses = await listClientAddresses(session.token);

      setAddresses(apiAddresses);
    } catch (error) {
      setAddressMessage(
        getApiErrorMessage(error, "Não foi possível carregar seus endereços."),
      );
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [session]);

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
    resetProfile({
      name: session?.client.name ?? "",
      phone: formatPhone(session?.client.phone ?? ""),
    });
  }, [resetProfile, session]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadAddresses();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadAddresses]);

  async function authenticateWithLogin(loginForm: LoginForm) {
    setIsAuthSubmitting(true);
    setAuthError("");

    try {
      const loginResponse = await loginClient(loginForm);

      setSession(loginResponse);
      resetLogin();
    } catch (error) {
      setAuthError(getApiErrorMessage(error, "E-mail ou senha inválidos."));
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function authenticateWithRegister(registerForm: RegisterForm) {
    setIsAuthSubmitting(true);
    setAuthError("");

    try {
      await registerClient({
        ...registerForm,
        phone: registerForm.phone.replace(/\D/g, ""),
      });
      const loginResponse = await loginClient({
        email: registerForm.email,
        password: registerForm.password,
      });

      setSession(loginResponse);
      resetRegister();
      setAuthMode("login");
    } catch (error) {
      setAuthError(
        getApiErrorMessage(error, "Não foi possível criar sua conta."),
      );
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function saveProfile() {
    if (!session) {
      return;
    }

    setIsProfileSubmitting(true);
    setProfileMessage("");

    try {
      const client = await updateOwnClient(session.token, {
        name: profileValues.name ?? "",
        phone: (profileValues.phone ?? "").replace(/\D/g, ""),
      });

      setSession({ client, token: session.token });
      setProfileMessage("Dados atualizados.");
    } catch (error) {
      setProfileMessage(
        getApiErrorMessage(error, "Não foi possível atualizar seus dados."),
      );
    } finally {
      setIsProfileSubmitting(false);
    }
  }

  async function saveAddress(addressForm: AddressForm) {
    if (!session) {
      setAddressMessage("Entre na sua conta para salvar endereços.");
      return;
    }

    setIsAddressSubmitting(true);
    setAddressMessage("");

    const address: Address = {
      ...addressForm,
      id: editingAddressId ?? "",
      isDefault: addresses.length === 0,
    };

    try {
      if (editingAddressId) {
        const updatedAddress = await updateClientAddress(
          session.token,
          editingAddressId,
          mapAddressToApiInput(address),
        );

        setAddresses((currentAddresses) =>
          currentAddresses.map((currentAddress) =>
            currentAddress.id === editingAddressId
              ? updatedAddress
              : currentAddress,
          ),
        );
      } else {
        const createdAddress = await createClientAddress(
          session.token,
          mapAddressToApiInput(address),
        );

        setAddresses((currentAddresses) => [
          ...currentAddresses.map((currentAddress) => ({
            ...currentAddress,
            isDefault: createdAddress.isDefault ? false : currentAddress.isDefault,
          })),
          createdAddress,
        ]);
      }

      notifyClientProfileChanged();
      setEditingAddressId(null);
      resetAddress(emptyAddressForm);
      resetCepStatus();
      setIsAddressFormOpen(false);
    } catch (error) {
      setAddressMessage(
        getApiErrorMessage(error, "Não foi possível salvar o endereço."),
      );
    } finally {
      setIsAddressSubmitting(false);
    }
  }

  async function removeAddress(id: string) {
    setAddressMessage("");

    try {
      if (!session) {
        setAddressMessage("Entre na sua conta para remover endereços.");
        return;
      }

      await deleteClientAddress(session.token, id);
      notifyClientProfileChanged();

      if (editingAddressId === id) {
        setEditingAddressId(null);
        resetAddress(emptyAddressForm);
        resetCepStatus();
        setIsAddressFormOpen(false);
      }

      setAddresses((currentAddresses) => {
        const nextAddresses = currentAddresses.filter((address) => address.id !== id);

        if (
          nextAddresses.some((address) => address.isDefault) ||
          nextAddresses.length === 0
        ) {
          return nextAddresses;
        }

        return nextAddresses.map((address, index) => ({
          ...address,
          isDefault: index === 0,
        }));
      });
    } catch (error) {
      setAddressMessage(
        getApiErrorMessage(error, "Não foi possível remover o endereço."),
      );
    }
  }

  async function setDefaultAddress(id: string) {
    setAddressMessage("");

    try {
      if (!session) {
        setAddressMessage("Entre na sua conta para definir o endereço padrão.");
        return;
      }

      await updateClientAddress(session.token, id, { main: true });
      const apiAddresses = await listClientAddresses(session.token);

      setAddresses(apiAddresses);
      notifyClientProfileChanged();
    } catch (error) {
      setAddressMessage(
        getApiErrorMessage(error, "Não foi possível definir o endereço padrão."),
      );
    }
  }

  function openAddAddress() {
    setEditingAddressId(null);
    resetAddress(emptyAddressForm);
    resetCepStatus();
    setIsAddressFormOpen(true);
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
    setIsAddressFormOpen(true);
  }

  function cancelAddressEdit() {
    setEditingAddressId(null);
    resetAddress(emptyAddressForm);
    resetCepStatus();
    setIsAddressFormOpen(false);
  }

  function logout() {
    clearSession();
    setAddresses([]);
    setProfileMessage("");
    setAddressMessage("");
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          aria-label={triggerLabel ?? "Abrir perfil"}
          className={triggerButtonClass}
          type="button"
        >
          <PersonIcon className="h-5 w-5" />
          {triggerLabel ? <span>{triggerLabel}</span> : null}
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
                Entre na sua conta para salvar endereços e enviar pedidos.
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
            {!session ? (
              <section>
                <div className="grid grid-cols-2 rounded-lg border border-border-input bg-white p-1">
                  <button
                    className={`h-10 rounded-md text-button font-extrabold transition ${
                      authMode === "login"
                        ? "bg-primary text-white"
                        : "text-text-muted hover:bg-surface-hover"
                    }`}
                    onClick={() => setAuthMode("login")}
                    type="button"
                  >
                    Entrar
                  </button>
                  <button
                    className={`h-10 rounded-md text-button font-extrabold transition ${
                      authMode === "register"
                        ? "bg-primary text-white"
                        : "text-text-muted hover:bg-surface-hover"
                    }`}
                    onClick={() => setAuthMode("register")}
                    type="button"
                  >
                    Criar conta
                  </button>
                </div>

                {authMode === "login" ? (
                  <form
                    className="mt-5 grid gap-4"
                    onSubmit={handleLoginSubmit(authenticateWithLogin)}
                  >
                    <Field
                      error={loginErrors.email?.message}
                      label="E-mail"
                      placeholder="voce@email.com"
                      registration={registerLogin("email", {
                        required: "Informe seu e-mail.",
                      })}
                    />
                    <Field
                      error={loginErrors.password?.message}
                      label="Senha"
                      placeholder="Sua senha"
                      registration={registerLogin("password", {
                        required: "Informe sua senha.",
                      })}
                      type="password"
                    />
                    <button
                      className="h-11 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border-input"
                      disabled={isAuthSubmitting}
                      type="submit"
                    >
                      Entrar
                    </button>
                  </form>
                ) : (
                  <form
                    className="mt-5 grid gap-4"
                    onSubmit={handleRegisterSubmit(authenticateWithRegister)}
                  >
                    <Field
                      error={registerErrors.name?.message}
                      label="Nome"
                      placeholder="Seu nome"
                      registration={registerRegister("name", {
                        required: "Informe seu nome.",
                      })}
                    />
                    <Field
                      error={registerErrors.email?.message}
                      label="E-mail"
                      placeholder="voce@email.com"
                      registration={registerRegister("email", {
                        required: "Informe seu e-mail.",
                      })}
                    />
                    <Field
                      error={registerErrors.phone?.message}
                      label="Telefone"
                      onChange={(value) =>
                        setRegisterValue("phone", formatPhone(value), {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      placeholder="(11) 99999-9999"
                      registration={registerRegister("phone", {
                        required: "Informe seu telefone.",
                      })}
                      value={registerPhone}
                    />
                    <Field
                      error={registerErrors.password?.message}
                      label="Senha"
                      placeholder="Crie uma senha"
                      registration={registerRegister("password", {
                        required: "Informe uma senha.",
                      })}
                      type="password"
                    />
                    <button
                      className="h-11 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border-input"
                      disabled={isAuthSubmitting}
                      type="submit"
                    >
                      Criar conta
                    </button>
                  </form>
                )}

                {authError ? (
                  <p className="mt-4 text-caption font-bold text-danger">
                    {authError}
                  </p>
                ) : null}
              </section>
            ) : (
              <>
                <section>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-card-title font-extrabold text-text-strong">
                        Dados do Cliente
                      </h2>
                      <p className="mt-1 text-caption font-medium text-text-muted">
                        {session.client.email}
                      </p>
                    </div>
                    <button
                      className="flex h-9 items-center gap-2 rounded-full border border-border-input px-3 text-caption font-extrabold text-danger transition hover:bg-surface-checkout"
                      onClick={logout}
                      type="button"
                    >
                      <ExitIcon className="h-3.5 w-3.5" />
                      Sair
                    </button>
                  </div>

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
                    <button
                      className="h-11 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border-input"
                      disabled={isProfileSubmitting}
                      onClick={saveProfile}
                      type="button"
                    >
                      Salvar dados
                    </button>
                    {profileMessage ? (
                      <p className="text-caption font-bold text-primary-dark">
                        {profileMessage}
                      </p>
                    ) : null}
                  </div>
                </section>

                <Separator.Root className="my-6 h-px bg-border-muted" />

                <section>
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-card-title font-extrabold text-text-strong">
                      Meus Endereços
                    </h2>
                    <span className="rounded-full bg-surface-soft px-3 py-1 text-caption font-extrabold text-primary-dark">
                      {isLoadingAddresses ? "..." : addresses.length}
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

                  {addressMessage ? (
                    <p className="mt-4 text-caption font-bold text-danger">
                      {addressMessage}
                    </p>
                  ) : null}

                  {!isAddressFormOpen ? (
                    <button
                      className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border-input bg-white text-button font-extrabold text-primary-dark transition hover:bg-surface-hover"
                      onClick={openAddAddress}
                      type="button"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Adicionar endereço
                    </button>
                  ) : null}
                </section>

                {isAddressFormOpen ? (
                  <>
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
                          onChange={(value) => {
                            if (value.replace(/\D/g, "").length !== 8) {
                              resetCepStatus();
                            }

                            setAddressValue(
                              "postalCode",
                              formatPostalCode(value),
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            );
                          }}
                          placeholder="00000-000"
                          value={addressPostalCode}
                        />
                        <CepFeedback
                          className="sm:col-span-2"
                          status={cepStatus}
                        />
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
                        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border-input"
                        disabled={isAddressSubmitting}
                        onClick={handleAddressSubmit(saveAddress)}
                        type="button"
                      >
                        <PlusIcon className="h-4 w-4" />
                        {editingAddressId ? "Atualizar endereço" : "Salvar endereço"}
                      </button>

                      <button
                        className="mt-3 h-11 w-full rounded-lg border border-border-input bg-white text-button font-extrabold text-text-muted transition hover:bg-surface-checkout"
                        onClick={cancelAddressEdit}
                        type="button"
                      >
                        {editingAddressId ? "Cancelar edição" : "Cancelar"}
                      </button>
                    </section>
                  </>
                ) : null}
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
