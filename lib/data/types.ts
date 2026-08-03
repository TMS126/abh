import { type HubKey } from '@/lib/brand'

export type HubId = HubKey

export interface ServiceItem { name: string; price: string; requirements: string[]; description?: string; tips?: string[] }
export interface HubSection { title: string; desc?: string; items: ServiceItem[] }
export interface Hub { iconName: string; iconColor: string; title: string; grad: string; desc: string; turnaround: string; sections: HubSection[]; previews: string[]; tagStyle: { bg: string; color: string }; tagStyleDark: { bg: string; color: string } }
