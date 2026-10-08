/**
 * Hero Background Presets & Rollback Configuration
 *
 * Use these presets to switch between visual versions of the Trayse hero background.
 * Switching is as simple as selecting a preset key in Hero.tsx or flipping `showLogoMask`.
 */

export interface HeroBackgroundConfig {
  name: string;
  description: string;
  bg: string;
  dotColor: string;
  showLogoMask: boolean;
  accentDotColor?: string;
  maskSize?: string;
  maskUrl?: string;
  baseGridPitch: number;
  accentGridPitch?: number;
  enableMotion: boolean;
}

export const HERO_BACKGROUND_PRESETS = {
  /**
   * Version: Minimal Clean Dots (Current Default)
   * Deep black canvas (#111113) with subtle, low-contrast dot glyphs.
   * Full cursor-reactive 3D cloth membrane deformation and fluid blue-neon filled ripple waves.
   * NO logo mask in the background.
   */
  minimalClean: {
    name: "Minimal Clean Dots",
    description: "Deep black background with subtle dot glyphs and interactive fluid ripples (no logo)",
    bg: "#111113",
    dotColor: "rgba(210, 225, 255, 0.08)",
    showLogoMask: false,
    baseGridPitch: 15,
    enableMotion: true,
  },

  /**
   * Version: Logo Mask Emblem (Rollback / Previous Version)
   * Includes the centered Trayse logo mask silhouette, atmospheric glow halo,
   * and high-density accent dots clipped to the emblem.
   */
  logoMaskEmblem: {
    name: "Logo Mask Emblem",
    description: "Previous version featuring the centered Trayse logo mask silhouette and ambient halo",
    bg: "#111113",
    dotColor: "rgba(210, 225, 255, 0.08)",
    showLogoMask: true,
    accentDotColor: "rgba(80, 105, 255, 0.68)",
    maskSize: "min(72vw, 50rem)",
    maskUrl: "/trayse-mask.svg",
    baseGridPitch: 15,
    accentGridPitch: 12,
    enableMotion: true,
  },
} as const satisfies Record<string, HeroBackgroundConfig>;

export type HeroBackgroundPresetKey = keyof typeof HERO_BACKGROUND_PRESETS;
