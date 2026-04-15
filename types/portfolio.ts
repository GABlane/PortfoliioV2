export type ItemIconType =
  | 'user' | 'lightbulb' | 'trophy'
  | 'store' | 'shield' | 'cart' | 'gamepad' | 'alert'
  | 'code' | 'monitor' | 'server' | 'database' | 'wrench'
  | 'graduation' | 'book' | 'flag' | 'users'
  | 'mail' | 'github' | 'linkedin' | 'phone';

export interface PortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon?: ItemIconType;
  meta?: string;
  tags?: string[];
  image?: string;
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

export type Theme = 'dark' | 'light';
