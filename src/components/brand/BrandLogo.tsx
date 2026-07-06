import { BurgerIcon } from "../icons/BurgerIcon";

type BrandLogoProps = {
  stacked?: boolean;
};

export function BrandLogo({ stacked = false }: BrandLogoProps) {
  return (
    <span className="inline-flex items-center gap-2 text-brand font-extrabold leading-tight text-primary-dark">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-soft text-primary-dark">
        <BurgerIcon className="h-5 w-5" />
      </span>
      <span>
        Hambre
        {stacked ? <br /> : " "}
      </span>
    </span>
  );
}
