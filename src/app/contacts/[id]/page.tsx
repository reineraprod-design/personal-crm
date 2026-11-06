import { MailIcon, PencilIcon, PhoneIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { addNote } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { NoteForm } from "@/components/note-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContact, listNotes, parseContactId } from "@/lib/contacts";
import { formatDateTime, initials } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/contacts/[id]">): Promise<Metadata> {
  const id = parseContactId((await params).id);
  const contact = id === undefined ? undefined : await getContact(id);
  return { title: contact?.name ?? "Контакт не найден" };
}

export default function ContactPage({ params }: PageProps<"/contacts/[id]">) {
  return (
    <div className="space-y-4">
      <BackLink href="/">Все контакты</BackLink>
      <Suspense fallback={<ContactSkeleton />}>
        <ContactDetails params={params} />
      </Suspense>
    </div>
  );
}

async function ContactDetails({ params }: Pick<PageProps<"/contacts/[id]">, "params">) {
  const id = parseContactId((await params).id);
  if (id === undefined) notFound();

  const [contact, notes] = await Promise.all([getContact(id), listNotes(id)]);
  if (!contact) notFound();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start gap-4">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground"
          >
            {initials(contact.name)}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-xl font-semibold tracking-tight break-words sm:text-2xl">
              {contact.name}
            </h1>
            {contact.about && (
              <p className="whitespace-pre-line text-muted-foreground">{contact.about}</p>
            )}
          </div>
          <Link
            href={`/contacts/${contact.id}/edit`}
            className={buttonVariants({ variant: "outline", className: "max-sm:size-8 max-sm:px-0" })}
            aria-label="Изменить контакт"
          >
            <PencilIcon />
            <span className="max-sm:hidden">Изменить</span>
          </Link>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 border-t pt-4 sm:grid-cols-2">
            <Detail icon={<PhoneIcon />} label="Телефон">
              {contact.phone && (
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">
                  {contact.phone}
                </a>
              )}
            </Detail>
            <Detail icon={<MailIcon />} label="Почта">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="break-all hover:underline">
                  {contact.email}
                </a>
              )}
            </Detail>
            <Detail icon={<UsersIcon />} label="Откуда знакомы" wide>
              {contact.howWeMet && <span className="whitespace-pre-line">{contact.howWeMet}</span>}
            </Detail>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Заметки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <NoteForm action={addNote.bind(null, contact.id)} />
          {notes.length > 0 ? (
            <ol className="space-y-4">
              {notes.map((note) => (
                <li key={note.id} className="border-l-2 pl-4">
                  <time
                    dateTime={note.createdAt.toISOString()}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDateTime(note.createdAt)}
                  </time>
                  <p className="mt-1 whitespace-pre-line break-words">{note.body}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">
              Заметок пока нет. Запишите, о чём говорили в последний раз.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({
  icon,
  label,
  wide,
  children,
}: {
  icon: ReactNode;
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1">{children || <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

function ContactSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Загружаем контакт">
      <div className="h-44 animate-pulse rounded-xl bg-muted" />
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
