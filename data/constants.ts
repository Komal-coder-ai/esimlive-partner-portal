import { CategoryItem, AppState } from '@/types';

export const STORAGE_KEY = 'esimlive-partner-v1';
export const AI_ENDPOINT = '/api/ai/generate';

export const CATS: CategoryItem[] = [
  { id: 'restaurant', label: 'Restaurant', icon: 'ph-fork-knife', color: '#17c99a' },
  { id: 'event', label: 'Event', icon: 'ph-calendar-star', color: '#d6336c' },
  { id: 'tour', label: 'Tour & activity', icon: 'ph-compass', color: '#e8730c' },
  { id: 'shop', label: 'Shop & souk', icon: 'ph-storefront', color: '#6c5ce7' },
  { id: 'stay', label: 'Stay', icon: 'ph-bed', color: '#3b82f6' },
  { id: 'wellness', label: 'Wellness & spa', icon: 'ph-flower-lotus', color: '#14b8a6' },
  { id: 'transport', label: 'Transport', icon: 'ph-bus', color: '#475569' },
  { id: 'attraction', label: 'Attraction', icon: 'ph-bank', color: '#a16207' },
];

export const COUNTRIES = [
  'Morocco',
  'Egypt',
  'Tunisia',
  'Jordan',
  'United Arab Emirates',
  'Turkey',
  'Spain',
  'Portugal',
  'France',
  'Other',
];

export const STOPS = [
  'Aït Benhaddou',
  'Ouarzazate',
  'Dades Gorge',
  'Todra Gorge',
  'Zagora',
  'Merzouga dunes',
];

export const LANGS = ['English', 'Français', 'العربية', 'Español', 'Deutsch', '中文'];

export const DEFAULTS: Omit<AppState, 'page' | 'toast' | 'busy' | 'now' | 'anim' | 'joinError'> = {
  signedUp: false,
  join: {
    business: 'Dar Zellij',
    category: 'restaurant',
    contact: 'Youssef Amrani',
    licence: 'RC 123456',
    email: 'hello@darzellij.ma',
    phone: '+212 6 12 34 56 78',
    city: 'Marrakech',
    country: 'Morocco',
    agree: true,
  },
  r: {
    name: 'Dar Zellij',
    hours: '12:00 – 23:00',
    cuisine: 'Moroccan',
    price: '$$',
    address: 'Riad Zitoun el Kedim, Marrakech',
    lat: 31.6214,
    lng: -7.9858,
    note: 'Pin set from address. Tap Use my location if you are on site.',
    desc: '',
    offer: '10% off for eSIMLive travellers',
  },
  e: {
    title: 'Gnawa Night in the Medina',
    type: 'Music',
    date: '2026-11-21',
    time: '20:00',
    price: '150 MAD',
    venue: 'Place Jemaa el-Fna, Marrakech',
    lat: 31.6258,
    lng: -7.9891,
    note: '',
    radius: '5 km',
    desc: '',
  },
  t: {
    name: 'Marrakech to Merzouga: 3-day Sahara trip',
    duration: '3 days',
    price: '€180',
    group: 'Max 12',
    included: [
      'Transport',
      'Camel trek',
      'Desert camp',
      'Breakfast & dinner',
    ],
    pickup: 'Riad pickup, Marrakech medina',
    lat: 31.6295,
    lng: -7.9811,
    note: 'Pickup pinned in the medina. Travellers can share their riad location when booking.',
    stops: ['Aït Benhaddou', 'Dades Gorge', 'Merzouga dunes'],
    desc: '',
  },
  s: {
    prompt:
      'Family-run rooftop café near the Koutoubia. Mint tea, tagines, live oud on Fridays.',
    langs: ['English', 'Français', 'العربية'],
    tone: 'Friendly',
    view: 'English',
    title: 'Dar Zellij Rooftop',
    tagline: 'Mint tea and tagines with a Koutoubia view',
    tags: ['Rooftop', 'Family-run', 'Live music', 'Near Koutoubia'],
    texts: {
      English:
        'Climb to our family rooftop for slow-cooked tagines, fresh mint tea and the best sunset view of the Koutoubia. On Fridays, a live oud player sets the mood.',
      Français:
        'Montez sur notre terrasse familiale pour des tajines mijotés, un thé à la menthe et un coucher de soleil sur la Koutoubia. Le vendredi, un joueur d’oud anime la soirée.',
      العربية:
        'اصعدوا إلى سطحنا العائلي لتذوق الطواجن المطهوة ببطء والشاي بالنعناع مع أجمل غروب على الكتبية. وفي أيام الجمعة، عازف عود يضفي أجواء ساحرة.',
    },
  },
  p: {
    type: 'Handicraft',
    offer: '20% off this weekend',
    code: 'Morocco20',
    valid: '24 hrs',
    radius: '5 km',
    sentAt: 0,
  },
  published: [],
  ins: {
    period: 'Week',
    metric: 'Views',
    featured: ['Rooftop sunset view', 'Mint tea', 'Live oud on Fridays'],
    rec: null,
  },
};

export const PERIODS = {
  Week: {
    unit: 'week',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    base: [182, 164, 171, 195, 268, 344, 312],
    prev: 0.87,
  },
  Month: {
    unit: 'month',
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
    base: [1360, 1425, 1512, 1688],
    prev: 0.91,
  },
  Year: {
    unit: 'year',
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    base: [
      3900, 4300, 5600, 6900, 6100, 4800, 5200, 5400, 6300, 7400, 6800, 5900,
    ],
    prev: 0.78,
  },
} as const;

export const METRICS = [
  { label: 'Views', icon: 'ph-eye', k: 1 },
  { label: 'Clicks', icon: 'ph-cursor-click', k: 0.31 },
  { label: 'Visits', icon: 'ph-footprints', k: 0.108 },
  { label: 'Reviews', icon: 'ph-chat-circle-text', k: 0.0125 },
  { label: 'Recommendations', icon: 'ph-thumbs-up', k: 0.0082 },
];

export const LIKED: [string, number][] = [
  ['Rooftop sunset view', 0.34],
  ['Mint tea', 0.27],
  ['Lamb tagine', 0.22],
  ['Live oud on Fridays', 0.16],
  ['Friendly staff', 0.14],
  ['Fair prices', 0.09],
];

export const jitter = (i: number, j: number) =>
  1 + (((i * 37 + j * 11) % 9) - 4) / 60;

export function series(period: 'Week' | 'Month' | 'Year', metric: string) {
  const P = PERIODS[period];
  const m = METRICS.find((x) => x.label === metric) || METRICS[0];
  const mi = METRICS.indexOf(m);
  const cur = P.base.map((v, i) => Math.round(v * m.k * jitter(i, mi)));
  const prev = P.base.map((v, i) =>
    Math.round(v * m.k * P.prev * jitter(i + 3, mi + 2))
  );
  return { cur, prev };
}

export const fmt = (n: number) =>
  n >= 10000
    ? (n / 1000).toFixed(1).replace('.0', '') + 'k'
    : n.toLocaleString('en-GB');

export const pad = (n: number) => String(n).padStart(2, '0');

export const hm = (d: Date) => pad(d.getHours()) + ':' + pad(d.getMinutes());

