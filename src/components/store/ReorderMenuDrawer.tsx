import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useCloseDrawerOnBack } from "../../hooks/useCloseDrawerOnBack";
import type { StoreCategoryWithProducts } from "../../types/storeMenu";

export type ReorderSaveStatus = "idle" | "saving" | "saved" | "error";

type ReorderMenuDrawerProps = {
  categories: StoreCategoryWithProducts[];
  onMoveCategory: (categoryId: string, direction: -1 | 1) => void;
  onMoveProduct: (
    categoryId: string,
    productId: string,
    direction: -1 | 1,
  ) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  saveStatus: ReorderSaveStatus;
};

const statusLabels: Record<ReorderSaveStatus, string> = {
  error: "Erro ao salvar",
  idle: "",
  saved: "Ordem salva",
  saving: "Salvando…",
};

export function ReorderMenuDrawer({
  categories,
  onMoveCategory,
  onMoveProduct,
  onOpenChange,
  open,
  saveStatus,
}: ReorderMenuDrawerProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  useCloseDrawerOnBack({ isOpen: open, onClose: () => onOpenChange(false) });

  // Always drill back to the category list when the drawer is reopened.
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setSelectedCategoryId(null);
    }
  }

  const selectedCategory = selectedCategoryId
    ? (categories.find((category) => category.id === selectedCategoryId) ?? null)
    : null;

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="drawer-panel fixed right-0 top-0 z-50 flex h-dvh w-full max-w-107.5 flex-col bg-surface shadow-[-20px_0_45px_rgba(44,29,22,0.25)] focus:outline-none">
          <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div className="flex min-w-0 items-start gap-2">
              {selectedCategory ? (
                <button
                  aria-label="Voltar para as categorias"
                  className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
                  onClick={() => setSelectedCategoryId(null)}
                  type="button"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>
              ) : null}
              <div className="min-w-0">
                <Dialog.Title className="truncate text-card-title font-extrabold text-text-main">
                  {selectedCategory
                    ? selectedCategory.name
                    : "Reordenar cardápio"}
                </Dialog.Title>
                <Dialog.Description className="mt-1 flex items-center gap-2 text-body-sm font-medium text-text-muted">
                  <span>{selectedCategory ? "Produtos" : "Categorias"}</span>
                  {saveStatus !== "idle" ? (
                    <span
                      className={`text-caption font-bold ${
                        saveStatus === "error"
                          ? "text-danger"
                          : "text-primary-dark"
                      }`}
                    >
                      · {statusLabels[saveStatus]}
                    </span>
                  ) : null}
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                aria-label="Fechar"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {selectedCategory ? (
              selectedCategory.products.length === 0 ? (
                <p className="text-center text-body-sm font-medium text-text-muted">
                  Nenhum produto nesta categoria.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedCategory.products.map((product, index) => (
                    <ReorderRow
                      canDown={index < selectedCategory.products.length - 1}
                      canUp={index > 0}
                      key={product.id}
                      label={product.name}
                      onDown={() =>
                        onMoveProduct(selectedCategory.id, product.id, 1)
                      }
                      onUp={() =>
                        onMoveProduct(selectedCategory.id, product.id, -1)
                      }
                    />
                  ))}
                </ul>
              )
            ) : categories.length === 0 ? (
              <p className="text-center text-body-sm font-medium text-text-muted">
                Nenhuma categoria cadastrada.
              </p>
            ) : (
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <ReorderRow
                    canDown={index < categories.length - 1}
                    canUp={index > 0}
                    dimmed={!category.enabled}
                    key={category.id}
                    label={category.name}
                    meta={`${category.products.length} ${category.products.length === 1 ? "produto" : "produtos"}`}
                    onDown={() => onMoveCategory(category.id, 1)}
                    onOpen={() => setSelectedCategoryId(category.id)}
                    onUp={() => onMoveCategory(category.id, -1)}
                  />
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ReorderRow({
  canDown,
  canUp,
  dimmed = false,
  label,
  meta,
  onDown,
  onOpen,
  onUp,
}: {
  canDown: boolean;
  canUp: boolean;
  dimmed?: boolean;
  label: string;
  meta?: string;
  onDown: () => void;
  onOpen?: () => void;
  onUp: () => void;
}) {
  return (
    <li className="flex items-center gap-2 rounded-lg border border-border-muted bg-white p-2">
      <div className="flex shrink-0 flex-col">
        <button
          aria-label={`Mover ${label} para cima`}
          className="grid h-6 w-7 place-items-center rounded text-text-muted transition hover:bg-surface-checkout disabled:opacity-30 disabled:hover:bg-transparent"
          disabled={!canUp}
          onClick={onUp}
          type="button"
        >
          <ArrowUpIcon className="h-4 w-4" />
        </button>
        <button
          aria-label={`Mover ${label} para baixo`}
          className="grid h-6 w-7 place-items-center rounded text-text-muted transition hover:bg-surface-checkout disabled:opacity-30 disabled:hover:bg-transparent"
          disabled={!canDown}
          onClick={onDown}
          type="button"
        >
          <ArrowDownIcon className="h-4 w-4" />
        </button>
      </div>

      {onOpen ? (
        <button
          className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-surface-checkout"
          onClick={onOpen}
          type="button"
        >
          <span className="min-w-0">
            <span
              className={`block truncate text-body-sm font-extrabold ${
                dimmed ? "text-text-muted" : "text-text-strong"
              }`}
            >
              {label}
            </span>
            {meta ? (
              <span className="block truncate text-caption font-medium text-text-muted">
                {meta}
              </span>
            ) : null}
          </span>
          <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-muted" />
        </button>
      ) : (
        <span className="min-w-0 flex-1 px-2">
          <span className="block truncate text-body-sm font-extrabold text-text-strong">
            {label}
          </span>
        </span>
      )}
    </li>
  );
}
