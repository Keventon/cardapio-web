import { createBrowserRouter, Outlet } from "react-router-dom";
import ClientApp from "../ClientApp";
import { CheckoutRoute } from "../components/checkout/CheckoutRoute";
import { StoreDirectoryPage } from "../components/home/StoreDirectoryPage";
import { DrawerBackHandler } from "../components/layout/DrawerBackHandler";
import { ClientOrdersPage } from "../components/orders/ClientOrdersPage";
import { storeRoutes } from "./storeRoutes";

export const router = createBrowserRouter([
  {
    element: (
      <>
        <DrawerBackHandler />
        <Outlet />
      </>
    ),
    children: [
      ...storeRoutes,
      { element: <StoreDirectoryPage />, path: "/" },
      { element: <CheckoutRoute />, path: "/:slug/checkout" },
      { element: <ClientOrdersPage />, path: "/:slug/pedidos" },
      { element: <ClientApp />, path: "/:slug" },
    ],
  },
]);
