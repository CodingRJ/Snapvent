"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Gem, Home, User, Users } from "lucide-react";
import { useRef } from "react";
import { uploadGroupPhoto } from "~/services/groups.actions";

const baseNavItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/profile", icon: User, label: "Profil" },
  { href: "/premium", icon: Gem, label: "Premium" },
];

export function AppNav() {
  const pathname = usePathname();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const groupMatch = pathname.match(/^\/groups\/([\w-]+)/);
  const groupId = groupMatch?.[1] ?? null;

  const handleCameraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !groupId) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      await uploadGroupPhoto(groupId, fd);
      window.dispatchEvent(new CustomEvent("snapvent:photo-uploaded"));
    } catch (err) {
      console.error("Camera upload error:", err);
    } finally {
      e.target.value = "";
    }
  };

  const mobileItems: Array<
    | {
        type: "link";
        href: string;
        icon: React.ElementType;
        label: string;
        active?: boolean;
      }
    | { type: "camera"; icon: React.ElementType; label: string }
  > = groupId
    ? [
        { type: "link", href: "/", icon: Home, label: "Home" },
        {
          type: "link",
          href: `/groups/${groupId}`,
          icon: Users,
          label: "Gruppe",
          active: true,
        },
        { type: "camera", icon: Camera, label: "Kamera" },
        { type: "link", href: "/profile", icon: User, label: "Profil" },
        { type: "link", href: "/premium", icon: Gem, label: "Premium" },
      ]
    : baseNavItems.map((item) => ({ type: "link" as const, ...item }));

  return (
    <>
      {/* Mobile: floating bottom pill */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-muted rounded-3xl flex items-center justify-around h-14 px-5 gap-6">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCameraChange}
        />
        {mobileItems.map((item) => {
          if (item.type === "camera") {
            return (
              <button
                key="camera"
                aria-label={item.label}
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center w-10 h-10 text-muted-foreground transition-colors"
              >
                <item.icon size={24} />
              </button>
            );
          }
          const active = item.active ?? pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex items-center justify-center w-10 h-10 transition-colors ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <item.icon size={24} />
            </Link>
          );
        })}
      </nav>

      {/* Desktop: left sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r bg-background h-screen sticky top-0">
        <div className="px-6 py-5 border-b">
          <span className="font-bold text-lg text-primary">Snapvent</span>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {baseNavItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
