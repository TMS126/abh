/**
 * ────────────────────────────────────────────────────────────────────────────
 * APEXBYTES HUB — COLOR UTILITIES
 * lib/color-utils.ts
 *
 * WCAG 2.x relative luminance helper. Given any hex background color,
 * returns the readable text color (near-black or white) to place on it.
 * Uses the standard relative luminance formula (WCAG 1.4.3) rather than
 * a naive average, so it correctly handles saturated hues (e.g. orange)
 * that "look light" but fail contrast with white text.
 * ────────────────────────────────────────────────────────────────────────────
 */

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "")
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean
  const num = parseInt(full, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Returns "#FFFFFF" or a near-black neutral, whichever has higher
 * contrast against the given background hex color.
 */
export function getReadableTextColor(
  bgHex: string,
  darkText: string = "#0A0A0A"
): string {
  const luminance = relativeLuminance(bgHex)
  const contrastWithWhite = 1.05 / (luminance + 0.05)
  const contrastWithDark = (luminance + 0.05) / 0.05
  return contrastWithWhite >= contrastWithDark ? "#FFFFFF" : darkText
} 
