import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const groupId = formData.get("groupId") as string | null;

  if (!file || !groupId) {
    return NextResponse.json({ error: "Missing file or groupId" }, { status: 400 });
  }

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
    return NextResponse.json({ error: "Failed to get upload URL", detail: body }, { status: urlRes.status });
  }

  const data = await urlRes.json();
  const uploadUrl = data.url ?? data.upload_url ?? data.presigned_url;

  if (!uploadUrl) {
    return NextResponse.json({ error: "No upload URL in response", data }, { status: 500 });
  }

  // Step 2: upload to GCS from the server (no CORS restrictions server-to-server)
  const buffer = await file.arrayBuffer();
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    body: buffer,
    headers: { "Content-Type": file.type },
  });

  if (!putRes.ok) {
    const body = await putRes.text();
    return NextResponse.json({ error: "GCS upload failed", detail: body }, { status: putRes.status });
  }

  return NextResponse.json({ success: true });
}
