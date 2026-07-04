import { useEffect, useMemo, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { CheckoutPage } from "./components/checkout/CheckoutPage";
import { Footer } from "./components/layout/Footer";
import { LoadingScreen } from "./components/loading/LoadingScreen";
import { CartDrawer } from "./components/menu/CartDrawer";
import { CategoryNav } from "./components/menu/CategoryNav";
import { FloatingCartButton } from "./components/menu/FloatingCartButton";
import { HeroBanner } from "./components/menu/HeroBanner";
import { PopularSection } from "./components/menu/PopularSection";
import { StoreLoginPage } from "./components/store/StoreLoginPage";
import { StoreOrdersPage } from "./components/store/StoreOrdersPage";
import { categories, products } from "./data/menu";
import { useActiveCategory } from "./hooks/useActiveCategory";
import {
  selectCartCount,
  selectCartTotalCents,
  useCartStore,
} from "./stores/cartStore";
import { readStoreSession } from "./utils/storeAuth";

type AppRoute = "menu" | "store";

function App() {
  const [appRoute, setAppRoute] = useState<AppRoute>(getCurrentRoute);
  const [currentScreen, setCurrentScreen] = useState<"menu" | "checkout">(
    "menu",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [isStoreAuthenticated, setIsStoreAuthenticated] =
    useState(readStoreSession);
  const { activeCategory, setActiveCategory } = useActiveCategory({
    categories,
    enabled: !isLoading && appRoute === "menu" && currentScreen === "menu",
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
    const timer = window.setTimeout(() => setIsLoading(false), 900);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleRouteChange() {
      setAppRoute(getCurrentRoute());
      setCurrentScreen("menu");
    }

    window.addEventListener("popstate", handleRouteChange);

    return () => window.removeEventListener("popstate", handleRouteChange);
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

  if (appRoute === "store") {
    const navigateToMenu = () => navigateTo("/", setAppRoute);

    if (!isStoreAuthenticated) {
      return (
        <StoreLoginPage
          onAuthenticated={() => setIsStoreAuthenticated(true)}
          onBackToMenu={navigateToMenu}
        />
      );
    }

    return (
      <StoreOrdersPage
        onBackToMenu={navigateToMenu}
        onLogout={() => setIsStoreAuthenticated(false)}
      />
    );
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

function getCurrentRoute(): AppRoute {
  return window.location.pathname === "/loja" ? "store" : "menu";
}

function navigateTo(path: string, setAppRoute: (route: AppRoute) => void) {
  window.history.pushState(null, "", path);
  setAppRoute(getCurrentRoute());
  window.scrollTo({ left: 0, top: 0 });
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default App;
