"use server";

import { eq, sql } from "drizzle-orm";
import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { contacts, notes } from "@/db/schema";
import {
  contactInputSchema,
  noteInputSchema,
  readContactForm,
  type ContactField,
  type ContactFormState,
  type NoteFormState,
} from "@/lib/contact-input";
import { getContact } from "@/lib/contacts";

function validateContact(formData: FormData) {
  const values = readContactForm(formData);
  const result = contactInputSchema.safeParse(values);
  if (result.success) return { values, data: result.data };

  const errors: Partial<Record<ContactField, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ContactField;
    errors[field] ??= issue.message;
  }
  return { values, errors };
}

export async function createContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const { values, data, errors } = validateContact(formData);
  if (!data) return { values, errors };

  const [created] = await db.insert(contacts).values(data).returning({ id: contacts.id });

  revalidatePath("/");
  redirect(`/?created=${created.id}`);
}

export async function updateContact(
  id: number,
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const { values, data, errors } = validateContact(formData);
  if (!data) return { values, errors };

  const updated = await db
    .update(contacts)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(contacts.id, id))
    .returning({ id: contacts.id });
  if (updated.length === 0) {
    return { values, message: "Контакт не найден — возможно, его удалили" };
  }

  revalidatePath("/");
  revalidatePath(`/contacts/${id}`);
  redirect(`/contacts/${id}`);
}

export async function addNote(
  contactId: number,
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const raw = formData.get("body");
  const body = typeof raw === "string" ? raw : "";
  const result = noteInputSchema.safeParse(body);
  if (!result.success) return { body, error: result.error.issues[0].message };

  if (!(await getContact(contactId))) {
    return { body, error: "Контакт не найден — возможно, его удалили" };
  }

  await db.transaction(async (tx) => {
    await tx.insert(notes).values({ contactId, body: result.data });
    await tx.update(contacts).set({ updatedAt: sql`now()` }).where(eq(contacts.id, contactId));
  });

  refresh();
  return { savedAt: Date.now() };
}
