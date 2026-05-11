"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "~/context/AuthContext";
import {
  Users,
  ChevronRight,
  Settings,
  Lightbulb,
  Gem,
  Frown,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export default function Profil() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const inviteLink = "https://snapevent.ch";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const router = useRouter();

  const redirectToSite = (link: string) => {
    router.push(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full flex flex-col gap-4 p-4">
        {/* Profil Header */}
        <div className="bg-secondary p-8 rounded-lg flex flex-col items-center gap-4 w-full">
          <div className="w-20 h-20 bg-primary rounded-full"></div>
          <p className="text-white font-bold">{user?.username}</p>
          <p className="text-white font-light">{user?.email}</p>
        </div>

        {/* Invite Friends Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full bg-gradient-to-r from-background via-[#F6ECEC] via-[#D0989D] to-primary py-6 px-4 rounded-lg flex items-center gap-2 text-left hover:opacity-90 transition cursor-pointer">
              <Users size={18} />
              <span>Freunde einladen</span>
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="center"
            className="w-[calc(100vw-2rem)] max-w-none bg-[#F6ECEC] border-none rounded-lg shadow-lg p-4"
          >
            <div className="flex flex-col gap-3 w-full">
              <p className="font-semibold text-primary">Freunde einladen</p>

              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border">
                <span className="flex-1 text-sm text-foreground truncate select-none">
                  {inviteLink}
                </span>

                <Button
                  onClick={handleCopy}
                  className="bg-primary text-white rounded-lg shrink-0"
                  size="icon"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>

              {/* Copy Feedback */}
              {copied && (
                <div className="min-h-h">
                  <p className="text-sm text-primary font-medium animate-in fade-in duration-200">
                    Link copied successfully!
                  </p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clickable Navigation Items */}
        {[
          {
            icon: Settings,
            label: "Profil bearbeiten",
            link: "/profile/infos",
          },
          { icon: Lightbulb, label: "FAQ", link: "/profile/faq" },
          {
            icon: Gem,
            label: "Abonnement verwalten",
            link: "/premium",
          },
          { icon: Frown, label: "Problem melden", link: "/profile/bug-report" },
        ].map((item, index) => (
          <div
            key={index}
            onClick={() => redirectToSite(item.link)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                redirectToSite(item.link);
              }
            }}
            className="w-full bg-[#F5F5F5] p-4 rounded-lg flex items-center justify-between hover:bg-[#ECECEC] transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <item.icon size={18} />
              <span>{item.label}</span>
            </div>

            <Button
              className="bg-primary text-white rounded-lg pointer-events-none"
              size="icon"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
