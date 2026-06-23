/**
 * Deterministic, restrained badge palette for city tags — replaces the
 * original's 18 hand-tuned per-city hex colors with a small fixed set so the
 * same city always renders the same way without a sprawling color table.
 */
export interface BadgeStyle {
  bg: string;
  text: string;
  border: string;
}

const PALETTE: BadgeStyle[] = [
  { bg: "#1e1233", text: "#a78bfa", border: "#3b1d72" },
  { bg: "#061733", text: "#60a5fa", border: "#0f2f6b" },
  { bg: "#042934", text: "#22d3ee", border: "#0e4a57" },
  { bg: "#2c1205", text: "#fb923c", border: "#5a2208" },
  { bg: "#052012", text: "#4ade80", border: "#0b4021" },
  { bg: "#2d1b00", text: "#fbbf24", border: "#6b3900" },
  { bg: "#022624", text: "#2dd4bf", border: "#0a4c47" },
  { bg: "#1a2d00", text: "#a3e635", border: "#3d5e00" },
  { bg: "#2c0510", text: "#fb7185", border: "#5a0a20" },
  { bg: "#130828", text: "#d8b4fe", border: "#3b1d6b" },
];

function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function badgeStyleForCity(cityKey: string): BadgeStyle {
  return PALETTE[hashString(cityKey) % PALETTE.length];
}
