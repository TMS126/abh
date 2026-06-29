export const HUB_COLORS = {
  print: {
    primary: BRAND.blue,
    light: BRAND.lightBlue,
    gradient: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueMid} 100%)`,
    // INACTIVE = dark bg, light text
    tagBg: '#374151',        // gray-700 
    tagText: '#f3f4f6',      // gray-100
    // ACTIVE = darker bg, light text  
    tagBgDark: '#111827',    // gray-900
    tagTextDark: '#ffffff',  // white
  },

  doc: {
    primary: BRAND.green,
    light: BRAND.lightGreen,
    gradient: `linear-gradient(135deg, ${BRAND.greenDeep} 0%, ${BRAND.green} 100%)`,
    tagBg: '#374151',        // gray-700
    tagText: '#f3f4f6',      // gray-100  
    tagBgDark: '#14532d',    // green-900
    tagTextDark: '#dcfce7',  // green-100
  },

  design: {
    primary: BRAND.orangeDark,
    light: BRAND.lightOrange,
    gradient: `linear-gradient(135deg, ${BRAND.orangeBrown} 0%, ${BRAND.orange} 100%)`,
    tagBg: '#374151',        // gray-700
    tagText: '#f3f4f6',      // gray-100
    tagBgDark: '#7c2d12',    // orange-900
    tagTextDark: '#ffedd5',  // orange-100
  },

  eservice: {
    primary: BRAND.blueDark,
    light: BRAND.lightBlue,
    gradient: `linear-gradient(135deg, #15537D 0%, ${BRAND.blueMid} 100%)`,
    tagBg: '#374151',        // gray-700
    tagText: '#f3f4f6',      // gray-100
    tagBgDark: '#1e3a8a',    // blue-900
    tagTextDark: '#dbeafe',  // blue-100
  },

  tech: {
    primary: "#B8CCE0",
    light: "#B8CCE0",
    gradient: `linear-gradient(135deg, #333333 0%, #555555 100%)`,
    tagBg: '#374151',        // gray-700
    tagText: '#f3f4f6',      // gray-100
    tagBgDark: '#111827',    // gray-900
    tagTextDark: '#f9fafb',  // gray-50
  },
} as const
