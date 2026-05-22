import * as Tooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

type IconButtonProps = {
  children: ReactNode;
  label: string;
};

export function IconButton({ children, label }: IconButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          aria-label={label}
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-surface-hover"
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="rounded bg-text-main px-2 py-1 text-caption font-semibold text-white shadow"
          sideOffset={6}
        >
          {label}
          <Tooltip.Arrow className="fill-text-main" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
