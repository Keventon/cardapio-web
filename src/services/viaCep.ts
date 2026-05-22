import axios from "axios";

export type CepStatus = "idle" | "loading" | "found" | "not-found" | "error";

export type ViaCepResponse = {
  bairro?: string;
  cep?: string;
  complemento?: string;
  erro?: boolean;
  localidade?: string;
  logradouro?: string;
  uf?: string;
};

export async function lookupPostalCode(cepDigits: string, signal: AbortSignal) {
  const { data } = await axios.get<ViaCepResponse>(
    `https://viacep.com.br/ws/${cepDigits}/json/`,
    { signal },
  );

  return data;
}

export function isRequestCanceled(error: unknown) {
  return axios.isCancel(error);
}
