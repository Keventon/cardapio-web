const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

export function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function getOrderItemTotalCents({
  extras,
  quantity,
  unitPriceCents,
}: {
  extras: { priceCents: number }[];
  quantity: number;
  unitPriceCents: number;
}) {
  const extrasTotal = extras.reduce((total, extra) => total + extra.priceCents, 0);

  return (unitPriceCents + extrasTotal) * quantity;
}
