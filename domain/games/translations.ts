const TEAM_NAME_TRANSLATIONS: Record<string, string> = {
  gales: "wales",
  itália: "italy",
  italia: "italy",
  irlanda: "ireland",
  frança: "france",
  franca: "france",
  escócia: "scotland",
  escocia: "scotland",
  inglaterra: "england",
  austrália: "australia",
  "nova zelândia": "new zealand",
  "nova zelandia": "new zealand",
  japão: "japan",
  japao: "japan",
  namíbia: "namibia",
  uruguai: "uruguay",
  canadá: "canada",
  romênia: "romania",
  geórgia: "georgia",
  espanha: "spain",
  "áfrica do sul": "south africa",
  "africa do sul": "south africa",
  "estados unidos": "united states",
  brasil: "brazil",
  rússia: "russia",
  quênia: "kenya",
  kênia: "kenya",
};

export function translateTeamName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s+w$/, "")
    .trim()
    .replace(/\bsub[-\s]?(\d+)\b/g, "u$1");
  return TEAM_NAME_TRANSLATIONS[base] ?? base;
}

export function tokenMatch(a: string, b: string): boolean {
  const tokensA = new Set(a.toLowerCase().trim().split(/\s+/));
  const tokensB = new Set(b.toLowerCase().trim().split(/\s+/));
  for (const token of tokensA) {
    if (token.length > 2 && tokensB.has(token)) return true;
  }
  return false;
}
