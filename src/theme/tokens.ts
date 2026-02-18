export const colors = {
  base: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    subtle: "#E0E5D9",
    subtleAlt: "#DDE5D8",
    border: "#E5E7EB",
    text: "#1A1C18",
    textSubtle: "#43473E",
  },
  brand: {
    50: "#F3F8F0",
    100: "#D9EBCF",
    200: "#BEDDAE",
    300: "#A3CF8C",
    400: "#7FB55D",
    500: "#5B9A3D",
    600: "#386A20",
    700: "#2E561A",
    800: "#244314",
    900: "#1A300E",
  },
  accent: {
    lime100: "#B7F397",
    favoriteActive: "#E53935",
    ratingStar: "#F59E0B",
  },
  map: {
    slate100: "#D4DDD0",
    slate200: "#CED4CA",
    slate300: "#CBD0C0",
    slate400: "#C7D2BF",
    routeGreen1: "#7CA06E",
    routeGreen2: "#6A8F58",
    routeGreen3: "#7C8C60",
  },
  semantic: {
    success: "#2E7D32",
    warning: "#B26A00",
    error: "#C62828",
    info: "#1565C0",
    errorBackground: "#FDE8E8",
    errorText: "#7F1D1D",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  x2: 24,
  x3: 32,
  x4: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  family: {
    base: "Noto Sans KR",
  },
  size: {
    titleLg: 24,
    titleMd: 20,
    titleSm: 18,
    bodyLg: 16,
    bodyMd: 15,
    bodySm: 14,
    labelLg: 16,
    labelMd: 14,
    labelSm: 12,
    caption: 12,
  },
  lineHeight: {
    titleLg: 30,
    titleMd: 28,
    titleSm: 27,
    bodyLg: 24,
    bodyMd: 22,
    bodySm: 20,
    labelLg: 22,
    labelMd: 20,
    labelSm: 16,
    caption: 16,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

export const shadow = {
  level1: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  level2: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadow,
} as const;

export type Theme = typeof theme;
