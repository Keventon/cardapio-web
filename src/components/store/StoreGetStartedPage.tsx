import { BackpackIcon } from "@radix-ui/react-icons";
import { BrandLogo } from "../brand/BrandLogo";

type StoreGetStartedPageProps = {
  onLogin: () => void;
  onSignUp: () => void;
};

export function StoreGetStartedPage({
  onLogin,
  onSignUp,
}: StoreGetStartedPageProps) {
  return (
    <div className="grid min-h-screen bg-surface-checkout px-5 py-8 text-text-strong sm:px-8">
      <div className="mx-auto grid w-full max-w-315 items-center gap-8 lg:grid-cols-[1fr_430px]">
        <section className="hidden lg:block">
          <div className="mb-10">
            <BrandLogo />
          </div>
          <h1 className="max-w-150 text-display font-extrabold leading-tight">
            Painel da loja
          </h1>
          <p className="mt-5 max-w-125 text-body font-medium leading-relaxed text-text-muted">
            Receba pedidos do cardápio digital, acompanhe o preparo e marque o
            despacho em uma área separada do cliente.
          </p>
        </section>

        <div className="rounded-lg bg-white p-6 shadow-[0_18px_42px_rgba(94,54,30,0.12)] sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <BrandLogo />
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-white">
              <BackpackIcon className="h-5 w-5" />
            </span>
          </div>

          <h2 className="text-page-title font-extrabold leading-tight">
            Painel da loja
          </h2>
          <p className="mt-2 text-body-sm font-medium text-text-muted">
            Crie a conta da sua loja ou entre pra gerenciar seus pedidos.
          </p>

          <button
            className="mt-7 h-12 w-full rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover"
            onClick={onSignUp}
            type="button"
          >
            Criar conta da loja
          </button>

          <button
            className="mt-3 h-12 w-full rounded-lg border border-border-input bg-white text-button font-extrabold text-primary-dark transition hover:bg-surface-hover"
            onClick={onLogin}
            type="button"
          >
            Já tenho conta
          </button>
        </div>
      </div>
    </div>
  );
}
