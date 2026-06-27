import { BIZ } from "../business/info"

export const STRIP_ITEMS = [
  {
    iconName: "Rocket",
    title: "Fast Turnaround",
    desc: "No long waits, quick service",
  },
  {
    iconName: "CurrencyDollar",
    title: "Affordable Rates",
    desc: "Fair pricing for everyone",
  },
  {
    iconName: "HandHeart",
    title: "Friendly Help",
    desc: "We explain, never judge",
  },
  {
    iconName: "MapPin",
    title: "Walk-ins Welcome",
    desc: BIZ.location,
  },
] as const
