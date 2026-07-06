import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { LoadingScreen } from "./components/loading/LoadingScreen";
import { router } from "./router";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: number | undefined;

    async function loadMenu() {
      try {
        const menu = await getStoreMenu();
        const mappedMenu = mapStoreMenuToClientMenu(menu);

        if (!isMounted) {
          return;
        }

        setMenuCategories(mappedMenu.categories);
        setMenuProducts(mappedMenu.products);
        setStoreId(mappedMenu.store.id);
        setMenuError("");
        setIsMenuOffline(false);
        setIsLoading(false);
      } catch {
        if (!isMounted) {
          return;
        }

        setMenuCategories([]);
        setMenuProducts([]);
        setStoreId("");
        setMenuError("A API parece estar fora do ar. Tentando reconectar...");
        setIsMenuOffline(true);
        setIsLoading(true);
        retryTimeout = window.setTimeout(loadMenu, 5000);
      }
    }

    loadMenu();

    return () => {
      isMounted = false;
      window.clearTimeout(retryTimeout);
    };
  }, []);

  if (isLoading && appRoute === "menu") {
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

  return <RouterProvider router={router} />;
}

export default App;
