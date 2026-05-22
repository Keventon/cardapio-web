import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
  phone: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length >= 10, {
      message: "Informe um telefone válido.",
    }),
});

export const addressSchema = z.object({
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

export type ProfileForm = z.infer<typeof profileSchema>;
export type AddressForm = z.infer<typeof addressSchema>;

export const emptyAddressForm: AddressForm = {
  city: "",
  complement: "",
  district: "",
  label: "",
  number: "",
  postalCode: "",
  state: "",
  street: "",
};
