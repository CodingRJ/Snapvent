"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchQrDataAction(groupId: string): Promise<string> {
  const token = (await cookies()).get("access_token")?.value;
  const res = await fetch(`${API_URL}/groups/${groupId}/qr-data`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const raw = await res.text();
  console.log("[fetchQrDataAction] status:", res.status, "raw body:", raw);
  if (!res.ok) throw new Error("QR Daten konnten nicht geladen werden");

  const parsed = JSON.parse(raw);
  if (typeof parsed === "string") return parsed;
  if (parsed?.invite_code) return String(parsed.invite_code);
  return raw;
}

export async function joinGroupAction(inviteCode: string): Promise<string> {
  const token = (await cookies()).get("access_token")?.value;
  console.log("[joinGroupAction] invite_code:", inviteCode);
  console.log("[joinGroupAction] token present:", !!token);

  const res = await fetch(`${API_URL}/groups/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ invite_code: inviteCode }),
  });

  const body = await res.text();
  console.log("[joinGroupAction] status:", res.status, "body:", body);

  if (!res.ok) throw new Error(`${res.status}: ${body}`);

  return body;
}

export async function uploadGroupPhoto(
  groupId: string,
  formData: FormData,
): Promise<void> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) throw new Error("Nicht authentifiziert");

  const file = formData.get("file") as File;
  if (!file) throw new Error("Keine Datei");

  // Step 1: get presigned URL from backend
  const urlRes = await fetch(`${API_URL}/groups/${groupId}/pictures`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type,
      file_size: file.size,
    }),
  });

  if (!urlRes.ok) {
    const body = await urlRes.text();
    throw new Error(`Upload URL fehlgeschlagen: ${body}`);
  }

  const data = await urlRes.json();
  const uploadUrl = data.url ?? data.upload_url ?? data.presigned_url;
  if (!uploadUrl) throw new Error("Keine Upload URL erhalten");

  // Step 2: upload directly to GCS — no CORS issues server-to-server
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    body: await file.arrayBuffer(),
    headers: { "Content-Type": file.type },
  });

  if (!putRes.ok) {
    const body = await putRes.text();
    throw new Error(`GCS Upload fehlgeschlagen: ${body}`);
  }
}
