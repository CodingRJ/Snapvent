"use client";

import { useEffect, useState } from "react";
import {
  MoreVertical,
  Plus,
  QrCode,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { useAuth } from "~/context/AuthContext";
import { Textarea } from "~/components/ui/textarea";
import {
  fetchGroups,
  createGroup as createGroupApi,
  type Group,
} from "~/services/groups.service";

export default function Home() {
  const { access_token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!access_token) return;
    fetchGroups(access_token).then(setGroups).catch(() => {});
  }, [access_token]);

  const createGroup = async () => {
    if (!groupName.trim() || !access_token) return;
    setCreating(true);
    try {
      const newGroup = await createGroupApi(
        access_token,
        groupName.trim(),
        groupDescription.trim(),
      );
      setGroups((prev) => [...prev, newGroup]);
      setGroupName("");
      setGroupDescription("");
      setDrawerOpen(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Group list */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-primary mb-4">Meine Gruppen</h1>
        {groups.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyContent>
              <EmptyTitle>Keine Gruppen</EmptyTitle>
              <EmptyDescription>
                Erstelle eine Gruppe oder tritt einer bei.
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-3 border rounded-xl p-3"
              >
                <div className="w-16 h-16 border rounded-lg shrink-0" />
                <span className="flex-1 font-medium">{group.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground shrink-0"
                >
                  <MoreVertical size={18} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom actions */}
      <div className="sticky bottom-0 bg-background pt-4 pb-16 flex flex-col gap-2">
        <Button
          variant="outline"
          size="lg"
          className="w-full border-primary text-primary hover:bg-primary/5"
        >
          <QrCode size={18} />
          Gruppe per QR Code beitreten
        </Button>

        <Drawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          repositionInputs={false}
        >
          <DrawerTrigger asChild>
            <Button size="lg" className="w-full">
              <Plus size={18} />
              Gruppe erstellen
            </Button>
          </DrawerTrigger>

          <DrawerContent className="h-[90vh] md:max-w-lg md:left-1/2 md:-translate-x-1/2 md:right-auto md:rounded-xl">
            {/* Header */}
            <DrawerHeader className="flex-row items-start text-left pb-4">
              <div className="flex flex-col gap-1">
                <DrawerTitle className="text-xl font-bold text-primary">
                  Gruppe erstellen
                </DrawerTitle>
                <DrawerDescription>
                  Erstelle eine neue Gruppe um Bilder und Videos mit Freunden
                  und Familie zu teilen
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground mt-0.5"
                >
                  <X size={18} />
                </Button>
              </DrawerClose>
            </DrawerHeader>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 pb-2">
              {/* Group name */}
              <div className="mb-5">
                <label className="text-sm font-bold block mb-1.5">
                  Gruppenname
                </label>
                <Input
                  placeholder="Gruppenname"
                  className="text-foreground"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              {/* Group description */}
              <div className="mb-5">
                <label className="text-sm font-bold block mb-1.5">
                  Beschreibung
                </label>
                <Textarea
                  rows={4}
                  placeholder="Beschreibung"
                  className="text-foreground"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Footer buttons */}
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-primary text-primary hover:bg-primary/5"
                >
                  Abbrechen
                </Button>
              </DrawerClose>
              <Button
                size="lg"
                className="w-full"
                disabled={creating || !groupName.trim()}
                onClick={createGroup}
              >
                {creating ? "Erstelle..." : "Gruppe erstellen"}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
