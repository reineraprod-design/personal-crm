import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-dashed bg-background px-6 py-16 text-center">
      <h1 className="text-lg font-semibold">Такой страницы нет</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Возможно, контакт удалён или в адресе опечатка.
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline", className: "mt-6" })}>
        К списку контактов
      </Link>
    </div>
  );
}
