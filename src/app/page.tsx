import { CheckCircle2Icon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { ContactList } from "@/components/contact-list";
import { ContactSearch } from "@/components/contact-search";
import { buttonVariants } from "@/components/ui/button";
import { countContacts, listContacts, parseContactId } from "@/lib/contacts";
import { pluralize } from "@/lib/format";

const CONTACT_FORMS: [string, string, string] = ["контакт", "контакта", "контактов"];

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Контакты</h1>
        <Link href="/contacts/new" className={buttonVariants({ size: "lg" })}>
          <PlusIcon />
          Добавить контакт
        </Link>
      </div>
      <Suspense fallback={<ContactsSkeleton />}>
        <Contacts searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Contacts({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const createdId =
    typeof params.created === "string" ? parseContactId(params.created) : undefined;

  const [contacts, total] = await Promise.all([listContacts(query), countContacts()]);
  const created = contacts.find((contact) => contact.id === createdId);

  return (
    <div className="space-y-4">
      {created && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <CheckCircle2Icon className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">
            Контакт «{created.name}» добавлен — он подсвечен в списке.
          </span>
          <Link
            href={`/contacts/${created.id}`}
            className="shrink-0 font-medium underline underline-offset-4"
          >
            Открыть карточку
          </Link>
        </div>
      )}

      <ContactSearch initialQuery={query} />

      <p className="text-sm text-muted-foreground">
        {query
          ? `Найдено: ${contacts.length} из ${total}`
          : `Всего ${pluralize(total, CONTACT_FORMS)}`}
      </p>

      {contacts.length > 0 ? (
        <ContactList contacts={contacts} highlightId={created?.id} />
      ) : total === 0 ? (
        <EmptyState
          title="Пока нет ни одного контакта"
          text="Добавьте первого человека — того, с кем недавно общались."
        />
      ) : (
        <EmptyState
          title={`Никого не нашли по запросу «${query}»`}
          text="Проверьте, как написано имя, или поищите по части имени или фамилии."
        />
      )}
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-background px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function ContactsSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Загружаем контакты">
      <div className="h-10 animate-pulse rounded-lg bg-muted" />
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="divide-y rounded-xl border bg-background">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3">
            <div className="size-9 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-3 w-64 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
