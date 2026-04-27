"use client";

import { Button } from "~/components/ui/button";
import { useAuth } from "~/context/AuthContext";

export default function Home() {
  const { logout } = useAuth();

  return (
    <>
      <h1 className="text-3xl font-bold underline text-primary">
        Hello world!
      </h1>
      <Button onClick={logout} variant="outline" size="lg" className="mt-4">
        Logout
      </Button>
    </>
  );
}
