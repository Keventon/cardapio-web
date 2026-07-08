import * as Switch from "@radix-ui/react-switch";

type ToggleProps = {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
};

export function Toggle({
  checked,
  disabled = false,
  label,
  onCheckedChange,
}: ToggleProps) {
  return (
    <Switch.Root
      aria-label={label}
      checked={checked}
      className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-border-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary"
      disabled={disabled}
      onCheckedChange={onCheckedChange}
    >
      <Switch.Thumb className="inline-block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-4.5" />
    </Switch.Root>
  );
}
