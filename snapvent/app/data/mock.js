// ── Mock Data ──────────────────────────────────────────────

export const currentUser = {
  id: "u1",
  name: "Max Müller",
  email: "max@example.com",
  profileImage: "https://picsum.photos/seed/avatar-max/200/200",
  createdAt: "2025-11-01T10:00:00Z",
};

export const users = [
  currentUser,
  {
    id: "u2",
    name: "Lena Fischer",
    email: "lena@example.com",
    profileImage: "https://picsum.photos/seed/avatar-lena/200/200",
    createdAt: "2025-11-02T12:00:00Z",
  },
  {
    id: "u3",
    name: "Jonas Weber",
    email: "jonas@example.com",
    profileImage: "https://picsum.photos/seed/avatar-jonas/200/200",
    createdAt: "2025-11-03T08:00:00Z",
  },
];

export const groups = [
  {
    id: "g1",
    name: "Hochzeit Anna & Tim",
    description: "Fotos von der Hochzeit am Zürichsee",
    coverImage: "https://picsum.photos/seed/wedding/600/400",
    joinCode: "ANNA2025",
    organizerId: "u1",
    memberIds: ["u1", "u2", "u3"],
    createdAt: "2025-12-01T09:00:00Z",
  },
  {
    id: "g2",
    name: "Firmen-Weihnachtsfeier",
    description: "Weihnachtsfeier 2025 bei der Firma",
    coverImage: "https://picsum.photos/seed/christmas/600/400",
    joinCode: "XMAS25",
    organizerId: "u2",
    memberIds: ["u1", "u2"],
    createdAt: "2025-12-15T18:00:00Z",
  },
  {
    id: "g3",
    name: "Skiweekend Davos",
    description: "Skifahren in Davos mit Freunden",
    coverImage: "https://picsum.photos/seed/skiing/600/400",
    joinCode: "SKI2026",
    organizerId: "u1",
    memberIds: ["u1", "u3"],
    createdAt: "2026-01-10T07:00:00Z",
  },
];

export const photos = [
  // Group 1 — Wedding
  { id: "p1", groupId: "g1", uploaderId: "u1", imageUrl: "https://picsum.photos/seed/wed1/800/800", createdAt: "2025-12-01T10:00:00Z" },
  { id: "p2", groupId: "g1", uploaderId: "u2", imageUrl: "https://picsum.photos/seed/wed2/800/800", createdAt: "2025-12-01T10:05:00Z" },
  { id: "p3", groupId: "g1", uploaderId: "u3", imageUrl: "https://picsum.photos/seed/wed3/800/800", createdAt: "2025-12-01T10:10:00Z" },
  { id: "p4", groupId: "g1", uploaderId: "u1", imageUrl: "https://picsum.photos/seed/wed4/800/800", createdAt: "2025-12-01T10:15:00Z" },
  { id: "p5", groupId: "g1", uploaderId: "u2", imageUrl: "https://picsum.photos/seed/wed5/800/800", createdAt: "2025-12-01T10:20:00Z" },
  { id: "p6", groupId: "g1", uploaderId: "u3", imageUrl: "https://picsum.photos/seed/wed6/800/800", createdAt: "2025-12-01T10:25:00Z" },

  // Group 2 — Christmas
  { id: "p7", groupId: "g2", uploaderId: "u1", imageUrl: "https://picsum.photos/seed/xmas1/800/800", createdAt: "2025-12-15T19:00:00Z" },
  { id: "p8", groupId: "g2", uploaderId: "u2", imageUrl: "https://picsum.photos/seed/xmas2/800/800", createdAt: "2025-12-15T19:05:00Z" },
  { id: "p9", groupId: "g2", uploaderId: "u1", imageUrl: "https://picsum.photos/seed/xmas3/800/800", createdAt: "2025-12-15T19:10:00Z" },
  { id: "p10", groupId: "g2", uploaderId: "u2", imageUrl: "https://picsum.photos/seed/xmas4/800/800", createdAt: "2025-12-15T19:15:00Z" },

  // Group 3 — Ski
  { id: "p11", groupId: "g3", uploaderId: "u1", imageUrl: "https://picsum.photos/seed/ski1/800/800", createdAt: "2026-01-10T09:00:00Z" },
  { id: "p12", groupId: "g3", uploaderId: "u3", imageUrl: "https://picsum.photos/seed/ski2/800/800", createdAt: "2026-01-10T09:05:00Z" },
  { id: "p13", groupId: "g3", uploaderId: "u1", imageUrl: "https://picsum.photos/seed/ski3/800/800", createdAt: "2026-01-10T09:10:00Z" },
  { id: "p14", groupId: "g3", uploaderId: "u3", imageUrl: "https://picsum.photos/seed/ski4/800/800", createdAt: "2026-01-10T09:15:00Z" },
  { id: "p15", groupId: "g3", uploaderId: "u1", imageUrl: "https://picsum.photos/seed/ski5/800/800", createdAt: "2026-01-10T09:20:00Z" },
];

// ── Helper Functions ───────────────────────────────────────

export function getGroupById(id) {
  return groups.find((g) => g.id === id) ?? null;
}

export function getPhotosByGroup(groupId) {
  return photos
    .filter((p) => p.groupId === groupId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getPhotoById(id) {
  return photos.find((p) => p.id === id) ?? null;
}

export function getUserById(id) {
  return users.find((u) => u.id === id) ?? null;
}
