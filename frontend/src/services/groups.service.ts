const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Group {
  id: number;
  name: string;
}

export async function fetchGroups(token: string): Promise<Group[]> {
  const res = await fetch(`${API_URL}/groups`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return Array.isArray(data) ? data : [];
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
