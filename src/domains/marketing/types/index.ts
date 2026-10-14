import type { ReactNode } from 'react';

export interface Feature {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  primaryCTA: string;
  secondaryCTA: string;
}