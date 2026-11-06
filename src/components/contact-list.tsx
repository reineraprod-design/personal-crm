import Link from "next/link";

import { ScrollIntoView } from "@/components/scroll-into-view";
import type { ContactListItem } from "@/lib/contacts";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

type Group = { letter: string; contacts: ContactListItem[] };

// Contacts arrive sorted by name, so consecutive items share a first letter
function groupByFirstLetter(contacts: ContactListItem[]): Group[] {
  const groups: Group[] = [];
  for (const contact of contacts) {
    const letter = contact.name.trim().charAt(0).toUpperCase() || "#";
    const last = groups.at(-1);
    if (last?.letter === letter) last.contacts.push(contact);
    else groups.push({ letter, contacts: [contact] });
  }
  return groups;
}

export function contactElementId(id: number) {
  return `contact-${id}`;
}

export function ContactList({
  contacts,
  highlightId,
}: {
  contacts: ContactListItem[];
  highlightId?: number;
}) {
  return (
    <div className="overflow-clip rounded-xl border bg-background">
      {groupByFirstLetter(contacts).map((group) => (
        <section
          key={group.letter}
          aria-label={`На букву ${group.letter}`}
          className="not-first:border-t"
        >
          <h2 className="sticky top-0 z-10 border-b bg-muted/90 px-4 py-1 text-xs font-semibold text-muted-foreground backdrop-blur">
            {group.letter}
          </h2>
          <ul className="divide-y">
            {group.contacts.map((contact) => (
              <li key={contact.id} id={contactElementId(contact.id)}>
                <ContactRow contact={contact} highlighted={contact.id === highlightId} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {highlightId !== undefined && <ScrollIntoView elementId={contactElementId(highlightId)} />}
    </div>
  );
}

function ContactRow({
  contact,
  highlighted,
}: {
  contact: ContactListItem;
  highlighted: boolean;
}) {
  return (
    <Link
      href={`/contacts/${contact.id}`}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none",
        highlighted && "bg-emerald-50 hover:bg-emerald-100/70",
      )}
    >
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
      >
        {initials(contact.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{contact.name}</span>
        {contact.about && (
          <span className="block truncate text-sm text-muted-foreground">{contact.about}</span>
        )}
      </span>
      <span className="hidden shrink-0 flex-col items-end text-sm text-muted-foreground sm:flex">
        {contact.phone && <span className="whitespace-nowrap">{contact.phone}</span>}
        {contact.email && <span className="max-w-56 truncate">{contact.email}</span>}
      </span>
    </Link>
  );
}
