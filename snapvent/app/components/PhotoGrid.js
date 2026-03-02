import Link from "next/link";
import Image from "next/image";

export default function PhotoGrid({ photos, groupId }) {
  if (photos.length === 0) {
    return (
      <p className="py-12 text-center text-muted">
        Noch keine Fotos vorhanden.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {photos.map((photo) => (
        <Link
          key={photo.id}
          href={`/groups/${groupId}/photos/${photo.id}`}
          className="relative aspect-square overflow-hidden"
        >
          <Image
            src={photo.imageUrl}
            alt=""
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 430px) 33vw, 143px"
          />
        </Link>
      ))}
    </div>
  );
}
