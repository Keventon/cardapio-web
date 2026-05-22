import { z } from "zod";
import type { ProfileState } from "../types/profile";
import { formatCurrency, parseCurrencyToCents } from "../utils/currency";

export function createCheckoutSchema(totalCents: number) {
  return z
    .object({
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
    })
    .superRefine((data, context) => {
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

export type CheckoutForm = z.infer<ReturnType<typeof createCheckoutSchema>>;

export const initialCheckoutForm: CheckoutForm = {
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

export function getDefaultAddress(profile: ProfileState) {
  return (
    profile.addresses.find((address) => address.isDefault) ??
    profile.addresses[0] ??
    null
  );
}

export function getCheckoutDefaults(profile: ProfileState): CheckoutForm {
  const defaultAddress = getDefaultAddress(profile);

  return {
    ...initialCheckoutForm,
    deliveryAddressId: defaultAddress ? String(defaultAddress.id) : "new",
    name: profile.name,
    phone: profile.phone,
  };
}
