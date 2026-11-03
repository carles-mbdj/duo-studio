"use client";

import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { submitContact } from "@/app/contact/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  budgetOptions,
  contactSchema,
  delayOptions,
  HONEYPOT_FIELD,
  requestTypes,
  toFieldErrors,
  type ContactField,
  type ContactFormState,
} from "@/lib/contact-schema";

type Values = {
  name: string;
  email: string;
  phone: string;
  requestType: string;
  budget: string;
  delay: string;
  message: string;
  consent: boolean;
  service: string;
};

const FIELD_ORDER: ContactField[] = [
  "name",
  "email",
  "phone",
  "requestType",
  "budget",
  "delay",
  "message",
  "consent",
];

const initialState: ContactFormState = { status: "idle" };

const inputClasses =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none transition-colors focus:border-fg aria-[invalid=true]:border-red-600 dark:aria-[invalid=true]:border-red-400";

export type ContactFormProps = {
  /** Type de demande pré-sélectionné (via ?service=slug). */
  initialRequestType?: string;
  /** Titre de l'offre d'origine, affiché pour information. */
  serviceTitle?: string;
  serviceSlug?: string;
  turnstileSiteKey?: string;
};

export function ContactForm(props: ContactFormProps) {
  // Changer la clé remonte le formulaire (et réinitialise l'état de l'action).
  const [formKey, setFormKey] = useState(0);
  return <ContactFormInner key={formKey} {...props} onReset={() => setFormKey((k) => k + 1)} />;
}

function ContactFormInner({
  initialRequestType = "",
  serviceTitle,
  serviceSlug = "",
  turnstileSiteKey,
  onReset,
}: ContactFormProps & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    phone: "",
    requestType: initialRequestType,
    budget: "",
    delay: "",
    message: "",
    consent: false,
    service: serviceSlug,
  });
  // Erreurs calculées côté navigateur ; "" signifie « corrigé depuis la réponse du serveur ».
  const [clientErrors, setClientErrors] = useState<Partial<Record<ContactField, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const id = useId();

  const errorFor = (field: ContactField) =>
    field in clientErrors ? clientErrors[field] : state.fieldErrors?.[field];

  const focusFirstError = (errors: Partial<Record<ContactField, string>>) => {
    const first = FIELD_ORDER.find((field) => errors[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  // Après une réponse du serveur : focus sur le message de succès, l'erreur ou le premier champ invalide.
  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
    else if (state.status === "invalid" && state.fieldErrors) focusFirstError(state.fieldErrors);
    else if (state.status === "error" || state.status === "rate-limited")
      statusRef.current?.focus();
  }, [state]);

  const validateField = (field: ContactField, next: Values) => {
    const result = contactSchema.safeParse(next);
    const errors = result.success ? {} : toFieldErrors(result.error);
    return errors[field] ?? "";
  };

  const onChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const field = name as ContactField;
    const nextValue =
      event.target instanceof HTMLInputElement && event.target.type === "checkbox"
        ? event.target.checked
        : value;
    const next = { ...values, [field]: nextValue } as Values;
    setValues(next);
    // Revalide en direct uniquement les champs déjà signalés en erreur.
    if (errorFor(field))
      setClientErrors((prev) => ({ ...prev, [field]: validateField(field, next) }));
  };

  const onBlur = (field: ContactField) => {
    // Valide un champ quand on le quitte, s'il a été rempli.
    const value = values[field];
    if (value === "" || value === false) return;
    setClientErrors((prev) => ({ ...prev, [field]: validateField(field, values) }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const result = contactSchema.safeParse(values);
    if (!result.success) {
      event.preventDefault();
      const errors = toFieldErrors(result.error);
      setClientErrors(errors);
      focusFirstError(errors);
      return;
    }
    setClientErrors({});
  };

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-3xl border border-emerald-600/30 bg-emerald-50 p-8 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-emerald-50"
      >
        <CheckCircle2
          aria-hidden="true"
          className="size-8 text-emerald-700 dark:text-emerald-300"
        />
        <h2 ref={successRef} tabIndex={-1} className="mt-4 text-h3 outline-none">
          Message envoyé
        </h2>
        <p className="mt-2">{state.message}</p>
        {state.demo && (
          <p className="mt-4 text-sm opacity-80">
            Mode démonstration : aucun e-mail n&apos;a réellement été envoyé (clé Resend non
            configurée). La demande est affichée dans la console du serveur.
          </p>
        )}
        <Button variant="secondary" className="mt-6" onClick={onReset}>
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  const hasClientErrors = Object.values(clientErrors).some(Boolean);
  const showSummary = state.status === "invalid" || hasClientErrors;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      aria-describedby={`${id}-required`}
      className="flex flex-col gap-6"
      data-testid="contact-form"
    >
      <p id={`${id}-required`} className="text-sm text-muted">
        Les champs marqués d&apos;un astérisque (<span aria-hidden="true">*</span>
        <span className="sr-only">astérisque</span>) sont obligatoires.
      </p>

      {serviceTitle && (
        <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm">
          Demande concernant l&apos;offre : <strong>{serviceTitle}</strong>
        </p>
      )}

      <div
        ref={statusRef}
        tabIndex={-1}
        aria-live="assertive"
        className="outline-none empty:hidden"
      >
        {(state.status === "error" || state.status === "rate-limited") && (
          <Alert>{state.message}</Alert>
        )}
        {showSummary && state.status !== "error" && state.status !== "rate-limited" && (
          <Alert>
            Certains champs sont à corriger. Les erreurs sont indiquées sous chaque champ.
          </Alert>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={`${id}-name`} label="Nom" required error={errorFor("name")}>
          {(a11y) => (
            <input
              {...a11y}
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={onChange}
              onBlur={() => onBlur("name")}
              className={inputClasses}
            />
          )}
        </Field>
        <Field id={`${id}-email`} label="E-mail" required error={errorFor("email")}>
          {(a11y) => (
            <input
              {...a11y}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={values.email}
              onChange={onChange}
              onBlur={() => onBlur("email")}
              className={inputClasses}
            />
          )}
        </Field>
        <Field id={`${id}-phone`} label="Téléphone" hint="Facultatif" error={errorFor("phone")}>
          {(a11y) => (
            <input
              {...a11y}
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={onChange}
              onBlur={() => onBlur("phone")}
              className={inputClasses}
            />
          )}
        </Field>
        <Field
          id={`${id}-requestType`}
          label="Type de demande"
          required
          error={errorFor("requestType")}
        >
          {(a11y) => (
            <select
              {...a11y}
              name="requestType"
              value={values.requestType}
              onChange={onChange}
              className={inputClasses}
            >
              <option value="">Choisir…</option>
              {requestTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id={`${id}-budget`} label="Budget indicatif" required error={errorFor("budget")}>
          {(a11y) => (
            <select
              {...a11y}
              name="budget"
              value={values.budget}
              onChange={onChange}
              className={inputClasses}
            >
              <option value="">Choisir…</option>
              {budgetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id={`${id}-delay`} label="Délai souhaité" required error={errorFor("delay")}>
          {(a11y) => (
            <select
              {...a11y}
              name="delay"
              value={values.delay}
              onChange={onChange}
              className={inputClasses}
            >
              <option value="">Choisir…</option>
              {delayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field
        id={`${id}-message`}
        label="Votre projet"
        required
        hint="Objectif, contexte, contraintes… quelques phrases suffisent."
        error={errorFor("message")}
      >
        {(a11y) => (
          <textarea
            {...a11y}
            name="message"
            rows={6}
            value={values.message}
            onChange={onChange}
            onBlur={() => onBlur("message")}
            className={cn(inputClasses, "resize-y")}
          />
        )}
      </Field>

      {/* Pot de miel : invisible et ignoré par les technologies d'assistance. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-hp`}>Ne pas remplir ce champ</label>
        <input id={`${id}-hp`} type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="service" value={values.service} />

      <div>
        <div className="flex items-start gap-3">
          <input
            id={`${id}-consent`}
            name="consent"
            type="checkbox"
            checked={values.consent}
            onChange={onChange}
            aria-invalid={errorFor("consent") ? true : undefined}
            aria-describedby={errorFor("consent") ? `${id}-consent-error` : undefined}
            aria-required="true"
            className="mt-1 size-5 shrink-0 accent-fg"
          />
          <label htmlFor={`${id}-consent`} className="text-sm leading-relaxed">
            J&apos;accepte que les informations saisies soient utilisées pour répondre à ma demande.
            Elles ne sont ni revendues ni utilisées à d&apos;autres fins.{" "}
            <Link href="/confidentialite" className="underline underline-offset-4">
              Politique de confidentialité
            </Link>
            <span aria-hidden="true"> *</span>
          </label>
        </div>
        {errorFor("consent") && (
          <FieldError id={`${id}-consent-error`}>{errorFor("consent")}</FieldError>
        )}
      </div>

      {turnstileSiteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-language="fr" />
        </>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          aria-disabled={pending}
          className="shrink-0 whitespace-nowrap"
        >
          {pending ? (
            <>
              <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              <Send aria-hidden="true" className="size-5" />
              Envoyer le message
            </>
          )}
        </Button>
        <p className="text-xs text-muted">
          Vos données servent uniquement à vous répondre (voir la politique de confidentialité).
        </p>
      </div>
      <p aria-live="polite" className="sr-only">
        {pending ? "Envoi du message en cours." : ""}
      </p>
    </form>
  );
}

/* --------------------------------------------------------------------------- */

type A11yProps = {
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};

function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: (a11y: A11yProps) => ReactNode;
}) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
        "aria-required": required || undefined,
      })}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-center gap-1.5 text-sm text-red-700 dark:text-red-400">
      <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
      {children}
    </p>
  );
}

function Alert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-xl border border-red-600/30 bg-red-50 p-4 text-sm text-red-900 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-100"
    >
      <AlertCircle aria-hidden="true" className="size-5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
