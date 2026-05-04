const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginApi(
  username: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Login fehlgeschlagen");

  const data = await res.json();
  return data.access_token;
}

export async function registerApi(
  username: string,
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) throw new Error(data?.detail ?? "Registrierung fehlgeschlagen");

  return data.access_token;
}
