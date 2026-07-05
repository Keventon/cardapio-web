import { useNavigate } from "react-router-dom";
import { StoreOrdersPage } from "./StoreOrdersPage";

export function OrdersRoute() {
  const navigate = useNavigate();

  return (
    <StoreOrdersPage
      onBackToMenu={() => navigate("/")}
      onLogout={() => navigate("/loja/login")}
    />
  );
}
