"use client";

export default function FAQPage() {
  const faqs = [
    {
      q: "Wie funktioniert das Einladen von Freunden?",
      a: "Du kannst deinen persönlichen Link kopieren und mit Freunden teilen. Sobald sie sich registrieren, werden sie deinem Konto zugeordnet.",
    },
    {
      q: "Kann ich meinen Account löschen?",
      a: "Ja, gehe in die Profileinstellungen und wähle 'Account löschen'.",
    },
    {
      q: "Ist die App kostenlos?",
      a: "Grundfunktionen sind kostenlos. Premium Funktionen sind im Abonnement enthalten.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col p-4 gap-4 bg-white">
      <h1 className="text-xl font-bold text-[#901F26]">FAQ</h1>

      <div className="flex flex-col gap-3">
        {faqs.map((item, index) => (
          <div
            key={index}
            className="bg-[#F5F5F5] p-4 rounded-lg flex flex-col gap-2"
          >
            <p className="font-semibold">{item.q}</p>
            <p className="text-sm text-gray-600">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}