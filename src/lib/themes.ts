export interface Theme {
  id: string;
  label: string;
  emoji: string;
  /** Small gradient used to preview the theme in the switcher dot. */
  dot: string;
}

export const THEME_STORAGE_KEY = "random-fantasy-creature:theme";
export const DEFAULT_THEME = "day";

export const THEMES: Theme[] = [
  { id: "day", label: "Dawn", emoji: "🌅", dot: "linear-gradient(135deg, #9fd0ff, #ffd3dd)" },
  { id: "sunset", label: "Sunset", emoji: "🌇", dot: "linear-gradient(135deg, #ffd9a8, #ffb3d1, #e0b3ff)" },
  { id: "ocean", label: "Ocean", emoji: "🌊", dot: "linear-gradient(135deg, #a9e7ff, #c9f4f0, #b8f0d0)" },
  { id: "meadow", label: "Meadow", emoji: "🌿", dot: "linear-gradient(135deg, #c8f2c0, #effbd8, #e3f6b8)" },
  { id: "sakura", label: "Sakura", emoji: "🌸", dot: "linear-gradient(135deg, #ffd3e2, #fde8ff, #ffd6e8)" },
  { id: "magic", label: "Mystic", emoji: "🔮", dot: "linear-gradient(135deg, #d6ccff, #f6e0ff, #e0d4ff)" },
];
