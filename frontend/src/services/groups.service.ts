const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Group {
  id: number;
  name: string;
}

export interface Thumbnail {
  id: number | string;
  thumb_url: string;
}

export async function fetchGroups(token: string): Promise<Group[]> {
  const res = await fetch(`${API_URL}/groups`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];

  const data = await res.json();
  if (!Array.isArray(data)) return [];
  // Normalize: API may return group_id instead of id
  return data.map((g: Record<string, unknown>) => ({
    ...g,
    id: g.id ?? g.group_id,
  })) as Group[];
}

export async function createGroup(
  token: string,
  name: string,
  description: string,
): Promise<Group> {
  const res = await fetch(`${API_URL}/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description }),
  });

  if (!res.ok) throw new Error("Gruppe konnte nicht erstellt werden");

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

