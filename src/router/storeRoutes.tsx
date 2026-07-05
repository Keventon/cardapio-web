import { redirect } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { GetStartedRoute } from "../components/store/GetStartedRoute";
import { LoginRoute } from "../components/store/LoginRoute";
import { MenuRoute } from "../components/store/MenuRoute";
import { OrdersRoute } from "../components/store/OrdersRoute";
import { SignupRoute } from "../components/store/SignupRoute";
import { useStoreAuthStore } from "../stores/storeAuthStore";

function isStoreAuthenticated() {
  return useStoreAuthStore.getState().token !== null;
}

export const storeRoutes: RouteObject[] = [
  {
    element: <GetStartedRoute />,
    loader: () => (isStoreAuthenticated() ? redirect("/loja/pedidos") : null),
    path: "/loja",
  },
  {
    element: <SignupRoute />,
    loader: () => (isStoreAuthenticated() ? redirect("/loja/pedidos") : null),
    path: "/loja/cadastro",
  },
  {
    element: <LoginRoute />,
    loader: () => (isStoreAuthenticated() ? redirect("/loja/pedidos") : null),
    path: "/loja/login",
  },
  {
    element: <OrdersRoute />,
    loader: () => (isStoreAuthenticated() ? null : redirect("/loja/login")),
    path: "/loja/pedidos",
  },
  {
    element: <MenuRoute />,
    loader: () => (isStoreAuthenticated() ? null : redirect("/loja/login")),
    path: "/loja/cardapio",
  },
  {
    loader: () => redirect("/loja"),
    path: "/loja/*",
  },
];
