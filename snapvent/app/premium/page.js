import { Diamond, Check } from "lucide-react";
import PageHeader from "@/app/components/PageHeader";

export default function PremiumPage() {
  const usedGB = 1.2;
  const totalGB = 2;
  const usagePercent = Math.round((usedGB / totalGB) * 100);

  return (
    <div>
      <PageHeader title="Premium" />

      <div className="p-4">
        {/* Current Plan */}
        <div className="mb-6 rounded-xl border border-border p-4">
          <p className="text-sm text-muted">Aktueller Plan</p>
          <p className="text-lg font-semibold">Free</p>

          {/* Storage Bar */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>Speicher</span>
              <span>{usedGB} / {totalGB} GB</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Premium Card */}
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Diamond size={24} className="text-primary" />
            <h2 className="text-lg font-bold">Snapvent Premium</h2>
          </div>

          <p className="mb-4 text-sm text-muted">
            Mehr Speicher, mehr Möglichkeiten.
          </p>

          <ul className="mb-6 flex flex-col gap-2">
            {[
              "50 GB Speicher",
              "Unbegrenzte Gruppen",
              "Prioritäts-Support",
              "Keine Werbung",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-primary" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mb-4 text-center">
            <span className="text-3xl font-bold">2.99</span>
            <span className="text-muted"> CHF / Monat</span>
          </div>

          <button className="w-full rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primary/90">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
