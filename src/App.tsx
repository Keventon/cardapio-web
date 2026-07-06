import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { LoadingScreen } from "./components/loading/LoadingScreen";
import { router } from "./router";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 900);

    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <RouterProvider router={router} />;
}

export default App;
