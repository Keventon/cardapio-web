import { BackpackIcon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { BrandLogo } from "../brand/BrandLogo";
import { ProfileDialog } from "../profile/ProfileDialog";

type HeaderProps = {
  cartCount: number;
};

export function Header({ cartCount }: HeaderProps) {
  return (
    <header className="flex h-[86px] shrink-0 items-center justify-between border-b border-border-light bg-surface px-8 sm:px-14 lg:px-20">
      <a href="#">
        <BrandLogo />
      </a>

      <div className="flex items-center gap-6 text-primary-dark">
        <Dialog.Trigger asChild>
          <button
            aria-label="Abrir pedido"
            className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-surface-hover"
          >
            <BackpackIcon className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-micro font-extrabold text-white">
              {cartCount}
            </span>
          </button>
        </Dialog.Trigger>
        <ProfileDialog />
      </div>
    </header>
  );
}
