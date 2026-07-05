# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm ci           # install dependencies
npm run dev      # start Vite dev server (http://localhost:5173)
npm run lint     # eslint over the whole repo
npm run build    # tsc -b (project references) + vite build
npm run preview  # preview a production build
```

There is no test runner configured in this project (no test script, no test files).

## Architecture

Fast Burguer is a single-page digital menu (React 19 + TypeScript + Vite + Tailwind v4). There is no router: `App.tsx` is the sole composition root and switches between screens with plain state and if/else returns rather than JSX conditionals, so the whole page tree for a screen mounts/unmounts as a unit. Two independent axes of "screen" state live in `App.tsx`:

- `appRoute` (`"menu" | "store"`) — driven by `window.location.pathname` (`/loja` → `"store"`) and kept in sync with browser back/forward via a `popstate` listener. `getCurrentRoute()`/`navigateTo()` at the bottom of `App.tsx` are the only navigation primitives; there's no history library.
- `currentScreen` (`"menu" | "checkout"`) — in-memory only, resets to `"menu"` on every route change.

When adding a new screen, follow this pattern: add/extend the union type, add an `if` block in `App.tsx` that returns the new component, and reset dependent state (e.g. `currentScreen`) in the `popstate` handler if the new screen needs it.

### Two independent apps under one root

1. **Customer menu → checkout** (`appRoute === "menu"`): `CategoryNav` + `HeroBanner` + `PopularSection` for browsing, `CartDrawer` as a persistent slide-over, `CheckoutPage` for the order form. Cart state lives in the Zustand store `stores/cartStore.ts` (`items`, `addItem/incrementItem/decrementItem/removeItem/clear`, plus `selectCartCount`/`selectCartTotalCents` selectors). Cart item identity is a composite key of `productId::sortedExtraNames::instructions`, so the same product with different extras/notes is a distinct line item that stacks quantity when it matches exactly.
2. **Store/admin panel** (`appRoute === "store"`, path `/loja`): gated by `readStoreSession()`/`writeStoreSession()` in `utils/storeAuth.ts` (a `localStorage` flag, not a real auth token — credentials are hardcoded in the same file as `storeCredentials`). `StoreLoginPage` → `StoreOrdersPage`, a kanban-style board (`pending → preparing → ready → finished`) driven by `utils/orderStorage.ts`.

These two apps are connected only through `localStorage`: `CheckoutPage` calls `createStoreOrderFromCheckout` + `addStoreOrder` (`utils/orderStorage.ts`) on order confirmation, and `StoreOrdersPage` reads that same key (`fast-burguer-store-orders`) and also listens for the `storage` event so a second tab/window picks up new orders live. This is the seam that will need to change first when wiring up a real backend/API — `orderStorage.ts`, `profileStorage.ts`, and `storeAuth.ts` are the three `localStorage`-backed modules standing in for API calls today.

### Data & domain types

- `data/menu.ts` is the static product/category catalog (hardcoded, no CMS/API yet). `types/menu.ts` defines the shared domain shapes (`Product`, `OrderItem`, `ProductExtra`, `MenuCategory`).
- `types/storeOrder.ts` / `types/profile.ts` define the store-order and customer-profile shapes persisted to `localStorage`.
- Money is always handled as integer cents (`priceCents`, `totalCents`, etc.); `utils/currency.ts` has the only formatting/parsing logic (`formatCurrency`, `parseCurrencyToCents`, `formatCurrencyInput`, `getOrderItemTotalCents`) — use these instead of ad hoc `toFixed`/string math.

### Checkout form

`forms/checkoutForm.ts` builds a Zod schema factory (`createCheckoutSchema(totalCents)`) rather than a static schema, because cash-payment change validation needs the live cart total. Conditional-required fields (delivery address fields, cash change fields) are enforced via `.superRefine`, not `.optional()`/branching schemas. `CheckoutPage` wires this up with `react-hook-form` + `@hookform/resolvers/zod`, and integrates address autofill via `hooks/useCepLookup.ts` → `services/viaCep.ts` (ViaCEP lookup, abortable per keystroke via `AbortController`).

### Styling

Tailwind v4 with CSS-based theme config in `src/style.css` (`@theme` block) — all design tokens (colors, font sizes) are custom-named (`text-page-title`, `bg-surface-checkout`, `text-text-muted`, etc.), not Tailwind's default palette/scale. Check `style.css` before inventing a new color/size utility; prefer an existing token.
