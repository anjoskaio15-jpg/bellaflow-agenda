import type { Business } from "@/types/business";

const hexToHsl = (hex: string) => {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.substring(0, 2), 16) / 255;
  const g = parseInt(normalized.substring(2, 4), 16) / 255;
  const b = parseInt(normalized.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export function applyTheme(business?: Partial<Business> | null) {
  if (!business) return;

  const root = document.documentElement;
  const theme = {
    "--primary": business.primary_color,
    "--secondary": business.secondary_color,
    "--background": business.background_color,
    "--foreground": business.foreground_color,
    "--card": business.card_color,
    "--border": business.border_color,
    "--muted": business.muted_color,
    "--success": business.success_color,
    "--danger": business.danger_color,
  };

  Object.entries(theme).forEach(([key, value]) => {
    if (value) root.style.setProperty(key, hexToHsl(value));
  });
}
