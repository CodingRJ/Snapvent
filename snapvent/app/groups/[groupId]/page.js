"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Upload } from "lucide-react";
import { useGroups } from "@/app/context/GroupsContext";
import PageHeader from "@/app/components/PageHeader";
import PhotoGrid from "@/app/components/PhotoGrid";

export default function GalleryPage({ params }) {
  const { groupId } = use(params);
  const { getGroupById, getPhotosByGroup } = useGroups();

  const group = getGroupById(groupId);

  if (!group) {
    return (
      <div>
        <PageHeader title="Nicht gefunden" backHref="/" />
        <div className="p-8 text-center text-muted">
          Gruppe nicht gefunden.
        </div>
      </div>
    );
  }

  const photos = getPhotosByGroup(groupId);

  return (
    <div>
      <PageHeader title={group.name} backHref="/" />

      {/* Group Info Bar */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={group.coverImage}
            alt={group.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">{photos.length} Fotos</p>
        </div>
        <Link
          href="/camera"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white"
        >
          <Upload size={16} />
          Hochladen
        </Link>
      </div>

      {/* Photo Grid */}
      <PhotoGrid photos={photos} groupId={groupId} />
    </div>
  );
}
