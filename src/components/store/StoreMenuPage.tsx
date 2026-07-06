import { BackpackIcon, Pencil2Icon, PlusIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { AddCategoryDialog } from "./AddCategoryDialog";
import { AddProductDialog } from "./AddProductDialog";
import { StoreSidebar } from "./StoreSidebar";
import { getStoreProducts } from "../../services/storeApi";
import { useStoreAuthStore } from "../../stores/storeAuthStore";
import type {
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
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(
    null,
  );

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

  const editingCategory = editingProduct
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
            <button
              className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-caption font-extrabold text-white transition hover:bg-primary-hover"
              onClick={() => setIsAddCategoryOpen(true)}
              type="button"
            >
              <PlusIcon className="h-4 w-4" />
              Adicionar categoria
            </button>
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
                  onEditProduct={setEditingProduct}
                  onProductSaved={handleProductSaved}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <AddCategoryDialog
        onCreated={(category) =>
          setCategories((current) => [
            ...current,
            { ...category, products: [] },
          ])
        }
        onOpenChange={setIsAddCategoryOpen}
        open={isAddCategoryOpen}
      />

      {editingProduct && editingCategory ? (
        <AddProductDialog
          categoryId={editingCategory.id}
          categoryName={editingCategory.name}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setEditingProduct(null);
            }
          }}
          onSaved={(product) => handleProductSaved(editingCategory.id, product)}
          open={Boolean(editingProduct)}
          product={editingProduct}
        />
      ) : null}
    </div>
  );
}

function CategorySection({
  category,
  onEditProduct,
  onProductSaved,
}: {
  category: StoreCategoryWithProducts;
  onEditProduct: (product: StoreProduct) => void;
  onProductSaved: (categoryId: string, product: StoreProduct) => void;
}) {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-price font-extrabold leading-tight text-text-strong">
          {category.name}
        </h2>
        <span
          className={`rounded px-2 py-1 text-micro font-extrabold uppercase ${
            category.enabled
              ? "bg-emerald-100 text-emerald-700"
              : "bg-surface-soft text-text-muted"
          }`}
        >
          {category.enabled ? "Habilitada" : "Desabilitada"}
        </span>
      </div>

      <div className="divide-y divide-border-light overflow-hidden rounded-lg border border-border-light bg-white">
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
