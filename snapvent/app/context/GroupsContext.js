"use client";

import { createContext, useContext, useState, useCallback } from "react";
import {
  groups as mockGroups,
  photos as mockPhotos,
  currentUser,
} from "@/app/data/mock";

const GroupsContext = createContext(null);

export function GroupsProvider({ children }) {
  const [groups, setGroups] = useState(mockGroups);
  const [photos, setPhotos] = useState(mockPhotos);

  const addGroup = useCallback(
    ({ name, description }) => {
      const id = "g" + (Date.now() % 100000);
      const joinCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      const newGroup = {
        id,
        name,
        description: description || "",
        coverImage: `https://picsum.photos/seed/${id}/600/400`,
        joinCode,
        organizerId: currentUser.id,
        memberIds: [currentUser.id],
        createdAt: new Date().toISOString(),
      };
      setGroups((prev) => [newGroup, ...prev]);
      return newGroup;
    },
    []
  );

  const joinGroup = useCallback(
    (code) => {
      const group = groups.find(
        (g) => g.joinCode.toUpperCase() === code.toUpperCase()
      );
      if (!group) return null;

      if (!group.memberIds.includes(currentUser.id)) {
        setGroups((prev) =>
          prev.map((g) =>
            g.id === group.id
              ? { ...g, memberIds: [...g.memberIds, currentUser.id] }
              : g
          )
        );
      }
      return group;
    },
    [groups]
  );

  const getGroupById = useCallback(
    (id) => groups.find((g) => g.id === id) ?? null,
    [groups]
  );

  const addPhoto = useCallback(
    ({ groupId, imageUrl }) => {
      const id = "p" + (Date.now() % 100000);
      const newPhoto = {
        id,
        groupId,
        uploaderId: currentUser.id,
        imageUrl,
        createdAt: new Date().toISOString(),
      };
      setPhotos((prev) => [newPhoto, ...prev]);
      return newPhoto;
    },
    []
  );

  const getPhotosByGroup = useCallback(
    (groupId) =>
      photos
        .filter((p) => p.groupId === groupId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [photos]
  );

  const getPhotoById = useCallback(
    (id) => photos.find((p) => p.id === id) ?? null,
    [photos]
  );

  return (
    <GroupsContext.Provider
      value={{ groups, photos, addGroup, joinGroup, addPhoto, getGroupById, getPhotosByGroup, getPhotoById }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error("useGroups must be used within GroupsProvider");
  return ctx;
}
