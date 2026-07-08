import { BackpackIcon, ExitIcon, IdCardIcon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStoreAuthStore } from "../../stores/storeAuthStore";

type StoreSidebarProps = {
  onLogout: () => void;
};

export function StoreSidebar({ onLogout }: StoreSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const storeUser = useStoreAuthStore((state) => state.storeUser);
  const storeName = storeUser?.storeName;

  return (
    <aside className="border-b border-border-light bg-white xl:flex xl:min-h-screen xl:flex-col xl:border-b-0 xl:border-r">
      <div className="flex h-16 items-center gap-3 border-b border-border-light px-4 sm:px-6 xl:h-20">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-[1rem] font-extrabold text-white">
          {(storeName ?? "Loja").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[1rem] font-extrabold text-text-strong">
            {storeName ?? "Loja"}
          </p>
          <p className="text-caption font-bold text-primary">Área da loja</p>
        </div>
        <button
          aria-label="Sair"
          className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full text-text-muted transition hover:bg-surface-checkout"
          onClick={onLogout}
          type="button"
        >
          <ExitIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6 xl:block xl:space-y-2 xl:overflow-visible">
        <SidebarItem
          active={location.pathname.startsWith("/loja/pedidos")}
          icon={<BackpackIcon className="h-5 w-5" />}
          label="Pedidos"
          onClick={() => navigate("/loja/pedidos")}
        />
        <SidebarItem
          active={location.pathname.startsWith("/loja/cardapio")}
          icon={<IdCardIcon className="h-5 w-5" />}
          label="Cardápio"
          onClick={() => navigate("/loja/cardapio")}
        />
        {storeUser?.storeSlug ? (
          <a
            className="flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-body-sm font-extrabold text-text-muted transition hover:bg-surface-checkout xl:w-full"
            href={`/${storeUser.storeSlug}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <IdCardIcon className="h-5 w-5" />
            Ver loja
          </a>
        ) : null}
      </nav>
    </aside>
  );
}

function SidebarItem({
  active = false,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-body-sm font-extrabold transition xl:w-full ${
        active ? "bg-primary text-white" : "text-text-muted hover:bg-surface-checkout"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
