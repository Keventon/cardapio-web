import { createBrowserRouter } from "react-router-dom";
import ClientApp from "../ClientApp";
import { storeRoutes } from "./storeRoutes";

export const router = createBrowserRouter([
  ...storeRoutes,
  { element: <ClientApp />, path: "/:slug" },
]);
