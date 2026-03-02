import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";

export default function GroupCard({ group }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={group.coverImage}
          alt={group.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{group.name}</p>
        <p className="flex items-center gap-1 text-sm text-muted">
          <Users size={14} />
          {group.memberIds.length} Mitglieder
        </p>
      </div>
    </Link>
  );
}
