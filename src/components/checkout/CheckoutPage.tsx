import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  CheckIcon,
  Cross2Icon,
  DrawingPinFilledIcon,
  IdCardIcon,
  LockClosedIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Separator from "@radix-ui/react-separator";
import type { ReactNode } from "react";
import type { OrderItem } from "../../types/menu";
import { BrandLogo } from "../brand/BrandLogo";

type CheckoutPageProps = {
  items: OrderItem[];
  onBack: () => void;
  total: string;
};

export function CheckoutPage({ items, onBack, total }: CheckoutPageProps) {
  return (
    <div className="min-h-screen bg-surface-checkout text-text-strong">
      <header className="sticky top-0 z-20 border-b border-border-light bg-surface/95 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-330 grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 lg:px-12">
          <button
            className="flex w-fit items-center gap-2 text-button font-extrabold text-primary-dark transition hover:text-primary"
            onClick={onBack}
            type="button"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Cardápio
          </button>
          <BrandLogo />
        </div>
      </header>

      <main className="mx-auto grid max-w-330 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-12 lg:py-12">
        <div>
          <div className="mb-8">
            <h1 className="text-page-title font-extrabold leading-tight">
              Finalização do Pedido
            </h1>
            <p className="mt-2 text-body-sm font-medium text-text-muted">
              Complete os detalhes abaixo para finalizar sua compra.
            </p>
          </div>

          <div className="space-y-6">
            <CheckoutCard
              icon={<RocketIcon className="h-5 w-5" />}
              title="Opções de Recebimento"
            >
              <RadioGroup.Root
                className="grid gap-3 md:grid-cols-2"
                defaultValue="delivery"
                name="fulfillment"
              >
                <DeliveryOption
                  label="Entrega"
                  time="30-45 min"
                  value="delivery"
                />
                <DeliveryOption
                  label="Retirada"
                  time="15-20 min"
                  value="pickup"
                />
              </RadioGroup.Root>
            </CheckoutCard>

            <CheckoutCard
              icon={<PersonIcon className="h-5 w-5" />}
              title="Seus Dados"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome Completo" placeholder="Ex: João da Silva" />
                <Field label="Telefone" placeholder="(11) 99999-9999" />
              </div>
            </CheckoutCard>

            <CheckoutCard
              icon={<DrawingPinFilledIcon className="h-5 w-5" />}
              title="Endereço de Entrega"
            >
              <div className="grid gap-4 md:grid-cols-[0.6fr_1.4fr]">
                <Field label="CEP" placeholder="00000-000" />
                <Field label="Rua/Avenida" placeholder="Rua das Flores" />
                <Field label="Número" placeholder="123" />
                <Field label="Complemento" placeholder="Apto 42, Bloco B" />
                <Field
                  className="md:col-span-2"
                  label="Bairro"
                  placeholder="Centro"
                />
              </div>
            </CheckoutCard>

            <CheckoutCard
              icon={<IdCardIcon className="h-5 w-5" />}
              title="Pagamento"
            >
              <RadioGroup.Root
                className="grid gap-3 md:grid-cols-3"
                defaultValue="card"
                name="payment"
              >
                <PaymentOption label="Cartão" value="card" />
                <PaymentOption label="Pix" value="pix" />
                <PaymentOption label="Dinheiro" value="cash" />
              </RadioGroup.Root>
            </CheckoutCard>
          </div>
        </div>

        <OrderCheckoutSummary items={items} total={total} />
      </main>
    </div>
  );
}

function CheckoutCard({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_12px_32px_rgba(94,54,30,0.08)] sm:p-6">
      <h2 className="mb-5 flex items-center gap-2 text-card-title font-extrabold text-text-strong">
        <span className="text-accent">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function DeliveryOption({
  label,
  time,
  value,
}: {
  label: string;
  time: string;
  value: string;
}) {
  return (
    <RadioGroup.Item
      className="group relative rounded-lg border border-border-input bg-surface p-4 text-left outline-none transition data-[state=checked]:border-primary data-[state=checked]:bg-surface-selected"
      value={value}
    >
      <span className="block text-body-sm font-extrabold text-text-strong">
        {label}
      </span>
      <span className="mt-2 block text-body-sm font-medium text-text-muted">
        {time}
      </span>
      <span className="absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border border-border-input text-white group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary">
        <CheckIcon className="h-3.5 w-3.5" />
      </span>
    </RadioGroup.Item>
  );
}

function PaymentOption({ label, value }: { label: string; value: string }) {
  return (
    <RadioGroup.Item
      className="rounded-lg border border-border-input bg-surface px-4 py-3 text-center text-button font-extrabold text-text-muted outline-none transition data-[state=checked]:border-primary data-[state=checked]:bg-surface-selected data-[state=checked]:text-primary-dark"
      value={value}
    >
      {label}
    </RadioGroup.Item>
  );
}

function Field({
  className = "",
  label,
  placeholder,
}: {
  className?: string;
  label: string;
  placeholder: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-caption font-extrabold text-text-strong">
        {label}
      </span>
      <input
        className="h-12 w-full rounded-lg border border-border-input bg-surface px-4 text-body-sm font-medium text-text-strong outline-none transition placeholder:text-placeholder focus:border-primary focus:bg-white"
        placeholder={placeholder}
      />
    </label>
  );
}

function OrderCheckoutSummary({
  items,
  total,
}: {
  items: OrderItem[];
  total: string;
}) {
  return (
    <aside className="h-fit rounded-lg bg-white p-5 shadow-[0_18px_42px_rgba(94,54,30,0.12)] lg:sticky lg:top-24 sm:p-6">
      <h2 className="text-card-title font-extrabold text-text-strong">
        Resumo do Pedido
      </h2>
      <Separator.Root className="my-5 h-px bg-border-muted" />

      <div className="space-y-4">
        {items.map((item) => (
          <div
            className="flex items-start justify-between gap-4"
            key={item.name}
          >
            <div className="flex min-w-0 gap-3">
              <span className="grid h-6 min-w-6 place-items-center rounded bg-surface-soft px-1 text-caption font-extrabold text-primary-dark">
                {item.quantity}x
              </span>
              <div className="min-w-0">
                <p className="truncate text-body-sm font-extrabold text-text-strong">
                  {item.name}
                </p>
                <p className="mt-1 text-caption font-medium text-text-muted">
                  Item selecionado
                </p>
              </div>
            </div>
            <strong className="shrink-0 text-body-sm font-extrabold text-text-strong">
              {item.price}
            </strong>
          </div>
        ))}
      </div>

      <Separator.Root className="my-5 h-px bg-border-muted" />

      <div className="space-y-3 text-body-sm font-medium text-text-muted">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="text-text-strong">{total}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Taxa de Entrega</span>
          <span className="font-bold text-primary">Grátis</span>
        </div>
      </div>

      <Separator.Root className="my-5 h-px bg-border-muted" />

      <div className="flex items-center justify-between">
        <span className="text-card-title font-extrabold text-text-strong">Total</span>
        <strong className="text-card-title font-extrabold text-primary">
          {total}
        </strong>
      </div>

      <ConfirmOrderDialog total={total} />

      <p className="mt-5 flex items-center justify-center gap-1 text-caption font-medium text-text-muted">
        <LockClosedIcon className="h-3.5 w-3.5" />
        Pagamento Seguro
      </p>
    </aside>
  );
}

function ConfirmOrderDialog({ total }: { total: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover">
          Confirmar Pedido
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,430px)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-soft text-primary">
              <CheckCircledIcon className="h-6 w-6" />
            </div>

            <Dialog.Close asChild>
              <button
                aria-label="Fechar confirmação"
                className="grid h-9 w-9 place-items-center rounded-full text-primary-dark transition hover:bg-surface-hover"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Title className="mt-5 text-section-title font-extrabold leading-tight text-text-strong">
            Confirmar pedido?
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-body-sm font-medium leading-relaxed text-text-muted">
            Revise os dados antes de continuar. Ao confirmar, o pedido no valor
            de <strong className="text-accent">{total}</strong> será enviado
            para preparo.
          </Dialog.Description>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Dialog.Close asChild>
              <button className="h-11 rounded-lg border border-border-input bg-white text-button font-extrabold text-text-muted transition hover:bg-surface-checkout">
                Voltar e revisar
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button className="h-11 rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover">
                Sim, confirmar
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
