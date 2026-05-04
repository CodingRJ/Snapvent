"use client";

import { useAuth } from "~/context/AuthContext";
import { Users, ChevronRight, Settings, Lightbulb, Gem, Frown } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full flex flex-col gap-4 p-4">
        <div className="bg-[#BE7C81] p-8 rounded-lg flex flex-col items-center gap-4 w-full">
          <div className="w-20 h-20 bg-[#901F26] rounded-full"></div>
          <p className="text-white font-bold">{user?.username}</p>
          <p className="text-white font-light">{user?.email}</p>
        </div>
        <div className="w-full bg-gradient-to-r from-[#FFFFFF] via-[#F6ECEC] via-[#D0989D] to-[#901F26] py-6 px-4 rounded-lg flex items-center gap-2">
          <Users size={18} />
          <span>Freunde einladen</span>
        </div>
        <div className="w-full bg-[#F5F5F5] p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={18} />
            <span>Profil bearbeiten</span>
          </div>
          <Button className="bg-[#901F26] text-white rounded-lg" size="icon">
            <ChevronRight size={18} />
          </Button>
        </div>
        <div className="w-full bg-[#F5F5F5] p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb size={18} />
            <span>FAQ</span>
          </div>
          <Button className="bg-[#901F26] text-white rounded-lg" size="icon">
            <ChevronRight size={18} />
          </Button>
        </div>
        <div className="w-full bg-[#F5F5F5] p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gem size={18} />
            <span>Abonnement verwalten</span>
          </div>
          <Button className="bg-[#901F26] text-white rounded-lg" size="icon">
            <ChevronRight size={18} />
          </Button>
        </div>
        <div className="w-full bg-[#F5F5F5] p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Frown size={18} />
            <span>Problem melden</span>
          </div>
          <Button className="bg-[#901F26] text-white rounded-lg" size="icon">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
