"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ImageIcon, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { useAuth } from "~/context/AuthContext";
import {
  fetchGroups,
  fetchGroupThumbnails,
  type Group,
  type Thumbnail,
} from "~/services/groups.service";
import { uploadGroupPhoto } from "~/services/groups.actions";
import Image from "next/image";
import PictureViewer from "~/components/PictureViewer";
import GroupActionsMenu from "~/components/GroupActionsMenu";

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const { access_token } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [uploading, setUploading] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
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
        <GroupActionsMenu
          groupId={id}
          groupName={group?.name ?? ""}
          groupDescription={group?.description ?? ""}
          onDeleted={() => router.push("/")}
          onUpdated={(name, description) => setGroup((g) => g ? { ...g, name, description } : g)}
        />
      </div>

      {/* Photo grid or empty state */}
      {(() => {
        const visible = thumbnails.filter((t) => t.thumb_url);
        if (visible.length === 0) {
          return (
            <Empty className="flex-1">
              <EmptyMedia variant="icon">
                <ImageIcon />
              </EmptyMedia>
              <EmptyContent>
                <EmptyTitle>Keine Bilder</EmptyTitle>
                <EmptyDescription>
                  Ersstelle / Lade deine ersten Bilder in diese Gruppe hoch.
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          );
        }
        return (
          <div className="grid grid-cols-3 gap-3">
            {visible.map((thumb, idx) => (
              <button
                key={thumb.id}
                onClick={() => setViewerIndex(idx)}
                className="relative aspect-square rounded-xl overflow-hidden bg-muted/30"
              >
                {typeof thumb.thumb_url === "string" && thumb.thumb_url && (
                  <Image
                    src={thumb.thumb_url}
                    alt="picture"
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                )}
              </button>
            ))}

            {/* "+" add cell always at the end */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted/30 transition-colors"
            >
              <Plus size={24} />
            </button>
          </div>
        );
      })()}

      {/* Hidden file input — gallery picker (no capture) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Fixed upload button */}
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

      {/* Full-screen picture viewer */}
      {viewerIndex !== null && access_token && (
        <PictureViewer
          thumbnails={thumbnails.filter((t) => t.thumb_url)}
          initialIndex={viewerIndex}
          token={access_token}
          onClose={() => setViewerIndex(null)}
          onDelete={(id) => setThumbnails((prev) => prev.filter((t) => t.id !== id))}
        />
      )}
    </div>
  );
}
