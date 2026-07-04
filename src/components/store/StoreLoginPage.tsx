import { BackpackIcon, LockClosedIcon, PersonIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import type { FormEvent } from "react";
import { BrandLogo } from "../brand/BrandLogo";
import {
  storeCredentials,
  validateStoreCredentials,
  writeStoreSession,
} from "../../utils/storeAuth";

type StoreLoginPageProps = {
  onBackToMenu: () => void;
  onAuthenticated: () => void;
};

export function StoreLoginPage({
  onBackToMenu,
  onAuthenticated,
}: StoreLoginPageProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateStoreCredentials(login, password)) {
      setError("Login ou senha da loja inválidos.");
      return;
    }

    writeStoreSession();
    onAuthenticated();
  }

  return (
    <div className="grid min-h-screen bg-surface-checkout px-5 py-8 text-text-strong sm:px-8">
      <div className="mx-auto grid w-full max-w-315 items-center gap-8 lg:grid-cols-[1fr_430px]">
        <section className="hidden lg:block">
          <div className="mb-10">
            <BrandLogo />
          </div>
          <h1 className="max-w-150 text-display font-extrabold leading-tight">
            Painel da hamburgueria
          </h1>
          <p className="mt-5 max-w-125 text-body font-medium leading-relaxed text-text-muted">
            Receba pedidos do cardápio digital, acompanhe o preparo e marque o
            despacho em uma área separada do cliente.
          </p>
          <button
            className="mt-8 h-11 rounded-lg border border-border-input bg-white px-5 text-button font-extrabold text-primary-dark transition hover:bg-surface-hover"
            onClick={onBackToMenu}
            type="button"
          >
            Ver cardápio do cliente
          </button>
        </section>

        <form
          className="rounded-lg bg-white p-6 shadow-[0_18px_42px_rgba(94,54,30,0.12)] sm:p-8"
          onSubmit={handleSubmit}
        >
          <div className="mb-8 flex items-center justify-between gap-4">
            <BrandLogo />
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-white">
              <BackpackIcon className="h-5 w-5" />
            </span>
          </div>

          <h2 className="text-page-title font-extrabold leading-tight">
            Login da loja
          </h2>
          <p className="mt-2 text-body-sm font-medium text-text-muted">
            Entre para visualizar e atualizar os pedidos recebidos.
          </p>

          <label className="mt-7 block">
            <span className="mb-2 block text-caption font-extrabold text-text-strong">
              Login
            </span>
            <span className="relative block">
              <PersonIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <input
                className="h-12 w-full rounded-lg border border-border-input bg-surface px-12 text-body-sm font-medium text-text-strong outline-none transition placeholder:text-placeholder focus:border-primary focus:bg-white"
                onChange={(event) => {
                  setLogin(event.target.value);
                  setError("");
                }}
                placeholder={storeCredentials.login}
                type="email"
                value={login}
              />
            </span>
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-caption font-extrabold text-text-strong">
              Senha
            </span>
            <span className="relative block">
              <LockClosedIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <input
                className="h-12 w-full rounded-lg border border-border-input bg-surface px-12 text-body-sm font-medium text-text-strong outline-none transition placeholder:text-placeholder focus:border-primary focus:bg-white"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Senha da loja"
                type="password"
                value={password}
              />
            </span>
          </label>

          {error ? (
            <p className="mt-3 text-caption font-bold text-danger">{error}</p>
          ) : null}

          <button
            className="mt-6 h-12 w-full rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover"
            type="submit"
          >
            Entrar no painel
          </button>
        </form>
      </div>
    </div>
  );
}
