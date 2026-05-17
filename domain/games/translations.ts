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
  australia: "australia",
  "nova zelândia": "new zealand",
  "nova zelandia": "new zealand",
  argentina: "argentina",
  japão: "japan",
  japao: "japan",
  fiji: "fiji",
  samoa: "samoa",
  tonga: "tonga",
  namíbia: "namibia",
  namibia: "namibia",
  uruguai: "uruguay",
  canadá: "canada",
  canada: "canada",
  romania: "romania",
  romênia: "romania",
  geórgia: "georgia",
  georgia: "georgia",
  espanha: "spain",
  portugal: "portugal",
};

export function translateTeamName(name: string): string {
  const base = name.toLowerCase().trim().replace(/\s+w$/, "").trim();
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
