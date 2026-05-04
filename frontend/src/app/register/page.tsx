"use client";

import { SyntheticEvent, useState } from "react";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/context/AuthContext";
import { registerApi } from "~/services/auth.service";
import {
  Field,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";

export default function Register() {
  const { loginWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const token = await registerApi(username, email, password);
      loginWithToken(token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registrierung fehlgeschlagen",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-primary h-screen flex justify-center items-center flex-col">
      <div className="max-w-xs flex flex-col gap-14s">
        <h1 className="font-bold text-primary-foreground text-5xl">
          Erstelle einen Nutzer
        </h1>
        <div className="w-full mt-6">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLegend>Email</FieldLegend>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLegend>Benutzer</FieldLegend>
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
                      className="text-primary hover:text-primary font-bold"
                      type="submit"
                      variant="outline"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Laden..." : "Registrieren"}
                    </Button>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </form>
          <div className="text-sm text-primary-foreground mt-2">
            Du hast bereits einen Account?{" "}
            <a
              href="/login"
              className="font-bold text-primary-foreground hover:underline"
            >
              Melde dich an!
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
