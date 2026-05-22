import { useEffect, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { CheckoutPage } from "./components/checkout/CheckoutPage";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { LoadingScreen } from "./components/loading/LoadingScreen";
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

function App() {
  const [currentScreen, setCurrentScreen] = useState<"menu" | "checkout">(
    "menu",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const { activeCategory, setActiveCategory } = useActiveCategory({
    categories,
    enabled: !isLoading && currentScreen === "menu",
  });
  const addToCart = useCartStore((state) => state.addItem);
  const cartCount = useCartStore(selectCartCount);
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const decrementCartItem = useCartStore((state) => state.decrementItem);
  const incrementCartItem = useCartStore((state) => state.incrementItem);
  const orderTotalCents = useCartStore(selectCartTotalCents);
  const removeCartItem = useCartStore((state) => state.removeItem);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 900);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setShowFloatingCart(window.scrollY > 220);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

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
            <Header cartCount={cartCount} />
            <CategoryNav
              activeCategory={activeCategory}
              categories={categories}
              onCategoryChange={setActiveCategory}
            />

            <main className="relative flex-1 bg-surface px-5 py-6 sm:px-8 lg:px-16 lg:py-7">
              <HeroBanner onAddToCart={addToCart} product={products[0]} />
              <PopularSection
                categories={categories}
                onAddToCart={addToCart}
                products={products}
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

export default App;
