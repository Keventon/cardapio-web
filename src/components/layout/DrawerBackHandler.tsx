import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDrawerBackStack } from "../../hooks/useCloseDrawerOnBack";

// Makes the browser back button close the top-most open drawer instead of
// leaving the page. When a drawer opens, a same-URL sentinel entry is pushed
// onto the history (state.drawerDepth); pressing back pops that entry, which
// we detect here and translate into closing the drawer. Closing the drawer
// in the UI consumes its sentinel with navigate(-1). A sentinel (instead of
// useBlocker) also covers the common mobile case where the menu is the very
// first history entry and back would otherwise exit the site.
// Rendered once at the router root.
export function DrawerBackHandler() {
  const stackLength = useDrawerBackStack(
    (state) => state.entries.length,
  );
  const location = useLocation();
  const navigate = useNavigate();
  const depth =
    (location.state as { drawerDepth?: number } | null)?.drawerDepth ?? 0;
  const prevStackLengthRef = useRef(stackLength);
  const prevDepthRef = useRef(depth);

  useEffect(() => {
    const prevStackLength = prevStackLengthRef.current;
    const prevDepth = prevDepthRef.current;

    prevStackLengthRef.current = stackLength;
    prevDepthRef.current = depth;

    if (stackLength > prevStackLength && stackLength > depth) {
      // A drawer just opened: push its sentinel entry.
      navigate(`${location.pathname}${location.search}${location.hash}`, {
        state: { drawerDepth: depth + 1 },
      });
    } else if (depth < prevDepth && stackLength > depth) {
      // Back button popped a sentinel while drawers are open: close the top one.
      useDrawerBackStack.getState().entries.at(-1)?.close();
    } else if (stackLength < prevStackLength && depth > stackLength) {
      // A drawer was closed in the UI (X/Esc/overlay): consume its sentinel.
      navigate(-1);
    }
  }, [depth, location, navigate, stackLength]);

  return null;
}
