// components/about/about-icons.tsx
import { Target, Heart, Lightning, Desktop, Printer, DeviceMobile } from "@phosphor-icons/react"

export function renderIcon(iconName: string, className: string) {
  switch (iconName) {
    case "Target": return <Target weight="fill" className={className} aria-hidden="true" />
    case "Heart": return <Heart weight="fill" className={className} aria-hidden="true" />
    case "Lightning": return <Lightning weight="fill" className={className} aria-hidden="true" />
    case "Desktop": return <Desktop weight="fill" className={className} aria-hidden="true" />
    case "Printer": return <Printer weight="fill" className={className} aria-hidden="true" />
    case "DeviceMobile": return <DeviceMobile weight="fill" className={className} aria-hidden="true" />
    default: return <Target weight="fill" className={className} aria-hidden="true" />
  }
}
