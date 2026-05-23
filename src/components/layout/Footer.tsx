import { BrandLogo } from "../brand/BrandLogo";

export function Footer() {
  return (
    <footer className="grid gap-6 bg-surface-page px-8 py-10 text-center sm:px-14 lg:grid-cols-[220px_1fr_220px] lg:items-center lg:px-20">
      <a href="#menu">
        <BrandLogo stacked />
      </a>

      <p className="text-body-sm font-medium leading-relaxed text-text-muted">
        © 2026 Fast Burguer. Todos os direitos reservados.
      </p>

      <span aria-hidden="true" />
    </footer>
  );
}
