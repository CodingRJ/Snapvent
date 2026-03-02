"use client";

import { GroupsProvider } from "@/app/context/GroupsContext";

export default function Providers({ children }) {
  return <GroupsProvider>{children}</GroupsProvider>;
}
