"use client";

import { SyntheticEvent, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username, password);
    } catch {
      setError("Benutzername oder Passwort falsch.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-primary h-screen flex justify-center items-center flex-col">
      <div className="max-w-xs flex flex-col gap-14s">
        <h1 className="font-bold text-primary-foreground text-5xl">
          Willkommen zu Snapvent
        </h1>
        <div className="w-full mt-6">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLegend>Benutzername</FieldLegend>
                    <Input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLegend>Password</FieldLegend>
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  {error && <p className="text-sm text-red-300">{error}</p>}
                  <Field>
                    <Button
                      type="submit"
                      className="text-primary hover:text-primary font-bold"
                      variant="outline"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Laden..." : "Login"}
                    </Button>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </form>
          <div className="text-sm text-primary-foreground mt-2">
            Du hast noch keinen Account?{" "}
            <a
              href="/register"
              className="font-bold text-primary-foreground hover:underline"
            >
              Erstelle jetzt einen!
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
