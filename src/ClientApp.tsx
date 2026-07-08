import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
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
import type { AddToCartOptions, MenuCategory, Product } from "./types/menu";

type CachedMenu = {
  categories: MenuCategory[];
  products: Product[];
  storeId: string;
  storeName: string;
};

// Keeps the last loaded menu per slug so coming back from /checkout (a
// separate route that remounts this component) doesn't flash the loading
// screen; the effect still revalidates in the background.
const menuCache = new Map<string, CachedMenu>();

function ClientApp() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated: isClientAuthenticated } = useUserClient();
  const cachedMenu = slug ? menuCache.get(slug) : undefined;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [isLoading, setIsLoading] = useState(!cachedMenu);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(
    cachedMenu?.categories ?? [],
  );
  const [menuProducts, setMenuProducts] = useState<Product[]>(
    cachedMenu?.products ?? [],
  );
  const [storeId, setStoreId] = useState(cachedMenu?.storeId ?? "");
  const [storeName, setStoreName] = useState(cachedMenu?.storeName ?? "");
  const [menuError, setMenuError] = useState("");
  const [isMenuOffline, setIsMenuOffline] = useState(false);
  const [showCartClearedNotice, setShowCartClearedNotice] = useState(false);
  const [addedToCartNotice, setAddedToCartNotice] = useState("");
  const addedNoticeTimeoutRef = useRef<number | undefined>(undefined);
  const { activeCategory, setActiveCategory } = useActiveCategory({
    categories: menuCategories,
    enabled: !isLoading,
  });
  const addToCart = useCartStore((state) => state.addItem);
  const cartCount = useCartStore(selectCartCount);
  const cartItems = useCartStore((state) => state.items);
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
    let noticeTimeout: number | undefined;

    async function loadMenu() {
      try {
        const menu = await getStoreMenu(slug);
        const mappedMenu = mapStoreMenuToClientMenu(menu);

        if (!isMounted) {
          return;
        }

        // The cart belongs to one store at a time: entering another store's
        // menu discards the previous items, with a notice to the customer.
        if (slug && useCartStore.getState().claimStore(slug)) {
          setShowCartClearedNotice(true);
          noticeTimeout = window.setTimeout(
            () => setShowCartClearedNotice(false),
            6000,
          );
        }

        if (slug) {
          menuCache.set(slug, {
            categories: mappedMenu.categories,
            products: mappedMenu.products,
            storeId: mappedMenu.store.id,
            storeName: mappedMenu.store.name,
          });
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
      window.clearTimeout(noticeTimeout);
    };
  }, [slug]);

  function handleAddToCart(product: Product, options: AddToCartOptions) {
    addToCart(product, options);
    setAddedToCartNotice(`${options.quantity}x ${product.name}`);
    window.clearTimeout(addedNoticeTimeoutRef.current);
    addedNoticeTimeoutRef.current = window.setTimeout(
      () => setAddedToCartNotice(""),
      2500,
    );
  }

  useEffect(() => {
    return () => window.clearTimeout(addedNoticeTimeoutRef.current);
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

  return (
    <Tooltip.Provider delayDuration={120}>
      <CartDrawer
        isClientAuthenticated={isClientAuthenticated}
        items={cartItems}
        onDecrementItem={decrementCartItem}
        onCheckout={() =>
          navigate(`/${slug}/checkout`, {
            // The cart drawer is open, so the top history entry is its
            // sentinel (see DrawerBackHandler); replacing it keeps a single
            // back press from checkout to the menu.
            replace: Boolean(
              (location.state as { drawerDepth?: number } | null)
                ?.drawerDepth,
            ),
            state: { storeId },
          })
        }
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
                <HeroBanner
                  onAddToCart={handleAddToCart}
                  product={menuProducts[0]}
                />
              )}
              <PopularSection
                categories={menuCategories}
                onAddToCart={handleAddToCart}
                products={filteredProducts}
                searchQuery={searchQuery}
              />
            </main>

            <Footer />
            <FloatingCartButton count={cartCount} visible={showFloatingCart} />
          </div>
        </div>

        <StatusToast
          message="Você entrou em outra loja, então os itens do carrinho anterior foram removidos."
          title="Carrinho esvaziado"
          visible={showCartClearedNotice}
        />

        <StatusToast
          message={`${addedToCartNotice} foi adicionado ao seu pedido.`}
          title="Item adicionado ao carrinho"
          variant="success"
          visible={Boolean(addedToCartNotice)}
        />
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
