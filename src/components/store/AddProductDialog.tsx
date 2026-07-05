import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Field } from "../forms/Field";
import {
  emptyStoreProductForm,
  storeProductSchema,
} from "../../forms/storeProductForm";
import type { StoreProductForm } from "../../forms/storeProductForm";
import { createProduct } from "../../services/storeApi";
import type { StoreProduct } from "../../types/storeMenu";
import { formatCurrencyInput, parseCurrencyToCents } from "../../utils/currency";

type AddProductDialogProps = {
  categoryId: string;
  categoryName: string;
  onCreated: (product: StoreProduct) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function AddProductDialog({
  categoryId,
  categoryName,
  onCreated,
  onOpenChange,
  open,
}: AddProductDialogProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<StoreProductForm>({
    defaultValues: emptyStoreProductForm,
    resolver: zodResolver(storeProductSchema),
  });
  const price = useWatch({ control, name: "price" });

  async function handleValidSubmit(form: StoreProductForm) {
    setIsSubmitting(true);
    setError("");

    try {
      const product = await createProduct(categoryId, {
        description: form.description || undefined,
        enabled: form.enabled,
        imageUrl: form.imageUrl || undefined,
        name: form.name,
        price: parseCurrencyToCents(form.price),
      });

      onCreated(product);
      reset(emptyStoreProductForm);
      onOpenChange(false);
    } catch {
      setError("Não foi possível criar o produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
          setError("");
          reset(emptyStoreProductForm);
        }
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-white shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-5 p-6 pb-0">
            <div>
              <Dialog.Title className="text-section-title font-extrabold leading-tight text-text-strong">
                Novo produto
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-body-sm font-medium text-text-muted">
                Categoria: {categoryName}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Fechar"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
                type="button"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form
            className="space-y-4 overflow-y-auto p-6"
            noValidate
            onSubmit={handleSubmit(handleValidSubmit)}
          >
            <Field
              error={errors.name?.message}
              label="Nome do produto"
              placeholder="Smash Clássico"
              registration={register("name")}
            />
            <Field
              error={errors.description?.message}
              label="Descrição"
              placeholder="Opcional"
              registration={register("description")}
            />
            <Field
              error={errors.price?.message}
              label="Preço"
              onChange={(value) =>
                setValue("price", formatCurrencyInput(value), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              placeholder="R$ 0,00"
              value={price}
            />
            <Field
              error={errors.imageUrl?.message}
              label="URL da imagem"
              placeholder="Opcional"
              registration={register("imageUrl")}
            />

            <label className="flex items-center gap-2 text-body-sm font-semibold text-text-strong">
              <input
                className="h-4 w-4 rounded border-border-input"
                type="checkbox"
                {...register("enabled")}
              />
              Produto habilitado no cardápio
            </label>

            {error ? (
              <p className="text-caption font-bold text-danger">{error}</p>
            ) : null}

            <button
              className="h-11 w-full rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Criando..." : "Criar produto"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
