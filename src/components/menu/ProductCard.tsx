import { PlusIcon, StarFilledIcon } from "@radix-ui/react-icons";
import type { AddToCartOptions, Product } from "../../types/menu";
import { formatCurrency } from "../../utils/currency";
import { ProductDetailDialog } from "./ProductDetailDialog";

type ProductCardProps = {
  onAddToCart: (product: Product, options: AddToCartOptions) => void;
  product: Product;
};

export function ProductCard({ onAddToCart, product }: ProductCardProps) {
  const BadgeIcon = product.badgeIcon;

  return (
    <ProductDetailDialog onAddToCart={onAddToCart} product={product}>
      <button
        aria-label={`Ver detalhes de ${product.name}`}
        className="overflow-hidden rounded-lg bg-white text-left shadow-[0_10px_28px_rgba(94,54,30,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(94,54,30,0.16)]"
      >
        <div className="relative aspect-[1.45] overflow-hidden bg-surface-image">
          <img
            alt={product.name}
            className="h-full w-full object-cover"
            src={product.imageUrl}
          />
          <span
            className={`absolute left-4 top-4 grid h-6 w-6 place-items-center rounded-full shadow-sm ${product.badgeColor}`}
          >
            <BadgeIcon className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-card-title font-extrabold leading-tight text-text-main">
              {product.name}
            </h3>
            <span className="mt-1 flex shrink-0 items-center gap-1 rounded bg-accent-soft px-2 py-1 text-caption font-bold text-rating-text">
              <StarFilledIcon className="h-3 w-3 text-rating" />
              {product.rating}
            </span>
          </div>

          <p className="mt-3 min-h-11 text-body-sm leading-relaxed text-text-muted">
            {product.description}
          </p>

          <div className="mt-7 flex items-center justify-between">
            <strong className="text-price font-extrabold text-accent">
              {formatCurrency(product.priceCents)}
            </strong>
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-card text-white shadow-sm">
              <PlusIcon className="h-5 w-5" />
            </span>
          </div>
        </div>
      </button>
    </ProductDetailDialog>
  );
}
