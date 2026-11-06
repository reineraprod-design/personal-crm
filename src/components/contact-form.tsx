"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContactField, ContactFormState, ContactFormValues } from "@/lib/contact-input";

type ContactFormAction = (state: ContactFormState, formData: FormData) => Promise<ContactFormState>;

export function ContactForm({
  action,
  initialValues,
  submitLabel,
  cancelHref,
}: {
  action: ContactFormAction;
  initialValues: ContactFormValues;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values ?? initialValues;
  const errors = state.errors ?? {};

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.message && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Field name="name" label="Имя" error={errors.name}>
        <Input
          id="name"
          name="name"
          defaultValue={values.name}
          placeholder="Например: Анна Петрова"
          autoComplete="off"
          autoFocus
          required
          aria-invalid={Boolean(errors.name)}
          className="h-10"
        />
      </Field>

      <Field name="about" label="Кто это" error={errors.about}>
        <Textarea
          id="about"
          name="about"
          defaultValue={values.about}
          placeholder="Например: дизайнер, бывший коллега по студии"
          rows={2}
          aria-invalid={Boolean(errors.about)}
        />
      </Field>

      <Field name="howWeMet" label="Откуда знакомы" error={errors.howWeMet}>
        <Textarea
          id="howWeMet"
          name="howWeMet"
          defaultValue={values.howWeMet}
          placeholder="Например: учились вместе в университете"
          rows={2}
          aria-invalid={Boolean(errors.howWeMet)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="phone" label="Телефон" error={errors.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            defaultValue={values.phone}
            placeholder="+7 900 123-45-67"
            autoComplete="off"
            aria-invalid={Boolean(errors.phone)}
            className="h-10"
          />
        </Field>
        <Field name="email" label="Почта" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            defaultValue={values.email}
            placeholder="anna@example.com"
            autoComplete="off"
            aria-invalid={Boolean(errors.email)}
            className="h-10"
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Сохраняем…" : submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonVariants({ variant: "ghost", size: "lg" })}>
          Отмена
        </Link>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  children,
}: {
  name: ContactField;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
