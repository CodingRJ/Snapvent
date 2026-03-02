"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Camera, Diamond, User } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/groups/new", icon: Plus, label: "Hinzufügen" },
  { href: "/camera", icon: Camera, label: "Kamera", isCenter: true },
  { href: "/premium", icon: Diamond, label: "Premium" },
  { href: "/profile", icon: User, label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-end justify-around border-t border-border bg-background px-2 pb-2 pt-1"
      style={{ height: "var(--nav-height)" }}
    >
      {navItems.map(({ href, icon: Icon, label, isCenter }) => {
        const isActive = pathname === href;

        if (isCenter) {
          return (
            <Link
              key={href}
              href={href}
              className="-mt-4 flex flex-col items-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                <Icon size={28} />
              </span>
              <span className="mt-0.5 text-[10px] text-primary font-medium">
                {label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 py-1 ${
              isActive ? "text-primary" : "text-muted"
            }`}
          >
            <Icon size={22} />
            <span className="text-[10px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
