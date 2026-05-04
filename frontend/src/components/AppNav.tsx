"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gem, Home, User } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/profile", icon: User, label: "Profil" },
  { href: "/premium", icon: Gem, label: "Premium" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: floating bottom pill */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-muted rounded-3xl flex items-center justify-around gap-10 h-14 px-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex items-center justify-center w-10 h-10 transition-colors ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon size={24} />
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
          {navItems.map(({ href, icon: Icon, label }) => {
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
