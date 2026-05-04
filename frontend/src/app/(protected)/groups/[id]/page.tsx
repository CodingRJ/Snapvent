"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { MoreVertical, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/context/AuthContext";
import {
  fetchGroups,
  fetchGroupThumbnails,
  type Group,
  type Thumbnail,
} from "~/services/groups.service";
import { uploadGroupPhoto } from "~/services/groups.actions";
import Image from "next/image";

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const { access_token } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailCountRef = useRef(0);

  const loadThumbnails = useCallback(async () => {
    if (!access_token) return;
    const data = await fetchGroupThumbnails(access_token, id);
    thumbnailCountRef.current = data.length;
    setThumbnails(data);
  }, [access_token, id]);

  // After an upload, poll every second until a new thumbnail appears (max 10s)
  const pollForNewThumbnail = useCallback(async () => {
    if (!access_token) return;
    const prevCount = thumbnailCountRef.current;
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const data = await fetchGroupThumbnails(access_token, id);
      setThumbnails(data);
      if (data.length > prevCount) {
        thumbnailCountRef.current = data.length;
        break;
      }
    }
  }, [access_token, id]);

  useEffect(() => {
    if (!access_token) return;
    fetchGroups(access_token)
      .then((groups) =>
        setGroup(groups.find((g) => String(g.id) === id) ?? null),
      )
      .catch(() => {});
    loadThumbnails();
  }, [access_token, id, loadThumbnails]);

  // Listen for uploads triggered by the AppNav camera button
  useEffect(() => {
    const handler = () => pollForNewThumbnail();
    window.addEventListener("snapvent:photo-uploaded", handler);
    return () => window.removeEventListener("snapvent:photo-uploaded", handler);
  }, [pollForNewThumbnail]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !access_token) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await uploadGroupPhoto(id, fd);
      await pollForNewThumbnail();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary">
          {group?.name ?? "Gruppe"}
        </h1>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <MoreVertical size={18} />
        </Button>
      </div>

      {/* Photo grid */}
      <div className="flex-1 grid grid-cols-3 gap-1.5">
        {thumbnails.filter((t) => t.thumb_url).map((thumb) => (
          <div
            key={thumb.id}
            className="relative aspect-square rounded-xl overflow-hidden bg-muted/30"
          >
            <Image
              src={thumb.thumb_url}
              alt=""
              fill
              className="object-cover"
              sizes="33vw"
            />
          </div>
        ))}

        {/* "+" add cell always at the end */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square border rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Hidden file input — gallery picker (no capture) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Sticky upload button */}
      <div className="sticky bottom-0 bg-background pt-4 pb-16">
        <Button
          size="lg"
          className="w-full"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus size={18} />
          {uploading ? "Wird hochgeladen..." : "Bilder uploaden"}
        </Button>
      </div>
    </div>
  );
}
