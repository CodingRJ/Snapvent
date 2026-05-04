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

export async function uploadGroupPhoto(
  token: string,
  groupId: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("groupId", groupId);

  const res = await fetch("/api/upload-proxy", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.error("uploadGroupPhoto failed:", res.status, data);
    throw new Error(data.error ?? "Foto konnte nicht hochgeladen werden");
  }
}
