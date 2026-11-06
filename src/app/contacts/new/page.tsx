import type { Metadata } from "next";

import { createContact } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { ContactForm } from "@/components/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Новый контакт" };

const emptyValues = { name: "", about: "", howWeMet: "", phone: "", email: "" };

export default function NewContactPage() {
  return (
    <div className="space-y-4">
      <BackLink href="/">Все контакты</BackLink>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Новый контакт</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm
            action={createContact}
            initialValues={emptyValues}
            submitLabel="Добавить контакт"
            cancelHref="/"
          />
        </CardContent>
      </Card>
    </div>
  );
}
