const pluralRules = new Intl.PluralRules("ru-RU");

// forms: [one, few, many], e.g. ["контакт", "контакта", "контактов"]
export function pluralize(count: number, forms: [string, string, string]) {
  const rule = pluralRules.select(count);
  const word = rule === "one" ? forms[0] : rule === "few" ? forms[1] : forms[2];
  return `${count} ${word}`;
}

const dateTimeFormat = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "long",
  timeStyle: "short",
});

export function formatDateTime(date: Date) {
  return dateTimeFormat.format(date);
}

export function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]);
  return letters.join("").toUpperCase() || "?";
}
