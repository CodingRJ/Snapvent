"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, MoreVertical, Trash2 } from "lucide-react";
import Image from "next/image";
import type { Thumbnail } from "~/services/groups.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SLIDE_MS = 280;

const urlCache = new Map<string | number, string>();

async function resolveFullUrl(token: string, id: string | number): Promise<string | null> {
  const cached = urlCache.get(id);
  if (cached) return cached;
  const res = await fetch(`${API_URL}/pictures/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const raw: unknown = await res.json();
  const url =
    typeof raw === "string"
      ? raw
      : raw && typeof raw === "object" && "full_url" in raw && typeof (raw as Record<string, unknown>).full_url === "string"
        ? (raw as Record<string, unknown>).full_url as string
        : null;
  if (!url) return null;
  urlCache.set(id, url);
  return url;
}

interface Props {
  thumbnails: Thumbnail[];
  initialIndex: number;
  token: string;
  onClose: () => void;
  onDelete?: (id: string | number) => void;
}

export default function PictureViewer({ thumbnails, initialIndex, token, onClose, onDelete }: Props) {
  const [items, setItems] = useState(thumbnails);
  const [index, setIndex] = useState(initialIndex);
  const [urls, setUrls] = useState<Record<string | number, string>>({});
  // slideX: additional offset on top of the -33.333% base (pixels from drag or animation)
  const [slideX, setSlideX] = useState(0);
  // instant: disables CSS transition so we can teleport without a visible jump
  const [instant, setInstant] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const indexRef = useRef(initialIndex);
  const touchStartX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const loadUrl = useCallback(
    async (idx: number) => {
      const thumb = items[idx];
      if (!thumb) return;
      if (urlCache.has(thumb.id)) {
        setUrls((prev) => ({ ...prev, [thumb.id]: urlCache.get(thumb.id)! }));
        return;
      }
      try {
        const url = await resolveFullUrl(token, thumb.id);
        if (url) setUrls((prev) => ({ ...prev, [thumb.id]: url }));
      } catch {
        // fall back to thumbnail already visible in the slot
      }
    },
    [items, token],
  );

  useEffect(() => {
    loadUrl(index);
    loadUrl(index - 1);
    loadUrl(index + 1);
  }, [index, loadUrl]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Animate to the adjacent slide, then teleport back to center with new index.
  const settle = useCallback(
    (dir: 1 | -1) => {
      const next = indexRef.current + dir;
      if (next < 0 || next >= items.length) return;
      const w = trackRef.current?.offsetWidth ?? window.innerWidth;

      // 1. Slide the strip to the target position (with CSS transition)
      setInstant(false);
      setSlideX(dir * -w);

      // 2. After the animation, snap back to center with the updated index
      setTimeout(() => {
        indexRef.current = next;
        setInstant(true); // disable transition for the instant reposition
        setIndex(next);
        setSlideX(0);
        // 3. Re-enable transitions after two frames so future swipes animate
        requestAnimationFrame(() => requestAnimationFrame(() => setInstant(false)));
      }, SLIDE_MS);
    },
    [items.length],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") settle(-1);
      else if (e.key === "ArrowRight") settle(1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [settle, onClose]);

  const handleDelete = useCallback(async () => {
    const item = items[index];
    if (!item || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/pictures/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");

      onDelete?.(item.id);
      const newItems = items.filter((_, i) => i !== index);

      if (newItems.length === 0) {
        onClose();
        return;
      }

      // Stay at same index (now pointing to next item), or step back at the end
      const newIndex = index >= newItems.length ? newItems.length - 1 : index;
      indexRef.current = newIndex;
      setItems(newItems);
      setIndex(newIndex);
    } catch {
      // silently ignore — user can retry
    } finally {
      setDeleting(false);
    }
  }, [items, index, token, deleting, onDelete, onClose]);

  const current = items[index];
  if (!current) return null;

  // The three visible slots: prev | current | next
  const slots = [
    items[index - 1] ?? null,
    current,
    items[index + 1] ?? null,
  ] as const;

  const urlFor = (thumb: Thumbnail | null) =>
    thumb ? urls[thumb.id] || thumb.thumb_url || null : null;

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shrink-0">
        <button onClick={onClose} className="p-1 -ml-1">
          <ChevronLeft size={24} />
        </button>
        <span className="text-sm font-medium truncate px-2">
          {index + 1} / {items.length}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 -mr-1">
              <MoreVertical size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              <Trash2 size={16} />
              {deleting ? "Wird gelöscht…" : "Löschen"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Swipe container — clips the strip so side slides stay hidden */}
      <div
        ref={trackRef}
        className="flex-1 overflow-hidden select-none"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          setInstant(true); // follow finger without lag
        }}
        onTouchMove={(e) => {
          if (touchStartX.current === null) return;
          const delta = e.touches[0].clientX - touchStartX.current;
          // Dampen drag at the edges so it feels bounded
          const bounded =
            (indexRef.current === 0 && delta > 0) ||
            (indexRef.current === items.length - 1 && delta < 0)
              ? delta * 0.25
              : delta;
          setSlideX(bounded);
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;

          if (delta < -60 && indexRef.current < items.length - 1) {
            settle(1);
          } else if (delta > 60 && indexRef.current > 0) {
            settle(-1);
          } else {
            // Not enough — spring back to center
            setInstant(false);
            setSlideX(0);
          }
        }}
      >
        {/* The 3-wide strip: each slot is 1/3 of the total (= 1 viewport) */}
        <div
          className="flex h-full"
          style={{
            width: "300%",
            transform: `translateX(calc(-33.333% + ${slideX}px))`,
            transition: instant ? "none" : `transform ${SLIDE_MS}ms ease-out`,
            willChange: "transform",
          }}
        >
          {slots.map((thumb, slot) => {
            const url = urlFor(thumb);
            return (
              <div key={slot} className="relative" style={{ width: "33.333%" }}>
                {url && (
                  <Image
                    src={url}
                    alt="Bild"
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
