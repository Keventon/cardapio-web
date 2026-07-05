import { z } from "zod";
import { parseCurrencyToCents } from "../utils/currency";

export const storeProductSchema = z.object({
  description: z.string(),
  enabled: z.boolean(),
  imageUrl: z.string(),
  name: z.string().trim().min(1, "Informe o nome do produto."),
  price: z
    .string()
    .trim()
    .refine((value) => parseCurrencyToCents(value) > 0, {
      message: "Informe um preço válido.",
    }),
});

export type StoreProductForm = z.infer<typeof storeProductSchema>;

export const emptyStoreProductForm: StoreProductForm = {
  description: "",
  enabled: true,
  imageUrl: "",
  name: "",
  price: "",
};
