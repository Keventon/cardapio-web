type BurgerIconProps = {
  className?: string;
};

export function BurgerIcon({ className }: BurgerIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 10.25C5.45 6.95 8.2 5 12 5s6.55 1.95 7 5.25H5Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M4.75 13.25h14.5M5.75 16.25h12.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M7 19h10c1.1 0 2-.9 2-2H5c0 1.1.9 2 2 2Z"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M9 8h.01M12 7h.01M15 8h.01"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
