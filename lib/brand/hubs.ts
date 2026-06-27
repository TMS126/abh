import { BRAND } from "./colors"

export const HUB_COLORS = {
  print: {
    primary: BRAND.blue,
    light: BRAND.lightBlue,
    gradient: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueMid} 100%)`,
    tagBg: "#EBF5FB",
    tagText: BRAND.blueDark,
    tagBgDark: "#1E3A52",
    tagTextDark: BRAND.lightBlue,
  },

  doc: {
    primary: BRAND.green,
    light: BRAND.lightGreen,
    gradient: `linear-gradient(135deg, ${BRAND.greenDeep} 0%, ${BRAND.green} 100%)`,
    tagBg: "#EAFAF1",
    tagText: BRAND.greenDeep,
    tagBgDark: "#1A3010",
    tagTextDark: BRAND.lightGreen,
  },

  design: {
    primary: BRAND.orangeDark,
    light: BRAND.lightOrange,
    gradient: `linear-gradient(135deg, ${BRAND.orangeBrown} 0%, ${BRAND.orange} 100%)`,
    tagBg: "#FEF3C7",
    tagText: "#b85c17",
    tagBgDark: "#3A2010",
    tagTextDark: BRAND.lightOrange,
  },

  eservice: {
    primary: BRAND.blueDark,
    light: BRAND.lightBlue,
    gradient: `linear-gradient(135deg, #15537D 0%, ${BRAND.blueMid} 100%)`,
    tagBg: "#EBF5FB",
    tagText: BRAND.blueText,
    tagBgDark: "#1E3A52",
    tagTextDark: "#5FB3F0",
  },

  tech: {
    primary: "#B8CCE0",
    light: "#B8CCE0",
    gradient: `linear-gradient(135deg, #333333 0%, #555555 100%)`,
    tagBg: "#EDEDED",
    tagText: "#3D4148",
    tagBgDark: "#3D4148",
    tagTextDark: "#C9CDD3",
  },
} as const
