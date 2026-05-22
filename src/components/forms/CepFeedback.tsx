import type { CepStatus } from "../../services/viaCep";

type CepFeedbackProps = {
  className?: string;
  status: CepStatus;
};

const feedbackByStatus: Record<Exclude<CepStatus, "idle">, string> = {
  error: "Não foi possível consultar o CEP agora.",
  found: "Endereço preenchido automaticamente.",
  loading: "Buscando endereço...",
  "not-found": "CEP não encontrado.",
};

export function CepFeedback({ className = "", status }: CepFeedbackProps) {
  if (status === "idle") {
    return null;
  }

  return (
    <p
      className={`-mt-2 text-caption font-bold ${
        status === "found" || status === "loading"
          ? "text-primary-dark"
          : "text-danger"
      } ${className}`}
    >
      {feedbackByStatus[status]}
    </p>
  );
}
