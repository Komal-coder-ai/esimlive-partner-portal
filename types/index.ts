export type PageType =
  | 'join'
  | 'listings'
  | 'restaurant'
  | 'event'
  | 'tour'
  | 'studio'
  | 'promo'
  | 'insights';

export interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface JoinData {
  business: string;
  category: string;
  contact: string;
  licence: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  agree: boolean;
}

export interface RestaurantData {
  name: string;
  hours: string;
  cuisine: string;
  price: string;
  address: string;
  lat: number;
  lng: number;
  note: string;
  desc: string;
  offer: string;
}

export interface EventData {
  title: string;
  type: string;
  date: string;
  time: string;
  price: string;
  venue: string;
  lat: number;
  lng: number;
  note: string;
  radius: string;
  desc: string;
}

export interface TourData {
  name: string;
  duration: string;
  price: string;
  group: string;
  included: string[];
  pickup: string;
  lat: number;
  lng: number;
  note: string;
  stops: string[];
  desc: string;
}

export interface StudioData {
  prompt: string;
  langs: string[];
  tone: string;
  view: string;
  title: string;
  tagline: string;
  tags: string[];
  texts: Record<string, string>;
}

export interface PromoData {
  type: string;
  offer: string;
  code: string;
  valid: string;
  radius: string;
  sentAt: number;
}

export interface PublishedItem {
  id: string;
  kind: 'r' | 'e' | 't' | 'p';
  title: string;
  sub: string;
  icon: string;
  color: string;
  status: 'Live' | 'Scheduled' | 'Sent';
}

export interface InsightsConfig {
  period: 'Week' | 'Month' | 'Year';
  metric: string;
  featured: string[];
  rec: {
    title: string;
    body: string;
  } | null;
}

export interface AppState {
  signedUp: boolean;
  join: JoinData;
  r: RestaurantData;
  e: EventData;
  t: TourData;
  s: StudioData;
  p: PromoData;
  published: PublishedItem[];
  ins: InsightsConfig;
  page: PageType;
  toast: string;
  busy: string;
  now: number;
  anim: boolean;
  joinError: string;
}

