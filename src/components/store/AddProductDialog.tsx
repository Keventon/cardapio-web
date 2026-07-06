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
import { createProduct, updateProduct } from "../../services/storeApi";
import type { StoreProduct } from "../../types/storeMenu";
import { formatCurrency, formatCurrencyInput, parseCurrencyToCents } from "../../utils/currency";
import { resolveStoreImageUrl } from "../../utils/imageUrl";

type AddProductDialogProps = {
  categoryId: string;
  categoryName: string;
  onOpenChange: (open: boolean) => void;
  onSaved: (product: StoreProduct) => void;
  open: boolean;
  product?: StoreProduct;
};

const acceptedImageTypes = "image/jpeg,image/png,image/webp,image/gif";

function productToFormValues(product: StoreProduct): StoreProductForm {
  return {
    description: product.description ?? "",
    enabled: product.enabled,
    imageUrl: "",
    name: product.name,
    price: formatCurrency(product.price),
  };
}

export function AddProductDialog({
  categoryId,
  categoryName,
  onOpenChange,
  onSaved,
  open,
  product,
}: AddProductDialogProps) {
  const isEditing = Boolean(product);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<StoreProductForm>({
    // Seeded from `product` at construction time (not via `reset()` later):
    // the edit instance always mounts fresh, and a `reset()` call during that
    // first render fires before useWatch's subscription exists to catch it,
    // so the controlled `price` field would silently miss the update.
    defaultValues: product ? productToFormValues(product) : emptyStoreProductForm,
    resolver: zodResolver(storeProductSchema),
  });
  const price = useWatch({ control, name: "price" });
  // Starts false (not `open`) so a dialog that mounts already open — like
  // the edit instance, which is only rendered while a product is selected —
  // still detects the "just opened" transition on its first render and
  // pre-fills from `product` instead of staying on the empty defaults.
  const [wasOpen, setWasOpen] = useState(false);

  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) {
      reset(product ? productToFormValues(product) : emptyStoreProductForm);
      setImageFile(null);
      setError("");
    }
  }

  async function handleValidSubmit(form: StoreProductForm) {
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        description: form.description || undefined,
        enabled: form.enabled,
        imageFile: imageFile ?? undefined,
        imageUrl: imageFile ? undefined : form.imageUrl || undefined,
        name: form.name,
        price: parseCurrencyToCents(form.price),
      };

      const savedProduct = product
        ? await updateProduct(product.id, payload)
        : await createProduct(categoryId, payload);

      onSaved(savedProduct);
      onOpenChange(false);
    } catch {
      setError(
        isEditing
          ? "Não foi possível salvar as alterações. Tente novamente."
          : "Não foi possível criar o produto. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-white shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-5 p-6 pb-0">
            <div>
              <Dialog.Title className="text-section-title font-extrabold leading-tight text-text-strong">
                {isEditing ? "Editar produto" : "Novo produto"}
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
            <div>
              <span className="mb-2 block text-caption font-extrabold text-text-strong">
                Foto do produto
              </span>

              {isEditing && product?.imageUrl && !imageFile ? (
                <div className="mb-3 flex items-center gap-3">
                  <img
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                    src={resolveStoreImageUrl(product.imageUrl)}
                  />
                  <span className="text-caption font-medium text-text-muted">
                    Imagem atual — escolha um arquivo abaixo pra substituir.
                  </span>
                </div>
              ) : null}

              {imageFile ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border-input bg-surface px-4 py-3">
                  <span className="truncate text-body-sm font-medium text-text-strong">
                    {imageFile.name}
                  </span>
                  <button
                    className="shrink-0 text-caption font-extrabold text-danger"
                    onClick={() => setImageFile(null)}
                    type="button"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <>
                  <input
                    accept={acceptedImageTypes}
                    className="block w-full text-body-sm font-medium text-text-strong file:mr-4 file:h-10 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:text-caption file:font-extrabold file:text-white file:transition hover:file:bg-primary-hover"
                    onChange={(event) =>
                      setImageFile(event.target.files?.[0] ?? null)
                    }
                    type="file"
                  />
                  <Field
                    className="mt-3"
                    error={errors.imageUrl?.message}
                    label="ou informe uma URL de imagem"
                    placeholder="Opcional"
                    registration={register("imageUrl")}
                  />
                </>
              )}
            </div>

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
              {isSubmitting
                ? isEditing
                  ? "Salvando..."
                  : "Criando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Criar produto"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
