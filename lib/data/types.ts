// lib/types.ts — Shared types only

import type { HubKey } from '@/lib/brand';

export type HubId = HubKey;

export interface ServiceItem {
  name: string;
  price: string;
  requirements: string[];
  description?: string;
}

export interface HubSection {
  title: string;
  items: ServiceItem[];
}

export interface Hub {
  iconName: string;
  iconColor: string;
  title: string;
  grad: string;
  desc: string;
  sections: HubSection[];
  previews: string[];
  tagStyle: {
    bg: string;
    color: string;
  };
  tagStyleDark: {
    bg: string;
    color: string;
  };
}

export type ProjectData = {
  id: string;
  hub: string;
  title: string;
  tag: string;
  shortDesc: string;
  image: string;
  images: readonly string[];
  clientType?: 'client' | 'practice' | 'sample';
  sensitive?: boolean;
  clientGoal: string;
  whatWeDid: readonly string[];
  tools: readonly string[];
  result: string;
};

export type Project = {
  id: string;
  hub: string;
  title: string;
  tag: string;
  shortDesc: string;
  image: string;
  images: readonly string[];
  clientType?: 'client' | 'practice' | 'sample';
  sensitive?: boolean;
  clientGoal: string;
  whatWeDid: readonly string[];
  tools: readonly string[];
  result: string;
};
