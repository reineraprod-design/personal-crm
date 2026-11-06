import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { updateContact } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { ContactForm } from "@/components/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContact, parseContactId } from "@/lib/contacts";

export async function generateMetadata({
  params,
}: PageProps<"/contacts/[id]/edit">): Promise<Metadata> {
  const id = parseContactId((await params).id);
  const contact = id === undefined ? undefined : await getContact(id);
  return { title: contact ? `Изменить: ${contact.name}` : "Контакт не найден" };
}

export default function EditContactPage({ params }: PageProps<"/contacts/[id]/edit">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <EditContact params={params} />
    </Suspense>
  );
}

async function EditContact({ params }: Pick<PageProps<"/contacts/[id]/edit">, "params">) {
  const id = parseContactId((await params).id);
  if (id === undefined) notFound();

  const contact = await getContact(id);
  if (!contact) notFound();

  return (
    <div className="space-y-4">
      <BackLink href={`/contacts/${contact.id}`}>{contact.name}</BackLink>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Изменить контакт</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm
            action={updateContact.bind(null, contact.id)}
            initialValues={{
              name: contact.name,
              about: contact.about ?? "",
              howWeMet: contact.howWeMet ?? "",
              phone: contact.phone ?? "",
              email: contact.email ?? "",
            }}
            submitLabel="Сохранить"
            cancelHref={`/contacts/${contact.id}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
