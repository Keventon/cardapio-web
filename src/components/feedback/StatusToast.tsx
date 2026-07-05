import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

type StatusToastProps = {
  message: string;
  title: string;
  visible: boolean;
};

export function StatusToast({ message, title, visible }: StatusToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-50 w-[min(calc(100vw-2rem),420px)] -translate-x-1/2 rounded-lg border border-border-light bg-white px-4 py-3 text-left shadow-[0_16px_42px_rgba(44,29,22,0.18)]"
      role="status"
    >
      <div className="flex gap-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-100 text-danger">
          <ExclamationTriangleIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-body-sm font-extrabold text-text-strong">{title}</p>
          <p className="mt-1 text-caption font-semibold leading-relaxed text-text-muted">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
