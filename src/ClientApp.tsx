import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { CheckoutPage } from "./components/checkout/CheckoutPage";
import { Footer } from "./components/layout/Footer";
import { CartDrawer } from "./components/menu/CartDrawer";
import { CategoryNav } from "./components/menu/CategoryNav";
import { FloatingCartButton } from "./components/menu/FloatingCartButton";
import { HeroBanner } from "./components/menu/HeroBanner";
import { PopularSection } from "./components/menu/PopularSection";
import { StatusToast } from "./components/feedback/StatusToast";
import { LoadingScreen } from "./components/loading/LoadingScreen";
import { getStoreMenu } from "./api/menu";
import { mapStoreMenuToClientMenu } from "./mappers/menuMapper";
import { useActiveCategory } from "./hooks/useActiveCategory";
import { useUserClient } from "./hooks/useUserClient";
import {
  selectCartCount,
  selectCartTotalCents,
  useCartStore,
} from "./stores/cartStore";
import type { MenuCategory, Product } from "./types/menu";

function ClientApp() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated: isClientAuthenticated } = useUserClient();
  const [currentScreen, setCurrentScreen] = useState<"menu" | "checkout">(
    "menu",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [menuProducts, setMenuProducts] = useState<Product[]>([]);
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [menuError, setMenuError] = useState("");
  const [isMenuOffline, setIsMenuOffline] = useState(false);
  const { activeCategory, setActiveCategory } = useActiveCategory({
    categories: menuCategories,
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
  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    if (!normalizedQuery) {
      return menuProducts;
    }

    return menuProducts.filter((product) =>
      normalizeSearchText(product.name).includes(normalizedQuery),
    );
  }, [menuProducts, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: number | undefined;

    async function loadMenu() {
      try {
        const menu = await getStoreMenu(slug);
        const mappedMenu = mapStoreMenuToClientMenu(menu);

        if (!isMounted) {
          return;
        }

        setMenuCategories(mappedMenu.categories);
        setMenuProducts(mappedMenu.products);
        setStoreId(mappedMenu.store.id);
        setStoreName(mappedMenu.store.name);
        setMenuError("");
        setIsMenuOffline(false);
        setIsLoading(false);
      } catch {
        if (!isMounted) {
          return;
        }

        setMenuError("A API parece estar fora do ar. Tentando reconectar...");
        setIsMenuOffline(true);
        retryTimeout = window.setTimeout(loadMenu, 5000);
      }
    }

    loadMenu();

    return () => {
      isMounted = false;
      window.clearTimeout(retryTimeout);
    };
  }, [slug]);

  useEffect(() => {
    function handleScroll() {
      setShowFloatingCart(window.scrollY > 220);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <>
        <LoadingScreen />
        <StatusToast
          message={menuError}
          title="Cardápio indisponível"
          visible={isMenuOffline}
        />
      </>
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
          storeId={storeId}
          totalCents={orderTotalCents}
        />
      </Tooltip.Provider>
    );
  }

  return (
    <Tooltip.Provider delayDuration={120}>
      <CartDrawer
        isClientAuthenticated={isClientAuthenticated}
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
              categories={menuCategories}
              onCategoryChange={setActiveCategory}
              onSearchChange={setSearchQuery}
              searchQuery={searchQuery}
              storeName={storeName}
            />

            <main className="relative flex-1 bg-surface px-5 py-6 sm:px-8 lg:px-16 lg:py-7">
              {searchQuery.trim() || !menuProducts[0] ? null : (
                <HeroBanner onAddToCart={addToCart} product={menuProducts[0]} />
              )}
              <PopularSection
                categories={menuCategories}
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
