import "server-only";

import { and, count, desc, eq, sql, type SQL } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { contacts, notes } from "@/db/schema";

export type ContactListItem = Pick<
  typeof contacts.$inferSelect,
  "id" | "name" | "about" | "phone" | "email"
>;

// Lowercase and fold "ё" into "е" so "Алена" finds "Алёна"
const searchableName = sql`replace(lower(${contacts.name}), 'ё', 'е')`;

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function nameMatches(query: string): SQL | undefined {
  const words = query.toLowerCase().replaceAll("ё", "е").split(/\s+/).filter(Boolean);
  if (words.length === 0) return undefined;
  // Every word must appear somewhere in the name, in any order
  return and(...words.map((word) => sql`${searchableName} like ${`%${escapeLike(word)}%`}`));
}

export async function listContacts(query: string): Promise<ContactListItem[]> {
  return db
    .select({
      id: contacts.id,
      name: contacts.name,
      about: contacts.about,
      phone: contacts.phone,
      email: contacts.email,
    })
    .from(contacts)
    .where(nameMatches(query))
    .orderBy(sql`${contacts.name} collate "ru-x-icu"`, contacts.id);
}

export async function countContacts(): Promise<number> {
  const [row] = await db.select({ value: count() }).from(contacts);
  return row.value;
}

// Deduplicated per request: metadata and the page both read the same contact
export const getContact = cache(async (id: number) => {
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
  return contact;
});

export async function listNotes(contactId: number) {
  return db
    .select()
    .from(notes)
    .where(eq(notes.contactId, contactId))
    .orderBy(desc(notes.createdAt), desc(notes.id));
}

export function parseContactId(value: string): number | undefined {
  if (!/^\d{1,9}$/.test(value)) return undefined;
  return Number(value);
}
