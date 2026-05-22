import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  CheckIcon,
  Cross2Icon,
  DrawingPinFilledIcon,
  IdCardIcon,
  LockClosedIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Separator from "@radix-ui/react-separator";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import type { OrderItem } from "../../types/menu";
import type { Address, ProfileState } from "../../types/profile";
import { formatCurrency, getOrderItemTotalCents } from "../../utils/currency";
import { formatPhone } from "../../utils/phone";
import { formatPostalCode } from "../../utils/postalCode";
import { addSavedAddress, readSavedProfile } from "../../utils/profileStorage";
import { BrandLogo } from "../brand/BrandLogo";

type CheckoutPageProps = {
  items: OrderItem[];
  onBack: () => void;
  onOrderConfirmed: () => void;
  totalCents: number;
};

function parseCurrencyToCents(value: string) {
  const normalizedValue = value.trim();
  const decimalMatch = normalizedValue.match(/^(.*)[,.](\d{1,2})$/);

  if (decimalMatch) {
    const reais = decimalMatch[1].replace(/\D/g, "");
    const cents = decimalMatch[2].padEnd(2, "0");

    return Number(`${reais || "0"}${cents}`);
  }

  const digits = normalizedValue.replace(/\D/g, "");

  if (!digits) {
    return 0;
  }

  return Number(digits) * 100;
}

function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return formatCurrency(Number(digits));
}

function createCheckoutSchema(totalCents: number) {
  return z.object({
    addressLabel: z.string(),
    cashChangeFor: z.string().optional(),
    cashChangeType: z.string().optional(),
    city: z.string(),
    complement: z.string(),
    deliveryAddressId: z.string(),
    district: z.string(),
    fulfillment: z.enum(["delivery", "pickup"]),
    name: z.string().trim().min(1, "Informe seu nome."),
    number: z.string(),
    payment: z.string().min(1, "Selecione uma forma de pagamento."),
    phone: z
      .string()
      .trim()
      .refine((value) => value.replace(/\D/g, "").length >= 10, {
        message: "Informe um telefone válido.",
      }),
    postalCode: z.string(),
    state: z.string(),
    street: z.string(),
  }).superRefine((data, context) => {
    if (data.fulfillment === "delivery") {
      if (!data.deliveryAddressId) {
        context.addIssue({
          code: "custom",
          message: "Selecione ou cadastre um endereço.",
          path: ["deliveryAddressId"],
        });
      }

      if (data.deliveryAddressId === "new") {
        if (!data.addressLabel.trim()) {
          context.addIssue({
            code: "custom",
            message: "Informe um apelido para o endereço.",
            path: ["addressLabel"],
          });
        }

        if (data.postalCode.replace(/\D/g, "").length !== 8) {
          context.addIssue({
            code: "custom",
            message: "Informe um CEP válido.",
            path: ["postalCode"],
          });
        }

        if (!data.street.trim()) {
          context.addIssue({
            code: "custom",
            message: "Informe a rua.",
            path: ["street"],
          });
        }

        if (!data.number.trim()) {
          context.addIssue({
            code: "custom",
            message: "Informe o número.",
            path: ["number"],
          });
        }

        if (!data.district.trim()) {
          context.addIssue({
            code: "custom",
            message: "Informe o bairro.",
            path: ["district"],
          });
        }
      }
    }

    if (data.payment === "cash") {
      if (!data.cashChangeType) {
        context.addIssue({
          code: "custom",
          message: "Informe se precisa de troco.",
          path: ["cashChangeType"],
        });
      }

      if (data.cashChangeType === "change" && !data.cashChangeFor?.trim()) {
        context.addIssue({
          code: "custom",
          message: "Informe para quanto precisa de troco.",
          path: ["cashChangeFor"],
        });
      }

      if (
        data.cashChangeType === "change" &&
        data.cashChangeFor?.trim() &&
        parseCurrencyToCents(data.cashChangeFor) <= totalCents
      ) {
        context.addIssue({
          code: "custom",
          message: `O valor para troco precisa ser maior que ${formatCurrency(totalCents)}.`,
          path: ["cashChangeFor"],
        });
      }
    }
  });
}

type CheckoutForm = z.infer<ReturnType<typeof createCheckoutSchema>>;

const initialCheckoutForm: CheckoutForm = {
  addressLabel: "",
  cashChangeFor: "",
  cashChangeType: "",
  city: "",
  complement: "",
  deliveryAddressId: "new",
  district: "",
  fulfillment: "delivery",
  name: "",
  number: "",
  payment: "",
  phone: "",
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

function getDefaultAddress(profile: ProfileState) {
  return (
    profile.addresses.find((address) => address.isDefault) ??
    profile.addresses[0] ??
    null
  );
}

function getCheckoutDefaults(profile: ProfileState): CheckoutForm {
  const defaultAddress = getDefaultAddress(profile);

  return {
    ...initialCheckoutForm,
    deliveryAddressId: defaultAddress ? String(defaultAddress.id) : "new",
    name: profile.name,
    phone: profile.phone,
  };
}


export function CheckoutPage({
  items,
  onBack,
  onOrderConfirmed,
  totalCents,
}: CheckoutPageProps) {
  const [savedProfile, setSavedProfile] = useState(readSavedProfile);
  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const checkoutValidationSchema = useMemo(
    () => createCheckoutSchema(totalCents),
    [totalCents],
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
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
  const isNewAddress = deliveryAddressId === "new" || savedAddresses.length === 0;

  const fillAddressFields = useCallback((address: Address) => {
    setValue("postalCode", address.postalCode, { shouldValidate: true });
    setValue("street", address.street, { shouldValidate: true });
    setValue("number", address.number, { shouldValidate: true });
    setValue("complement", address.complement);
    setValue("district", address.district, { shouldValidate: true });
    setValue("city", address.city);
    setValue("state", address.state);
  }, [setValue]);

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

  useEffect(() => {
    if (fulfillment !== "delivery" || !isNewAddress) {
      return;
    }

    const cepDigits = (postalCode ?? "").replace(/\D/g, "");

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
  }, [fulfillment, isNewAddress, postalCode, setValue]);

  function clearAddressFields() {
    setValue("addressLabel", "");
    setValue("postalCode", "");
    setValue("street", "");
    setValue("number", "");
    setValue("complement", "");
    setValue("district", "");
    setValue("city", "");
    setValue("state", "");
    setCepStatus("idle");
  }

  function handleDeliveryAddressChange(value: string, onChange: (value: string) => void) {
    onChange(value);

    if (value === "new") {
      clearAddressFields();
      return;
    }

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

    if (form.fulfillment === "delivery" && form.deliveryAddressId === "new") {
      const newAddress: Address = {
        city: form.city,
        complement: form.complement,
        district: form.district,
        id: Math.max(0, ...savedAddresses.map((address) => address.id)) + 1,
        isDefault: savedAddresses.length === 0,
        label: form.addressLabel,
        number: form.number,
        postalCode: form.postalCode,
        state: form.state,
        street: form.street,
      };

      addSavedAddress(newAddress);
      setSavedProfile(readSavedProfile());
    }

    setIsConfirmOpen(true);
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
        </div>
      </header>

      <form
        className="mx-auto grid max-w-330 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-12 lg:py-12"
        noValidate
        onSubmit={handleSubmit(handleValidSubmit)}
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
                            <span className="absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border border-border-input text-white group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary">
                              <CheckIcon className="h-3.5 w-3.5" />
                            </span>
                          </RadioGroup.Item>
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

                {isNewAddress ? (
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
                          setCepStatus("idle");
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
                    <CepFeedback status={cepStatus} />
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

        <OrderCheckoutSummary items={items} totalCents={totalCents} />
      </form>

      <ConfirmOrderDialog
        onConfirm={onOrderConfirmed}
        onOpenChange={setIsConfirmOpen}
        open={isConfirmOpen}
        totalCents={totalCents}
      />
    </div>
  );
}

function CheckoutCard({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_12px_32px_rgba(94,54,30,0.08)] sm:p-6">
      <h2 className="mb-5 flex items-center gap-2 text-card-title font-extrabold text-text-strong">
        <span className="text-accent">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function DeliveryOption({
  label,
  time,
  value,
}: {
  label: string;
  time: string;
  value: string;
}) {
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
      <span className="absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border border-border-input text-white group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary">
        <CheckIcon className="h-3.5 w-3.5" />
      </span>
    </RadioGroup.Item>
  );
}

function PaymentOption({ label, value }: { label: string; value: string }) {
  return (
    <RadioGroup.Item
      className="rounded-lg border border-border-input bg-surface px-4 py-3 text-center text-button font-extrabold text-text-muted outline-none transition data-[state=checked]:border-primary data-[state=checked]:bg-surface-selected data-[state=checked]:text-primary-dark"
      value={value}
    >
      {label}
    </RadioGroup.Item>
  );
}

function AddressOption({
  address,
  value,
}: {
  address: Address;
  value: string;
}) {
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
      <span className="absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border border-border-input text-white group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary">
        <CheckIcon className="h-3.5 w-3.5" />
      </span>
    </RadioGroup.Item>
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
      className={`-mt-2 text-caption font-bold md:col-span-2 ${
        status === "found" || status === "loading"
          ? "text-primary-dark"
          : "text-danger"
      }`}
    >
      {feedback}
    </p>
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
      <span className="mb-2 block text-caption font-extrabold text-text-strong">
        {label}
      </span>
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

function OrderCheckoutSummary({
  items,
  totalCents,
}: {
  items: OrderItem[];
  totalCents: number;
}) {
  const hasItems = items.length > 0;

  return (
    <aside className="h-fit rounded-lg bg-white p-5 shadow-[0_18px_42px_rgba(94,54,30,0.12)] lg:sticky lg:top-24 sm:p-6">
      <h2 className="text-card-title font-extrabold text-text-strong">
        Resumo do Pedido
      </h2>
      <Separator.Root className="my-5 h-px bg-border-muted" />

      <div className="space-y-4">
        {items.map((item) => (
          <div
            className="flex items-start justify-between gap-4"
            key={item.id}
          >
            <div className="flex min-w-0 gap-3">
              <span className="grid h-6 min-w-6 place-items-center rounded bg-surface-soft px-1 text-caption font-extrabold text-primary-dark">
                {item.quantity}x
              </span>
              <div className="min-w-0">
                <p className="truncate text-body-sm font-extrabold text-text-strong">
                  {item.name}
                </p>
                <p className="mt-1 text-caption font-medium text-text-muted">
                  Item selecionado
                </p>
              </div>
            </div>
            <strong className="shrink-0 text-body-sm font-extrabold text-text-strong">
              {formatCurrency(getOrderItemTotalCents(item))}
            </strong>
          </div>
        ))}
      </div>

      <Separator.Root className="my-5 h-px bg-border-muted" />

      <div className="space-y-3 text-body-sm font-medium text-text-muted">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="text-text-strong">{formatCurrency(totalCents)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Taxa de Entrega</span>
          <span className="font-bold text-primary">Grátis</span>
        </div>
      </div>

      <Separator.Root className="my-5 h-px bg-border-muted" />

      <div className="flex items-center justify-between">
        <span className="text-card-title font-extrabold text-text-strong">Total</span>
        <strong className="text-card-title font-extrabold text-primary">
          {formatCurrency(totalCents)}
        </strong>
      </div>

      <button
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border-input"
        disabled={!hasItems}
        type="submit"
      >
        Confirmar Pedido
        <ArrowRightIcon className="h-4 w-4" />
      </button>

      <p className="mt-5 flex items-center justify-center gap-1 text-caption font-medium text-text-muted">
        <LockClosedIcon className="h-3.5 w-3.5" />
        Site seguro
      </p>
    </aside>
  );
}

function ConfirmOrderDialog({
  onConfirm,
  onOpenChange,
  open,
  totalCents,
}: {
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  totalCents: number;
}) {
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
