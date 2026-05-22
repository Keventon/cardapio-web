type MilkshakeIconProps = {
  className?: string;
};

export function MilkshakeIcon({ className }: MilkshakeIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 8h10l-1 11a2 2 0 0 1-2 1.8h-4A2 2 0 0 1 8 19L7 8Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M8 8c.35-2.25 2.05-3.8 4-3.8s3.65 1.55 4 3.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path d="M12 4.2V2.8" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M9 12h6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M10 16h4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
