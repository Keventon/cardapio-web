import { BrandLogo } from "../brand/BrandLogo";

export function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-page px-6 text-text-main">
      <div className="flex flex-col items-center text-center">
        <BrandLogo />
        <div className="mt-8 h-12 w-12 animate-spin rounded-full border-4 border-border-muted border-t-primary" />
        <p className="mt-5 text-body-sm font-semibold text-text-muted">
          Carregando...
        </p>
      </div>
    </div>
  );
}
