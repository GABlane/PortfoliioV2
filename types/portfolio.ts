export interface PortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  meta?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface PortfolioCategory {
  id: string;
  label: string;
  iconType: 'profile' | 'projects' | 'skills' | 'experience' | 'contact';
  items: PortfolioItem[];
}

export interface NavigationState {
  activeCategoryId: string;
  activeItemId: string;
  isTransitioning: boolean;
}

export type ViewportMode = 'shell' | 'screen';
