import { useLocation, useNavigate } from "react-router-dom";
import { StoreLoginPage } from "./StoreLoginPage";

export function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean(
    (location.state as { justRegistered?: boolean } | null)?.justRegistered,
  );

  return (
    <StoreLoginPage
      justRegistered={justRegistered}
      onAuthenticated={() => navigate("/loja/pedidos")}
      onBackToMenu={() => navigate("/")}
      onGoToSignUp={() => navigate("/loja/cadastro")}
    />
  );
}
