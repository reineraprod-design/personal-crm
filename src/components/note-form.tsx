"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NoteFormState } from "@/lib/contact-input";

type NoteFormAction = (state: NoteFormState, formData: FormData) => Promise<NoteFormState>;

export function NoteForm({ action }: { action: NoteFormAction }) {
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state.savedAt) toast.success("Заметка сохранена", { id: `note-${state.savedAt}` });
  }, [state.savedAt]);

  return (
    <form action={formAction} className="space-y-2">
      <Label htmlFor="note-body" className="sr-only">
        Новая заметка
      </Label>
      <Textarea
        id="note-body"
        name="body"
        defaultValue={state.body}
        placeholder="Что обсудили, о чём договорились…"
        rows={3}
        aria-invalid={Boolean(state.error)}
        aria-describedby={state.error ? "note-body-error" : undefined}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        className="min-h-20 bg-background"
      />
      {state.error && (
        <p id="note-body-error" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">Ctrl + Enter — сохранить</span>
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняем…" : "Добавить заметку"}
        </Button>
      </div>
    </form>
  );
}
