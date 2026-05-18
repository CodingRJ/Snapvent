"use client";

import { Check, X } from "lucide-react";

const RULES = [
  { label: "Mindestens 12 Zeichen", test: (p: string) => p.length >= 12 },
  {
    label: "Mindestens ein Grossbuchstabe",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    label: "Mindestens ein Kleinbuchstabe",
    test: (p: string) => /[a-z]/.test(p),
  },
  { label: "Mindestens eine Zahl", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "Mindestens ein Sonderzeichen",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

export function validatePassword(password: string): boolean {
  return RULES.every((r) => r.test(password));
}

export function PasswordRequirements({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="mt-2 space-y-1">
      {RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.label} className="flex items-center gap-1.5 text-xs">
            {ok ? (
              <Check size={12} className="shrink-0 text-green-400" />
            ) : (
              <X size={12} className="shrink-0 text-white" />
            )}
            <span className={ok ? "text-green-300" : "text-white"}>
              {rule.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
