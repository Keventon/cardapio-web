import {
  BackpackIcon,
  DragHandleDots2Icon,
  Pencil2Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import { AddCategoryDialog } from "./AddCategoryDialog";
import { AddProductDialog } from "./AddProductDialog";
import { ReorderMenuDrawer } from "./ReorderMenuDrawer";
import type { ReorderSaveStatus } from "./ReorderMenuDrawer";
import { StoreSidebar } from "./StoreSidebar";
import { StatusToast } from "../feedback/StatusToast";
import { Toggle } from "../Toggle";
import {
  getStoreProducts,
  reorderCategories,
  reorderProducts,
  updateCategory,
} from "../../services/storeApi";
import { useStoreAuthStore } from "../../stores/storeAuthStore";
import type {
  StoreCategory,
  StoreCategoryWithProducts,
  StoreProduct,
} from "../../types/storeMenu";
import { formatCurrency } from "../../utils/currency";
import { resolveStoreImageUrl } from "../../utils/imageUrl";

type StoreMenuPageProps = {
  onLogout: () => void;
};

export function StoreMenuPage({ onLogout }: StoreMenuPageProps) {
  const [categories, setCategories] = useState<StoreCategoryWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<StoreCategoryWithProducts | null>(null);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(
    null,
  );
  const [toggleError, setToggleErrorState] = useState("");
  const toggleErrorTimeoutRef = useRef<number | undefined>(undefined);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [reorderStatus, setReorderStatus] = useState<ReorderSaveStatus>("idle");
  const categoriesRef = useRef(categories);
  const reorderTimersRef = useRef(new Map<string, number>());
  const reorderStatusTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    categoriesRef.current = categories;
  });

  function setToggleError(message: string) {
    setToggleErrorState(message);
    window.clearTimeout(toggleErrorTimeoutRef.current);

    if (message) {
      toggleErrorTimeoutRef.current = window.setTimeout(
        () => setToggleErrorState(""),
        5000,
      );
    }
  }

  // Persists the current order for one scope ("categories" or
  // "product:<categoryId>"), reading the latest order from the ref so
  // coalesced moves send only the final arrangement.
  function flushReorder(key: string) {
    const current = categoriesRef.current;
    const request =
      key === "categories"
        ? reorderCategories(current.map((category) => category.id))
        : (() => {
            const categoryId = key.slice("product:".length);
            const category = current.find((item) => item.id === categoryId);

            return category
              ? reorderProducts(
                  categoryId,
                  category.products.map((product) => product.id),
                )
              : Promise.resolve();
          })();

    request
      .then(() => {
        if (reorderTimersRef.current.size === 0) {
          setReorderStatus("saved");
          window.clearTimeout(reorderStatusTimeoutRef.current);
          reorderStatusTimeoutRef.current = window.setTimeout(
            () => setReorderStatus("idle"),
            2000,
          );
        }
      })
      .catch(() => {
        setReorderStatus("error");
        // A coalesced multi-move can't be cleanly reverted, so resync with
        // the backend's truth instead.
        getStoreProducts()
          .then((data) => setCategories(data))
          .catch(() => {});
      });
  }

  const flushReorderRef = useRef(flushReorder);
  useEffect(() => {
    flushReorderRef.current = flushReorder;
  });

  useEffect(() => {
    const timers = reorderTimersRef.current;
    const statusTimeoutRef = reorderStatusTimeoutRef;

    return () => {
      // Flush anything still within the debounce window on unmount so a
      // pending order change is never lost.
      [...timers.keys()].forEach((key) => {
        window.clearTimeout(timers.get(key));
        timers.delete(key);
        flushReorderRef.current(key);
      });
      window.clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  function scheduleReorderSave(key: string) {
    setReorderStatus("saving");
    window.clearTimeout(reorderStatusTimeoutRef.current);

    const timers = reorderTimersRef.current;
    window.clearTimeout(timers.get(key));
    timers.set(
      key,
      window.setTimeout(() => {
        timers.delete(key);
        flushReorderRef.current(key);
      }, 700),
    );
  }

  function flushPendingReorders() {
    const timers = reorderTimersRef.current;
    [...timers.keys()].forEach((key) => {
      window.clearTimeout(timers.get(key));
      timers.delete(key);
      flushReorderRef.current(key);
    });
  }

  function moveCategory(categoryId: string, direction: -1 | 1) {
    setCategories((current) => {
      const index = current.findIndex((item) => item.id === categoryId);
      const target = index + direction;

      if (index < 0 || target < 0 || target >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];

      return next;
    });
    scheduleReorderSave("categories");
  }

  function moveProduct(
    categoryId: string,
    productId: string,
    direction: -1 | 1,
  ) {
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== categoryId) {
          return category;
        }

        const index = category.products.findIndex(
          (item) => item.id === productId,
        );
        const target = index + direction;

        if (index < 0 || target < 0 || target >= category.products.length) {
          return category;
        }

        const products = [...category.products];
        [products[index], products[target]] = [
          products[target],
          products[index],
        ];

        return { ...category, products };
      }),
    );
    scheduleReorderSave(`product:${categoryId}`);
  }

  useEffect(() => {
    let isIgnored = false;

    getStoreProducts()
      .then((data) => {
        if (!isIgnored) {
          setCategories(data);
          setLoadError("");
        }
      })
      .catch(() => {
        if (!isIgnored) {
          setLoadError("Não foi possível carregar o cardápio.");
        }
      })
      .finally(() => {
        if (!isIgnored) {
          setIsLoading(false);
        }
      });

    return () => {
      isIgnored = true;
    };
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(toggleErrorTimeoutRef.current);
  }, []);

  function handleLogout() {
    useStoreAuthStore.getState().clearAuth();
    onLogout();
  }

  function handleProductSaved(categoryId: string, product: StoreProduct) {
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== categoryId) {
          return category;
        }

        const alreadyExists = category.products.some(
          (existing) => existing.id === product.id,
        );

        return {
          ...category,
          products: alreadyExists
            ? category.products.map((existing) =>
                existing.id === product.id ? product : existing,
              )
            : [...category.products, product],
        };
      }),
    );
  }

  function handleCategorySaved(saved: StoreCategory) {
    setCategories((current) => {
      const alreadyExists = current.some((category) => category.id === saved.id);

      return alreadyExists
        ? current.map((category) =>
            category.id === saved.id
              ? { ...category, ...saved }
              : category,
          )
        : [...current, { ...saved, products: [] }];
    });
  }

  function setCategoryEnabled(categoryId: string, enabled: boolean) {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId ? { ...category, enabled } : category,
      ),
    );
  }

  async function handleToggleCategory(
    category: StoreCategoryWithProducts,
    nextEnabled: boolean,
  ) {
    // Optimistic flip; revert and warn if the request fails.
    setCategoryEnabled(category.id, nextEnabled);
    setToggleError("");

    try {
      await updateCategory(category.id, {
        enabled: nextEnabled,
        name: category.name,
      });
    } catch {
      setCategoryEnabled(category.id, category.enabled);
      setToggleError(
        `Não foi possível ${nextEnabled ? "ativar" : "desativar"} a categoria "${category.name}".`,
      );
    }
  }

  const productEditCategory = editingProduct
    ? categories.find((category) => category.id === editingProduct.categoryId)
    : undefined;

  return (
    <div className="min-h-screen bg-surface-checkout text-text-strong">
      <div className="grid min-h-screen xl:grid-cols-[16rem_minmax(0,1fr)]">
        <StoreSidebar onLogout={handleLogout} />

        <main className="min-w-0">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border-light bg-surface/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div>
              <h1 className="text-page-title font-extrabold leading-tight">
                Cardápio
              </h1>
              <p className="mt-1 text-body-sm font-medium text-text-muted">
                Categorias e produtos da sua loja.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {categories.length > 1 ? (
                <button
                  className="flex h-10 items-center gap-2 rounded-lg border border-border-input bg-white px-4 text-caption font-extrabold text-primary-dark transition hover:bg-surface-hover"
                  onClick={() => setIsReorderOpen(true)}
                  type="button"
                >
                  <DragHandleDots2Icon className="h-4 w-4" />
                  Reordenar
                </button>
              ) : null}
              <button
                className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-caption font-extrabold text-white transition hover:bg-primary-hover"
                onClick={() => setIsAddCategoryOpen(true)}
                type="button"
              >
                <PlusIcon className="h-4 w-4" />
                Adicionar categoria
              </button>
            </div>
          </header>

          {isLoading ? (
            <div className="grid min-h-96 place-items-center px-4 py-6">
              <p className="text-body-sm font-semibold text-text-muted">
                Carregando cardápio...
              </p>
            </div>
          ) : loadError ? (
            <div className="grid min-h-96 place-items-center px-4 py-6 text-center">
              <p className="text-body-sm font-semibold text-danger">
                {loadError}
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="grid min-h-96 place-items-center px-4 py-6 text-center">
              <div>
                <BackpackIcon className="mx-auto h-8 w-8 text-border-input" />
                <p className="mt-4 text-body-sm font-semibold text-text-muted">
                  Nenhuma categoria cadastrada ainda.
                </p>
                <button
                  className="mt-4 h-10 rounded-lg border border-border-input bg-white px-4 text-caption font-extrabold text-primary-dark transition hover:bg-surface-hover"
                  onClick={() => setIsAddCategoryOpen(true)}
                  type="button"
                >
                  Adicionar categoria
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8 xl:py-8">
              {categories.map((category) => (
                <CategorySection
                  category={category}
                  key={category.id}
                  onEditCategory={setEditingCategory}
                  onEditProduct={setEditingProduct}
                  onProductSaved={handleProductSaved}
                  onToggleCategory={handleToggleCategory}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <AddCategoryDialog
        onOpenChange={setIsAddCategoryOpen}
        onSaved={handleCategorySaved}
        open={isAddCategoryOpen}
      />

      {editingCategory ? (
        <AddCategoryDialog
          category={editingCategory}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setEditingCategory(null);
            }
          }}
          onSaved={handleCategorySaved}
          open={Boolean(editingCategory)}
        />
      ) : null}

      {editingProduct && productEditCategory ? (
        <AddProductDialog
          categoryId={productEditCategory.id}
          categoryName={productEditCategory.name}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setEditingProduct(null);
            }
          }}
          onSaved={(product) =>
            handleProductSaved(productEditCategory.id, product)
          }
          open={Boolean(editingProduct)}
          product={editingProduct}
        />
      ) : null}

      <ReorderMenuDrawer
        categories={categories}
        onMoveCategory={moveCategory}
        onMoveProduct={moveProduct}
        onOpenChange={(nextOpen) => {
          setIsReorderOpen(nextOpen);
          if (!nextOpen) {
            flushPendingReorders();
          }
        }}
        open={isReorderOpen}
        saveStatus={reorderStatus}
      />

      <StatusToast
        message={toggleError}
        title="Não foi possível atualizar"
        visible={Boolean(toggleError)}
      />
    </div>
  );
}

function CategorySection({
  category,
  onEditCategory,
  onEditProduct,
  onProductSaved,
  onToggleCategory,
}: {
  category: StoreCategoryWithProducts;
  onEditCategory: (category: StoreCategoryWithProducts) => void;
  onEditProduct: (product: StoreProduct) => void;
  onProductSaved: (categoryId: string, product: StoreProduct) => void;
  onToggleCategory: (
    category: StoreCategoryWithProducts,
    nextEnabled: boolean,
  ) => void;
}) {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2
          className={`text-price font-extrabold leading-tight ${
            category.enabled ? "text-text-strong" : "text-text-muted"
          }`}
        >
          {category.name}
        </h2>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Toggle
            checked={category.enabled}
            label={`${category.enabled ? "Desativar" : "Ativar"} categoria ${category.name}`}
            onCheckedChange={(nextEnabled) =>
              onToggleCategory(category, nextEnabled)
            }
          />
          <span
            className={`w-12 text-caption font-extrabold ${
              category.enabled ? "text-primary-dark" : "text-text-muted"
            }`}
          >
            {category.enabled ? "Ativa" : "Inativa"}
          </span>
          <button
            aria-label={`Editar categoria ${category.name}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-text-muted transition hover:bg-surface-hover"
            onClick={() => onEditCategory(category)}
            type="button"
          >
            <Pencil2Icon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={`divide-y divide-border-light overflow-hidden rounded-lg border border-border-light bg-white transition ${
          category.enabled ? "" : "opacity-60"
        }`}
      >
        {category.products.length === 0 ? (
          <p className="p-4 text-body-sm font-medium text-text-muted">
            Nenhum produto cadastrado nesta categoria.
          </p>
        ) : (
          category.products.map((product) => (
            <ProductRow
              key={product.id}
              onEdit={onEditProduct}
              product={product}
            />
          ))
        )}

        <button
          className="flex w-full items-center justify-center gap-2 p-4 text-caption font-extrabold text-primary-dark transition hover:bg-surface-checkout"
          onClick={() => setIsAddProductOpen(true)}
          type="button"
        >
          <PlusIcon className="h-4 w-4" />
          Adicionar produto
        </button>
      </div>

      <AddProductDialog
        categoryId={category.id}
        categoryName={category.name}
        onOpenChange={setIsAddProductOpen}
        onSaved={(product) => onProductSaved(category.id, product)}
        open={isAddProductOpen}
      />
    </section>
  );
}

function ProductRow({
  onEdit,
  product,
}: {
  onEdit: (product: StoreProduct) => void;
  product: StoreProduct;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex min-w-0 items-center gap-3">
        {product.imageUrl ? (
          <img
            alt={product.name}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
            src={resolveStoreImageUrl(product.imageUrl)}
          />
        ) : (
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface-soft text-text-muted">
            <BackpackIcon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-body-sm font-extrabold text-text-strong">
            {product.name}
          </p>
          {product.description ? (
            <p className="mt-1 truncate text-caption font-medium text-text-muted">
              {product.description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`rounded px-2 py-1 text-micro font-extrabold uppercase ${
            product.enabled
              ? "bg-emerald-100 text-emerald-700"
              : "bg-surface-soft text-text-muted"
          }`}
        >
          {product.enabled ? "Ativo" : "Inativo"}
        </span>
        <strong className="text-body-sm font-extrabold text-text-strong">
          {formatCurrency(product.price)}
        </strong>
        <button
          aria-label={`Editar ${product.name}`}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-text-muted transition hover:bg-surface-hover"
          onClick={() => onEdit(product)}
          type="button"
        >
          <Pencil2Icon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
