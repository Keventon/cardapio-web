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

export function parseCurrencyToCents(value: string) {
  const normalizedValue = value.trim();
  const decimalMatch = normalizedValue.match(/^(.*)[,.](\d{1,2})$/);

  if (decimalMatch) {
    const reais = decimalMatch[1].replace(/\D/g, "");
    const cents = decimalMatch[2].padEnd(2, "0");

    return Number(`${reais || "0"}${cents}`);
  }

  const digits = normalizedValue.replace(/\D/g, "");

  if (!digits) {
    return 0;
  }

  return Number(digits) * 100;
}

export function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return formatCurrency(Number(digits));
}
