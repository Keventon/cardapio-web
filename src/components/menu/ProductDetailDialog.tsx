import {
  BackpackIcon,
  Cross2Icon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import * as Separator from "@radix-ui/react-separator";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import type { AddToCartOptions, Product } from "../../types/menu";
import { formatCurrency } from "../../utils/currency";
import { BrandLogo } from "../brand/BrandLogo";

type ProductDetailDialogProps = {
  children: ReactNode;
  onAddToCart: (product: Product, options: AddToCartOptions) => void;
  product: Product;
};

export function ProductDetailDialog({
  children,
  onAddToCart,
  product,
}: ProductDetailDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(94dvh,820px)] w-[min(94vw,1060px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-surface shadow-2xl focus:outline-none">
          <div className="flex items-center justify-between border-b border-border-light px-5 py-4 sm:px-7">
            <BrandLogo />
            <Dialog.Close asChild>
              <button
                aria-label="Fechar detalhes do produto"
                className="grid h-10 w-10 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-8 px-5 py-6 sm:px-7 lg:grid-cols-[1.12fr_0.88fr] lg:gap-12 lg:px-12 lg:py-10">
              <ProductGallery product={product} />
              <ProductDetails onAddToCart={onAddToCart} product={product} />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ProductGallery({ product }: { product: Product }) {
  const BadgeIcon = product.badgeIcon;
  const images = product.gallery.length > 0 ? product.gallery : [];
  const [selectedImage, setSelectedImage] = useState(product.detailImageUrl);
  const currentImage = selectedImage || product.detailImageUrl || images[0] || "";

  return (
    <div>
      <div className="relative aspect-[1.06] overflow-hidden rounded-lg bg-surface-image">
        {currentImage ? (
          <img
            alt={product.name}
            className="h-full w-full object-cover"
            src={currentImage}
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-surface-soft text-primary-dark">
            <BadgeIcon className="h-16 w-16" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1.5 text-caption font-extrabold text-accent shadow-sm">
          Destaque
        </span>
      </div>

      {images.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-3 sm:flex sm:gap-4">
        {images.map((image, index) => (
          <button
            aria-label={`Ver imagem ${index + 1} de ${product.name}`}
            className={`aspect-square overflow-hidden rounded-lg border bg-surface-image sm:h-20 sm:w-20 ${
              image === currentImage ? "border-primary" : "border-border-muted"
            }`}
            key={image}
            onClick={() => setSelectedImage(image)}
            type="button"
          >
            <img alt="" className="h-full w-full object-cover" src={image} />
          </button>
        ))}
        </div>
      ) : null}
    </div>
  );
}

function ProductDetails({
  onAddToCart,
  product,
}: {
  onAddToCart: (product: Product, options: AddToCartOptions) => void;
  product: Product;
}) {
  const instructionsId = useId();
  const [instructions, setInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);
  const itemTotalCents = product.priceCents * quantity;

  function addCurrentSelectionToCart() {
    onAddToCart(product, {
      instructions,
      quantity,
    });
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-start justify-between gap-5">
        <div>
          <Dialog.Title className="text-page-title font-extrabold leading-tight text-text-strong">
            {product.name}
          </Dialog.Title>
          <div className="mt-3 flex items-center gap-3">
            <strong className="text-price font-extrabold text-accent">
              {formatCurrency(product.priceCents)}
            </strong>
            <span className="flex items-center gap-1 rounded bg-accent-soft px-2 py-1 text-caption font-bold text-rating-text">
              <StarFilledIcon className="h-3 w-3 text-rating" />
              {product.rating}
            </span>
          </div>
        </div>

        <button
          aria-label={`Favoritar ${product.name}`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
        >
          <HeartIcon className="h-5 w-5" />
        </button>
      </div>

      <Dialog.Description className="mt-5 text-body font-medium leading-relaxed text-text-muted">
        {product.fullDescription}
      </Dialog.Description>

      <Separator.Root className="my-7 h-px bg-border-muted" />

      <section>
        <label
          className="text-card-title font-extrabold text-text-strong"
          htmlFor={instructionsId}
        >
          Observações
        </label>
        <textarea
          className="mt-3 min-h-24 w-full resize-none rounded-lg border border-border-muted bg-white px-4 py-3 text-body-sm font-medium text-text-main outline-none transition placeholder:text-placeholder-muted focus:border-primary"
          id={instructionsId}
          onChange={(event) => setInstructions(event.target.value)}
          placeholder="Ex: sem cebola, ponto da carne, molho separado..."
          value={instructions}
        />
      </section>

      <div className="mt-8 flex flex-col gap-4 sm:mt-auto sm:flex-row sm:items-center sm:justify-between sm:pt-8">
        <div className="flex w-fit items-center overflow-hidden rounded-full border border-border bg-white">
          <button
            aria-label="Diminuir quantidade"
            className="grid h-10 w-10 place-items-center rounded-l-full text-primary-dark transition hover:bg-surface-hover"
            disabled={quantity === 1}
            onClick={() => setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))}
            type="button"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="min-w-10 text-center text-body-sm font-extrabold text-text-main">
            {quantity}
          </span>
          <button
            aria-label="Aumentar quantidade"
            className="grid h-10 w-10 place-items-center rounded-r-full text-primary-dark transition hover:bg-surface-hover"
            onClick={() => setQuantity((currentQuantity) => currentQuantity + 1)}
            type="button"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        <Dialog.Close asChild>
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-button font-extrabold text-white transition hover:bg-primary-hover sm:min-w-55"
            onClick={addCurrentSelectionToCart}
            type="button"
          >
            <BackpackIcon className="h-4 w-4" />
            Adicionar ao Pedido - {formatCurrency(itemTotalCents)}
          </button>
        </Dialog.Close>
      </div>
    </div>
  );
}
