import { z } from "zod";

export const storeCategorySchema = z.object({
  enabled: z.boolean(),
  name: z.string().trim().min(1, "Informe o nome da categoria."),
});

export type StoreCategoryForm = z.infer<typeof storeCategorySchema>;

export const emptyStoreCategoryForm: StoreCategoryForm = {
  enabled: true,
  name: "",
};
