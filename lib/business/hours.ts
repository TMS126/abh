export const HOURS = {
  printAndDoc: {
    label: "Print Hub · Document Hub",
    hours: "Mon – Sun · 07:00 – 20:00",
    note: "Open on Public Holidays",
    open: true,
  },

  techDesignEservice: {
    label: "Tech Hub · Design Hub · E-Service Hub",
    lines: ["Mon – Fri · 09:00 – 17:00", "Sat · 09:00 – 12:00"],
    note: "Sun & Public Holidays · Closed",
    open: false,
  },

  responseTime: "We typically reply within 15 minutes during business hours.",
} as const
