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
import { categories, orderItems, orderTotal, products } from "./data/menu";
import type { MenuCategory } from "./types/menu";

function App() {
  const [currentScreen, setCurrentScreen] = useState<"menu" | "checkout">(
    "menu",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] =
    useState<MenuCategory["id"]>("all");
  const [showFloatingCart, setShowFloatingCart] = useState(false);

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
          items={orderItems}
          onBack={() => setCurrentScreen("menu")}
          total={orderTotal}
        />
      </Tooltip.Provider>
    );
  }

  return (
    <Tooltip.Provider delayDuration={120}>
      <CartDrawer
        items={orderItems}
        onCheckout={() => setCurrentScreen("checkout")}
        total={orderTotal}
      >
        <div className="min-h-screen bg-surface-page text-text-main">
          <div className="mx-auto flex min-h-screen max-w-375 flex-col bg-surface shadow-2xl">
            <Header cartCount={orderItems.length} />
            <CategoryNav
              activeCategory={activeCategory}
              categories={categories}
              onCategoryChange={setActiveCategory}
            />

            <main className="relative flex-1 bg-surface px-5 py-6 sm:px-8 lg:px-16 lg:py-7">
              <HeroBanner product={products[0]} />
              <PopularSection categories={categories} products={products} />
            </main>

            <Footer />
            <FloatingCartButton count={orderItems.length} visible={showFloatingCart} />
          </div>
        </div>
      </CartDrawer>
    </Tooltip.Provider>
  );
}

export default App;
