import { BackpackIcon } from "@radix-ui/react-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { BrandLogo } from "../brand/BrandLogo";
import { Field } from "../forms/Field";
import {
  emptyStoreSignupForm,
  storeSignupSchema,
} from "../../forms/storeSignupForm";
import type { StoreSignupForm } from "../../forms/storeSignupForm";
import { registerStore } from "../../services/storeApi";
import { formatCpf } from "../../utils/cpf";
import { slugify } from "../../utils/slug";

type StoreSignupPageProps = {
  onBackToMenu: () => void;
  onGoToLogin: () => void;
  onRegistered: () => void;
};

export function StoreSignupPage({
  onBackToMenu,
  onGoToLogin,
  onRegistered,
}: StoreSignupPageProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    formState: { dirtyFields, errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<StoreSignupForm>({
    defaultValues: emptyStoreSignupForm,
    resolver: zodResolver(storeSignupSchema),
  });
  const name = useWatch({ control, name: "name" });
  const slug = useWatch({ control, name: "slug" });
  const ownerCpf = useWatch({ control, name: "ownerCpf" });

  useEffect(() => {
    if (dirtyFields.slug) {
      return;
    }

    setValue("slug", slugify(name));
  }, [dirtyFields.slug, name, setValue]);

  async function handleValidSubmit(form: StoreSignupForm) {
    setIsSubmitting(true);

    try {
      await registerStore({
        name: form.name,
        owner: {
          cpf: form.ownerCpf.replace(/\D/g, ""),
          email: form.ownerEmail,
          name: form.ownerName,
          password: form.ownerPassword,
        },
        slug: form.slug,
      });

      onRegistered();
    } catch (submitError) {
      if (
        axios.isAxiosError(submitError) &&
        submitError.response?.status === 409
      ) {
        setError("Nome da loja, slug ou email já cadastrados.");
      } else {
        setError("Não foi possível conectar. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-surface-checkout px-5 py-8 text-text-strong sm:px-8">
      <div className="mx-auto grid w-full max-w-315 items-center gap-8 lg:grid-cols-[1fr_430px]">
        <section className="hidden lg:block">
          <div className="mb-10">
            <BrandLogo />
          </div>
          <h1 className="max-w-150 text-display font-extrabold leading-tight">
            Painel da hamburgueria
          </h1>
          <p className="mt-5 max-w-125 text-body font-medium leading-relaxed text-text-muted">
            Receba pedidos do cardápio digital, acompanhe o preparo e marque o
            despacho em uma área separada do cliente.
          </p>
          <button
            className="mt-8 h-11 rounded-lg border border-border-input bg-white px-5 text-button font-extrabold text-primary-dark transition hover:bg-surface-hover"
            onClick={onBackToMenu}
            type="button"
          >
            Ver cardápio do cliente
          </button>
        </section>

        <form
          className="rounded-lg bg-white p-6 shadow-[0_18px_42px_rgba(94,54,30,0.12)] sm:p-8"
          noValidate
          onSubmit={handleSubmit(handleValidSubmit)}
        >
          <div className="mb-8 flex items-center justify-between gap-4">
            <BrandLogo />
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-white">
              <BackpackIcon className="h-5 w-5" />
            </span>
          </div>

          <h2 className="text-page-title font-extrabold leading-tight">
            Criar conta da loja
          </h2>
          <p className="mt-2 text-body-sm font-medium text-text-muted">
            Cadastre sua loja pra começar a receber pedidos.
          </p>

          <div className="mt-7 space-y-4">
            <Field
              error={errors.name?.message}
              label="Nome da loja"
              placeholder="Fast Burguer"
              registration={register("name")}
            />
            <Field
              error={errors.slug?.message}
              label="Slug"
              onChange={(value) =>
                setValue("slug", slugify(value), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              placeholder="fast-burguer"
              value={slug}
            />
            <Field
              error={errors.ownerName?.message}
              label="Seu nome"
              placeholder="Ex: João da Silva"
              registration={register("ownerName")}
            />
            <Field
              error={errors.ownerEmail?.message}
              label="Seu email"
              placeholder="voce@email.com"
              registration={register("ownerEmail")}
              type="email"
            />
            <Field
              error={errors.ownerCpf?.message}
              label="Seu CPF"
              onChange={(value) =>
                setValue("ownerCpf", formatCpf(value), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              placeholder="000.000.000-00"
              value={ownerCpf}
            />
            <Field
              error={errors.ownerPassword?.message}
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              registration={register("ownerPassword")}
              type="password"
            />
          </div>

          {error ? (
            <p className="mt-4 text-caption font-bold text-danger">{error}</p>
          ) : null}

          <button
            className="mt-6 h-12 w-full rounded-lg bg-primary text-button font-extrabold text-white transition hover:bg-primary-hover disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Cadastrando..." : "Criar conta"}
          </button>

          <button
            className="mt-3 h-11 w-full rounded-lg border border-border-input bg-white text-button font-extrabold text-primary-dark transition hover:bg-surface-hover"
            onClick={onGoToLogin}
            type="button"
          >
            Já tenho conta
          </button>
        </form>
      </div>
    </div>
  );
}
