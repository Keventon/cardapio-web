import { BackpackIcon, LockClosedIcon, PersonIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import type { FormEvent } from "react";
import { createStore, getStore, loginStoreUser } from "../../api/store";
import { getApiErrorMessage } from "../../api/http";
import { BrandLogo } from "../brand/BrandLogo";
import { writeStoreSession } from "../../utils/storeAuth";
import type { StoreSession } from "../../utils/storeAuth";

type StoreLoginPageProps = {
  onBackToMenu: () => void;
  onAuthenticated: (session: StoreSession) => void;
};

export function StoreLoginPage({
  onBackToMenu,
  onAuthenticated,
}: StoreLoginPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerCpf, setOwnerCpf] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        const normalizedCpf = ownerCpf.replace(/\D/g, "");
        const created = await createStore({
          name: storeName.trim(),
          owner: {
            cpf: normalizedCpf,
            email: login.trim(),
            name: ownerName.trim(),
            password,
          },
          slug: (storeSlug || storeName).trim().toLowerCase(),
        });
        const auth = await loginStoreUser({
          email: login.trim(),
          password,
        });
        authenticateStore({
          store: created.store,
          storeUser: auth.storeUser,
          token: auth.token,
        });
        return;
      }

      const auth = await loginStoreUser({ email: login.trim(), password });
      const store = await getStore(auth.storeUser.storeId);
      authenticateStore({
        store,
        storeUser: auth.storeUser,
        token: auth.token,
      });
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          mode === "register"
            ? "Não foi possível cadastrar a loja."
            : "Login ou senha da loja inválidos.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function authenticateStore(session: StoreSession) {
    writeStoreSession(session);
    onAuthenticated(session);
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
            {mode === "login" ? "Login da loja" : "Cadastrar loja"}
          </h2>
          <p className="mt-2 text-body-sm font-medium text-text-muted">
            {mode === "login"
              ? "Entre para visualizar e atualizar os pedidos recebidos."
              : "Crie a loja e entre automaticamente com o token da API."}
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-lg border border-border-input bg-surface p-1">
            <button
              className={`h-10 rounded-md text-button font-extrabold transition ${
                mode === "login"
                  ? "bg-primary text-white"
                  : "text-text-muted hover:bg-surface-hover"
              }`}
              onClick={() => {
                setMode("login");
                setError("");
              }}
              type="button"
            >
              Entrar
            </button>
            <button
              className={`h-10 rounded-md text-button font-extrabold transition ${
                mode === "register"
                  ? "bg-primary text-white"
                  : "text-text-muted hover:bg-surface-hover"
              }`}
              onClick={() => {
                setMode("register");
                setError("");
              }}
              type="button"
            >
              Cadastrar
            </button>
          </div>

          {mode === "register" ? (
            <>
              <label className="mt-7 block">
                <span className="mb-2 block text-caption font-extrabold text-text-strong">
                  Nome da loja
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-border-input bg-surface px-4 text-body-sm font-medium text-text-strong outline-none transition placeholder:text-placeholder focus:border-primary focus:bg-white"
                  onChange={(event) => {
                    setStoreName(event.target.value);
                    setStoreSlug(getSlugFromName(event.target.value));
                    setError("");
                  }}
                  placeholder="Ex: Fast Burguer"
                  value={storeName}
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-caption font-extrabold text-text-strong">
                  Slug do cardápio
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-border-input bg-surface px-4 text-body-sm font-medium text-text-strong outline-none transition placeholder:text-placeholder focus:border-primary focus:bg-white"
                  onChange={(event) => {
                    setStoreSlug(getSlugFromName(event.target.value));
                    setError("");
                  }}
                  placeholder="fast-burguer"
                  value={storeSlug}
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-caption font-extrabold text-text-strong">
                  Nome do dono
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-border-input bg-surface px-4 text-body-sm font-medium text-text-strong outline-none transition placeholder:text-placeholder focus:border-primary focus:bg-white"
                  onChange={(event) => {
                    setOwnerName(event.target.value);
                    setError("");
                  }}
                  placeholder="Seu nome"
                  value={ownerName}
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-caption font-extrabold text-text-strong">
                  CPF do dono
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-border-input bg-surface px-4 text-body-sm font-medium text-text-strong outline-none transition placeholder:text-placeholder focus:border-primary focus:bg-white"
                  inputMode="numeric"
                  maxLength={14}
                  onChange={(event) => {
                    setOwnerCpf(formatCpf(event.target.value));
                    setError("");
                  }}
                  placeholder="000.000.000-00"
                  value={ownerCpf}
                />
              </label>
            </>
          ) : null}

          <label className={mode === "register" ? "mt-4 block" : "mt-7 block"}>
            <span className="mb-2 block text-caption font-extrabold text-text-strong">
              {mode === "login" ? "Login" : "E-mail do dono"}
            </span>
            <span className="relative block">
              <PersonIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <input
                className="h-12 w-full rounded-lg border border-border-input bg-surface px-12 text-body-sm font-medium text-text-strong outline-none transition placeholder:text-placeholder focus:border-primary focus:bg-white"
                onChange={(event) => {
                  setLogin(event.target.value);
                  setError("");
                }}
                placeholder="loja@email.com"
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
            className="mt-6 h-12 w-full rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border-input"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? mode === "register"
                ? "Cadastrando..."
                : "Entrando..."
              : mode === "register"
                ? "Cadastrar e entrar"
                : "Entrar no painel"}
          </button>
        </form>
      </div>
    </div>
  );
}

function formatCpf(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function getSlugFromName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
