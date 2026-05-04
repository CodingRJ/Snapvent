import { AuthGuard } from "~/components/AuthGuard";
import { AppNav } from "~/components/AppNav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <AppNav />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 p-4 md:p-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
