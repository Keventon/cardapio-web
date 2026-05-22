import { useEffect, useState } from "react";
import {
  isRequestCanceled,
  lookupPostalCode,
} from "../services/viaCep";
import type { CepStatus, ViaCepResponse } from "../services/viaCep";

type UseCepLookupOptions = {
  enabled?: boolean;
  onFound: (address: ViaCepResponse) => void;
  postalCode?: string;
};

export function useCepLookup({
  enabled = true,
  onFound,
  postalCode = "",
}: UseCepLookupOptions) {
  const [status, setStatus] = useState<CepStatus>("idle");

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const cepDigits = postalCode.replace(/\D/g, "");

    if (cepDigits.length !== 8) {
      return;
    }

    const controller = new AbortController();

    async function fetchAddressByCep() {
      setStatus("loading");

      try {
        const address = await lookupPostalCode(cepDigits, controller.signal);

        if (address.erro) {
          setStatus("not-found");
          return;
        }

        onFound(address);
        setStatus("found");
      } catch (error) {
        if (isRequestCanceled(error)) {
          return;
        }

        setStatus("error");
      }
    }

    fetchAddressByCep();

    return () => controller.abort();
  }, [enabled, onFound, postalCode]);

  return {
    resetStatus: () => setStatus("idle"),
    status,
  };
}
