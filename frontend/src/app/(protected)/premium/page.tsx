import { Button } from "~/components/ui/button";

const plans = [
  {
    name: "Pro",
    tagline: "Wechsle jetzt zu Pro und erhalte folgende Vorteile",
    perks: [
      "Bis zu 10 Gruppen",
      "1 TB Speicher pro Gruppe",
      "Lade bis zu 15 Personen in eine Gruppe ein",
    ],
  },
  {
    name: "Premium",
    tagline: "Wechsle jetzt zu Premium und erhalte folgende Vorteile",
    perks: [
      "Unlimitierte Anzahl Gruppen",
      "20 TB Speicher pro Gruppe",
      "Unlimitierte Anzahl Personen in einer Gruppe",
    ],
  },
];

export default function PremiumPage() {
  return (
    <div className="flex flex-col min-h-full">
      <h1 className="text-2xl font-bold text-primary mb-6">Abonnement Pläne</h1>

      <div className="flex flex-col gap-5">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-2xl p-6 bg-linear-to-b from-white via-[#E9D2D4] to-primary shadow-sm"
          >
            <h2 className="text-4xl font-bold text-primary mb-2">
              {plan.name}
            </h2>
            <p className="font-bold text-md text-foreground mb-4">
              {plan.tagline}
            </p>

            <ul className="text-sm text-foreground space-y-1 mb-4 pl-1">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-end">
              <Button
                size="lg"
                className="bg-white text-primary border-none hover:bg-white/90"
              >
                Jetzt wechseln
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
