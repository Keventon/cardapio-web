import type { AddToCartOptions, Product } from "../../types/menu";
import { ProductDetailDialog } from "./ProductDetailDialog";

type HeroBannerProps = {
  onAddToCart: (product: Product, options: AddToCartOptions) => void;
  product: Product;
};

export function HeroBanner({ onAddToCart, product }: HeroBannerProps) {
  return (
    <ProductDetailDialog onAddToCart={onAddToCart} product={product}>
      <button
        aria-label={`Ver detalhes de ${product.name}`}
        className="group relative block min-h-65 w-full overflow-hidden rounded-lg bg-hero-dark text-left shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(94,54,30,0.18)] sm:min-h-80.5"
      >
        <img
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 ease-out group-hover:scale-105"
          src={product.detailImageUrl}
        />
        <div className="absolute inset-0 bg-linear-to-r from-hero-wash/90 via-hero-glow/40 to-hero-end/80" />
        <div className="relative flex min-h-65 max-w-155 flex-col justify-center px-8 py-9 sm:min-h-80.5 sm:px-14">
          <span className="mb-5 w-fit rounded-full bg-badge-red px-3.5 py-1.5 text-caption font-extrabold text-white">
            Destaque
          </span>
          <h2 className="text-display font-extrabold leading-[1.05] text-primary-dark">
            {product.name}
          </h2>
          <p className="mt-5 max-w-110 text-body font-medium leading-relaxed text-text-muted">
            {product.fullDescription}
          </p>
          <span className="mt-6 w-fit rounded-full bg-primary px-5 py-3 text-button font-extrabold text-white transition group-hover:bg-primary-hover">
            Ver detalhes
          </span>
        </div>
      </button>
    </ProductDetailDialog>
  );
}
