import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PageHeader({ title, backHref, rightAction }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
      {backHref && (
        <Link href={backHref} className="text-foreground">
          <ArrowLeft size={22} />
        </Link>
      )}
      <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>
      {rightAction && <div>{rightAction}</div>}
    </header>
  );
}
