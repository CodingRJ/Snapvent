import Link from "next/link";
import Image from "next/image";
import { Upload } from "lucide-react";
import { getGroupById, getPhotosByGroup } from "@/app/data/mock";
import PageHeader from "@/app/components/PageHeader";
import PhotoGrid from "@/app/components/PhotoGrid";
import { notFound } from "next/navigation";

export default async function GalleryPage({ params }) {
  const { groupId } = await params;
  const group = getGroupById(groupId);

  if (!group) notFound();

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
