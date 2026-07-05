import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "../forms/Field";
import {
  emptyStoreCategoryForm,
  storeCategorySchema,
} from "../../forms/storeCategoryForm";
import type { StoreCategoryForm } from "../../forms/storeCategoryForm";
import { createCategory } from "../../services/storeApi";
import type { StoreCategory } from "../../types/storeMenu";

type AddCategoryDialogProps = {
  onCreated: (category: StoreCategory) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function AddCategoryDialog({
  onCreated,
  onOpenChange,
  open,
}: AddCategoryDialogProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<StoreCategoryForm>({
    defaultValues: emptyStoreCategoryForm,
    resolver: zodResolver(storeCategorySchema),
  });

  async function handleValidSubmit(form: StoreCategoryForm) {
    setIsSubmitting(true);
    setError("");

    try {
      const category = await createCategory(form);

      onCreated(category);
      reset(emptyStoreCategoryForm);
      onOpenChange(false);
    } catch {
      setError("Não foi possível criar a categoria. Tente novamente.");
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
          reset(emptyStoreCategoryForm);
        }
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,430px)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-5">
            <Dialog.Title className="text-section-title font-extrabold leading-tight text-text-strong">
              Nova categoria
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

            <label className="flex items-center gap-2 text-body-sm font-semibold text-text-strong">
              <input
                className="h-4 w-4 rounded border-border-input"
                type="checkbox"
                {...register("enabled")}
              />
              Categoria habilitada no cardápio
            </label>

            {error ? (
              <p className="text-caption font-bold text-danger">{error}</p>
            ) : null}

            <button
              className="h-11 w-full rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Criando..." : "Criar categoria"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
