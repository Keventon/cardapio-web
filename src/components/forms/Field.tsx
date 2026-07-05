import type { UseFormRegisterReturn } from "react-hook-form";

type FieldProps = {
  className?: string;
  error?: string;
  label: string;
  onChange?: (value: string) => void;
  placeholder: string;
  registration?: UseFormRegisterReturn;
  type?: string;
  value?: string;
};

export function Field({
  className = "",
  error,
  label,
  onChange,
  placeholder,
  registration,
  type = "text",
  value,
}: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-caption font-extrabold text-text-strong">
        {label}
      </span>
      <input
        aria-invalid={error ? "true" : "false"}
        className="h-12 w-full rounded-lg border border-border-input bg-surface px-4 text-body-sm font-medium text-text-strong outline-none transition placeholder:text-placeholder focus:border-primary focus:bg-white aria-invalid:border-danger"
        placeholder={placeholder}
        type={type}
        {...registration}
        onChange={(event) => {
          registration?.onChange(event);
          onChange?.(event.target.value);
        }}
        value={value}
      />
      {error ? (
        <span className="mt-2 block text-caption font-bold text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}
