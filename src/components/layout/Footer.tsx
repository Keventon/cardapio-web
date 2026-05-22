import { BrandLogo } from "../brand/BrandLogo";

export function Footer() {
  return (
    <footer className="grid gap-6 bg-surface-footer px-8 py-10 sm:px-14 lg:grid-cols-[220px_1fr_auto] lg:px-20">
      <a href="#">
        <BrandLogo stacked />
      </a>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-body-sm font-medium text-text-muted">
        <a href="#">Política de Privacidade</a>
        <a href="#">Termos de Serviço</a>
        <a href="#">Acessibilidade</a>
        <a href="#">Fale Conosco</a>
      </div>

      <p className="text-body-sm leading-relaxed text-text-muted">
        © 2024 Fast Burguer. Todos os direitos reservados.
      </p>
    </footer>
  );
}
