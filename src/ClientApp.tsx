import { useEffect, useMemo, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { CheckoutPage } from "./components/checkout/CheckoutPage";
import { Footer } from "./components/layout/Footer";
import { CartDrawer } from "./components/menu/CartDrawer";
import { CategoryNav } from "./components/menu/CategoryNav";
import { FloatingCartButton } from "./components/menu/FloatingCartButton";
import { HeroBanner } from "./components/menu/HeroBanner";
import { PopularSection } from "./components/menu/PopularSection";
import { categories, products } from "./data/menu";
import { useActiveCategory } from "./hooks/useActiveCategory";
import {
  selectCartCount,
  selectCartTotalCents,
  useCartStore,
} from "./stores/cartStore";

function ClientApp() {
  const [currentScreen, setCurrentScreen] = useState<"menu" | "checkout">(
    "menu",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const { activeCategory, setActiveCategory } = useActiveCategory({
    categories,
    enabled: currentScreen === "menu",
  });
  const addToCart = useCartStore((state) => state.addItem);
  const cartCount = useCartStore(selectCartCount);
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const decrementCartItem = useCartStore((state) => state.decrementItem);
  const incrementCartItem = useCartStore((state) => state.incrementItem);
  const orderTotalCents = useCartStore(selectCartTotalCents);
  const removeCartItem = useCartStore((state) => state.removeItem);
  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) =>
      normalizeSearchText(product.name).includes(normalizedQuery),
    );
  }, [searchQuery]);

  useEffect(() => {
    function handleScroll() {
      setShowFloatingCart(window.scrollY > 220);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (currentScreen === "checkout") {
    return (
      <Tooltip.Provider delayDuration={120}>
        <CheckoutPage
          items={cartItems}
          onBack={() => setCurrentScreen("menu")}
          onOrderConfirmed={() => {
            clearCart();
            setCurrentScreen("menu");
          }}
          totalCents={orderTotalCents}
        />
      </Tooltip.Provider>
    );
  }

  return (
    <Tooltip.Provider delayDuration={120}>
      <CartDrawer
        items={cartItems}
        onDecrementItem={decrementCartItem}
        onCheckout={() => setCurrentScreen("checkout")}
        onIncrementItem={incrementCartItem}
        onRemoveItem={removeCartItem}
        totalCents={orderTotalCents}
      >
        <div className="min-h-screen overflow-x-clip bg-surface-page text-text-main">
          <div className="mx-auto flex min-h-screen w-full max-w-375 flex-col overflow-x-clip bg-surface shadow-2xl">
            <CategoryNav
              activeCategory={activeCategory}
              cartCount={cartCount}
              categories={categories}
              onCategoryChange={setActiveCategory}
              onSearchChange={setSearchQuery}
              searchQuery={searchQuery}
            />

            <main className="relative flex-1 bg-surface px-5 py-6 sm:px-8 lg:px-16 lg:py-7">
              {searchQuery.trim() ? null : (
                <HeroBanner onAddToCart={addToCart} product={products[0]} />
              )}
              <PopularSection
                categories={categories}
                onAddToCart={addToCart}
                products={filteredProducts}
                searchQuery={searchQuery}
              />
            </main>

            <Footer />
            <FloatingCartButton count={cartCount} visible={showFloatingCart} />
          </div>
        </div>
      </CartDrawer>
    </Tooltip.Provider>
  );
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default ClientApp;
