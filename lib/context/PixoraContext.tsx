"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PromptItem, UserCollection } from "../types";

interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  description?: string;
}

interface PixoraContextType {
  userToken: string;
  unlockedPromptIds: Set<string>;
  unlockedPromptsMap: Record<string, string>; // promptId -> promptText
  favorites: Set<string>;
  collections: UserCollection[];
  isProUser: boolean;
  toggleProUser: () => void;
  isUnlocked: (promptId: string) => boolean;
  getUnlockedText: (promptId: string) => string | undefined;
  recordUnlock: (promptId: string, promptText: string, token?: string) => void;
  toggleFavorite: (promptId: string, slug: string) => Promise<boolean>;
  isFavorite: (promptId: string) => boolean;
  createCollection: (name: string, description?: string) => UserCollection;
  addToCollection: (collectionId: string, promptId: string) => void;
  removeFromCollection: (collectionId: string, promptId: string) => void;
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: "success" | "info" | "warning") => void;
  removeToast: (id: string) => void;
  // Modal triggers
  activeSharePrompt: PromptItem | null;
  setActiveSharePrompt: (prompt: PromptItem | null) => void;
  activeReportPrompt: PromptItem | null;
  setActiveReportPrompt: (prompt: PromptItem | null) => void;
  isProModalOpen: boolean;
  setIsProModalOpen: (open: boolean) => void;
}

const PixoraContext = createContext<PixoraContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  TOKEN: "pixora_user_token",
  UNLOCKED_IDS: "pixora_unlocked_ids",
  UNLOCKED_TEXTS: "pixora_unlocked_texts",
  FAVORITES: "pixora_favorites",
  COLLECTIONS: "pixora_collections",
  PRO_STATUS: "pixora_is_pro",
};

export function PixoraProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string>("");
  const [unlockedPromptIds, setUnlockedPromptIds] = useState<Set<string>>(new Set());
  const [unlockedPromptsMap, setUnlockedPromptsMap] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [isProUser, setIsProUser] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeSharePrompt, setActiveSharePrompt] = useState<PromptItem | null>(null);
  const [activeReportPrompt, setActiveReportPrompt] = useState<PromptItem | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      // User Token
      let token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        token = "px_usr_" + Math.random().toString(36).substring(2, 10);
        localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
      }
      setUserToken(token);

      // Unlocked IDs & texts
      const savedUnlocked = localStorage.getItem(LOCAL_STORAGE_KEYS.UNLOCKED_IDS);
      if (savedUnlocked) {
        setUnlockedPromptIds(new Set(JSON.parse(savedUnlocked)));
      }
      const savedTexts = localStorage.getItem(LOCAL_STORAGE_KEYS.UNLOCKED_TEXTS);
      if (savedTexts) {
        setUnlockedPromptsMap(JSON.parse(savedTexts));
      }

      // Favorites
      const savedFavs = localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITES);
      if (savedFavs) {
        setFavorites(new Set(JSON.parse(savedFavs)));
      }

      // Collections
      const savedColls = localStorage.getItem(LOCAL_STORAGE_KEYS.COLLECTIONS);
      if (savedColls) {
        setCollections(JSON.parse(savedColls));
      } else {
        // Initial default collections
        const initialColls: UserCollection[] = [
          {
            id: "col-1",
            name: "Visual Inspiration",
            description: "High impact cinematic and editorial concepts",
            promptIds: ["px-001", "px-002"],
            isPrivate: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "col-2",
            name: "E-Commerce Ideas",
            description: "Clean product photography prompts",
            promptIds: ["px-003", "px-010"],
            isPrivate: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setCollections(initialColls);
        localStorage.setItem(LOCAL_STORAGE_KEYS.COLLECTIONS, JSON.stringify(initialColls));
      }

      // Pro Status
      const savedPro = localStorage.getItem(LOCAL_STORAGE_KEYS.PRO_STATUS);
      if (savedPro === "true") {
        setIsProUser(true);
      }
    } catch (e) {
      console.warn("Local storage initialization failed", e);
    }
  }, []);

  const addToast = (title: string, description?: string, type: "success" | "info" | "warning" = "success") => {
    const id = "toast-" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const isUnlocked = (promptId: string) => {
    if (isProUser) return true;
    return unlockedPromptIds.has(promptId);
  };

  const getUnlockedText = (promptId: string) => {
    return unlockedPromptsMap[promptId];
  };

  const recordUnlock = (promptId: string, promptText: string, token?: string) => {
    if (token && token !== userToken) {
      setUserToken(token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
    }

    setUnlockedPromptIds((prev) => {
      const next = new Set(prev);
      next.add(promptId);
      localStorage.setItem(LOCAL_STORAGE_KEYS.UNLOCKED_IDS, JSON.stringify(Array.from(next)));
      return next;
    });

    setUnlockedPromptsMap((prev) => {
      const next = { ...prev, [promptId]: promptText };
      localStorage.setItem(LOCAL_STORAGE_KEYS.UNLOCKED_TEXTS, JSON.stringify(next));
      return next;
    });

    addToast("Prompt Unlocked!", "Full AI prompt & parameters are now ready to copy.", "success");
  };

  const toggleFavorite = async (promptId: string, slug: string): Promise<boolean> => {
    const currentlyFav = favorites.has(promptId);
    const nextFav = !currentlyFav;

    setFavorites((prev) => {
      const next = new Set(prev);
      if (nextFav) {
        next.add(promptId);
      } else {
        next.delete(promptId);
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITES, JSON.stringify(Array.from(next)));
      return next;
    });

    addToast(
      nextFav ? "Added to Favorites" : "Removed from Favorites",
      undefined,
      nextFav ? "success" : "info"
    );

    // Sync count with backend
    try {
      await fetch(`/api/prompts/${slug}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increment: nextFav }),
      });
    } catch (err) {
      console.error("Failed to sync favorite with server", err);
    }

    return nextFav;
  };

  const isFavorite = (promptId: string) => favorites.has(promptId);

  const createCollection = (name: string, description?: string): UserCollection => {
    const newCol: UserCollection = {
      id: "col-" + Date.now(),
      name,
      description,
      promptIds: [],
      isPrivate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextCols = [newCol, ...collections];
    setCollections(nextCols);
    localStorage.setItem(LOCAL_STORAGE_KEYS.COLLECTIONS, JSON.stringify(nextCols));
    addToast("Collection Created", `"${name}" collection is ready.`);
    return newCol;
  };

  const addToCollection = (collectionId: string, promptId: string) => {
    const nextCols = collections.map((col) => {
      if (col.id === collectionId && !col.promptIds.includes(promptId)) {
        return {
          ...col,
          promptIds: [...col.promptIds, promptId],
          updatedAt: new Date().toISOString(),
        };
      }
      return col;
    });
    setCollections(nextCols);
    localStorage.setItem(LOCAL_STORAGE_KEYS.COLLECTIONS, JSON.stringify(nextCols));
    addToast("Saved to Collection");
  };

  const removeFromCollection = (collectionId: string, promptId: string) => {
    const nextCols = collections.map((col) => {
      if (col.id === collectionId) {
        return {
          ...col,
          promptIds: col.promptIds.filter((id) => id !== promptId),
          updatedAt: new Date().toISOString(),
        };
      }
      return col;
    });
    setCollections(nextCols);
    localStorage.setItem(LOCAL_STORAGE_KEYS.COLLECTIONS, JSON.stringify(nextCols));
    addToast("Removed from Collection", undefined, "info");
  };

  const toggleProUser = () => {
    const next = !isProUser;
    setIsProUser(next);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRO_STATUS, String(next));
    addToast(
      next ? "Pixora Pro Active" : "Returned to Free Plan",
      next ? "Enjoy zero ads and instant prompt unlocks across the entire library!" : "Ad-supported unlocking mode active."
    );
  };

  return (
    <PixoraContext.Provider
      value={{
        userToken,
        unlockedPromptIds,
        unlockedPromptsMap,
        favorites,
        collections,
        isProUser,
        toggleProUser,
        isUnlocked,
        getUnlockedText,
        recordUnlock,
        toggleFavorite,
        isFavorite,
        createCollection,
        addToCollection,
        removeFromCollection,
        toasts,
        addToast,
        removeToast,
        activeSharePrompt,
        setActiveSharePrompt,
        activeReportPrompt,
        setActiveReportPrompt,
        isProModalOpen,
        setIsProModalOpen,
      }}
    >
      {children}
    </PixoraContext.Provider>
  );
}

export function usePixora() {
  const context = useContext(PixoraContext);
  if (!context) {
    throw new Error("usePixora must be used within a PixoraProvider");
  }
  return context;
}
