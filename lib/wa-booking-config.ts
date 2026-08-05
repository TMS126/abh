export const WA_BOOKING_CONFIG = {
  businessTimezone: "Africa/Johannesburg", // SAST
  appointmentLengthMinutes: 15,
  leadTimeMinutes: 120, // don't allow slots sooner than now + leadTime
  slotGranularityMinutes: 15,
  maxDaysAhead: 14,

  // Hub mapping — print and docu hubs use the wide range (07:00-20:00).
  // Other hubs (design, tech, eservice) use the office range (09:00-17:00).
  hubAvailability: {
    print: [
      { start: "07:00", end: "20:00" },
    ],
    doc: [
      { start: "07:00", end: "20:00" },
    ],
    design: [
      { start: "09:00", end: "17:00" },
    ],
    tech: [
      { start: "09:00", end: "17:00" },
    ],
    eservice: [
      { start: "09:00", end: "17:00" },
    ],
    other: [
      { start: "09:00", end: "17:00" },
    ],
    saturdayWide: [
      { start: "07:00", end: "20:00" },
      { start: "09:00", end: "12:00" },
    ],
  },

  infoFields: {
    name: { required: true },
    phone: { required: false },
    deviceModel: { required: true },
    service: { required: true },
  },
} as const;
