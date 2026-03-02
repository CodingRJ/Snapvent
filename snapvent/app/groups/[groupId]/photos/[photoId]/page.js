"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MoreVertical, Copy, Share2, Trash2 } from "lucide-react";
import { getPhotoById, getUserById } from "@/app/data/mock";
import { useState } from "react";

export default function SinglePhotoPage() {
  const { groupId, photoId } = useParams();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const photo = getPhotoById(photoId);
  const uploader = photo ? getUserById(photo.uploaderId) : null;

  if (!photo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Foto nicht gefunden.
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-black">
      {/* Header */}
      <header className="absolute top-0 z-10 flex w-full items-center justify-between p-4">
        <button
          onClick={() => router.push(`/groups/${groupId}`)}
          className="flex items-center gap-2 text-white"
        >
          <ArrowLeft size={22} />
          <span className="text-sm">Zurück</span>
        </button>

        {uploader && (
          <span className="text-sm text-white/80">
            Taken by {uploader.name}
          </span>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white"
          >
            <MoreVertical size={22} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 w-44 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
              <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-zinc-800">
                <Copy size={16} /> Kopieren
              </button>
              <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-zinc-800">
                <Share2 size={16} /> Teilen
              </button>
              <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800">
                <Trash2 size={16} /> Löschen
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Full Image */}
      <div className="flex flex-1 items-center justify-center">
        <div className="relative aspect-square w-full">
          <Image
            src={photo.imageUrl}
            alt=""
            fill
            className="object-contain"
            sizes="430px"
            priority
          />
        </div>
      </div>
    </div>
  );
}
