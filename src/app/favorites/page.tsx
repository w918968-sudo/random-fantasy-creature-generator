import type { Metadata } from "next";
import { FavoritesList } from "@/components/favorites-list";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your saved original fantasy creatures.",
  alternates: { canonical: "/favorites" },
};

export default function FavoritesPage() {
  return <FavoritesList />;
}
