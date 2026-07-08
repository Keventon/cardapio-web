import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { CheckoutPage } from "./CheckoutPage";
import {
  selectCartTotalCents,
  useCartStore,
} from "../../stores/cartStore";

export function CheckoutRoute() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const orderTotalCents = useCartStore(selectCartTotalCents);
  const storeId = (location.state as { storeId?: string } | null)?.storeId;

  // Direct access, reload (cart lives in memory only) or a just-confirmed
  // order all land here without a usable cart: back to the menu.
  if (!storeId || cartItems.length === 0) {
    return <Navigate replace to={`/${slug}`} />;
  }

  return (
    <Tooltip.Provider delayDuration={120}>
      <CheckoutPage
        items={cartItems}
        onBack={() => navigate(-1)}
        onOrderConfirmed={() => clearCart()}
        storeId={storeId}
        totalCents={orderTotalCents}
      />
    </Tooltip.Provider>
  );
}
