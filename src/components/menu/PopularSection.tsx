import type { AddToCartOptions, MenuCategory, Product } from "../../types/menu";
import { ProductCard } from "./ProductCard";

type PopularSectionProps = {
  categories: MenuCategory[];
  onAddToCart: (product: Product, options: AddToCartOptions) => void;
  products: Product[];
};

export function PopularSection({
  categories,
  onAddToCart,
  products,
}: PopularSectionProps) {
  const productSections = categories
    .filter((category) => category.id !== "all")
    .map((category) => ({
      ...category,
      products: products.filter((product) => product.category === category.id),
    }))
    .filter((section) => section.products.length > 0);

  return (
    <section className="mt-12 scroll-mt-32 space-y-14 pb-10" id="menu">
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
