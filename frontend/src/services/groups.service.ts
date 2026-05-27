const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Group {
  id: number;
  name: string;
  description?: string;
  group_img_url: string;
}

export interface Thumbnail {
  id: number | string;
  thumb_url: string;
}

// Unwrap IDs that the API may return as objects (e.g. MongoDB {$oid:"..."})
function extractId(v: unknown): number | string {
  if (typeof v === "number" || typeof v === "string") return v;
  if (v && typeof v === "object") {
    const vals = Object.values(v as object);
    if (vals.length > 0) return extractId(vals[0]);
  }
  return String(v ?? "");
}

export async function fetchGroups(token: string): Promise<Group[]> {
  const res = await fetch(`${API_URL}/groups`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];

  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((g: Record<string, unknown>) => ({
    ...g,
    id: extractId(g.id ?? g.group_id),
  })) as Group[];
}

export async function createGroup(
  token: string,
  name: string,
  description: string,
  usernames: string[],
): Promise<Group> {
  const res = await fetch(`${API_URL}/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description, usernames }),
  });

  if (!res.ok) throw new Error("Gruppe konnte nicht erstellt werden");

  return res.json();
}

export async function updateGroup(
  token: string,
  groupId: string,
  name: string,
  description: string,
): Promise<Group> {
  const res = await fetch(`${API_URL}/groups/${groupId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description }),
  });

  if (!res.ok) throw new Error("Gruppe konnte nicht aktualisiert werden");

  return res.json();
}

export async function deleteGroup(
  token: string,
  groupId: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/groups/${groupId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Gruppe konnte nicht gelöscht werden");
}

export async function fetchGroupThumbnails(
  token: string,
  groupId: string,
): Promise<Thumbnail[]> {
  const res = await fetch(`${API_URL}/groups/${groupId}/thumbnails`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchQrData(
  token: string,
  groupId: string,
): Promise<string> {
  const res = await fetch(`${API_URL}/groups/${groupId}/qr-data`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("QR Daten konnten nicht geladen werden");

  return res.json();
}

export interface GroupMember {
  userId: string | number;
  username: string;
}

export async function fetchGroupMembers(
  token: string,
  groupId: string,
): Promise<GroupMember[]> {
  const res = await fetch(`${API_URL}/groups/${groupId}/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Mitglieder konnten nicht geladen werden");

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function joinGroup(
  token: string,
  inviteCode: string,
): Promise<string> {
  const res = await fetch(`${API_URL}/groups/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ invite_code: inviteCode }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("joinGroup failed", res.status, body);
    throw new Error(`${res.status}: ${body}`);
  }

  return res.json();
}
