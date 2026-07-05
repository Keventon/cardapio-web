import {
  ArrowLeftIcon,
  DrawingPinFilledIcon,
  IdCardIcon,
  PersonIcon,
  PlusIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  createClientAddress,
  listClientAddresses,
  mapAddressToApiInput,
} from "../../api/addresses";
import { getApiErrorMessage } from "../../api/http";
import { createOrder } from "../../api/orders";
import { AddressOption, DeliveryOption, NewAddressOption, PaymentOption } from "./CheckoutOptions";
import { CheckoutCard } from "./CheckoutCard";
import { ConfirmOrderDialog } from "./ConfirmOrderDialog";
import { OrderReceivedDialog } from "./OrderReceivedDialog";
import { OrderCheckoutSummary } from "./OrderCheckoutSummary";
import { CepFeedback } from "../forms/CepFeedback";
import { Field } from "../forms/Field";
import {
  createCheckoutSchema,
  getCheckoutDefaults,
} from "../../forms/checkoutForm";
import type { CheckoutForm } from "../../forms/checkoutForm";
import { useCepLookup } from "../../hooks/useCepLookup";
import { useClientSession } from "../../hooks/useClientSession";
import type { ApiOrder } from "../../types/api";
import type { OrderItem } from "../../types/menu";
import type { Address, ProfileState } from "../../types/profile";
import { formatCurrencyInput } from "../../utils/currency";
import { formatPhone } from "../../utils/phone";
import { formatPostalCode } from "../../utils/postalCode";
import { subscribeClientProfileChanged } from "../../utils/clientSession";
import { BrandLogo } from "../brand/BrandLogo";
import { ProfileDialog } from "../profile/ProfileDialog";

type CheckoutPageProps = {
  items: OrderItem[];
  onBack: () => void;
  onOrderConfirmed: () => void;
  storeId: string;
  totalCents: number;
};

const emptyProfile: ProfileState = {
  addresses: [],
  name: "",
  phone: "",
};

export function CheckoutPage({
  items,
  onBack,
  onOrderConfirmed,
  storeId,
  totalCents,
}: CheckoutPageProps) {
  const session = useClientSession();
  const [savedProfile, setSavedProfile] = useState<ProfileState>(emptyProfile);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isNewAddressFormOpen, setIsNewAddressFormOpen] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<ApiOrder | null>(null);
  const [submittedForm, setSubmittedForm] = useState<CheckoutForm | null>(null);
  const checkoutValidationSchema = useMemo(
    () => createCheckoutSchema(totalCents),
    [totalCents],
  );
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setValue,
    trigger,
  } = useForm<CheckoutForm>({
    defaultValues: getCheckoutDefaults(savedProfile),
    resolver: zodResolver(checkoutValidationSchema),
  });
  const fulfillment = useWatch({ control, name: "fulfillment" });
  const deliveryAddressId = useWatch({ control, name: "deliveryAddressId" });
  const payment = useWatch({ control, name: "payment" });
  const cashChangeType = useWatch({ control, name: "cashChangeType" });
  const cashChangeFor = useWatch({ control, name: "cashChangeFor" });
  const phone = useWatch({ control, name: "phone" });
  const postalCode = useWatch({ control, name: "postalCode" });
  const savedAddresses = savedProfile.addresses;
  const isNewAddress = deliveryAddressId === "new";
  const shouldShowNewAddressForm = isNewAddress && isNewAddressFormOpen;

  const loadClientAddresses = useCallback(async () => {
    if (!session) {
      setSavedProfile(emptyProfile);
      return;
    }

    try {
      const addresses = await listClientAddresses(session.token);

      setSavedProfile({
        addresses,
        name: session.client.name,
        phone: session.client.phone,
      });
      setValue("name", session.client.name);
      setValue("phone", formatPhone(session.client.phone));
      setValue(
        "deliveryAddressId",
        addresses.find((address) => address.isDefault)?.id ??
          addresses[0]?.id ??
          "new",
      );
      setIsNewAddressFormOpen(false);
    } catch (error) {
      setOrderError(
        getApiErrorMessage(error, "Não foi possível carregar seus endereços."),
      );
    }
  }, [session, setValue]);

  const fillAddressFields = useCallback((address: Address) => {
    setValue("postalCode", address.postalCode, { shouldValidate: true });
    setValue("street", address.street, { shouldValidate: true });
    setValue("number", address.number, { shouldValidate: true });
    setValue("complement", address.complement);
    setValue("district", address.district, { shouldValidate: true });
    setValue("city", address.city);
    setValue("state", address.state);
  }, [setValue]);
  const fillAddressFromCep = useCallback(
    (address: {
      bairro?: string;
      complemento?: string;
      localidade?: string;
      logradouro?: string;
      uf?: string;
    }) => {
      setValue("street", address.logradouro ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("district", address.bairro ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("complement", address.complemento ?? "", {
        shouldDirty: true,
      });
      setValue("city", address.localidade ?? "", {
        shouldDirty: true,
      });
      setValue("state", address.uf ?? "", {
        shouldDirty: true,
      });
    },
    [setValue],
  );
  const { resetStatus: resetCepStatus, status: cepStatus } = useCepLookup({
    enabled: fulfillment === "delivery" && shouldShowNewAddressForm,
    onFound: fillAddressFromCep,
    postalCode,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadClientAddresses();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadClientAddresses]);

  useEffect(() => {
    return subscribeClientProfileChanged(loadClientAddresses);
  }, [loadClientAddresses]);

  useEffect(() => {
    if (fulfillment !== "delivery" || isNewAddress) {
      return;
    }

    const selectedAddress = savedAddresses.find(
      (address) => String(address.id) === deliveryAddressId,
    );

    if (!selectedAddress) {
      return;
    }

    fillAddressFields(selectedAddress);
  }, [
    deliveryAddressId,
    fillAddressFields,
    fulfillment,
    isNewAddress,
    savedAddresses,
  ]);

  function clearAddressFields() {
    setValue("addressLabel", "");
    setValue("postalCode", "");
    setValue("street", "");
    setValue("number", "");
    setValue("complement", "");
    setValue("district", "");
    setValue("city", "");
    setValue("state", "");
    resetCepStatus();
  }

  function handleDeliveryAddressChange(value: string, onChange: (value: string) => void) {
    onChange(value);

    if (value === "new") {
      setIsNewAddressFormOpen(true);
      clearAddressFields();
      return;
    }

    setIsNewAddressFormOpen(false);
    const selectedAddress = savedAddresses.find(
      (address) => String(address.id) === value,
    );

    if (selectedAddress) {
      fillAddressFields(selectedAddress);
    }
  }

  function handleValidSubmit(form: CheckoutForm) {
    if (items.length === 0) {
      return;
    }

    if (!session) {
      setOrderError("Entre ou crie uma conta para enviar o pedido.");
      return;
    }

    if (!storeId) {
      setOrderError("Não foi possível identificar a loja deste cardápio.");
      return;
    }

    if (
      form.fulfillment === "delivery" &&
      form.deliveryAddressId === "new" &&
      !isNewAddressFormOpen
    ) {
      setIsNewAddressFormOpen(true);
      setOrderError("Adicione um endereço para receber o pedido.");
      return;
    }

    setOrderError("");
    setSubmittedForm(form);
    setIsConfirmOpen(true);
  }

  function handleInvalidSubmit() {
    if (
      fulfillment === "delivery" &&
      deliveryAddressId === "new" &&
      !isNewAddressFormOpen
    ) {
      setIsNewAddressFormOpen(true);
      setOrderError("Adicione um endereço para receber o pedido.");
    }
  }

  function openNewAddressForm() {
    setValue("deliveryAddressId", "new", { shouldValidate: true });
    clearAddressFields();
    setIsNewAddressFormOpen(true);
    setOrderError("");
  }

  async function confirmOrder() {
    if (!submittedForm || !session) {
      return;
    }

    setIsSubmittingOrder(true);
    setOrderError("");

    try {
      const addressId = await resolveOrderAddressId(submittedForm);

      const order = await createOrder({
        addressId,
        form: submittedForm,
        items,
        storeId,
        token: session.token,
      });

      setConfirmedOrder(order);
    } catch (error) {
      setOrderError(
        getApiErrorMessage(error, "Não foi possível enviar o pedido."),
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  function finishConfirmedOrder() {
    setConfirmedOrder(null);
    onOrderConfirmed();
  }

  async function saveNewAddress() {
    if (!session) {
      setOrderError("Entre ou crie uma conta para salvar endereço.");
      return;
    }

    const isAddressValid = await trigger([
      "addressLabel",
      "postalCode",
      "street",
      "number",
      "district",
      "city",
      "state",
    ]);

    if (!isAddressValid) {
      setOrderError("Preencha os dados do endereço antes de salvar.");
      return;
    }

    setIsSavingAddress(true);
    setOrderError("");

    try {
      const createdAddress = await createAddressFromForm(getValues());

      setValue("deliveryAddressId", createdAddress.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      fillAddressFields(createdAddress);
      setIsNewAddressFormOpen(false);
      resetCepStatus();
    } catch (error) {
      setOrderError(
        getApiErrorMessage(error, "Não foi possível salvar o endereço."),
      );
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function resolveOrderAddressId(form: CheckoutForm) {
    if (form.fulfillment === "pickup") {
      return undefined;
    }

    if (form.deliveryAddressId !== "new") {
      return form.deliveryAddressId;
    }

    const createdAddress = await createAddressFromForm(form);

    return createdAddress.id;
  }

  async function createAddressFromForm(form: CheckoutForm) {
    const newAddress: Address = {
      city: form.city,
      complement: form.complement,
      district: form.district,
      id: "",
      isDefault: savedAddresses.length === 0,
      label: form.addressLabel,
      number: form.number,
      postalCode: form.postalCode,
      state: form.state,
      street: form.street,
    };
    const createdAddress = await createClientAddress(
      session!.token,
      mapAddressToApiInput(newAddress),
    );

    setSavedProfile((currentProfile) => ({
      ...currentProfile,
      addresses: [
        ...currentProfile.addresses.map((address) => ({
          ...address,
          isDefault: createdAddress.isDefault ? false : address.isDefault,
        })),
        createdAddress,
      ],
    }));

    return createdAddress;
  }

  return (
    <div className="min-h-screen bg-surface-checkout text-text-strong">
      <header className="sticky top-0 z-20 border-b border-border-light bg-surface/95 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-330 grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 lg:px-12">
          <button
            className="flex w-fit items-center gap-2 text-button font-extrabold text-primary-dark transition hover:text-primary"
            onClick={onBack}
            type="button"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Cardápio
          </button>
          <BrandLogo />
          <div className="justify-self-end">
            <ProfileDialog />
          </div>
        </div>
      </header>

      <form
        className="mx-auto grid max-w-330 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-12 lg:py-12"
        noValidate
        onSubmit={handleSubmit(handleValidSubmit, handleInvalidSubmit)}
      >
        <div>
          <div className="mb-8">
            <h1 className="text-page-title font-extrabold leading-tight">
              Finalização do Pedido
            </h1>
            <p className="mt-2 text-body-sm font-medium text-text-muted">
              Complete os detalhes abaixo para finalizar sua compra.
            </p>
          </div>

          <div className="space-y-6">
            {!session ? (
              <CheckoutCard
                icon={<PersonIcon className="h-5 w-5" />}
                title="Conta do Cliente"
              >
                <p className="mb-4 text-body-sm font-medium leading-relaxed text-text-muted">
                  Faça login ou crie sua conta para salvar endereços e enviar o
                  pedido para a loja.
                </p>
                <ProfileDialog triggerLabel="Entrar ou criar conta" />
              </CheckoutCard>
            ) : null}

            <CheckoutCard
              icon={<RocketIcon className="h-5 w-5" />}
              title="Opções de Recebimento"
            >
              <Controller
                control={control}
                name="fulfillment"
                render={({ field }) => (
                  <RadioGroup.Root
                    className="grid gap-3 md:grid-cols-2"
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <DeliveryOption
                      label="Entrega"
                      time="30-45 min"
                      value="delivery"
                    />
                    <DeliveryOption
                      label="Retirada"
                      time="15-20 min"
                      value="pickup"
                    />
                  </RadioGroup.Root>
                )}
              />
            </CheckoutCard>

            <CheckoutCard
              icon={<PersonIcon className="h-5 w-5" />}
              title="Seus Dados"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  error={errors.name?.message}
                  label="Nome Completo"
                  placeholder="Ex: João da Silva"
                  registration={register("name")}
                />
                <Field
                  error={errors.phone?.message}
                  label="Telefone"
                  onChange={(value) =>
                    setValue("phone", formatPhone(value), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  placeholder="(11) 99999-9999"
                  value={phone}
                />
              </div>
            </CheckoutCard>

            {fulfillment === "delivery" ? (
              <CheckoutCard
                icon={<DrawingPinFilledIcon className="h-5 w-5" />}
                title="Endereço de Entrega"
              >
                {savedAddresses.length > 0 ? (
                  <div className="mb-5">
                    <Controller
                      control={control}
                      name="deliveryAddressId"
                      render={({ field }) => (
                        <RadioGroup.Root
                          className="grid gap-3"
                          name={field.name}
                          onValueChange={(value) =>
                            handleDeliveryAddressChange(value, field.onChange)
                          }
                          value={field.value}
                        >
                          {savedAddresses.map((address) => (
                            <AddressOption
                              address={address}
                              key={address.id}
                              value={String(address.id)}
                            />
                          ))}
                          <NewAddressOption />
                        </RadioGroup.Root>
                      )}
                    />
                    {errors.deliveryAddressId?.message ? (
                      <p className="mt-3 text-caption font-bold text-danger">
                        {errors.deliveryAddressId.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {savedAddresses.length === 0 && !shouldShowNewAddressForm ? (
                  <div className="rounded-lg border border-dashed border-border-muted bg-white px-5 py-6 text-center">
                    <DrawingPinFilledIcon className="mx-auto h-8 w-8 text-primary-dark" />
                    <p className="mt-3 text-body-sm font-extrabold text-text-strong">
                      Nenhum endereço cadastrado
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-caption font-medium leading-relaxed text-text-muted">
                      Adicione um endereço para receber seu pedido por entrega.
                    </p>
                    <button
                      className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-button font-extrabold text-white transition hover:bg-primary-hover"
                      onClick={openNewAddressForm}
                      type="button"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Adicionar endereço
                    </button>
                  </div>
                ) : null}

                {shouldShowNewAddressForm ? (
                  <div className="grid gap-4 md:grid-cols-[0.6fr_1.4fr]">
                    <Field
                      className="md:col-span-2"
                      error={errors.addressLabel?.message}
                      label="Apelido do endereço"
                      placeholder="Casa, trabalho..."
                      registration={register("addressLabel")}
                    />
                    <Field
                      error={errors.postalCode?.message}
                      label="CEP"
                      onChange={(value) => {
                        if (value.replace(/\D/g, "").length !== 8) {
                          resetCepStatus();
                        }

                        setValue("postalCode", formatPostalCode(value), {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      placeholder="00000-000"
                      value={postalCode}
                    />
                    <Field
                      error={errors.street?.message}
                      label="Rua/Avenida"
                      placeholder="Rua das Flores"
                      registration={register("street")}
                    />
                    <CepFeedback className="md:col-span-2" status={cepStatus} />
                    <Field
                      error={errors.number?.message}
                      label="Número"
                      placeholder="123"
                      registration={register("number")}
                    />
                    <Field
                      label="Complemento"
                      placeholder="Apto 42, Bloco B"
                      registration={register("complement")}
                    />
                    <Field
                      error={errors.district?.message}
                      label="Bairro"
                      placeholder="Centro"
                      registration={register("district")}
                    />
                    <Field
                      label="Cidade"
                      placeholder="Cidade"
                      registration={register("city")}
                    />
                    <Field
                      label="UF"
                      placeholder="UF"
                      registration={register("state")}
                    />
                    <button
                      className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border-input md:col-span-2"
                      disabled={isSavingAddress}
                      onClick={saveNewAddress}
                      type="button"
                    >
                      <PlusIcon className="h-4 w-4" />
                      {isSavingAddress ? "Salvando..." : "Criar endereço"}
                    </button>
                  </div>
                ) : null}
              </CheckoutCard>
            ) : null}

            <CheckoutCard
              icon={<IdCardIcon className="h-5 w-5" />}
              title="Pagamento"
            >
              <Controller
                control={control}
                name="payment"
                render={({ field }) => (
                  <RadioGroup.Root
                    className="grid gap-3 md:grid-cols-3"
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <PaymentOption label="Cartão" value="card" />
                    <PaymentOption label="Pix" value="pix" />
                    <PaymentOption label="Dinheiro" value="cash" />
                  </RadioGroup.Root>
                )}
              />
              {errors.payment?.message ? (
                <p className="mt-3 text-caption font-bold text-danger">
                  {errors.payment.message}
                </p>
              ) : null}

              {payment === "cash" ? (
                <div className="mt-5">
                  <Controller
                    control={control}
                    name="cashChangeType"
                    render={({ field }) => (
                      <RadioGroup.Root
                        className="grid gap-3 md:grid-cols-2"
                        name={field.name}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <PaymentOption label="Sem troco" value="none" />
                        <PaymentOption label="Preciso de troco" value="change" />
                      </RadioGroup.Root>
                    )}
                  />
                  {errors.cashChangeType?.message ? (
                    <p className="mt-3 text-caption font-bold text-danger">
                      {errors.cashChangeType.message}
                    </p>
                  ) : null}

                  {cashChangeType === "change" ? (
                    <Field
                      className="mt-4"
                      error={errors.cashChangeFor?.message}
                      label="Troco para quanto?"
                      onChange={(value) =>
                        setValue("cashChangeFor", formatCurrencyInput(value), {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      placeholder="Ex: R$ 100,00"
                      value={cashChangeFor}
                    />
                  ) : null}
                </div>
              ) : null}
            </CheckoutCard>
          </div>
        </div>

        <div>
          <OrderCheckoutSummary items={items} totalCents={totalCents} />
          {orderError ? (
            <p className="mt-4 rounded-lg border border-danger/30 bg-white px-4 py-3 text-caption font-bold text-danger">
              {orderError}
            </p>
          ) : null}
          {isSubmittingOrder ? (
            <p className="mt-3 text-center text-caption font-bold text-primary-dark">
              Enviando pedido...
            </p>
          ) : null}
        </div>
      </form>

      <ConfirmOrderDialog
        onConfirm={confirmOrder}
        onOpenChange={setIsConfirmOpen}
        open={isConfirmOpen}
        totalCents={totalCents}
      />
      <OrderReceivedDialog
        onClose={finishConfirmedOrder}
        open={Boolean(confirmedOrder)}
        order={confirmedOrder}
        phone={phone}
      />
    </div>
  );
}
