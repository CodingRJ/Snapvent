import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/app/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Snapvent",
  description: "Teile und sammle Fotos von Events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-100 dark:bg-black`}
      >
        <div className="relative mx-auto min-h-screen max-w-[430px] bg-background shadow-xl">
          <main className="pb-24">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
