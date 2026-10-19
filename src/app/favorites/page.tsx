import type { Metadata } from "next";
import { FavoritesList } from "@/components/favorites-list";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your saved original fantasy creatures.",
  alternates: { canonical: "/favorites" },
  // Personalized per-browser page — keep it out of search results.
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return <FavoritesList />;
}
