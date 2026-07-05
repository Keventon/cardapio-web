import { useNavigate } from "react-router-dom";
import { StoreGetStartedPage } from "./StoreGetStartedPage";

export function GetStartedRoute() {
  const navigate = useNavigate();

  return (
    <StoreGetStartedPage
      onBackToMenu={() => navigate("/")}
      onLogin={() => navigate("/loja/login")}
      onSignUp={() => navigate("/loja/cadastro")}
    />
  );
}
