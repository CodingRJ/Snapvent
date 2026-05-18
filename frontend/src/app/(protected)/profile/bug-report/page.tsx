"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";

export default function BugReportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSubmit = () => {
    setSuccessOpen(true);
  };

  const handleClose = () => {
    setSuccessOpen(false);
    setSubject("");
    setMessage("");
  };

  return (
    <div className="flex flex-col gap-4">
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
          size="lg"
          className="w-full"
          disabled={!subject.trim() || !message.trim()}
        >
          Senden
        </Button>
      </div>

      <Dialog open={successOpen} onOpenChange={handleClose}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Nachricht erhalten!</DialogTitle>
            <DialogDescription>
              Wir haben deine Nachricht erhalten und werden uns so schnell wie
              möglich darum kümmern. Danke für dein Feedback!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Schliessen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
