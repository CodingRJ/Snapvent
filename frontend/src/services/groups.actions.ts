"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
