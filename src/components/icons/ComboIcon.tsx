import { BurgerIcon } from "./BurgerIcon";

type ComboIconProps = {
  className?: string;
};

export function ComboIcon({ className }: ComboIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <BurgerIcon className="h-3.5 w-3.5" />
      <path
        d="M15 7h4l-.7 8.3A2 2 0 0 1 16.3 17h-.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M14.5 7h5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M16 7 17 4h2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path
        d="M5 17h8M6 20h10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}
