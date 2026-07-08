import { ArrowRightIcon, BackpackIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listStores } from "../../api/stores";
import type { ApiStore } from "../../types/api";
import { resolveStoreImageUrl } from "../../utils/imageUrl";
import { BrandLogo } from "../brand/BrandLogo";

export function StoreDirectoryPage() {
  const [stores, setStores] = useState<ApiStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isIgnored = false;

    listStores()
      .then((data) => {
        if (!isIgnored) {
          setStores(data);
          setLoadError("");
        }
      })
      .catch(() => {
        if (!isIgnored) {
          setLoadError("Não foi possível carregar as lojas.");
        }
      })
      .finally(() => {
        if (!isIgnored) {
          setIsLoading(false);
        }
      });

    return () => {
      isIgnored = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface-page text-text-main">
      <div className="mx-auto flex min-h-screen w-full max-w-375 flex-col bg-surface shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-8 lg:px-16">
          <BrandLogo />
          <Link
            className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-border-input bg-white px-4 text-caption font-extrabold text-primary-dark transition hover:bg-surface-hover"
            to="/loja"
          >
            Área da loja
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-16">
          <h1 className="text-page-title font-extrabold leading-tight text-text-strong">
            Lojas disponíveis
          </h1>
          <p className="mt-1 text-body-sm font-medium text-text-muted">
            Escolha uma loja para ver o cardápio e fazer seu pedido.
          </p>

          {isLoading ? (
            <p className="mt-10 text-body-sm font-semibold text-text-muted">
              Carregando lojas...
            </p>
          ) : loadError ? (
            <p className="mt-10 text-body-sm font-semibold text-danger">
              {loadError}
            </p>
          ) : stores.length === 0 ? (
            <p className="mt-10 text-body-sm font-semibold text-text-muted">
              Nenhuma loja cadastrada ainda.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <Link
                  className="group flex min-w-0 items-center gap-4 rounded-lg border border-border-muted bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                  key={store.id}
                  to={`/${store.slug}`}
                >
                  {store.logoUrl ? (
                    <img
                      alt={store.name}
                      className="h-14 w-14 shrink-0 rounded-full object-cover"
                      src={resolveStoreImageUrl(store.logoUrl)}
                    />
                  ) : (
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-surface-soft text-primary-dark">
                      <BackpackIcon className="h-6 w-6" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-card-title font-extrabold text-text-strong">
                      {store.name}
                    </h2>
                    <p className="mt-1 truncate text-caption font-medium text-text-muted">
                      /{store.slug}
                    </p>
                  </div>

                  <ArrowRightIcon className="h-5 w-5 shrink-0 text-border-input transition group-hover:text-primary" />
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
