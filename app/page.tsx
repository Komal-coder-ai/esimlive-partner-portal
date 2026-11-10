'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Data types
type PageType =
  | 'join'
  | 'listings'
  | 'restaurant'
  | 'event'
  | 'tour'
  | 'studio'
  | 'promo'
  | 'insights';

interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface JoinData {
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

interface RestaurantData {
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

interface EventData {
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

interface TourData {
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

interface StudioData {
  prompt: string;
  langs: string[];
  tone: string;
  view: string;
  title: string;
  tagline: string;
  tags: string[];
  texts: Record<string, string>;
}

interface PromoData {
  type: string;
  offer: string;
  code: string;
  valid: string;
  radius: string;
  sentAt: number;
}

interface PublishedItem {
  id: string;
  kind: 'r' | 'e' | 't' | 'p';
  title: string;
  sub: string;
  icon: string;
  color: string;
  status: 'Live' | 'Scheduled' | 'Sent';
}

interface InsightsConfig {
  period: 'Week' | 'Month' | 'Year';
  metric: string;
  featured: string[];
  rec: { title: string; body: string } | null;
}

interface AppState {
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

const KEY = 'esimlive-partner-v1';
const AI_ENDPOINT = '/api/ai/generate';

const CATS: CategoryItem[] = [
  { id: 'restaurant', label: 'Restaurant', icon: 'ph-fork-knife', color: 'var(--color-primary)' },
  { id: 'event', label: 'Event', icon: 'ph-calendar-star', color: 'var(--color-accent-event)' },
  { id: 'tour', label: 'Tour & activity', icon: 'ph-compass', color: 'var(--color-accent-tour)' },
  { id: 'shop', label: 'Shop & souk', icon: 'ph-storefront', color: 'var(--color-accent-shop)' },
  { id: 'stay', label: 'Stay', icon: 'ph-bed', color: 'var(--color-accent-stay)' },
  { id: 'wellness', label: 'Wellness & spa', icon: 'ph-flower-lotus', color: 'var(--color-accent-wellness)' },
  { id: 'transport', label: 'Transport', icon: 'ph-bus', color: 'var(--color-accent-transport)' },
  { id: 'attraction', label: 'Attraction', icon: 'ph-bank', color: 'var(--color-accent-attraction)' },
];

const COUNTRIES = [
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

const STOPS = [
  'Aït Benhaddou',
  'Ouarzazate',
  'Dades Gorge',
  'Todra Gorge',
  'Zagora',
  'Merzouga dunes',
];

const LANGS = ['English', 'Français', 'العربية', 'Español', 'Deutsch', '中文'];

const DEFAULTS: Omit<AppState, 'page' | 'toast' | 'busy' | 'now' | 'anim' | 'joinError'> = {
  signedUp: true, // Default to true as seen in active dashboard
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
    included: ['Transport', 'Camel trek', 'Desert camp', 'Breakfast & dinner'],
    pickup: 'Riad pickup, Marrakech medina',
    lat: 31.6295,
    lng: -7.9811,
    note: 'Pickup pinned in the medina. Travellers can share their riad location when booking.',
    stops: ['Aït Benhaddou', 'Dades Gorge', 'Merzouga dunes'],
    desc: '',
  },
  s: {
    prompt: 'Family-run rooftop café near the Koutoubia. Mint tea, tagines, live oud on Fridays.',
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
    offer: '15% off Monday to Thursday',
    code: 'WEEKDAY15',
    valid: '24 hrs',
    radius: '5 km',
    sentAt: Date.now() - 3600000,
  },
  published: [
    {
      id: 'p:15% off Monday to Thursday',
      kind: 'p',
      title: '15% off Monday to Thursday',
      sub: 'Code WEEKDAY15 · 5 km · 24 hrs',
      icon: 'ph-tag',
      color: '#e8730c',
      status: 'Sent',
    },
  ],
  ins: {
    period: 'Week',
    metric: 'Views',
    featured: ['Rooftop sunset view', 'Mint tea', 'Live oud on Fridays'],
    rec: null,
  },
};

const PERIODS = {
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
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    base: [3900, 4300, 5600, 6900, 6100, 4800, 5200, 5400, 6300, 7400, 6800, 5900],
    prev: 0.78,
  },
} as const;

const METRICS = [
  { label: 'Views', icon: 'ph-eye', k: 1 },
  { label: 'Clicks', icon: 'ph-cursor-click', k: 0.31 },
  { label: 'Visits', icon: 'ph-footprints', k: 0.108 },
  { label: 'Reviews', icon: 'ph-chat-circle-text', k: 0.0125 },
  { label: 'Recommendations', icon: 'ph-thumbs-up', k: 0.0082 },
];

const LIKED: [string, number][] = [
  ['Rooftop sunset view', 0.34],
  ['Mint tea', 0.27],
  ['Lamb tagine', 0.22],
  ['Live oud on Fridays', 0.16],
  ['Friendly staff', 0.14],
  ['Fair prices', 0.09],
];

const jitter = (i: number, j: number) =>
  1 + (((i * 37 + j * 11) % 9) - 4) / 60;

function series(period: 'Week' | 'Month' | 'Year', metric: string) {
  const P = PERIODS[period];
  const m = METRICS.find((x) => x.label === metric) || METRICS[0];
  const mi = METRICS.indexOf(m);
  const cur = P.base.map((v, i) => Math.round(v * m.k * jitter(i, mi)));
  const prev = P.base.map((v, i) =>
    Math.round(v * m.k * P.prev * jitter(i + 3, mi + 2))
  );
  return { cur, prev };
}

const fmt = (n: number) =>
  n >= 10000
    ? (n / 1000).toFixed(1).replace('.0', '') + 'k'
    : n.toLocaleString('en-GB');

const pad = (n: number) => String(n).padStart(2, '0');
const hm = (d: Date) => pad(d.getHours()) + ':' + pad(d.getMinutes());
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<AppState>(() => {
    return {
      ...clone(DEFAULTS),
      page: 'listings',
      toast: '',
      busy: '',
      now: Date.now(),
      anim: true,
      joinError: '',
    };
  });

  const toast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setState((prev) => ({ ...prev, toast: msg }));
    toastTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, toast: '' }));
    }, 2600);
  }, []);

  const route = useCallback(() => {
    const pages: PageType[] = [
      'join',
      'listings',
      'restaurant',
      'event',
      'tour',
      'studio',
      'promo',
      'insights',
    ];
    let pg = (window.location.hash.match(/#\/?([\w-]+)/) || [])[1] as PageType;
    if (!pages.includes(pg)) pg = state.signedUp ? 'listings' : 'join';
    if (pg !== 'join' && !state.signedUp) pg = 'join';
    setState((prev) => ({ ...prev, page: pg }));
  }, [state.signedUp]);

  useEffect(() => {
    setMounted(true);
    let saved: any = null;
    try {
      saved = JSON.parse(localStorage.getItem(KEY) || '');
    } catch (e) {}

    const base = clone(DEFAULTS);
    if (saved) {
      for (const k of Object.keys(base) as (keyof typeof base)[]) {
        if (saved[k] !== undefined) {
          (base as any)[k] =
            typeof base[k] === 'object' && !Array.isArray(base[k])
              ? { ...(base as any)[k], ...saved[k] }
              : saved[k];
        }
      }
    }

    let initialPage: PageType = 'listings';
    const hashMatch = window.location.hash.match(/#\/?([\w-]+)/);
    if (hashMatch && hashMatch[1]) {
      initialPage = hashMatch[1] as PageType;
    } else {
      initialPage = base.signedUp ? 'listings' : 'join';
    }

    setState({
      ...base,
      page: initialPage,
      toast: '',
      busy: '',
      now: Date.now(),
      anim: true,
      joinError: '',
    });

    const onHashChange = () => route();
    window.addEventListener('hashchange', onHashChange);

    const timer = setInterval(() => {
      setState((prev) => ({ ...prev, now: Date.now() }));
    }, 15000);

    return () => {
      window.removeEventListener('hashchange', onHashChange);
      clearInterval(timer);
    };
  }, [route]);

  // Persist to local storage
  useEffect(() => {
    if (!mounted) return;
    const { signedUp, join, r, e, t, s, p, published } = state;
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ signedUp, join, r, e, t, s, p, published })
      );
    } catch (err) {}
  }, [state, mounted]);

  const go = (page: PageType) => {
    if (window.location.hash !== '#/' + page) {
      window.location.hash = '#/' + page;
    } else {
      setState((prev) => ({ ...prev, page }));
    }
    window.scrollTo(0, 0);
  };

  const upd = <K extends keyof AppState>(sec: K, patch: Partial<AppState[K]>) => {
    setState((st) => ({
      ...st,
      [sec]: { ...(st[sec] as any), ...patch },
    }));
  };

  // AI completion
  const ai = async (prompt: string, fallback: string) => {
    try {
      if ((window as any).claude && (window as any).claude.complete) {
        return (await (window as any).claude.complete(prompt)).trim();
      }
      const res = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const j = await res.json();
        if (j.text) return j.text.trim();
      }
    } catch (err) {}
    return fallback;
  };

  const writeDesc = async (sec: 'r' | 'e' | 't') => {
    if (state.busy) return;
    const d = state[sec];
    let ctx = '',
      fb = '';
    if (sec === 'r') {
      ctx = `Restaurant "${state.r.name}", ${state.r.cuisine} cuisine, price ${state.r.price}, open ${state.r.hours}, at ${state.r.address}. Traveller offer: ${state.r.offer}.`;
      fb = `${state.r.name} serves ${state.r.cuisine.toLowerCase()} cooking in the heart of ${state.join.city}. Drop in between ${state.r.hours} — ${state.r.price === '$' ? 'easy on the wallet' : state.r.price === '$$' ? 'fair prices' : 'a special night out'}, and ${state.r.offer ? state.r.offer.toLowerCase() : 'a warm welcome'}.`;
    } else if (sec === 'e') {
      ctx = `${state.e.type} event "${state.e.title}" on ${state.e.date} at ${state.e.time}, venue ${state.e.venue}, tickets ${state.e.price}.`;
      fb = `${state.e.title}: an evening of ${state.e.type.toLowerCase()} at ${state.e.venue}. Doors open ${state.e.time}, tickets ${state.e.price}. Arrive early for the best spot.`;
    } else if (sec === 't') {
      ctx = `${state.t.duration} tour "${state.t.name}" from ${state.t.pickup}, stops: ${state.t.stops.join(', ')}. Included: ${state.t.included.join(', ')}. ${state.t.price} per person, ${state.t.group}.`;
      fb = `Leave from ${state.t.pickup} and travel through ${state.t.stops.join(', ')}. ${state.t.included.join(', ')} included. ${state.t.group} travellers, ${state.t.price} per person.`;
    }

    setState((prev) => ({ ...prev, busy: sec }));
    const text = await ai(
      `Write a warm, concise 2-sentence listing description for travellers using a travel app. No emoji, no hashtags, no quotes. Details: ${ctx}`,
      fb
    );
    setState((prev) => ({ ...prev, busy: '' }));
    upd(sec, { desc: text });
  };

  const generate = async () => {
    if (state.busy) return;
    const s = state.s,
      name = state.join.business;
    setState((prev) => ({ ...prev, busy: 'studio' }));
    const phrases = s.prompt
      .split(/[.,;]/)
      .map((x) => x.trim())
      .filter(Boolean);
    const lead: Record<string, string> = {
      Friendly: `Come and say hello at ${name}.`,
      Premium: `${name} is a refined address for discerning travellers.`,
      Family: `Bring the whole family to ${name}.`,
    };
    const fbTexts: Record<string, string> = {};
    s.langs.forEach((l) => {
      fbTexts[l] =
        s.texts[l] && s.prompt === DEFAULTS.s.prompt
          ? s.texts[l]
          : `${lead[s.tone] || lead.Friendly} ${s.prompt}`;
    });
    const fallback = {
      title: name,
      tagline: phrases[0] || name,
      tags: phrases
        .slice(0, 4)
        .map((x) => x.split(' ').slice(0, 3).join(' ')),
      texts: fbTexts,
    };
    const raw = await ai(
      `You write listings for eSIMLive, a travel app. Business name: "${name}" in ${state.join.city}. Description: "${s.prompt}". Tone: ${s.tone}. Return ONLY JSON: {"title": string, "tagline": string, "tags": [string], "texts": {${s.langs.map((l) => `"${l}": string`).join(', ')}}}`,
      ''
    );
    let out = fallback;
    if (raw) {
      try {
        const j = JSON.parse(
          raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
        );
        if (j.texts) out = { ...fallback, ...j };
      } catch (err) {}
    }
    setState((prev) => ({ ...prev, busy: '' }));
    upd('s', {
      title: out.title,
      tagline: out.tagline,
      tags: out.tags || [],
      texts: { ...s.texts, ...out.texts },
      view: s.langs[0] || 'English',
    });
    toast('Listing generated');
  };

  const find = (sec: 'r' | 'e' | 't') => {
    const q =
      sec === 'r' ? state.r.address : sec === 'e' ? state.e.venue : state.t.pickup;
    fetch(
      'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
        encodeURIComponent(q)
    )
      .then((r) => r.json())
      .then((j) => {
        if (!j[0]) return toast('Address not found — try adding the city');
        upd(sec, {
          lat: +(+j[0].lat).toFixed(5),
          lng: +(+j[0].lon).toFixed(5),
          note: 'Pin set from address. Tap Use my location if you are on site.',
        });
      })
      .catch(() => toast('Could not reach the map service'));
  };

  const locate = (sec: 'r' | 'e' | 't') => {
    if (!navigator.geolocation)
      return toast('Location not available on this device');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        upd(sec, {
          lat: +pos.coords.latitude.toFixed(5),
          lng: +pos.coords.longitude.toFixed(5),
          note: 'Pin set from your current location.',
        });
        toast('Location pinned');
      },
      () => toast('Allow location access to pin your spot'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const publish = (kind: 'r' | 'e' | 't' | 'p') => {
    const st = state;
    const item: PublishedItem = {
      r: {
        kind: 'r' as const,
        title: st.r.name,
        sub: `${st.r.cuisine} · ${st.r.price} · ${st.r.hours}`,
        icon: 'ph-fork-knife',
        color: '#17c99a',
        status: 'Live' as const,
        id: 'r:' + st.r.name,
      },
      e: {
        kind: 'e' as const,
        title: st.e.title,
        sub: `${eventShort()} · ${st.e.venue}`,
        icon: 'ph-calendar-star',
        color: '#d6336c',
        status: 'Scheduled' as const,
        id: 'e:' + st.e.title,
      },
      t: {
        kind: 't' as const,
        title: st.t.name,
        sub: `${st.t.duration} · ${st.t.price} · ${st.t.group}`,
        icon: 'ph-compass',
        color: '#e8730c',
        status: 'Live' as const,
        id: 't:' + st.t.name,
      },
      p: {
        kind: 'p' as const,
        title: st.p.offer,
        sub: `Code ${st.p.code} · ${st.p.radius} · ${st.p.valid}`,
        icon: 'ph-tag',
        color: '#e8730c',
        status: 'Sent' as const,
        id: 'p:' + st.p.offer,
      },
    }[kind];

    setState((s) => ({
      ...s,
      published: [item, ...s.published.filter((x) => x.id !== item.id)],
    }));
    return item;
  };

  const refreshRec = async (gap: number, kpis: any[]) => {
    if (state.busy) return;
    setState((prev) => ({ ...prev, busy: 'ins' }));
    const I = state.ins;
    const summary = kpis
      .map((k) => `${k.label} ${k.value} (${k.delta})`)
      .join('; ');
    const fb = {
      title: `Your ${I.metric.toLowerCase()} peak on weekends. Move some of that demand to weekdays.`,
      body: `Weekday visits trail weekends by ${gap}%. Try a short Tuesday–Thursday offer and feature "${
        I.featured[0] || 'your best dish'
      }" in the push — it is what travellers mention most.`,
    };
    const raw = await ai(
      `You advise a ${state.join.category} called "${state.join.business}" in ${state.join.city} listed in the eSIMLive travel app. Performance this ${PERIODS[I.period].unit}: ${summary}. Weekday visits are ${gap}% lower than weekends. Travellers most liked: ${LIKED.slice(0, 3).map((x) => x[0]).join(', ')}. Give ONE concrete recommendation. Return ONLY JSON {"title": one sentence max 16 words, "body": two sentences}.`,
      ''
    );
    let rec = fb;
    if (raw) {
      try {
        const j = JSON.parse(
          raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
        );
        if (j.title) rec = j;
      } catch (e) {}
    }
    setState((prev) => ({ ...prev, busy: '' }));
    upd('ins', { rec });
  };

  const eventShort = () => {
    const e = state.e;
    const d = new Date(e.date + 'T00:00');
    if (isNaN(d.getTime())) return e.time;
    return (
      d
        .toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
        .toUpperCase()
        .replace(',', '') +
      ' · ' +
      e.time
    );
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)' }} />
    );
  }

  // Active page & computed values matching eSIMLive Partners.dc.html
  const page = state.page;
  const busy = state.busy;
  const st = state;
  const I = st.ins;
  const P = PERIODS[I.period];
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

  const kpis = METRICS.map((m) => {
    const s = series(I.period, m.label);
    const c = sum(s.cur);
    const p = sum(s.prev);
    const d = Math.round(((c - p) / (p || 1)) * 100);
    const on = I.metric === m.label;
    return {
      label: m.label,
      icon: m.icon,
      value: fmt(c),
      delta: (d >= 0 ? '▲ ' : '▼ ') + Math.abs(d) + '% vs last ' + P.unit,
      deltaStyle: {
        fontSize: '12px',
        fontWeight: 600,
        color: d >= 0 ? 'var(--color-primary-dark)' : 'var(--color-alert-red)',
      },
      style: {
        textAlign: 'left' as const,
        background: '#fff',
        border: on ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
        boxShadow: on ? '0 0 0 3px var(--color-primary-glow)' : 'none',
        borderRadius: '14px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        minWidth: 0,
        overflow: 'hidden',
      },
      onClick: () => upd('ins', { metric: m.label }),
    };
  });

  const chartSeries = series(I.period, I.metric);
  const max = Math.max(...chartSeries.cur, ...chartSeries.prev) || 1;
  const barW = I.period === 'Year' ? 9 : I.period === 'Month' ? 30 : 18;
  const bar = (v: number, c: string) => ({
    width: barW,
    flex: '0 1 ' + barW + 'px',
    height: Math.max(3, (v / max) * 100) + '%',
    background: c,
    borderRadius: '4px 4px 0 0',
    transition: 'height .35s ease',
  });
  const bars = P.labels.map((label, i) => ({
    label,
    tip: `${label}: ${fmt(chartSeries.cur[i])} this ${P.unit}, ${fmt(chartSeries.prev[i])} last ${P.unit}`,
    curStyle: bar(chartSeries.cur[i], 'var(--color-primary)'),
    prevStyle: bar(chartSeries.prev[i], '#c9d6dc'),
  }));
  const best = chartSeries.cur.indexOf(Math.max(...chartSeries.cur));
  const w = series('Week', 'Visits').cur;
  const wkday = sum(w.slice(0, 4)) / 4;
  const wkend = sum(w.slice(4)) / 3;
  const gap = Math.round((1 - wkday / (wkend || 1)) * 100);
  const rec = I.rec || {
    title: `Weekday visits are ${gap}% lower than weekends. Offer a Monday–Thursday promotion.`,
    body: `Fridays to Sundays are busy, but Monday to Thursday has room to spare. A 15% weekday offer sent to travellers within 5 km at lunchtime could fill those quieter tables.`,
  };
  const reviewsTotal = sum(series(I.period, 'Reviews').cur);
  const recsTotal = sum(series(I.period, 'Recommendations').cur);
  const liked = LIKED.map(([label, k]) => {
    const on = I.featured.includes(label);
    const count = Math.max(1, Math.round(reviewsTotal * k * 2.4));
    return {
      label,
      count,
      starIcon: on ? 'ph-fill ph-star' : 'ph ph-star',
      starStyle: {
        width: 32,
        height: 32,
        flex: '0 0 32px',
        borderRadius: '50%',
        border: on ? '1px solid var(--color-star-border)' : '1px solid var(--color-border)',
        background: on ? 'var(--color-star-bg)' : '#fff',
        color: on ? 'var(--color-star-text)' : 'var(--color-text-dim)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      barStyle: {
        height: '100%',
        width: (k / LIKED[0][1]) * 100 + '%',
        background: 'var(--color-accent-event)',
        borderRadius: 6,
      },
      onToggle: () =>
        upd('ins', {
          featured: on
            ? I.featured.filter((x) => x !== label)
            : [...I.featured, label],
        }),
    };
  });
  const rangeLabel = {
    Week: 'Last 7 days',
    Month: 'Last 4 weeks',
    Year: 'Last 12 months',
  }[I.period];

  const chipS = (on: boolean, dark?: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 34,
    padding: '0 14px',
    borderRadius: 999,
    border:
      '1px solid ' +
      (on
        ? 'var(--color-primary)'
        : dark
        ? 'rgba(255,255,255,.22)'
        : 'var(--color-border-input)'),
    background: on
      ? 'var(--color-primary)'
      : dark
      ? 'transparent'
      : '#fff',
    color: on
      ? 'var(--color-primary-darker)'
      : dark
      ? '#fff'
      : 'var(--color-text-main)',
    fontSize: 13,
    fontWeight: on ? 600 : 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  });

  const segS = (on: boolean, dark?: boolean) => ({
    height: 34,
    padding: '0 14px',
    border: 0,
    borderRadius: 8,
    background: on ? '#fff' : 'transparent',
    boxShadow: on ? '0 1px 3px rgba(16,34,46,.14)' : 'none',
    color: on
      ? 'var(--color-text-main)'
      : dark
      ? 'var(--color-dark-text-muted)'
      : 'var(--color-text-muted)',
    fontWeight: on ? 600 : 500,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
  });

  const cat = CATS.find((c) => c.id === st.join.category) || CATS[0];
  const catTiles = CATS.map((c) => {
    const on = c.id === cat.id;
    return {
      ...c,
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 8,
        padding: '16px 8px',
        borderRadius: 12,
        border: on ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border-input)',
        background: on ? 'var(--color-primary-tint)' : '#fff',
        color: on ? 'var(--color-primary-dark)' : 'var(--color-text-main)',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: on ? 600 : 500,
        cursor: 'pointer',
      },
      onClick: () => upd('join', { category: c.id }),
    };
  });

  const navDefs: [string, PageType, PageType[]][] = [
    ['Listings', 'listings', ['listings', 'restaurant', 'event', 'tour']],
    ['AI studio', 'studio', ['studio']],
    ['Promotions', 'promo', ['promo']],
    ['Insights', 'insights', ['insights']],
  ];

  const navItems = navDefs.map(([label, to, act]) => {
    const on = act.includes(page);
    return {
      label,
      onClick: () => go(to),
      style: {
        height: 36,
        padding: '0 14px',
        border: 0,
        borderRadius: 999,
        background: on ? 'var(--color-bg-muted)' : 'transparent',
        color: on ? 'var(--color-text-main)' : 'var(--color-text-muted)',
        fontFamily: 'inherit',
        fontSize: 14,
        fontWeight: on ? 600 : 500,
        cursor: 'pointer',
      },
    };
  });

  const addCards = [
    {
      label: 'Restaurant',
      sub: 'Menu, hours, price and a traveller offer',
      icon: 'ph-fork-knife',
      c: '#17c99a',
      to: 'restaurant' as PageType,
    },
    {
      label: 'Event',
      sub: 'Date, venue and one push on the day',
      icon: 'ph-calendar-star',
      c: '#d6336c',
      to: 'event' as PageType,
    },
    {
      label: 'Tour & experience',
      sub: 'Multi-day routes, stops and pickup',
      icon: 'ph-compass',
      c: '#e8730c',
      to: 'tour' as PageType,
    },
    {
      label: 'Flash promotion',
      sub: 'An instant offer to phones nearby',
      icon: 'ph-lightning',
      c: '#6c5ce7',
      to: 'promo' as PageType,
    },
    {
      label: 'AI listing studio',
      sub: 'One line in, every language out',
      icon: 'ph-sparkle',
      c: '#0f2533',
      to: 'studio' as PageType,
    },
  ].map((a) => ({
    ...a,
    iconStyle: {
      width: 42,
      height: 42,
      borderRadius: 12,
      background: a.c,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    onClick: () => go(a.to),
  }));

  const feed = st.published.map((f) => ({
    ...f,
    tile: {
      width: 40,
      height: 40,
      flex: '0 0 40px',
      borderRadius: 11,
      background: f.color,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    onRemove: () =>
      setState((s) => ({
        ...s,
        published: s.published.filter((x) => x.id !== f.id),
      })),
  }));

  const mapUrl = (d: { lat: number; lng: number }) =>
    `https://www.openstreetmap.org/export/embed.html?bbox=${d.lng - 0.008},${
      d.lat - 0.005
    },${d.lng + 0.008},${d.lat + 0.005}&layer=mapnik&marker=${d.lat},${d.lng}`;

  const coord = (d: { lat: number; lng: number }) =>
    `${(+d.lat).toFixed(5)}, ${(+d.lng).toFixed(5)}`;

  const now = new Date(st.now);
  const e = st.e;
  const eDate = new Date(e.date + 'T' + (e.time || '20:00'));
  const lockEvent = isNaN(eDate.getTime())
    ? now
    : new Date(eDate.getTime() - 90 * 60000);

  const lockD = (d: Date) =>
    d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  const radiusTxt = (r: string) =>
    r === 'Whole city' || r === 'City' ? 'in the city' : 'within ' + r;

  const eventIcon =
    {
      Music: 'ph-music-notes',
      Food: 'ph-bowl-food',
      Culture: 'ph-mask-happy',
      Market: 'ph-storefront',
      Sport: 'ph-soccer-ball',
    }[e.type] || 'ph-calendar-star';

  const p = st.p;
  const hrs = parseInt(p.valid, 10) || 24;
  const sentLive = Boolean(p.sentAt && st.now - p.sentAt < hrs * 3600000);
  const until = p.sentAt ? hm(new Date(p.sentAt + hrs * 3600000)) : '';

  const s = st.s;
  const view = s.langs.includes(s.view) ? s.view : s.langs[0] || 'English';
  const dirOf = (l: string) => (l === 'العربية' ? 'rtl' : 'ltr');

  const sTexts = s.langs.map((l) => ({
    lang: l,
    dir: dirOf(l),
    text: s.texts[l] || 'Press Generate listing to write this language.',
    onCopy: () => {
      navigator.clipboard && navigator.clipboard.writeText(s.texts[l] || '');
      toast(l + ' copied');
    },
  }));

  const phoneLock = page === 'event' || page === 'promo';
  const labels: Record<string, string> = {
    insights: 'HOW TRAVELLERS SEE YOU',
    join: 'YOUR CARD IN THE APP',
    listings: 'LIVE IN THE APP',
    restaurant: 'LIVE APP PREVIEW',
    event: 'WHAT TRAVELLERS SEE',
    tour: 'LIVE APP PREVIEW',
    studio: 'LIVE APP PREVIEW',
    promo: 'WHAT TRAVELLERS SEE',
  };
  const hints: Record<string, string> = {
    insights: 'Rating, reviews and starred likes appear on your card.',
    join: 'Updates as you type.',
    listings: 'Everything you publish, as travellers see it.',
    restaurant: 'Every field updates the card instantly.',
    event: 'The push travellers get on the day.',
    tour: 'Tap stops and extras — the route card follows.',
    studio: 'Tap a language to preview it on the phone.',
    promo: sentLive
      ? 'Sent — this is on travellers’ lock screens now.'
      : 'Preview of the push. Tap Send now to go live.',
  };

  const initials =
    st.join.business
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'DZ';

  const routeArray = [
    st.t.pickup.split(',').pop()?.trim().replace(/ medina$/i, '') || 'Pickup',
    ...st.t.stops,
  ];
  const pickupCity = st.t.pickup
    .split(',')
    .pop()
    ?.trim()
    .replace(/ medina$/i, '');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-page)',
        fontFamily: 'Poppins, system-ui, sans-serif',
        color: 'var(--color-text-main)',
        fontSize: '14px',
      }}
    >
      {/* 1. Header (shown when signed up or inside app) */}
      {page !== 'join' && (
        <header
          style={{
            background: 'var(--color-bg-card)',
            borderBottom: '1px solid var(--color-border)',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          {/* Desktop Header (>= 768px) */}
          <div
            className="hidden md:flex"
            style={{
              maxWidth: '1360px',
              margin: '0 auto',
              padding: '0 32px',
              height: '68px',
              alignItems: 'center',
              gap: '36px',
            }}
          >
            <div
              onClick={() => go('listings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: 'var(--color-indigo)',
                    }}
                  ></span>
                  <span
                    style={{
                      width: '14px',
                      height: '7px',
                      borderRadius: '4px',
                      background: 'linear-gradient(90deg, var(--color-blue), var(--color-primary))',
                    }}
                  ></span>
                </div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <span
                    style={{
                      width: '14px',
                      height: '7px',
                      borderRadius: '4px',
                      background: 'linear-gradient(90deg, var(--color-indigo), var(--color-sky))',
                    }}
                  ></span>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                    }}
                  ></span>
                </div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: 'var(--color-indigo)',
                    }}
                  ></span>
                  <span
                    style={{
                      width: '14px',
                      height: '7px',
                      borderRadius: '4px',
                      background: 'linear-gradient(90deg, var(--color-blue), var(--color-primary))',
                    }}
                  ></span>
                </div>
              </div>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '17px',
                  letterSpacing: '-0.01em',
                }}
              >
                eSIMLive{' '}
                <span style={{ color: 'var(--color-primary-brand)' }}>
                  Partners
                </span>
              </span>
            </div>

            <nav style={{ display: 'flex', gap: '6px', flex: 1 }}>
              {navItems.map((n) => (
                <button
                  key={n.label}
                  onClick={n.onClick}
                  style={n.style}
                >
                  {n.label}
                </button>
              ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary-active)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {initials}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>
                {st.join.business}
              </span>
              <button
                onClick={() => {
                  setState((s) => ({ ...s, signedUp: false }));
                  go('join');
                }}
                title="Sign out"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-card)',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="ph ph-sign-out" style={{ fontSize: '16px' }}></i>
              </button>
            </div>
          </div>

          {/* Mobile Header (< 768px) */}
          <div
            className="flex flex-col md:hidden"
            style={{
              padding: '8px 16px',
              gap: '8px',
            }}
          >
            {/* Top row: Logo + Profile/Signout */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <div
                onClick={() => go('listings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-indigo)' }}></span>
                    <span style={{ width: '12px', height: '6px', borderRadius: '3px', background: 'linear-gradient(90deg, var(--color-blue), var(--color-primary))' }}></span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <span style={{ width: '12px', height: '6px', borderRadius: '3px', background: 'linear-gradient(90deg, var(--color-indigo), var(--color-sky))' }}></span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-indigo)' }}></span>
                    <span style={{ width: '12px', height: '6px', borderRadius: '3px', background: 'linear-gradient(90deg, var(--color-blue), var(--color-primary))' }}></span>
                  </div>
                </div>
                <span style={{ fontWeight: 600, fontSize: '16px', letterSpacing: '-0.01em' }}>
                  eSIMLive <span style={{ color: 'var(--color-primary-brand)' }}>Partners</span>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary-active)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {initials}
                </span>
                <span
                  className="hidden sm:inline"
                  style={{ fontSize: '13px', fontWeight: 500, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {st.join.business}
                </span>
                <button
                  onClick={() => {
                    setState((s) => ({ ...s, signedUp: false }));
                    go('join');
                  }}
                  title="Sign out"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i className="ph ph-sign-out" style={{ fontSize: '15px' }}></i>
                </button>
              </div>
            </div>

            {/* Bottom row: Horizontal scrolling tabs */}
            <nav
              className="no-scrollbar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: '2px',
              }}
            >
              {navItems.map((n) => (
                <button
                  key={n.label}
                  onClick={n.onClick}
                  style={{
                    ...n.style,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    padding: '0 12px',
                    height: '32px',
                    fontSize: '13px',
                  }}
                >
                  {n.label}
                </button>
              ))}
            </nav>
          </div>
        </header>
      )}

      {/* 2. Main Page Layout (620px Left Main + 320px Right Sticky Phone) */}
      <div
        className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8 flex flex-wrap gap-6 lg:gap-10 items-start max-w-[1360px] mx-auto"
        style={{
          minWidth: 0,
        }}
      >
        <main
          style={{
            flex: '1 1 620px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* VIEW: JOIN */}
          {page === 'join' && (
            <div
              className="flex flex-col lg:flex-row bg-[var(--color-bg-card)] rounded-2xl lg:rounded-[20px] overflow-hidden border border-[var(--color-border)] shadow-[0_20px_50px_-24px_rgba(16,34,46,.25)]"
            >
              {/* Left Dark Hero Banner */}
              <div
                className="w-full lg:w-[42%] lg:max-w-[420px] p-6 sm:p-8 lg:p-10 flex flex-col gap-6 sm:gap-7 shrink-0 text-white"
                style={{
                  background:
                    'radial-gradient(circle at 80% 8%, rgba(23,201,154,.35), transparent 40%), radial-gradient(circle at 10% 100%, rgba(63,143,232,.3), transparent 45%), var(--color-dark-bg)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-[38px] h-[38px] rounded-[10px] bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <span className="flex flex-col gap-0.5">
                      <span className="flex gap-0.5">
                        <span className="w-[5px] h-[5px] rounded-full bg-[var(--color-indigo)]"></span>
                        <span className="w-[10px] h-[5px] rounded-[3px] bg-gradient-to-r from-[var(--color-blue)] to-[var(--color-primary)]"></span>
                      </span>
                      <span className="flex gap-0.5">
                        <span className="w-[10px] h-[5px] rounded-[3px] bg-[var(--color-blue)]"></span>
                        <span className="w-[5px] h-[5px] rounded-full bg-[var(--color-primary)]"></span>
                      </span>
                      <span className="flex gap-0.5">
                        <span className="w-[5px] h-[5px] rounded-full bg-[var(--color-indigo)]"></span>
                        <span className="w-[10px] h-[5px] rounded-[3px] bg-gradient-to-r from-[var(--color-blue)] to-[var(--color-primary)]"></span>
                      </span>
                    </span>
                  </span>
                  <span className="font-semibold text-[17px] text-white">
                    eSIMLive <span className="text-[var(--color-primary-accent)]">Partners</span>
                  </span>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4 mt-1 sm:mt-3">
                  <span className="text-[11px] sm:text-xs font-semibold tracking-[0.14em] text-[var(--color-primary-accent)]">
                    FOR LOCAL BUSINESSES
                  </span>
                  <h1 className="m-0 text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-bold leading-[1.15] tracking-tight text-white">
                    Put your business on every visitor&apos;s phone.
                  </h1>
                  <p className="m-0 text-sm sm:text-[15px] leading-relaxed text-[var(--color-dark-text-muted)]">
                    List once. Your restaurant, event or tour shows up in the eSIMLive app for travellers who are nearby, right when they are deciding.
                  </p>
                </div>

                <div className="flex flex-col gap-3.5 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[10px] bg-[var(--color-primary-subtle)] text-[var(--color-primary-accent)] flex items-center justify-center shrink-0">
                      <i className="ph ph-identification-card text-lg"></i>
                    </span>
                    <span className="text-xs sm:text-sm text-white/90">
                      <strong className="text-white font-semibold">Sign up</strong> with your company details
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[10px] bg-[var(--color-primary-subtle)] text-[var(--color-primary-accent)] flex items-center justify-center shrink-0">
                      <i className="ph ph-map-pin text-lg"></i>
                    </span>
                    <span className="text-xs sm:text-sm text-white/90">
                      <strong className="text-white font-semibold">Pin your location</strong> in one click
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[10px] bg-[var(--color-primary-subtle)] text-[var(--color-primary-accent)] flex items-center justify-center shrink-0">
                      <i className="ph ph-sparkle text-lg"></i>
                    </span>
                    <span className="text-xs sm:text-sm text-white/90">
                      <strong className="text-white font-semibold">Let AI write</strong> your listing in every language
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[10px] bg-[var(--color-primary-subtle)] text-[var(--color-primary-accent)] flex items-center justify-center shrink-0">
                      <i className="ph ph-device-mobile text-lg"></i>
                    </span>
                    <span className="text-xs sm:text-sm text-white/90">
                      <strong className="text-white font-semibold">Go live</strong> in the eSIMLive app
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Form Container */}
              <div className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 flex flex-col gap-5 sm:gap-6 bg-[var(--color-bg-card)]">
                <div className="flex items-center justify-between gap-3 pb-3 sm:pb-0 border-b border-[var(--color-border)] sm:border-b-0">
                  <span className="text-xs sm:text-[13px] text-[var(--color-text-muted)] font-medium">
                    Already a partner?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setState((s) => ({ ...s, signedUp: true, joinError: '' }));
                      go('listings');
                    }}
                    className="h-9 px-4 rounded-full border border-[var(--color-border-input)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-page)] text-[var(--color-text-main)] text-xs sm:text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Sign in
                  </button>
                </div>

                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <h2 className="m-0 text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight text-[var(--color-text-main)]">
                    Create your partner account
                  </h2>
                  <span className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                    Free to join. Takes about two minutes.
                  </span>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-xs sm:text-[13px] font-semibold text-[var(--color-text-main)]">
                    Business name
                  </span>
                  <input
                    value={st.join.business}
                    onChange={(ev) => upd('join', { business: ev.target.value })}
                    placeholder="e.g. Dar Zellij, Sahara Dunes Tours"
                    className="h-11 sm:h-12 box-border px-3.5 rounded-xl border border-[var(--color-border-input)] text-sm text-[var(--color-text-main)] bg-[var(--color-bg-card)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)] transition-all"
                  />
                </label>

                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-[13px] font-semibold text-[var(--color-text-main)]">Category</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                    {catTiles.map((c) => {
                      const on = c.id === cat.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={c.onClick}
                          className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl border text-center transition-all cursor-pointer font-inherit ${
                            on
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-tint)] text-[var(--color-primary-dark)] shadow-sm font-semibold'
                              : 'border-[var(--color-border-input)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-page)] text-[var(--color-text-main)] font-medium'
                          }`}
                        >
                          <i className={`ph ${c.icon} text-xl sm:text-2xl`}></i>
                          <span className="text-xs sm:text-[13px] leading-tight">{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs sm:text-[13px] font-semibold text-[var(--color-text-main)]">
                      Contact name
                    </span>
                    <input
                      value={st.join.contact}
                      onChange={(ev) => upd('join', { contact: ev.target.value })}
                      placeholder="e.g. Youssef Amrani"
                      className="h-11 sm:h-12 box-border px-3.5 rounded-xl border border-[var(--color-border-input)] text-sm text-[var(--color-text-main)] bg-[var(--color-bg-card)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)] transition-all"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs sm:text-[13px] font-semibold text-[var(--color-text-main)]">
                      Business licence no.
                    </span>
                    <input
                      value={st.join.licence}
                      onChange={(ev) => upd('join', { licence: ev.target.value })}
                      placeholder="e.g. RC 123456"
                      className="h-11 sm:h-12 box-border px-3.5 rounded-xl border border-[var(--color-border-input)] text-sm text-[var(--color-text-main)] bg-[var(--color-bg-card)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)] transition-all"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs sm:text-[13px] font-semibold text-[var(--color-text-main)]">Email</span>
                    <input
                      type="email"
                      value={st.join.email}
                      onChange={(ev) => upd('join', { email: ev.target.value })}
                      placeholder="hello@business.com"
                      className="h-11 sm:h-12 box-border px-3.5 rounded-xl border border-[var(--color-border-input)] text-sm text-[var(--color-text-main)] bg-[var(--color-bg-card)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)] transition-all"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs sm:text-[13px] font-semibold text-[var(--color-text-main)]">
                      Phone / WhatsApp
                    </span>
                    <input
                      value={st.join.phone}
                      onChange={(ev) => upd('join', { phone: ev.target.value })}
                      placeholder="+212 6 12 34 56 78"
                      className="h-11 sm:h-12 box-border px-3.5 rounded-xl border border-[var(--color-border-input)] text-sm text-[var(--color-text-main)] bg-[var(--color-bg-card)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)] transition-all"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs sm:text-[13px] font-semibold text-[var(--color-text-main)]">City</span>
                    <input
                      value={st.join.city}
                      onChange={(ev) => upd('join', { city: ev.target.value })}
                      placeholder="e.g. Marrakech"
                      className="h-11 sm:h-12 box-border px-3.5 rounded-xl border border-[var(--color-border-input)] text-sm text-[var(--color-text-main)] bg-[var(--color-bg-card)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)] transition-all"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs sm:text-[13px] font-semibold text-[var(--color-text-main)]">
                      Country
                    </span>
                    <select
                      value={st.join.country}
                      onChange={(ev) => upd('join', { country: ev.target.value })}
                      className="h-11 sm:h-12 box-border px-3 rounded-xl border border-[var(--color-border-input)] text-sm text-[var(--color-text-main)] bg-[var(--color-bg-card)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)] transition-all"
                    >
                      {COUNTRIES.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="flex items-start sm:items-center gap-2.5 cursor-pointer text-[var(--color-text-sub)] select-none pt-1">
                  <input
                    type="checkbox"
                    checked={st.join.agree}
                    onChange={(ev) => upd('join', { agree: ev.target.checked })}
                    className="w-4 h-4 sm:w-4.5 sm:h-4.5 mt-0.5 sm:mt-0 rounded accent-[var(--color-primary)] cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm leading-snug">
                    I agree to the eSIMLive partner terms
                  </span>
                </label>

                {st.joinError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-alert-bg)] border border-[var(--color-alert-border)] text-[var(--color-alert-red)] text-xs sm:text-[13px]">
                    <i className="ph ph-warning-circle text-base shrink-0"></i>
                    <span>{st.joinError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const j = st.join;
                      if (!j.business.trim() || !/\S+@\S+\.\S+/.test(j.email)) {
                        return setState((s) => ({
                          ...s,
                          joinError: 'Add your business name and a valid email.',
                        }));
                      }
                      if (!j.agree) {
                        return setState((s) => ({
                          ...s,
                          joinError: 'Please accept the partner terms to continue.',
                        }));
                      }
                      const nextPage: Record<string, PageType> = {
                        restaurant: 'restaurant',
                        event: 'event',
                        tour: 'tour',
                      };
                      const target = nextPage[j.category] || 'listings';
                      setState((s2) => ({
                        ...s2,
                        signedUp: true,
                        joinError: '',
                        r: { ...s2.r, name: j.business },
                      }));
                      go(target);
                      toast('Welcome to eSIMLive Partners');
                    }}
                    className="w-full sm:w-auto h-12 sm:h-[50px] px-8 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] text-[var(--color-primary-darker)] font-semibold text-sm sm:text-[15px] cursor-pointer inline-flex items-center justify-center gap-2.5 shadow-[0_10px_24px_-10px_var(--color-primary-shadow)] active:scale-[0.99] transition-all"
                  >
                    <span>Create partner account</span>
                    <i className="ph ph-arrow-right text-base"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: LISTINGS */}
          {page === 'listings' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '13px',
                  }}
                >
                  Welcome, {st.join.contact}
                </span>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '30px',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Your listings
                </h1>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                  gap: '14px',
                }}
              >
                {addCards.map((a) => (
                  <button
                    key={a.label}
                    onClick={a.onClick}
                    style={{
                      textAlign: 'left',
                      background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      cursor: 'pointer',
                      font: 'inherit',
                      color: 'var(--color-text-main)',
                    }}
                  >
                    <span style={a.iconStyle}>
                      <i className={`ph ${a.icon}`} style={{ fontSize: '20px' }}></i>
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>
                        {a.label}
                      </span>
                      <span
                        style={{
                          color: 'var(--color-text-muted)',
                          fontSize: '13px',
                          lineHeight: 1.45,
                        }}
                      >
                        {a.sub}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '8px 24px',
                }}
              >
                {feed.length === 0 ? (
                  <div
                    style={{
                      padding: '28px 0',
                      color: 'var(--color-text-muted)',
                      textAlign: 'center',
                    }}
                  >
                    Nothing live yet. Publish a listing and it appears in the app
                    preview straight away.
                  </div>
                ) : (
                  feed.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '16px 0',
                        borderBottom: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <span style={f.tile}>
                        <i className={`ph ${f.icon}`} style={{ fontSize: '18px' }}></i>
                      </span>
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{f.title}</span>
                        <span
                          style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '13px',
                          }}
                        >
                          {f.sub}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--color-primary-active)',
                          background: 'var(--color-primary-light)',
                          padding: '4px 10px',
                          borderRadius: '999px',
                        }}
                      >
                        {f.status}
                      </span>
                      <button
                        onClick={f.onRemove}
                        title="Remove"
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-bg-card)',
                          color: 'var(--color-text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <i className="ph ph-trash" style={{ fontSize: '15px' }}></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* VIEW: RESTAURANT */}
          {page === 'restaurant' && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '13px',
                    }}
                  >
                    Listings / New
                  </span>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '30px',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Add your restaurant
                  </h1>
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-alert-red)',
                    background: 'var(--color-alert-bg)',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ● Draft
                </span>
              </div>

              <section
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 600,
                    fontSize: '16px',
                  }}
                >
                  <i
                    className="ph ph-fork-knife"
                    style={{
                      fontSize: '20px',
                      color: 'var(--color-primary-brand)',
                    }}
                  ></i>
                  Basics
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                  }}
                >
                  <label
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Restaurant name
                    </span>
                    <input
                      value={st.r.name}
                      onChange={(ev) => upd('r', { name: ev.target.value })}
                      style={{
                        height: '44px',
                        boxSizing: 'border-box',
                        padding: '0 14px',
                        border: '1px solid var(--color-border-input)',
                        borderRadius: '10px',
                        font: 'inherit',
                        fontSize: '14px',
                        color: 'var(--color-text-main)',
                        background: 'var(--color-bg-card)',
                        outline: 'none',
                      }}
                    />
                  </label>
                  <label
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Opening hours
                    </span>
                    <input
                      value={st.r.hours}
                      onChange={(ev) => upd('r', { hours: ev.target.value })}
                      style={{
                        height: '44px',
                        boxSizing: 'border-box',
                        padding: '0 14px',
                        border: '1px solid var(--color-border-input)',
                        borderRadius: '10px',
                        font: 'inherit',
                        fontSize: '14px',
                        color: 'var(--color-text-main)',
                        background: 'var(--color-bg-card)',
                        outline: 'none',
                      }}
                    />
                  </label>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px 32px',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Cuisine
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {[
                        'Moroccan',
                        'Mediterranean',
                        'Street food',
                        'Café',
                        'Vegetarian',
                      ].map((c) => (
                        <button
                          key={c}
                          onClick={() => upd('r', { cuisine: c })}
                          style={chipS(st.r.cuisine === c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Price range
                    </span>
                    <div
                      style={{
                        display: 'inline-flex',
                        gap: '4px',
                        padding: '4px',
                        background: 'var(--color-bg-muted)',
                        borderRadius: '10px',
                      }}
                    >
                      {['$', '$$', '$$$'].map((c) => (
                        <button
                          key={c}
                          onClick={() => upd('r', { price: c })}
                          style={segS(st.r.price === c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontWeight: 600,
                      fontSize: '16px',
                    }}
                  >
                    <i
                      className="ph ph-map-pin"
                      style={{
                        fontSize: '20px',
                        color: 'var(--color-primary-brand)',
                      }}
                    ></i>
                    Location
                  </div>
                  <span
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '13px',
                    }}
                  >
                    Travellers see your distance from them
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <input
                    value={st.r.address}
                    onChange={(ev) => upd('r', { address: ev.target.value })}
                    style={{
                      flex: '1 1 240px',
                      minWidth: 0,
                      height: '44px',
                      boxSizing: 'border-box',
                      padding: '0 14px',
                      border: '1px solid var(--color-border-input)',
                      borderRadius: '10px',
                      font: 'inherit',
                      fontSize: '14px',
                      color: 'var(--color-text-main)',
                      background: 'var(--color-bg-card)',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => find('r')}
                    style={{
                      height: '44px',
                      padding: '0 18px',
                      border: 0,
                      borderRadius: '999px',
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)',
                      font: 'inherit',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <i className="ph ph-magnifying-glass"></i>Find address
                  </button>
                  <button
                    onClick={() => locate('r')}
                    style={{
                      height: '44px',
                      padding: '0 18px',
                      border: 0,
                      borderRadius: '999px',
                      background: 'var(--color-primary)',
                      color: 'var(--color-primary-darker)',
                      font: 'inherit',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <i className="ph ph-crosshair"></i>Use my location
                  </button>
                </div>
                <div
                  style={{
                    position: 'relative',
                    height: '260px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'var(--color-bg-muted)',
                  }}
                >
                  <iframe
                    src={mapUrl(st.r)}
                    title="Map"
                    style={{ width: '100%', height: '100%', border: 0 }}
                  ></iframe>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      bottom: '12px',
                      background: 'var(--color-bg-card)',
                      borderRadius: '999px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      boxShadow: '0 2px 8px rgba(16,34,46,.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <i
                      className="ph-fill ph-map-pin"
                      style={{ color: 'var(--color-pin-red)' }}
                    ></i>
                    {coord(st.r)}
                  </span>
                </div>
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i
                    className="ph ph-info"
                    style={{ color: 'var(--color-primary-brand)' }}
                  ></i>
                  {st.r.note}
                </span>
              </section>

              <section
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontWeight: 600,
                      fontSize: '16px',
                    }}
                  >
                    <i
                      className="ph ph-text-align-left"
                      style={{
                        fontSize: '20px',
                        color: 'var(--color-primary-brand)',
                      }}
                    ></i>
                    Description
                  </div>
                  <button
                    onClick={() => writeDesc('r')}
                    style={{
                      height: '38px',
                      padding: '0 16px',
                      border: 0,
                      borderRadius: '999px',
                      background: 'var(--color-dark-bg)',
                      color: '#fff',
                      font: 'inherit',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <i
                      className="ph ph-sparkle"
                      style={{ color: 'var(--color-primary-accent)' }}
                    ></i>
                    {busy === 'r' ? 'Writing…' : 'Write with AI'}
                  </button>
                </div>
                <textarea
                  value={st.r.desc}
                  onChange={(ev) => upd('r', { desc: ev.target.value })}
                  placeholder="Tell travellers what makes you special, or let AI write it from the details above."
                  rows={4}
                  style={{
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    border: '1px solid var(--color-border-input)',
                    borderRadius: '10px',
                    font: 'inherit',
                    fontSize: '14px',
                    lineHeight: 1.55,
                    color: 'var(--color-text-main)',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                ></textarea>
                <label
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    Offer for eSIMLive travellers
                  </span>
                  <input
                    value={st.r.offer}
                    onChange={(ev) => upd('r', { offer: ev.target.value })}
                    style={{
                      height: '44px',
                      boxSizing: 'border-box',
                      padding: '0 14px',
                      border: '1px solid var(--color-border-input)',
                      borderRadius: '10px',
                      font: 'inherit',
                      fontSize: '14px',
                      color: 'var(--color-text-main)',
                      background: 'var(--color-bg-card)',
                      outline: 'none',
                    }}
                  />
                </label>
              </section>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  onClick={() => toast('Draft saved')}
                  style={{
                    height: '46px',
                    padding: '0 22px',
                    border: '1px solid var(--color-border-input)',
                    borderRadius: '999px',
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-text-main)',
                    font: 'inherit',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Save draft
                </button>
                <button
                  onClick={() => {
                    publish('r');
                    toast(st.r.name + ' is live in the app');
                    go('listings');
                  }}
                  style={{
                    height: '46px',
                    padding: '0 24px',
                    border: 0,
                    borderRadius: '999px',
                    background: 'var(--color-primary)',
                    color: 'var(--color-primary-darker)',
                    font: 'inherit',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <i className="ph ph-rocket-launch"></i>Publish to app
                </button>
              </div>
            </>
          )}

          {/* VIEW: EVENT */}
          {page === 'event' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '13px',
                  }}
                >
                  Listings / New
                </span>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '30px',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Add an event
                </h1>
              </div>

              <section
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 600,
                    fontSize: '16px',
                  }}
                >
                  <i
                    className="ph ph-calendar-star"
                    style={{
                      fontSize: '20px',
                      color: 'var(--color-accent-event)',
                    }}
                  ></i>
                  Event details
                </div>
                <label
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    Event title
                  </span>
                  <input
                    value={st.e.title}
                    onChange={(ev) => upd('e', { title: ev.target.value })}
                    style={{
                      height: '44px',
                      boxSizing: 'border-box',
                      padding: '0 14px',
                      border: '1px solid var(--color-border-input)',
                      borderRadius: '10px',
                      font: 'inherit',
                      fontSize: '14px',
                      color: 'var(--color-text-main)',
                      background: 'var(--color-bg-card)',
                      outline: 'none',
                    }}
                  />
                </label>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Type</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { label: 'Music', icon: 'ph-music-notes' },
                      { label: 'Food', icon: 'ph-bowl-food' },
                      { label: 'Culture', icon: 'ph-mask-happy' },
                      { label: 'Market', icon: 'ph-storefront' },
                      { label: 'Sport', icon: 'ph-soccer-ball' },
                    ].map((c) => (
                      <button
                        key={c.label}
                        onClick={() => upd('e', { type: c.label })}
                        style={chipS(st.e.type === c.label)}
                      >
                        <i className={`ph ${c.icon}`}></i>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: '16px',
                  }}
                >
                  <label
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Date</span>
                    <input
                      type="date"
                      value={st.e.date}
                      onChange={(ev) => upd('e', { date: ev.target.value })}
                      style={{
                        height: '44px',
                        boxSizing: 'border-box',
                        padding: '0 14px',
                        border: '1px solid var(--color-border-input)',
                        borderRadius: '10px',
                        font: 'inherit',
                        fontSize: '14px',
                        color: 'var(--color-text-main)',
                        background: 'var(--color-bg-card)',
                        outline: 'none',
                      }}
                    />
                  </label>
                  <label
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Starts</span>
                    <input
                      type="time"
                      value={st.e.time}
                      onChange={(ev) => upd('e', { time: ev.target.value })}
                      style={{
                        height: '44px',
                        boxSizing: 'border-box',
                        padding: '0 14px',
                        border: '1px solid var(--color-border-input)',
                        borderRadius: '10px',
                        font: 'inherit',
                        fontSize: '14px',
                        color: 'var(--color-text-main)',
                        background: 'var(--color-bg-card)',
                        outline: 'none',
                      }}
                    />
                  </label>
                  <label
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Ticket price
                    </span>
                    <input
                      value={st.e.price}
                      onChange={(ev) => upd('e', { price: ev.target.value })}
                      style={{
                        height: '44px',
                        boxSizing: 'border-box',
                        padding: '0 14px',
                        border: '1px solid var(--color-border-input)',
                        borderRadius: '10px',
                        font: 'inherit',
                        fontSize: '14px',
                        color: 'var(--color-text-main)',
                        background: 'var(--color-bg-card)',
                        outline: 'none',
                      }}
                    />
                  </label>
                </div>
              </section>

              <section
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 600,
                    fontSize: '16px',
                  }}
                >
                  <i
                    className="ph ph-map-pin"
                    style={{
                      fontSize: '20px',
                      color: 'var(--color-primary-brand)',
                    }}
                  ></i>
                  Venue
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <input
                    value={st.e.venue}
                    onChange={(ev) => upd('e', { venue: ev.target.value })}
                    style={{
                      flex: '1 1 240px',
                      minWidth: 0,
                      height: '44px',
                      boxSizing: 'border-box',
                      padding: '0 14px',
                      border: '1px solid var(--color-border-input)',
                      borderRadius: '10px',
                      font: 'inherit',
                      fontSize: '14px',
                      color: 'var(--color-text-main)',
                      background: 'var(--color-bg-card)',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => find('e')}
                    style={{
                      height: '44px',
                      padding: '0 18px',
                      border: 0,
                      borderRadius: '999px',
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)',
                      font: 'inherit',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <i className="ph ph-magnifying-glass"></i>Find venue
                  </button>
                  <button
                    onClick={() => locate('e')}
                    style={{
                      height: '44px',
                      padding: '0 18px',
                      border: 0,
                      borderRadius: '999px',
                      background: 'var(--color-primary)',
                      color: 'var(--color-primary-darker)',
                      font: 'inherit',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <i className="ph ph-crosshair"></i>I&apos;m at the venue
                  </button>
                </div>
                <div
                  style={{
                    position: 'relative',
                    height: '240px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'var(--color-bg-muted)',
                  }}
                >
                  <iframe
                    src={mapUrl(st.e)}
                    title="Map"
                    style={{ width: '100%', height: '100%', border: 0 }}
                  ></iframe>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      bottom: '12px',
                      background: 'var(--color-bg-card)',
                      borderRadius: '999px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      boxShadow: '0 2px 8px rgba(16,34,46,.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <i
                      className="ph-fill ph-map-pin"
                      style={{ color: 'var(--color-pin-red)' }}
                    ></i>
                    {coord(st.e)}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Notify travellers within
                    </span>
                    <span
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '13px',
                      }}
                    >
                      One push to eSIMLive users nearby on the day
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      gap: '4px',
                      padding: '4px',
                      background: 'var(--color-bg-muted)',
                      borderRadius: '10px',
                    }}
                  >
                    {['1 km', '5 km', '20 km', 'Whole city'].map((c) => (
                      <button
                        key={c}
                        onClick={() => upd('e', { radius: c })}
                        style={segS(st.e.radius === c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontWeight: 600,
                      fontSize: '16px',
                    }}
                  >
                    <i
                      className="ph ph-text-align-left"
                      style={{
                        fontSize: '20px',
                        color: 'var(--color-primary-brand)',
                      }}
                    ></i>
                    Description
                  </div>
                  <button
                    onClick={() => writeDesc('e')}
                    style={{
                      height: '38px',
                      padding: '0 16px',
                      border: 0,
                      borderRadius: '999px',
                      background: 'var(--color-dark-bg)',
                      color: '#fff',
                      font: 'inherit',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <i
                      className="ph ph-sparkle"
                      style={{ color: 'var(--color-primary-accent)' }}
                    ></i>
                    {busy === 'e' ? 'Writing…' : 'Write with AI'}
                  </button>
                </div>
                <textarea
                  value={st.e.desc}
                  onChange={(ev) => upd('e', { desc: ev.target.value })}
                  placeholder="What should visitors expect? Or let AI write it from the details above."
                  rows={4}
                  style={{
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    border: '1px solid var(--color-border-input)',
                    borderRadius: '10px',
                    font: 'inherit',
                    fontSize: '14px',
                    lineHeight: 1.55,
                    color: 'var(--color-text-main)',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                ></textarea>
              </section>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  onClick={() => toast('Draft saved')}
                  style={{
                    height: '46px',
                    padding: '0 22px',
                    border: '1px solid var(--color-border-input)',
                    borderRadius: '999px',
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-text-main)',
                    font: 'inherit',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Save draft
                </button>
                <button
                  onClick={() => {
                    publish('e');
                    toast('Event scheduled — push goes out on the day');
                    go('listings');
                  }}
                  style={{
                    height: '46px',
                    padding: '0 24px',
                    border: 0,
                    borderRadius: '999px',
                    background: 'var(--color-primary)',
                    color: 'var(--color-primary-darker)',
                    font: 'inherit',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <i className="ph ph-rocket-launch"></i>Publish event
                </button>
              </div>
            </>
          )}

          {/* VIEW: TOUR */}
          {page === 'tour' && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '13px',
                    }}
                  >
                    Listings / New
                  </span>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '30px',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Add a tour or experience
                  </h1>
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-alert-red)',
                    background: 'var(--color-alert-bg)',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ● Draft
                </span>
              </div>

              <section
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 600,
                    fontSize: '16px',
                  }}
                >
                  <i
                    className="ph ph-compass"
                    style={{ fontSize: '20px', color: 'var(--color-accent-tour)' }}
                  ></i>
                  Tour details
                </div>
                <label
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    Tour name
                  </span>
                  <input
                    value={st.t.name}
                    onChange={(ev) => upd('t', { name: ev.target.value })}
                    style={{
                      height: '44px',
                      boxSizing: 'border-box',
                      padding: '0 14px',
                      border: '1px solid var(--color-border-input)',
                      borderRadius: '10px',
                      font: 'inherit',
                      fontSize: '14px',
                      color: 'var(--color-text-main)',
                      background: 'var(--color-bg-card)',
                      outline: 'none',
                    }}
                  />
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    alignItems: 'flex-end',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      flex: '1 1 280px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Duration
                    </span>
                    <div
                      style={{
                        display: 'inline-flex',
                        gap: '4px',
                        padding: '4px',
                        background: 'var(--color-bg-muted)',
                        borderRadius: '10px',
                        alignSelf: 'flex-start',
                      }}
                    >
                      {['1 day', '2 days', '3 days', '4+ days'].map((c) => (
                        <button
                          key={c}
                          onClick={() => upd('t', { duration: c })}
                          style={segS(st.t.duration === c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      flex: '1 1 130px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Price per person
                    </span>
                    <input
                      value={st.t.price}
                      onChange={(ev) => upd('t', { price: ev.target.value })}
                      style={{
                        height: '44px',
                        boxSizing: 'border-box',
                        padding: '0 14px',
                        border: '1px solid var(--color-border-input)',
                        borderRadius: '10px',
                        font: 'inherit',
                        fontSize: '14px',
                        color: 'var(--color-text-main)',
                        background: 'var(--color-bg-card)',
                        outline: 'none',
                      }}
                    />
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      flex: '1 1 130px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Group size
                    </span>
                    <input
                      value={st.t.group}
                      onChange={(ev) => upd('t', { group: ev.target.value })}
                      style={{
                        height: '44px',
                        boxSizing: 'border-box',
                        padding: '0 14px',
                        border: '1px solid var(--color-border-input)',
                        borderRadius: '10px',
                        font: 'inherit',
                        fontSize: '14px',
                        color: 'var(--color-text-main)',
                        background: 'var(--color-bg-card)',
                        outline: 'none',
                      }}
                    />
                  </label>
                </div>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    What&apos;s included
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { label: 'Transport', icon: 'ph-van' },
                      { label: 'Camel trek', icon: 'ph-sun-horizon' },
                      { label: 'Desert camp', icon: 'ph-tent' },
                      { label: 'Breakfast & dinner', icon: 'ph-bowl-food' },
                      { label: 'Local guide', icon: 'ph-user-sound' },
                      { label: 'Sandboarding', icon: 'ph-mountains' },
                    ].map((c) => {
                      const on = st.t.included.includes(c.label);
                      return (
                        <button
                          key={c.label}
                          onClick={() => {
                            const arr = on
                              ? st.t.included.filter((x) => x !== c.label)
                              : [...st.t.included, c.label];
                            upd('t', { included: arr });
                          }}
                          style={chipS(on)}
                        >
                          <i className={`ph ${c.icon}`}></i>
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontWeight: 600,
                      fontSize: '16px',
                    }}
                  >
                    <i
                      className="ph ph-path"
                      style={{
                        fontSize: '20px',
                        color: 'var(--color-primary-brand)',
                      }}
                    ></i>
                    Route &amp; pickup
                  </div>
                  <span
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '13px',
                    }}
                  >
                    Tap stops to build the route
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <input
                    value={st.t.pickup}
                    onChange={(ev) => upd('t', { pickup: ev.target.value })}
                    style={{
                      flex: '1 1 240px',
                      minWidth: 0,
                      height: '44px',
                      boxSizing: 'border-box',
                      padding: '0 14px',
                      border: '1px solid var(--color-border-input)',
                      borderRadius: '10px',
                      font: 'inherit',
                      fontSize: '14px',
                      color: 'var(--color-text-main)',
                      background: 'var(--color-bg-card)',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => find('t')}
                    style={{
                      height: '44px',
                      padding: '0 18px',
                      border: 0,
                      borderRadius: '999px',
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)',
                      font: 'inherit',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <i className="ph ph-magnifying-glass"></i>Find pickup
                  </button>
                  <button
                    onClick={() => locate('t')}
                    style={{
                      height: '44px',
                      padding: '0 18px',
                      border: 0,
                      borderRadius: '999px',
                      background: 'var(--color-primary)',
                      color: 'var(--color-primary-darker)',
                      font: 'inherit',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <i className="ph ph-crosshair"></i>Use my location
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {STOPS.map((c) => {
                    const on = st.t.stops.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => {
                          let arr = on
                            ? st.t.stops.filter((x) => x !== c)
                            : [...st.t.stops, c];
                          arr = STOPS.filter((x) => arr.includes(x));
                          upd('t', { stops: arr });
                        }}
                        style={chipS(on)}
                      >
                        <i className="ph ph-map-pin"></i>
                        {c}
                      </button>
                    );
                  })}
                </div>
                <div
                  style={{
                    position: 'relative',
                    height: '230px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'var(--color-bg-muted)',
                  }}
                >
                  <iframe
                    src={mapUrl(st.t)}
                    title="Map"
                    style={{ width: '100%', height: '100%', border: 0 }}
                  ></iframe>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      bottom: '12px',
                      background: 'var(--color-bg-card)',
                      borderRadius: '999px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      boxShadow: '0 2px 8px rgba(16,34,46,.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <i
                      className="ph-fill ph-map-pin"
                      style={{ color: 'var(--color-pin-red)' }}
                    ></i>
                    Pickup · {coord(st.t)}
                  </span>
                </div>
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i
                    className="ph ph-info"
                    style={{ color: 'var(--color-primary-brand)' }}
                  ></i>
                  {st.t.note}
                </span>
              </section>

              <section
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontWeight: 600,
                      fontSize: '16px',
                    }}
                  >
                    <i
                      className="ph ph-text-align-left"
                      style={{
                        fontSize: '20px',
                        color: 'var(--color-primary-brand)',
                      }}
                    ></i>
                    Description
                  </div>
                  <button
                    onClick={() => writeDesc('t')}
                    style={{
                      height: '38px',
                      padding: '0 16px',
                      border: 0,
                      borderRadius: '999px',
                      background: 'var(--color-dark-bg)',
                      color: '#fff',
                      font: 'inherit',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <i
                      className="ph ph-sparkle"
                      style={{ color: 'var(--color-primary-accent)' }}
                    ></i>
                    {busy === 't' ? 'Writing…' : 'Write with AI'}
                  </button>
                </div>
                <textarea
                  value={st.t.desc}
                  onChange={(ev) => upd('t', { desc: ev.target.value })}
                  placeholder="Describe the journey day by day, or let AI write it from the route above."
                  rows={4}
                  style={{
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    border: '1px solid var(--color-border-input)',
                    borderRadius: '10px',
                    font: 'inherit',
                    fontSize: '14px',
                    lineHeight: 1.55,
                    color: 'var(--color-text-main)',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                ></textarea>
              </section>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  onClick={() => toast('Draft saved')}
                  style={{
                    height: '46px',
                    padding: '0 22px',
                    border: '1px solid var(--color-border-input)',
                    borderRadius: '999px',
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-text-main)',
                    font: 'inherit',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Save draft
                </button>
                <button
                  onClick={() => {
                    publish('t');
                    toast('Tour is live in the app');
                    go('listings');
                  }}
                  style={{
                    height: '46px',
                    padding: '0 24px',
                    border: 0,
                    borderRadius: '999px',
                    background: 'var(--color-primary)',
                    color: 'var(--color-primary-darker)',
                    font: 'inherit',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <i className="ph ph-rocket-launch"></i>Publish tour
                </button>
              </div>
            </>
          )}

          {/* VIEW: STUDIO */}
          {page === 'studio' && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '24px',
                alignItems: 'flex-start',
              }}
            >
              <section
                style={{
                  flex: '1 1 320px',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  borderRadius: '20px',
                  padding: '28px',
                  color: '#fff',
                  background:
                    'radial-gradient(circle at 85% 0%, rgba(23,201,154,.3), transparent 45%), var(--color-dark-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'var(--color-primary)',
                      color: 'var(--color-primary-darker)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className="ph-fill ph-sparkle" style={{ fontSize: '22px' }}></i>
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontSize: '20px', fontWeight: 700 }}>
                      AI listing studio
                    </span>
                    <span
                      style={{
                        color: 'var(--color-dark-text-muted)',
                        fontSize: '13px',
                      }}
                    >
                      Describe your business in one line
                    </span>
                  </div>
                </div>

                <textarea
                  value={st.s.prompt}
                  onChange={(ev) => upd('s', { prompt: ev.target.value })}
                  rows={4}
                  style={{
                    boxSizing: 'border-box',
                    padding: '14px 16px',
                    border: '1px solid rgba(255,255,255,.16)',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,.06)',
                    font: 'inherit',
                    fontSize: '15px',
                    lineHeight: 1.55,
                    color: '#fff',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                ></textarea>

                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    Languages for travellers
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {LANGS.map((c) => {
                      const on = st.s.langs.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() => {
                            let arr = on
                              ? st.s.langs.filter((x) => x !== c)
                              : [...st.s.langs, c];
                            arr = LANGS.filter((x) => arr.includes(x));
                            upd('s', { langs: arr });
                          }}
                          style={chipS(on, true)}
                        >
                          {on && <i className="ph ph-check"></i>}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Tone</span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '4px',
                      padding: '4px',
                      background: 'rgba(255,255,255,.07)',
                      borderRadius: '12px',
                    }}
                  >
                    {['Friendly', 'Premium', 'Family'].map((c) => (
                      <button
                        key={c}
                        onClick={() => upd('s', { tone: c })}
                        style={segS(st.s.tone === c, true)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generate}
                  style={{
                    height: '52px',
                    border: 0,
                    borderRadius: '999px',
                    background: 'var(--color-primary)',
                    color: 'var(--color-primary-darker)',
                    font: 'inherit',
                    fontWeight: 600,
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                  }}
                >
                  <i className="ph ph-magic-wand" style={{ fontSize: '18px' }}></i>
                  {busy === 'studio' ? 'Generating…' : 'Generate listing'}
                </button>
                <span
                  style={{
                    color: 'var(--color-dark-text-dim)',
                    fontSize: '12px',
                  }}
                >
                  You review everything before it goes live in the app.
                </span>
              </section>

              <section
                style={{
                  flex: '1.2 1 340px',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '13px',
                  }}
                >
                  Generated listing
                </span>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <input
                      value={st.s.title}
                      onChange={(ev) => upd('s', { title: ev.target.value })}
                      style={{
                        font: 'inherit',
                        fontSize: '28px',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        border: 0,
                        background: 'transparent',
                        padding: 0,
                        color: 'var(--color-text-main)',
                        outline: 'none',
                        minWidth: 0,
                      }}
                    />
                    <input
                      value={st.s.tagline}
                      onChange={(ev) => upd('s', { tagline: ev.target.value })}
                      style={{
                        font: 'inherit',
                        fontSize: '15px',
                        border: 0,
                        background: 'transparent',
                        padding: 0,
                        color: 'var(--color-text-sub)',
                        outline: 'none',
                        minWidth: 0,
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      upd('r', { desc: s.texts.English || s.texts[view] || '' });
                      toast('Copied into your restaurant listing');
                      go('restaurant');
                    }}
                    style={{
                      height: '44px',
                      padding: '0 20px',
                      border: 0,
                      borderRadius: '999px',
                      background: 'var(--color-primary)',
                      color: 'var(--color-primary-darker)',
                      font: 'inherit',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <i className="ph ph-arrow-bend-down-right"></i>Use in listing
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {st.s.tags.map((tg) => (
                    <span
                      key={tg}
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--color-primary-dark)',
                        background: 'var(--color-primary-light)',
                        padding: '6px 12px',
                        borderRadius: '999px',
                      }}
                    >
                      # {tg}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '14px',
                  }}
                >
                  {sTexts.map((x) => (
                    <div
                      key={x.lang}
                      style={{
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '14px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--color-primary-accent)',
                            background: 'var(--color-dark-bg)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                          }}
                        >
                          {x.lang}
                        </span>
                        <button
                          onClick={x.onCopy}
                          title="Copy"
                          style={{
                            border: 0,
                            background: 'transparent',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '4px',
                          }}
                        >
                          <i className="ph ph-copy"></i>
                        </button>
                      </div>
                      <p
                        dir={x.dir}
                        style={{
                          margin: 0,
                          lineHeight: 1.6,
                          color: 'var(--color-text-darker)',
                          fontSize: '14px',
                          textWrap: 'pretty',
                        }}
                      >
                        {x.text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* VIEW: PROMO */}
          {page === 'promo' && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '13px',
                    }}
                  >
                    Promotions / New
                  </span>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '30px',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    New promotion
                  </h1>
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-primary-dark)',
                    background: 'var(--color-primary-light)',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="ph-fill ph-lightning"></i>Instant
                </span>
              </div>

              <section
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    Business type
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { label: 'Restaurant', icon: 'ph-fork-knife' },
                      { label: 'Event', icon: 'ph-calendar-star' },
                      { label: 'Tour', icon: 'ph-compass' },
                      { label: 'Spa', icon: 'ph-flower-lotus' },
                      { label: 'Handicraft', icon: 'ph-hand-heart' },
                    ].map((c) => (
                      <button
                        key={c.label}
                        onClick={() => upd('p', { type: c.label })}
                        style={chipS(st.p.type === c.label)}
                      >
                        <i className={`ph ${c.icon}`}></i>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Offer</span>
                  <input
                    value={st.p.offer}
                    onChange={(ev) => upd('p', { offer: ev.target.value })}
                    style={{
                      height: '52px',
                      boxSizing: 'border-box',
                      padding: '0 16px',
                      border: '1.5px solid var(--color-primary)',
                      borderRadius: '12px',
                      font: 'inherit',
                      fontSize: '17px',
                      color: 'var(--color-text-main)',
                      background: 'var(--color-bg-card)',
                      outline: 'none',
                      boxShadow: '0 0 0 4px rgba(23,201,154,.12)',
                    }}
                  />
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    alignItems: 'end',
                  }}
                >
                  <label
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Promo code
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        height: '48px',
                        boxSizing: 'border-box',
                        padding: '0 14px',
                        border: '1.5px dashed var(--color-border-dashed)',
                        borderRadius: '12px',
                        background: 'var(--color-primary-surface)',
                      }}
                    >
                      <i
                        className="ph ph-ticket"
                        style={{
                          color: 'var(--color-primary-active)',
                          fontSize: '18px',
                        }}
                      ></i>
                      <input
                        value={st.p.code}
                        onChange={(ev) => upd('p', { code: ev.target.value })}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          border: 0,
                          background: 'transparent',
                          font: 'inherit',
                          fontSize: '17px',
                          fontWeight: 700,
                          color: 'var(--color-primary-dark)',
                          outline: 'none',
                          letterSpacing: '.02em',
                        }}
                      />
                    </span>
                  </label>

                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Valid for
                    </span>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '4px',
                        padding: '4px',
                        background: 'var(--color-bg-muted)',
                        borderRadius: '10px',
                      }}
                    >
                      {['6 hrs', '12 hrs', '24 hrs'].map((c) => (
                        <button
                          key={c}
                          onClick={() => upd('p', { valid: c })}
                          style={segS(st.p.valid === c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Send to travellers within
                    </span>
                    <span
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '13px',
                      }}
                    >
                      From {st.join.business}, {st.join.city}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      gap: '4px',
                      padding: '4px',
                      background: 'var(--color-bg-muted)',
                      borderRadius: '10px',
                    }}
                  >
                    {['1 km', '5 km', 'City'].map((c) => (
                      <button
                        key={c}
                        onClick={() => upd('p', { radius: c })}
                        style={segS(st.p.radius === c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <div
                style={{
                  background: 'var(--color-dark-bg)',
                  color: '#fff',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <i
                  className="ph ph-timer"
                  style={{
                    fontSize: '30px',
                    color: 'var(--color-primary-accent)',
                  }}
                ></i>
                <div
                  style={{
                    flex: '1 1 220px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>
                    {sentLive
                      ? `Live now · ends at ${until}`
                      : `Goes live instantly · runs ${p.valid}`}
                  </span>
                  <span
                    style={{
                      color: 'var(--color-dark-text-muted)',
                      fontSize: '13px',
                    }}
                  >
                    Expires automatically, no follow-up needed
                  </span>
                </div>
                <button
                  onClick={() => {
                    setState((s2) => ({
                      ...s2,
                      anim: false,
                      p: { ...s2.p, sentAt: Date.now() },
                    }));
                    publish('p');
                    setTimeout(() => setState((s2) => ({ ...s2, anim: true })), 60);
                    toast('Sent to eSIMLive travellers ' + radiusTxt(p.radius));
                  }}
                  style={{
                    height: '48px',
                    padding: '0 26px',
                    border: 0,
                    borderRadius: '999px',
                    background: 'var(--color-primary)',
                    color: 'var(--color-primary-darker)',
                    font: 'inherit',
                    fontWeight: 600,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <i className="ph-fill ph-paper-plane-tilt"></i>
                  {sentLive ? 'Send again' : 'Send now'}
                </button>
              </div>
            </>
          )}

          {/* VIEW: INSIGHTS */}
          {page === 'insights' && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '13px',
                    }}
                  >
                    {rangeLabel}
                  </span>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '30px',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Insights
                  </h1>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    gap: '4px',
                    padding: '4px',
                    background: 'var(--color-bg-muted)',
                    borderRadius: '10px',
                  }}
                >
                  {(['Week', 'Month', 'Year'] as const).map((pr) => (
                    <button
                      key={pr}
                      onClick={() => upd('ins', { period: pr })}
                      style={segS(I.period === pr)}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '12px',
                }}
              >
                {kpis.map((k) => (
                  <button
                    key={k.label}
                    onClick={k.onClick}
                    style={k.style}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--color-text-muted)',
                        minWidth: 0,
                      }}
                    >
                      <i
                        className={`ph ${k.icon}`}
                        style={{
                          fontSize: '17px',
                          color: 'var(--color-primary-brand)',
                          flexShrink: 0,
                        }}
                      ></i>
                      <span
                        style={{
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {k.label}
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: '26px',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        color: 'var(--color-text-main)',
                      }}
                    >
                      {k.value}
                    </span>
                    <span style={k.deltaStyle}>{k.delta}</span>
                  </button>
                ))}
              </div>

              <section
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '16px' }}>
                      {I.metric} · this {P.unit} vs last {P.unit}
                    </span>
                    <span
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '13px',
                      }}
                    >
                      Busiest: {P.labels[best]} with {fmt(chartSeries.cur[best])}{' '}
                      {I.metric.toLowerCase()}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '3px',
                          background: 'var(--color-primary)',
                        }}
                      ></span>
                      This {P.unit}
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '3px',
                          background: '#c9d6dc',
                        }}
                      ></span>
                      Last {P.unit}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '6px',
                    height: '220px',
                    paddingTop: '8px',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  {bars.map((b, i) => (
                    <div
                      key={i}
                      title={b.tip}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        gap: '3px',
                      }}
                    >
                      <span style={b.prevStyle}></span>
                      <span style={b.curStyle}></span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '-10px' }}>
                  {bars.map((b, i) => (
                    <span
                      key={i}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        textAlign: 'center',
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                        overflow: 'hidden',
                      }}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </section>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '20px',
                  alignItems: 'stretch',
                }}
              >
                <section
                  style={{
                    flex: '1 1 300px',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    borderRadius: '16px',
                    padding: '24px',
                    color: '#fff',
                    background:
                      'radial-gradient(circle at 90% 0%, rgba(23,201,154,.3), transparent 45%), var(--color-dark-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: 600,
                        fontSize: '16px',
                      }}
                    >
                      <span
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          background: 'var(--color-primary)',
                          color: 'var(--color-primary-darker)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <i
                          className="ph-fill ph-sparkle"
                          style={{ fontSize: '17px' }}
                        ></i>
                      </span>
                      AI recommendation
                    </span>
                    <button
                      onClick={() => refreshRec(gap, kpis)}
                      title="Ask AI again"
                      style={{
                        height: '32px',
                        padding: '0 12px',
                        border: '1px solid rgba(255,255,255,.22)',
                        borderRadius: '999px',
                        background: 'transparent',
                        color: '#fff',
                        font: 'inherit',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <i className="ph ph-arrows-clockwise"></i>
                      {busy === 'ins' ? 'Thinking…' : 'Ask again'}
                    </button>
                  </div>
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      lineHeight: 1.4,
                      textWrap: 'pretty',
                    }}
                  >
                    {rec.title}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: 'var(--color-dark-text-muted)',
                      textWrap: 'pretty',
                    }}
                  >
                    {rec.body}
                  </span>
                  <div style={{ flex: 1 }}></div>
                  <div>
                    <button
                      onClick={() => {
                        upd('p', {
                          offer: '15% off Monday to Thursday',
                          code: 'WEEKDAY15',
                          valid: '24 hrs',
                          radius: '5 km',
                          sentAt: 0,
                        });
                        go('promo');
                        toast('Weekday promotion drafted from your insights');
                      }}
                      style={{
                        height: '44px',
                        padding: '0 20px',
                        border: 0,
                        borderRadius: '999px',
                        background: 'var(--color-primary)',
                        color: 'var(--color-primary-darker)',
                        font: 'inherit',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <i className="ph-fill ph-lightning"></i>Create weekday
                      promotion
                    </button>
                  </div>
                </section>

                <section
                  style={{
                    flex: '1 1 300px',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: 600,
                        fontSize: '16px',
                      }}
                    >
                      <i
                        className="ph-fill ph-heart"
                        style={{
                          fontSize: '19px',
                          color: 'var(--color-accent-event)',
                        }}
                      ></i>
                      What people liked
                    </span>
                    <span
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '13px',
                      }}
                    >
                      From {fmt(reviewsTotal)} reviews this {P.unit}. Star items to
                      feature them on your app card.
                    </span>
                  </div>
                  {liked.map((l) => (
                    <div
                      key={l.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <button
                        onClick={l.onToggle}
                        title="Feature on app card"
                        style={l.starStyle}
                      >
                        <i className={l.starIcon} style={{ fontSize: '16px' }}></i>
                      </button>
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '8px',
                            fontSize: '14px',
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{l.label}</span>
                          <span
                            style={{
                              color: 'var(--color-text-muted)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {l.count} likes
                          </span>
                        </div>
                        <div
                          style={{
                            height: '6px',
                            borderRadius: '6px',
                            background: 'var(--color-bg-muted)',
                            overflow: 'hidden',
                          }}
                        >
                          <div style={l.barStyle}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            </>
          )}
        </main>

        {/* 3. Right Sticky Smartphone Preview (310x640px matching eSIMLive Partners.dc.html) */}
        <aside
          className="w-full max-w-[320px] mx-auto flex flex-col items-center gap-3.5 lg:sticky lg:top-24 shrink-0 mt-4 lg:mt-0"
          style={{
            flex: '0 0 auto',
            maxWidth: '100%',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '.12em',
              color: 'var(--color-text-muted)',
            }}
            className="self-center lg:self-start text-center lg:text-left"
          >
            {labels[page]}
          </span>
          <div
            style={{
              width: '100%',
              maxWidth: '310px',
              height: '640px',
              boxSizing: 'border-box',
              padding: '10px',
              borderRadius: '50px',
              background: 'var(--color-dark-surface)',
              boxShadow:
                '0 40px 70px -30px rgba(11,22,32,.55), inset 0 0 0 2px var(--color-dark-border)',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '40px',
                overflow: 'hidden',
                background: 'var(--color-bg-card)',
              }}
            >
              {/* Dynamic Island Notch */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '96px',
                  height: '28px',
                  borderRadius: '20px',
                  background: 'var(--color-dark-surface)',
                  zIndex: 5,
                }}
              ></div>

              {/* White App Screen */}
              {!phoneLock && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    overflowY: 'auto',
                    padding: '14px 16px 22px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 10px',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <span>{hm(now)}</span>
                    <span
                      style={{
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center',
                      }}
                    >
                      <i
                        className="ph-fill ph-cell-signal-full"
                        style={{ fontSize: '13px' }}
                      ></i>
                      <i
                        className="ph-fill ph-battery-full"
                        style={{ fontSize: '16px' }}
                      ></i>
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '.1em',
                      color: 'var(--color-primary-brand)',
                      marginTop: '4px',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1px',
                      }}
                    >
                      <span style={{ display: 'flex', gap: '1px' }}>
                        <span
                          style={{
                            width: '3px',
                            height: '3px',
                            borderRadius: '50%',
                            background: 'var(--color-indigo)',
                          }}
                        ></span>
                        <span
                          style={{
                            width: '6px',
                            height: '3px',
                            borderRadius: '2px',
                            background: 'var(--color-primary)',
                          }}
                        ></span>
                      </span>
                      <span style={{ display: 'flex', gap: '1px' }}>
                        <span
                          style={{
                            width: '6px',
                            height: '3px',
                            borderRadius: '2px',
                            background: 'var(--color-blue)',
                          }}
                        ></span>
                        <span
                          style={{
                            width: '3px',
                            height: '3px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                          }}
                        ></span>
                      </span>
                      <span style={{ display: 'flex', gap: '1px' }}>
                        <span
                          style={{
                            width: '3px',
                            height: '3px',
                            borderRadius: '50%',
                            background: 'var(--color-indigo)',
                          }}
                        ></span>
                        <span
                          style={{
                            width: '6px',
                            height: '3px',
                            borderRadius: '2px',
                            background: 'var(--color-primary)',
                          }}
                        ></span>
                      </span>
                    </span>
                    {page === 'tour'
                      ? 'ESIMLIVE · EXPERIENCES'
                      : 'ESIMLIVE · NEAR YOU'}
                  </div>

                  {/* Phone preview on JOIN */}
                  {page === 'join' && (
                    <>
                      <div
                        style={{
                          position: 'relative',
                          height: '150px',
                          borderRadius: '16px',
                          background: `linear-gradient(135deg, ${cat.color}, var(--color-dark-bg))`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: 'rgba(11,22,32,.75)',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '4px 8px',
                            borderRadius: '999px',
                          }}
                        >
                          New on eSIMLive
                        </span>
                        <i
                          className={`ph ${cat.icon}`}
                          style={{ fontSize: '52px', color: '#fff' }}
                        ></i>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '19px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {st.join.business}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {cat.label} · {st.join.city}, {st.join.country}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-text-muted)',
                          lineHeight: 1.5,
                        }}
                      >
                        Finish sign-up to pin your location and write your
                        listing. Travellers nearby will see this card.
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span
                          style={{
                            flex: 1,
                            height: '38px',
                            borderRadius: '999px',
                            background: 'var(--color-primary)',
                            color: 'var(--color-primary-darker)',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className="ph-fill ph-navigation-arrow"></i>
                          Directions
                        </span>
                        <span
                          style={{
                            flex: 1,
                            height: '38px',
                            borderRadius: '999px',
                            background: 'var(--color-bg-muted)',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className="ph-fill ph-whatsapp-logo"></i>WhatsApp
                        </span>
                      </div>
                    </>
                  )}

                  {/* Phone preview on LISTINGS */}
                  {page === 'listings' && (
                    <>
                      <span
                        style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Around you in {st.join.city}
                      </span>
                      {feed.length === 0 ? (
                        <div
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            color: 'var(--color-text-muted)',
                            textAlign: 'center',
                            fontSize: '12px',
                            padding: '20px',
                          }}
                        >
                          <i
                            className="ph ph-map-trifold"
                            style={{ fontSize: '40px', color: '#b4c4c9' }}
                          ></i>
                          Your published listings show up here, just as
                          travellers see them.
                        </div>
                      ) : (
                        feed.map((f) => (
                          <div
                            key={f.id}
                            style={{
                              display: 'flex',
                              gap: '10px',
                              alignItems: 'center',
                              padding: '10px',
                              borderRadius: '14px',
                              background: 'var(--color-bg-page)',
                            }}
                          >
                            <span style={f.tile}>
                              <i
                                className={`ph ${f.icon}`}
                                style={{ fontSize: '18px' }}
                              ></i>
                            </span>
                            <div
                              style={{
                                flex: 1,
                                minWidth: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {f.title}
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--color-text-muted)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {f.sub}
                              </span>
                            </div>
                            <i
                              className="ph ph-caret-right"
                              style={{ color: 'var(--color-text-dim)' }}
                            ></i>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* Phone preview on RESTAURANT */}
                  {page === 'restaurant' && (
                    <>
                      <div
                        style={{
                          position: 'relative',
                          height: '140px',
                          borderRadius: '16px',
                          background:
                            'linear-gradient(135deg, var(--color-primary), var(--color-cyan))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: 'rgba(11,22,32,.8)',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '4px 8px',
                            borderRadius: '999px',
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'center',
                          }}
                        >
                          <i className="ph-fill ph-navigation-arrow"></i>0.4 km
                        </span>
                        <i
                          className="ph ph-bowl-steam"
                          style={{ fontSize: '54px', color: '#fff' }}
                        ></i>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '19px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {st.r.name}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {st.r.cuisine} · {st.r.price} · Open {st.r.hours}
                        </span>
                      </div>
                      {st.r.offer && (
                        <span
                          style={{
                            alignSelf: 'flex-start',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--color-primary-dark)',
                            background: 'var(--color-primary-light)',
                            padding: '5px 10px',
                            borderRadius: '999px',
                            display: 'flex',
                            gap: '5px',
                            alignItems: 'center',
                          }}
                        >
                          <i className="ph-fill ph-tag"></i>
                          {st.r.offer}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-text-sub)',
                          lineHeight: 1.55,
                        }}
                      >
                        {st.r.desc ||
                          'Your description appears here. Tap Write with AI to create one from your details.'}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span
                          style={{
                            flex: 1,
                            height: '38px',
                            borderRadius: '999px',
                            background: 'var(--color-primary)',
                            color: 'var(--color-primary-darker)',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className="ph-fill ph-navigation-arrow"></i>
                          Directions
                        </span>
                        <span
                          style={{
                            flex: 1,
                            height: '38px',
                            borderRadius: '999px',
                            background: 'var(--color-bg-muted)',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className="ph-fill ph-phone"></i>Call
                        </span>
                      </div>
                    </>
                  )}

                  {/* Phone preview on TOUR */}
                  {page === 'tour' && (
                    <>
                      <div
                        style={{
                          position: 'relative',
                          height: '130px',
                          borderRadius: '16px',
                          background:
                            'linear-gradient(160deg, #f6a54a, var(--color-accent-tour) 60%, #b84d06)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'flex-end',
                          padding: '12px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: '18px',
                            left: '18px',
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: '#ffe9b8',
                          }}
                        ></span>
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '10px',
                            background: 'rgba(11,22,32,.8)',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '4px 8px',
                            borderRadius: '999px',
                          }}
                        >
                          ● {st.t.duration}
                        </span>
                        <i
                          className="ph ph-sun-horizon"
                          style={{ fontSize: '44px', color: '#fff' }}
                        ></i>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '17px',
                            fontWeight: 700,
                            lineHeight: 1.25,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {st.t.name}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {st.t.duration} · {st.t.group} · from {pickupCity}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '7px',
                        }}
                      >
                        {routeArray.map((rt, i) => (
                          <span
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12px',
                            }}
                          >
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                border: '2px solid var(--color-accent-tour)',
                              }}
                            ></span>
                            {rt}
                          </span>
                        ))}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '5px',
                        }}
                      >
                        {st.t.included.map((inc) => (
                          <span
                            key={inc}
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: 'var(--color-accent-tour-dark)',
                              background: 'var(--color-accent-tour-light)',
                              padding: '4px 8px',
                              borderRadius: '999px',
                            }}
                          >
                            {inc}
                          </span>
                        ))}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            From
                          </span>
                          <span style={{ fontSize: '17px', fontWeight: 700 }}>
                            {st.t.price}
                          </span>
                        </div>
                        <span
                          style={{
                            height: '38px',
                            padding: '0 16px',
                            borderRadius: '999px',
                            background: 'var(--color-primary)',
                            color: 'var(--color-primary-darker)',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          Book tour <i className="ph ph-arrow-right"></i>
                        </span>
                      </div>
                    </>
                  )}

                  {/* Phone preview on STUDIO */}
                  {page === 'studio' && (
                    <>
                      <div
                        style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}
                      >
                        {s.langs.map((l) => (
                          <button
                            key={l}
                            onClick={() => upd('s', { view: l })}
                            style={{
                              height: '26px',
                              padding: '0 10px',
                              borderRadius: '999px',
                              border: 0,
                              background:
                                l === view
                                  ? 'var(--color-dark-bg)'
                                  : 'var(--color-bg-muted)',
                              color:
                                l === view ? '#fff' : 'var(--color-text-sub)',
                              fontFamily: 'inherit',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                      <div
                        style={{
                          position: 'relative',
                          height: '120px',
                          borderRadius: '16px',
                          background:
                            'linear-gradient(135deg, var(--color-primary), var(--color-cyan))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <i
                          className="ph ph-sparkle"
                          style={{ fontSize: '46px', color: '#fff' }}
                        ></i>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '19px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {st.s.title}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {st.s.tagline}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '5px',
                        }}
                      >
                        {st.s.tags.map((tg) => (
                          <span
                            key={tg}
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: 'var(--color-primary-active)',
                              background: 'var(--color-primary-light)',
                              padding: '4px 8px',
                              borderRadius: '999px',
                            }}
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                      <p
                        dir={dirOf(view)}
                        style={{
                          margin: 0,
                          fontSize: '12px',
                          color: 'var(--color-text-sub)',
                          lineHeight: 1.6,
                        }}
                      >
                        {s.texts[view] || 'Generate to preview this language.'}
                      </p>
                    </>
                  )}

                  {/* Phone preview on INSIGHTS */}
                  {page === 'insights' && (
                    <>
                      <div
                        style={{
                          position: 'relative',
                          height: '130px',
                          borderRadius: '16px',
                          background:
                            'linear-gradient(135deg, var(--color-primary), var(--color-cyan))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: 'rgba(11,22,32,.8)',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '4px 8px',
                            borderRadius: '999px',
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'center',
                          }}
                        >
                          <i className="ph-fill ph-fire"></i>Popular this{' '}
                          {P.unit}
                        </span>
                        <i
                          className="ph ph-bowl-steam"
                          style={{ fontSize: '50px', color: '#fff' }}
                        ></i>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '19px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {st.join.business}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <i
                            className="ph-fill ph-star"
                            style={{ color: 'var(--color-star-gold)' }}
                          ></i>
                          <b style={{ color: 'var(--color-text-main)' }}>4.8</b> ·{' '}
                          {fmt(reviewsTotal)} reviews · {st.join.city}
                        </span>
                      </div>
                      <span
                        style={{
                          alignSelf: 'flex-start',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--color-primary-active)',
                          background: 'var(--color-primary-light)',
                          padding: '5px 10px',
                          borderRadius: '999px',
                          display: 'flex',
                          gap: '5px',
                          alignItems: 'center',
                        }}
                      >
                        <i className="ph-fill ph-thumbs-up"></i>
                        {fmt(recsTotal)} travellers recommend
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '.08em',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          LOVED FOR
                        </span>
                        {I.featured.length === 0 ? (
                          <span
                            style={{
                              fontSize: '12px',
                              color: 'var(--color-text-dim)',
                            }}
                          >
                            Star items in Insights to show them here.
                          </span>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '5px',
                            }}
                          >
                            {I.featured.map((fl) => (
                              <span
                                key={fl}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: 'var(--color-accent-event-dark)',
                                  background: 'var(--color-accent-event-pink-light)',
                                  padding: '5px 9px',
                                  borderRadius: '999px',
                                  display: 'flex',
                                  gap: '4px',
                                  alignItems: 'center',
                                }}
                              >
                                <i className="ph-fill ph-heart"></i>
                                {fl}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '2px',
                        }}
                      >
                        <span
                          style={{
                            flex: 1,
                            height: '38px',
                            borderRadius: '999px',
                            background: 'var(--color-primary)',
                            color: 'var(--color-primary-darker)',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className="ph-fill ph-navigation-arrow"></i>
                          Directions
                        </span>
                        <span
                          style={{
                            flex: 1,
                            height: '38px',
                            borderRadius: '999px',
                            background: 'var(--color-bg-muted)',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className="ph-fill ph-chat-circle-text"></i>Reviews
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Dark Lock Screen Mode (EVENT & PROMO) */}
              {phoneLock && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    boxSizing: 'border-box',
                    padding: '58px 12px 18px',
                    color: '#fff',
                    background:
                      'radial-gradient(circle at 90% 100%, rgba(232,115,12,.45), transparent 40%), linear-gradient(180deg, #1b5562 0%, var(--color-dark-bg) 45%, var(--color-dark-surface) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <i
                      className="ph-fill ph-lock-simple"
                      style={{ fontSize: '15px' }}
                    ></i>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>
                      {lockD(page === 'event' ? lockEvent : now)}
                    </span>
                    <span
                      style={{
                        fontSize: '68px',
                        fontWeight: 600,
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                      }}
                    >
                      {hm(page === 'event' ? lockEvent : now)}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}></div>

                  {page === 'event' && (
                    <>
                      <div
                        style={{
                          background: 'rgba(244,248,247,.94)',
                          color: 'var(--color-text-main)',
                          borderRadius: '18px',
                          padding: '12px',
                          display: 'flex',
                          gap: '10px',
                        }}
                      >
                        <span
                          style={{
                            width: '34px',
                            height: '34px',
                            flex: '0 0 34px',
                            borderRadius: '9px',
                            background: 'var(--color-bg-card)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,.1)',
                          }}
                        >
                          <i
                            className="ph-fill ph-calendar-star"
                            style={{
                              color: 'var(--color-accent-event)',
                              fontSize: '18px',
                            }}
                          ></i>
                        </span>
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                          }}
                        >
                          <span
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '9px',
                              fontWeight: 600,
                              letterSpacing: '.06em',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            <span>ESIMLIVE · HAPPENING NEARBY</span>
                            <span>now</span>
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>
                            {st.e.title}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              lineHeight: 1.4,
                              color: 'var(--color-text-sub)',
                            }}
                          >
                            Tonight at {st.e.time}, {radiusTxt(st.e.radius)}.{' '}
                            Tickets {st.e.price}.
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          background:
                            'linear-gradient(90deg, rgba(255,255,255,.1), rgba(214,51,108,.3))',
                          border: '1px solid rgba(255,255,255,.12)',
                          borderRadius: '18px',
                          padding: '12px',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            width: '38px',
                            height: '38px',
                            flex: '0 0 38px',
                            borderRadius: '10px',
                            background: 'var(--color-accent-event)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i
                            className={`ph ${eventIcon}`}
                            style={{ fontSize: '18px' }}
                          ></i>
                        </span>
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 600,
                              letterSpacing: '.08em',
                              color: 'var(--color-accent-event-pink)',
                            }}
                          >
                            {eventShort()}
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              lineHeight: 1.3,
                            }}
                          >
                            {st.e.venue}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            background: 'var(--color-primary)',
                            color: 'var(--color-primary-darker)',
                            padding: '6px 12px',
                            borderRadius: '999px',
                          }}
                        >
                          Book
                        </span>
                      </div>
                    </>
                  )}

                  {page === 'promo' && (
                    <div
                      style={{
                        background: 'rgba(244,248,247,.95)',
                        color: 'var(--color-text-main)',
                        borderRadius: '20px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        transition:
                          'transform .5s cubic-bezier(.2,.9,.3,1.2), opacity .4s',
                        transform: st.anim
                          ? 'translateY(0)'
                          : 'translateY(-40px)',
                        opacity: st.anim ? 1 : 0,
                      }}
                    >
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span
                          style={{
                            position: 'relative',
                            width: '38px',
                            height: '38px',
                            flex: '0 0 38px',
                            borderRadius: '10px',
                            background: 'var(--color-bg-card)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,.1)',
                          }}
                        >
                          <span
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                            }}
                          >
                            <span style={{ display: 'flex', gap: '2px' }}>
                              <span
                                style={{
                                  width: '5px',
                                  height: '5px',
                                  borderRadius: '50%',
                                  background: 'var(--color-indigo)',
                                }}
                              ></span>
                              <span
                                style={{
                                  width: '10px',
                                  height: '5px',
                                  borderRadius: '3px',
                                  background: 'var(--color-primary)',
                                }}
                              ></span>
                            </span>
                            <span style={{ display: 'flex', gap: '2px' }}>
                              <span
                                style={{
                                  width: '10px',
                                  height: '5px',
                                  borderRadius: '3px',
                                  background: 'var(--color-blue)',
                                }}
                              ></span>
                              <span
                                style={{
                                  width: '5px',
                                  height: '5px',
                                  borderRadius: '50%',
                                  background: 'var(--color-primary)',
                                }}
                              ></span>
                            </span>
                            <span style={{ display: 'flex', gap: '2px' }}>
                              <span
                                style={{
                                  width: '5px',
                                  height: '5px',
                                  borderRadius: '50%',
                                  background: 'var(--color-indigo)',
                                }}
                              ></span>
                              <span
                                style={{
                                  width: '10px',
                                  height: '5px',
                                  borderRadius: '3px',
                                  background: 'var(--color-primary)',
                                }}
                              ></span>
                            </span>
                          </span>
                          <span
                            style={{
                              position: 'absolute',
                              right: '-5px',
                              bottom: '-5px',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: 'var(--color-accent-tour)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid #fff',
                            }}
                          >
                            <i
                              className="ph-fill ph-tag"
                              style={{ fontSize: '9px' }}
                            ></i>
                          </span>
                        </span>
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                          }}
                        >
                          <span
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '9px',
                              fontWeight: 600,
                              letterSpacing: '.06em',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            <span>ESIMLIVE · OFFER</span>
                            <span>now</span>
                          </span>
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: 700,
                              lineHeight: 1.25,
                            }}
                          >
                            {st.p.offer}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--color-text-sub)',
                            }}
                          >
                            {st.join.business} ·{' '}
                            {st.p.radius === '1 km'
                              ? '0.3 km away'
                              : st.p.radius === 'City'
                              ? 'in ' + st.join.city
                              : '0.6 km away'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span
                          style={{
                            flex: 1,
                            minWidth: 0,
                            height: '34px',
                            border: '1.5px dashed var(--color-border-dashed)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--color-primary-dark)',
                            overflow: 'hidden',
                          }}
                        >
                          <i className="ph ph-ticket"></i>
                          {st.p.code}
                        </span>
                        <span
                          style={{
                            height: '34px',
                            padding: '0 10px',
                            borderRadius: '10px',
                            background: 'var(--color-accent-tour-light)',
                            color: 'var(--color-alert-red)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          <i className="ph-fill ph-clock"></i>
                          {st.p.valid}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span
                          style={{
                            flex: 1,
                            height: '34px',
                            borderRadius: '999px',
                            background: 'var(--color-primary)',
                            color: 'var(--color-primary-darker)',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                          }}
                        >
                          <i className="ph-fill ph-navigation-arrow"></i>
                          Directions
                        </span>
                        <span
                          style={{
                            flex: 1,
                            height: '34px',
                            borderRadius: '999px',
                            background: 'var(--color-bg-card)',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                          }}
                        >
                          <i className="ph-fill ph-bookmark-simple"></i>Save
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      alignSelf: 'center',
                      width: '110px',
                      height: '4px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,.7)',
                      marginTop: '6px',
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              maxWidth: '280px',
            }}
          >
            {hints[page]}
          </span>
        </aside>
      </div>

      {/* Toast Notification */}
      {st.toast && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: '28px',
            transform: 'translateX(-50%)',
            background: 'var(--color-dark-bg)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 14px 30px -10px rgba(11,22,32,.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 50,
          }}
        >
          <i
            className="ph-fill ph-check-circle"
            style={{ color: 'var(--color-primary-accent)', fontSize: '18px' }}
          ></i>
          {st.toast}
        </div>
      )}
    </div>
  );
}
