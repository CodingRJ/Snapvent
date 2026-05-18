"use client";

import { useAuth } from "~/context/AuthContext";
import { Button } from "~/components/ui/button";

export default function ProfileInfosPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-primary">Profil-Informationen</h1>

      {/* Persönliche Daten */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-primary">Persönliche Daten</h2>
        <div className="bg-secondary p-8 rounded-lg flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.username
              .split(" ")
              .map((w) => w[0]?.toUpperCase())
              .slice(0, 2)
              .join("")}
          </div>
          <p className="text-white font-bold">{user?.username}</p>
          <p className="text-white font-light">{user?.email}</p>
        </div>
      </section>

      {/* Email-Adresse */}
      <section className="flex flex-col gap-1">
        <h2 className="font-bold text-primary">Email-Adresse</h2>
        <p className="text-sm text-foreground">{user?.email}</p>
      </section>

      {/* Passwort */}
      <section className="flex flex-col gap-1">
        <h2 className="font-bold text-primary">Passwort</h2>
        <p className="text-sm tracking-widest">••••••</p>
      </section>

      {/* Actions */}
      <div className="sticky bottom-0 bg-background pt-4 pb-16">
        <Button size="lg" className="w-full" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
