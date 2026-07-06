import { useNavigate } from "react-router-dom";
import { StoreMenuPage } from "./StoreMenuPage";

export function MenuRoute() {
  const navigate = useNavigate();

  return <StoreMenuPage onLogout={() => navigate("/loja/login")} />;
}
