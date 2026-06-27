export type NavItem = {
  id: string
  label: string
  path: string
  isCta?: boolean
}

export const NAV_ITEMS = [
  { id: "home", label: "Home", path: "/" },
  { id: "services", label: "Services", path: "/services" },
  { id: "gallery", label: "Gallery", path: "/gallery" },
  { id: "about", label: "About", path: "/about" },
  { id: "contact", label: "Contact", path: "/contact", isCta: true },
] as const
