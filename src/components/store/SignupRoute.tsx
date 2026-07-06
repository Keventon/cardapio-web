import { useNavigate } from "react-router-dom";
import { StoreSignupPage } from "./StoreSignupPage";

export function SignupRoute() {
  const navigate = useNavigate();

  return (
    <StoreSignupPage
      onGoToLogin={() => navigate("/loja/login")}
      onRegistered={() =>
        navigate("/loja/login", { state: { justRegistered: true } })
      }
    />
  );
}
