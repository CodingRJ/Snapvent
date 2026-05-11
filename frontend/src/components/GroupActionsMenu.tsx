"use client";

import { useState } from "react";
import { Loader2, MoreVertical, Pen, Share2, Trash2, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "~/components/ui/button";
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
import {
  deleteGroup as deleteGroupApi,
  fetchGroupMembers,
  type GroupMember,
} from "~/services/groups.service";
import { fetchQrDataAction } from "~/services/groups.actions";

interface Props {
  groupId: string | number;
  groupName: string;
  onDeleted?: () => void;
}

export default function GroupActionsMenu({ groupId, groupName, onDeleted }: Props) {
  const { access_token } = useAuth();
  const id = String(groupId);

  const [membersOpen, setMembersOpen] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareQrData, setShareQrData] = useState<string | null>(null);
  const [shareQrLoading, setShareQrLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openMembers = async () => {
    if (!access_token) return;
    setMembers([]);
    setMembersLoading(true);
    setMembersOpen(true);
    try {
      const data = await fetchGroupMembers(access_token, id);
      setMembers(data);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const openShare = async () => {
    setShareQrData(null);
    setShareQrLoading(true);
    setShareOpen(true);
    try {
      const data = await fetchQrDataAction(id);
      setShareQrData(data);
    } catch {
      setShareQrData(null);
    } finally {
      setShareQrLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!access_token) return;
    setDeleting(true);
    try {
      await deleteGroupApi(access_token, id);
      setDeleteOpen(false);
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  };

  return (
    // This div stops React portal event bubbling — clicks inside any dialog
    // (or on the overlay) would otherwise bubble up through React's component
    // tree to a parent onClick handler (e.g. the group row nav link).
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="contents" onClick={(e) => e.stopPropagation()}>
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
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openMembers(); }}>
            <Users size={16} />
            Mitglieder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openShare(); }}>
            <Share2 size={16} />
            Teilen
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
            <Pen size={16} />
            Bearbeiten
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
          >
            <Trash2 size={16} />
            Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Members dialog */}
      <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mitglieder</DialogTitle>
          </DialogHeader>
          {membersLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Wird geladen…
            </p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Keine Mitglieder gefunden.
            </p>
          ) : (
            <ul className="flex flex-col gap-2 pt-2">
              {members.map((m) => (
                <li
                  key={m.userId}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2"
                >
                  <Users size={16} className="text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">{m.username}</span>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      {/* Share / QR code dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
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

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Gruppe löschen</DialogTitle>
            <DialogDescription>
              Möchtest du die Gruppe &quot;{groupName}&quot; wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Löscht..." : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
