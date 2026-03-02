"use client";

import { useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import { Check } from "lucide-react";

export default function CreateJoinPage() {
  const [tab, setTab] = useState("create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [feedback, setFeedback] = useState(null);

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setFeedback({
      type: "success",
      message: `Gruppe "${name}" wurde erstellt! Code: ${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    });
    setName("");
    setDescription("");
  }

  function handleJoin(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setFeedback({
      type: "success",
      message: `Du bist der Gruppe beigetreten!`,
    });
    setJoinCode("");
  }

  return (
    <div>
      <PageHeader title="Gruppe Hinzufügen" backHref="/" />

      {/* Tab Toggle */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setTab("create"); setFeedback(null); }}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            tab === "create"
              ? "border-b-2 border-primary text-primary"
              : "text-muted"
          }`}
        >
          Gruppe erstellen
        </button>
        <button
          onClick={() => { setTab("join"); setFeedback(null); }}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            tab === "join"
              ? "border-b-2 border-primary text-primary"
              : "text-muted"
          }`}
        >
          Gruppe beitreten
        </button>
      </div>

      <div className="p-4">
        {/* Feedback Banner */}
        {feedback && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <Check size={18} />
            {feedback.message}
          </div>
        )}

        {tab === "create" ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Gruppenname *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Hochzeit Anna & Tim"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Beschreibung
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional: Beschreibe das Event..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Gruppe erstellen
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Einladungscode
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="z.B. ANNA2025"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm uppercase tracking-wider outline-none focus:border-primary"
                required
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Beitreten
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
