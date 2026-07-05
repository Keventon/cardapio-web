import { z } from "zod";

export const storeSignupSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da loja."),
  ownerCpf: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length === 11, {
      message: "Informe um CPF válido.",
    }),
  ownerEmail: z.string().trim().email("Informe um email válido."),
  ownerName: z.string().trim().min(1, "Informe seu nome."),
  ownerPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  slug: z
    .string()
    .trim()
    .min(1, "Informe o slug da loja.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      message: "Use apenas letras minúsculas, números e hífen.",
    }),
});

export type StoreSignupForm = z.infer<typeof storeSignupSchema>;

export const emptyStoreSignupForm: StoreSignupForm = {
  name: "",
  ownerCpf: "",
  ownerEmail: "",
  ownerName: "",
  ownerPassword: "",
  slug: "",
};
