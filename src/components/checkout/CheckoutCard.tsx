import type { ReactNode } from "react";

type CheckoutCardProps = {
  children: ReactNode;
  icon: ReactNode;
  title: string;
};

export function CheckoutCard({ children, icon, title }: CheckoutCardProps) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_12px_32px_rgba(94,54,30,0.08)] sm:p-6">
      <h2 className="mb-5 flex items-center gap-2 text-card-title font-extrabold text-text-strong">
        <span className="text-accent">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
