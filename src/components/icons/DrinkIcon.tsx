type DrinkIconProps = {
  className?: string;
};

export function DrinkIcon({ className }: DrinkIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 7h10l-1.2 12.2A2 2 0 0 1 14.8 21H11.2a2 2 0 0 1-1.99-1.8L8 7Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M7 7h12" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M11 7 13 3h4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M9.4 11h7.2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
