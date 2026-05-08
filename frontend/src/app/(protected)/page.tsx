"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MoreVertical, Pen, Plus, QrCode, Share2, Trash2, Users, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useAuth } from "~/context/AuthContext";
import { Textarea } from "~/components/ui/textarea";
import {
  fetchGroups,
  createGroup as createGroupApi,
  deleteGroup as deleteGroupApi,
  type Group,
} from "~/services/groups.service";
import { joinGroupAction, fetchQrDataAction } from "~/services/groups.actions";

function QrScanner({ onScanned }: { onScanned: (code: string) => void }) {
  const [scanError, setScanError] = useState<string | null>(null);
  const onScannedRef = useRef(onScanned);
  useEffect(() => {
    onScannedRef.current = onScanned;
  });

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;
    let stopped = false;

    const start = async () => {
      try {
        scanner = new Html5Qrcode("qr-scanner-view");
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!stopped) {
              stopped = true;
              onScannedRef.current(decodedText);
            }
          },
          () => {},
        );
      } catch {
        setScanError(
          "Kamera konnte nicht gestartet werden. Bitte erlaube den Kamerazugriff.",
        );
      }
    };

    const timer = setTimeout(start, 150);

    return () => {
      stopped = true;
      clearTimeout(timer);
      if (scanner) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            try {
              scanner?.clear();
            } catch {}
          });
      }
    };
  }, []);

  if (scanError) {
    return (
      <p className="text-destructive text-sm text-center py-8">{scanError}</p>
    );
  }

  return <div id="qr-scanner-view" className="w-full rounded-lg overflow-hidden" />;
}

export default function Home() {
  const { access_token } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareQrData, setShareQrData] = useState<string | null>(null);
  const [shareQrLoading, setShareQrLoading] = useState(false);

  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);

  useEffect(() => {
    if (!access_token) return;
    fetchGroups(access_token)
      .then((data) => {
        console.log("Groups loaded:", data);
        setGroups(data);
      })
      .catch((err) => console.error("fetchGroups failed:", err));
  }, [access_token]);

  const openDeleteDialog = (group: Group) => {
    setDeletingGroup(group);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!access_token || !deletingGroup) return;
    setDeleting(true);
    try {
      await deleteGroupApi(access_token, String(deletingGroup.id));
      setGroups((prev) => prev.filter((g) => g.id !== deletingGroup.id));
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || !access_token) return;
    setCreating(true);
    try {
      await createGroupApi(
        access_token,
        groupName.trim(),
        groupDescription.trim(),
      );
      const updated = await fetchGroups(access_token);
      setGroups(updated);
      setGroupName("");
      setGroupDescription("");
      setDrawerOpen(false);
    } finally {
      setCreating(false);
    }
  };

  const openShareDialog = async (e: React.MouseEvent, groupId: number) => {
    e.stopPropagation();
    setShareQrData(null);
    setShareQrLoading(true);
    setShareDialogOpen(true);
    try {
      const data = await fetchQrDataAction(String(groupId));
      setShareQrData(data);
    } catch {
      setShareQrData(null);
    } finally {
      setShareQrLoading(false);
    }
  };

  const closeShareDialog = () => {
    setShareDialogOpen(false);
    setShareQrData(null);
  };

  const handleQrScanned = async (scannedText: string) => {
    if (joinLoading) return;
    console.log("QR scanned:", scannedText);
    setJoinLoading(true);
    setJoinError(null);
    try {
      await joinGroupAction(scannedText);
      setJoinSuccess(true);
      const updated = await fetchGroups(access_token!);
      setGroups(updated);
      setTimeout(() => {
        setScanDialogOpen(false);
        setJoinSuccess(false);
        setJoinLoading(false);
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setJoinError(msg);
      setJoinLoading(false);
    }
  };

  const closeScanDialog = () => {
    setScanDialogOpen(false);
    setJoinLoading(false);
    setJoinError(null);
    setJoinSuccess(false);
  };

  const retryScanner = () => {
    setJoinError(null);
    setScannerKey((k) => k + 1);
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
                className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer"
                onClick={() => router.push(`/groups/${group.id}`)}
              >
                <div className="w-16 h-16 border rounded-lg shrink-0" />
                <span className="flex-1 font-medium">{group.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => openShareDialog(e, group.id)}
                    >
                      <Share2 size={16} />
                      Teilen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Pen size={16} />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(group);
                      }}
                    >
                      <Trash2 size={16} />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
          onClick={() => setScanDialogOpen(true)}
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

      {/* Delete dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gruppe löschen</DialogTitle>
            <DialogDescription>
              Möchtest du die Gruppe &quot;{deletingGroup?.name}&quot; wirklich
              löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Löscht..." : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share / QR code dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={closeShareDialog}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Gruppe teilen</DialogTitle>
            <DialogDescription>
              Zeige diesen QR Code deinen Freunden, damit sie der Gruppe
              beitreten können.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            {shareQrLoading && (
              <Loader2 size={48} className="animate-spin text-muted-foreground" />
            )}
            {!shareQrLoading && shareQrData && (
              <QRCodeSVG value={shareQrData} size={220} />
            )}
            {!shareQrLoading && !shareQrData && (
              <p className="text-destructive text-sm text-center">
                QR Code konnte nicht geladen werden.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan / join dialog */}
      <Dialog open={scanDialogOpen} onOpenChange={closeScanDialog}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>QR Code scannen</DialogTitle>
            <DialogDescription>
              Scanne den QR Code deines Freundes, um der Gruppe beizutreten.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {joinSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 size={48} className="text-green-500" />
                <p className="font-medium">Erfolgreich beigetreten!</p>
              </div>
            ) : joinLoading ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 size={48} className="animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Beitreten...</p>
              </div>
            ) : joinError ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <p className="text-destructive text-sm">{joinError}</p>
                <Button variant="outline" onClick={retryScanner}>
                  Erneut versuchen
                </Button>
              </div>
            ) : (
              <QrScanner key={scannerKey} onScanned={handleQrScanned} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
