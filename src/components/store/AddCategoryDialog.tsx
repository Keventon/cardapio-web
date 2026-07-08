import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Field } from "../forms/Field";
import { Toggle } from "../Toggle";
import {
  emptyStoreCategoryForm,
  storeCategorySchema,
} from "../../forms/storeCategoryForm";
import type { StoreCategoryForm } from "../../forms/storeCategoryForm";
import { useCloseDrawerOnBack } from "../../hooks/useCloseDrawerOnBack";
import { createCategory, updateCategory } from "../../services/storeApi";
import type { StoreCategory } from "../../types/storeMenu";

type AddCategoryDialogProps = {
  category?: StoreCategory;
  onOpenChange: (open: boolean) => void;
  onSaved: (category: StoreCategory) => void;
  open: boolean;
};

function categoryToFormValues(category: StoreCategory): StoreCategoryForm {
  return {
    enabled: category.enabled,
    name: category.name,
  };
}

export function AddCategoryDialog({
  category,
  onOpenChange,
  onSaved,
  open,
}: AddCategoryDialogProps) {
  const isEditing = Boolean(category);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<StoreCategoryForm>({
    defaultValues: category
      ? categoryToFormValues(category)
      : emptyStoreCategoryForm,
    resolver: zodResolver(storeCategorySchema),
  });
  const enabled = useWatch({ control, name: "enabled" });

  useCloseDrawerOnBack({ isOpen: open, onClose: () => onOpenChange(false) });

  // Re-syncs the form when the dialog re-opens: the create instance is
  // reused across opens, and the edit instance mounts already open, so both
  // need the values reset from the current `category` on the open edge.
  const [wasOpen, setWasOpen] = useState(false);

  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) {
      reset(category ? categoryToFormValues(category) : emptyStoreCategoryForm);
      setError("");
    }
  }

  async function handleValidSubmit(form: StoreCategoryForm) {
    setIsSubmitting(true);
    setError("");

    try {
      const savedCategory = category
        ? await updateCategory(category.id, form)
        : await createCategory(form);

      onSaved(savedCategory);
      onOpenChange(false);
    } catch {
      setError(
        isEditing
          ? "Não foi possível salvar as alterações. Tente novamente."
          : "Não foi possível criar a categoria. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,430px)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-5">
            <Dialog.Title className="text-section-title font-extrabold leading-tight text-text-strong">
              {isEditing ? "Editar categoria" : "Nova categoria"}
            </Dialog.Title>
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
            className="mt-5 space-y-4"
            noValidate
            onSubmit={handleSubmit(handleValidSubmit)}
          >
            <Field
              error={errors.name?.message}
              label="Nome da categoria"
              placeholder="Hambúrgueres"
              registration={register("name")}
            />

            <div className="flex items-center gap-3">
              <Toggle
                checked={enabled}
                label="Categoria habilitada no cardápio"
                onCheckedChange={(next) =>
                  setValue("enabled", next, { shouldDirty: true })
                }
              />
              <span className="text-body-sm font-semibold text-text-strong">
                Categoria habilitada no cardápio
              </span>
            </div>

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
                  : "Criar categoria"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
