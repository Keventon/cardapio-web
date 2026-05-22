import { BrandLogo } from "../brand/BrandLogo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="grid gap-6 bg-surface-footer px-8 py-10 sm:px-14 lg:grid-cols-[220px_1fr_auto] lg:px-20">
      <a href="#menu">
        <BrandLogo stacked />
      </a>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-body-sm font-medium text-text-muted">
        <a href="/privacidade">Política de Privacidade</a>
        <a href="/termos">Termos de Serviço</a>
        <a href="#menu">Acessibilidade</a>
        <a href="mailto:contato@fastburguer.com">Fale Conosco</a>
      </div>

      <p className="text-body-sm leading-relaxed text-text-muted">
        © {currentYear} Fast Burguer. Todos os direitos reservados.
      </p>
    </footer>
  );
}
