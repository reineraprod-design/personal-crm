"use client";

import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";

const SEARCH_DELAY_MS = 250;

export function ContactSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [requested, setRequested] = useState(initialQuery);
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The URL changed without typing here (e.g. a click on the logo): show the new query
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    if (!isPending && initialQuery !== requested) {
      setValue(initialQuery);
      setRequested(initialQuery);
    }
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function search(query: string) {
    clearTimeout(timer.current);
    const trimmed = query.trim();
    setRequested(trimmed);
    startTransition(() => {
      router.replace(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/", { scroll: false });
    });
  }

  function handleChange(next: string) {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(next), SEARCH_DELAY_MS);
  }

  return (
    <form
      role="search"
      action="/"
      onSubmit={(event) => {
        event.preventDefault();
        search(value);
      }}
      className="relative"
    >
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Найти по имени"
        aria-label="Найти контакт по имени"
        autoComplete="off"
        className="h-10 bg-background pr-10 pl-9 text-base [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
        {isPending ? (
          <Loader2Icon className="m-1.5 size-4 animate-spin text-muted-foreground" aria-label="Ищем…" />
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              search("");
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Очистить поиск"
          >
            <XIcon className="size-4" />
          </button>
        ) : null}
      </div>
    </form>
  );
}
