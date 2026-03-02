import Link from "next/link";
import { Camera, Plus, Search } from "lucide-react";
import { groups } from "@/app/data/mock";
import GroupCard from "@/app/components/GroupCard";

export default function HomePage() {
  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Camera size={24} className="text-primary" />
          <h1 className="text-xl font-bold">Snapvent</h1>
        </div>
        <button className="text-muted">
          <Search size={22} />
        </button>
      </header>

      <div className="p-4">
        {/* Add Group Button */}
        <Link
          href="/groups/new"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 py-3 font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Plus size={20} />
          Gruppe Hinzufügen
        </Link>

        {/* Group List */}
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}
