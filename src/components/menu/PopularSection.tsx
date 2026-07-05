import type { AddToCartOptions, MenuCategory, Product } from "../../types/menu";
import { ProductCard } from "./ProductCard";

type PopularSectionProps = {
  categories: MenuCategory[];
  onAddToCart: (product: Product, options: AddToCartOptions) => void;
  products: Product[];
  searchQuery: string;
};

export function PopularSection({
  categories,
  onAddToCart,
  products,
  searchQuery,
}: PopularSectionProps) {
  const hasSearch = searchQuery.trim().length > 0;
  const productSections = categories
    .filter((category) => category.id !== "all")
    .map((category) => ({
      ...category,
      products: products.filter((product) => product.category === category.id),
    }))
    .filter((section) => section.products.length > 0);

  return (
    <section className="mt-12 scroll-mt-32 space-y-14 pb-10" id="menu">
      {hasSearch ? (
        <div className="rounded-lg border border-border-light bg-surface-soft px-5 py-4">
          <h2 className="text-card-title font-extrabold text-text-strong">
            Resultados da busca
          </h2>
          <p className="mt-1 text-body-sm font-medium text-text-muted">
            {products.length} {products.length === 1 ? "item encontrado" : "itens encontrados"}
          </p>
        </div>
      ) : null}

      {productSections.length === 0 ? (
        <div className="rounded-lg border border-border-light bg-white px-5 py-10 text-center shadow-[0_10px_28px_rgba(94,54,30,0.08)]">
          <h2 className="text-card-title font-extrabold text-text-strong">
            Nenhum produto encontrado
          </h2>
          <p className="mx-auto mt-3 max-w-md text-body-sm font-medium leading-relaxed text-text-muted">
            {hasSearch
              ? "Tente buscar por outro sabor, bebida, acompanhamento ou combo."
              : "A loja ainda não possui produtos publicados na API."}
          </p>
        </div>
      ) : null}

      {productSections.map((section) => {
        const Icon = section.icon;

        return (
          <section className="scroll-mt-32" id={section.id} key={section.id}>
            <div className="mb-7 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-surface-soft text-primary-dark">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-section-title font-extrabold leading-tight text-text-strong">
                  {section.label}
                </h2>
                <p className="mt-1 text-body-sm font-medium text-text-muted">
                  {section.products.length} {section.products.length === 1 ? "opção" : "opções"}
                </p>
              </div>
            </div>

            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {section.products.map((product) => (
                <ProductCard
                  key={product.id}
                  onAddToCart={onAddToCart}
                  product={product}
                />
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}
