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
import type { AddToCartOptions, MenuCategory, OrderItem, Product } from "./types/menu";
import { getOrderItemTotalCents } from "./utils/currency";

function App() {
  const [currentScreen, setCurrentScreen] = useState<"menu" | "checkout">(
    "menu",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] =
    useState<MenuCategory["id"]>("all");
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const orderTotalCents = cartItems.reduce(
    (total, item) => total + getOrderItemTotalCents(item),
    0,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 900);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setShowFloatingCart(window.scrollY > 220);

      const visibleCategory = categories
        .filter((category) => category.id !== "all")
        .findLast((category) => {
          const section = document.getElementById(category.id);

          return section ? section.getBoundingClientRect().top <= 170 : false;
        });

      setActiveCategory(visibleCategory?.id ?? "all");
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function addToCart(product: Product, options: AddToCartOptions) {
    const instructions = options.instructions.trim();
    const extras = [...options.extras].sort((first, second) =>
      first.name.localeCompare(second.name),
    );
    const id = [
      product.id,
      extras.map((extra) => extra.name).join("|"),
      instructions,
    ].join("::");

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + options.quantity }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          extras,
          id,
          instructions,
          name: product.name,
          quantity: options.quantity,
          unitPriceCents: product.priceCents,
        },
      ];
    });
  }

  function decrementCartItem(id: string) {
    setCartItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.id !== id) {
          return [item];
        }

        if (item.quantity === 1) {
          return [];
        }

        return [{ ...item, quantity: item.quantity - 1 }];
      }),
    );
  }

  function incrementCartItem(id: string) {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function removeCartItem(id: string) {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

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
            setCartItems([]);
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
        <div className="min-h-screen overflow-x-hidden bg-surface-page text-text-main">
          <div className="mx-auto flex min-h-screen w-full max-w-375 flex-col overflow-x-hidden bg-surface shadow-2xl">
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
