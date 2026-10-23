import type { Metadata } from "next";
import { DailyCreature } from "@/components/daily-creature";

export const metadata: Metadata = {
  title: "Creature of the Day",
  description:
    "One original fantasy creature, picked fresh each day. Come back tomorrow for a new one.",
  alternates: { canonical: "/daily" },
};

export default function DailyPage() {
  return <DailyCreature />;
}
