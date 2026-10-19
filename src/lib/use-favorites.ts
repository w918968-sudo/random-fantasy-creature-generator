"use client";

import { useCallback, useEffect, useState } from "react";
import { readFavorites, subscribeFavorites, toggleFavorite } from "@/lib/favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : readFavorites(),
  );

  useEffect(() => {
    setFavorites(readFavorites());
    return subscribeFavorites(() => setFavorites(readFavorites()));
  }, []);

  const toggle = useCallback((id: string) => toggleFavorite(id), []);

  return { favorites, toggle };
}
