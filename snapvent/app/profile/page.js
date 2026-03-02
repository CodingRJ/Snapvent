"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, Users } from "lucide-react";
import { currentUser } from "@/app/data/mock";
import { useGroups } from "@/app/context/GroupsContext";
import PageHeader from "@/app/components/PageHeader";

export default function ProfilePage() {
  const { groups } = useGroups();
  const userGroups = groups.filter((g) =>
    g.memberIds.includes(currentUser.id)
  );

  return (
    <div>
      <PageHeader title="Profil" />

      <div className="p-4">
        {/* Avatar & Info */}
        <div className="flex flex-col items-center gap-3 pb-6">
          <div className="relative h-20 w-20 overflow-hidden rounded-full">
            <Image
              src={currentUser.profileImage}
              alt={currentUser.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{currentUser.name}</p>
            <p className="text-sm text-muted">{currentUser.email}</p>
          </div>
        </div>

        {/* My Groups */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            Meine Gruppen
          </h2>
          <div className="flex flex-col gap-2">
            {userGroups.map((g) => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                  <Image
                    src={g.coverImage}
                    alt={g.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <span className="flex-1 truncate text-sm font-medium">
                  {g.name}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Users size={12} />
                  {g.memberIds.length}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
          <LogOut size={18} />
          Abmelden
        </button>
      </div>
    </div>
  );
}
