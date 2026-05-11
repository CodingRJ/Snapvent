"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";

export default function BugReportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    // placeholder send logic
    console.log({ subject, message });

    setSubject("");
    setMessage("");

    alert("Nachricht gesendet!");
  };

  return (
    <div className="min-h-screen flex flex-col gap-4 bg-white">
      <h1 className="text-2xl font-bold text-primary mb-4">Problem melden</h1>

      <p className="text-sm text-foreground">
        Ist dir ein Problem aufgefallen oder du möchtest uns Rückmeldung zu der
        App geben? Dann schreib uns eine Nachricht.
      </p>

      <div className="flex flex-col gap-3">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Betreff"
          className="w-full bg-[#F5F5F5] p-3 rounded-lg outline-none"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nachricht"
          rows={6}
          className="w-full bg-[#F5F5F5] p-3 rounded-lg outline-none resize-none"
        />

        <Button
          onClick={handleSubmit}
          className="bg-[#901F26] text-white rounded-lg"
        >
          Senden
        </Button>
      </div>
    </div>
  );
}
