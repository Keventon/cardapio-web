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
import type { ReactNode } from "react";
import type { Product } from "../../types/menu";
import { BrandLogo } from "../brand/BrandLogo";

type ProductDetailDialogProps = {
  children: ReactNode;
  product: Product;
};

export function ProductDetailDialog({
  children,
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
              <ProductDetails product={product} />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ProductGallery({ product }: { product: Product }) {
  return (
    <div>
      <div className="relative aspect-[1.06] overflow-hidden rounded-lg bg-surface-image">
        <img
          alt={product.name}
          className="h-full w-full object-cover"
          src={product.detailImageUrl}
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1.5 text-caption font-extrabold text-accent shadow-sm">
          Destaque
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 sm:flex sm:gap-4">
        {product.gallery.map((image, index) => (
          <button
            aria-label={`Ver imagem ${index + 1} de ${product.name}`}
            className={`aspect-square overflow-hidden rounded-lg border bg-surface-image sm:h-20 sm:w-20 ${
              index === 0 ? "border-primary" : "border-border-muted"
            }`}
            key={image}
          >
            <img alt="" className="h-full w-full object-cover" src={image} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductDetails({ product }: { product: Product }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-start justify-between gap-5">
        <div>
          <Dialog.Title className="text-page-title font-extrabold leading-tight text-text-strong">
            {product.name}
          </Dialog.Title>
          <div className="mt-3 flex items-center gap-3">
            <strong className="text-price font-extrabold text-accent">
              {product.price}
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
        <h3 className="text-card-title font-extrabold text-text-strong">Adicionais</h3>
        <div className="mt-4 space-y-3">
          {product.extras.map((extra) => (
            <label
              className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-transparent px-3 py-2 text-body-sm font-medium text-text-muted transition hover:border-border-muted hover:bg-white"
              key={extra.name}
            >
              <span className="flex items-center gap-3">
                <input
                  className="h-4 w-4 accent-primary"
                  name={`extra-${product.name}`}
                  type="checkbox"
                />
                {extra.name}
              </span>
              <span className="font-bold text-accent">{extra.price}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <label
          className="text-card-title font-extrabold text-text-strong"
          htmlFor="instructions"
        >
          Observações
        </label>
        <textarea
          className="mt-3 min-h-24 w-full resize-none rounded-lg border border-border-muted bg-white px-4 py-3 text-body-sm font-medium text-text-main outline-none transition placeholder:text-placeholder-muted focus:border-primary"
          id="instructions"
          placeholder="Ex: sem cebola, ponto da carne, molho separado..."
        />
      </section>

      <div className="mt-8 flex flex-col gap-4 sm:mt-auto sm:flex-row sm:items-center sm:justify-between sm:pt-8">
        <div className="flex w-fit items-center rounded-full border border-border bg-white">
          <button
            aria-label="Diminuir quantidade"
            className="grid h-10 w-10 place-items-center text-primary-dark transition hover:bg-surface-hover"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="min-w-10 text-center text-body-sm font-extrabold text-text-main">
            1
          </span>
          <button
            aria-label="Aumentar quantidade"
            className="grid h-10 w-10 place-items-center text-primary-dark transition hover:bg-surface-hover"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-button font-extrabold text-white transition hover:bg-primary-hover sm:min-w-55">
          <BackpackIcon className="h-4 w-4" />
          Adicionar ao Pedido - {product.price}
        </button>
      </div>
    </div>
  );
}
