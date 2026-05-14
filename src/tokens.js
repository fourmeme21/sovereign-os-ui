export const T = {
  bgPrimary:    "#0F0F0F",
  bgSurface:    "#1A1A1A",
  bgElevated:   "#242424",
  border:       "#2A2A2A",
  borderSubtle: "#1E1E1E",
  success:      "#2DD4BF",
  warning:      "#F59E0B",
  danger:       "#EF4444",
  textPrimary:  "#EDEDEC",
  textSecondary:"#888884",
  textTertiary: "#555550",
  accent:       "#7C3AED",
  accentGlow:   "#7C3AED28",
};

export const getRiskColor = (s) =>
  s <= 3 ? T.success : s <= 6 ? T.warning : T.danger;

export const getRiskLabel = (s, lang) => {
  const m = {
    tr: ["DÜŞÜK RİSK", "ORTA RİSK", "YÜKSEK RİSK"],
    en: ["LOW RISK",   "MEDIUM RISK", "HIGH RISK"],
  };
  return s <= 3 ? m[lang][0] : s <= 6 ? m[lang][1] : m[lang][2];
};
