'use client';

import React from 'react';
import { AppState } from '@/types';
import { CATS, hm, pad } from '@/data/constants';

interface PhoneSimulatorProps {
  state: AppState;
  onUpdateStudioView?: (lang: string) => void;
  onCloseMobile?: () => void;
  isMobileModal?: boolean;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  state,
  onUpdateStudioView,
  onCloseMobile,
  isMobileModal = false,
}) => {
  const { page, join, r, e, t, s, p, published, ins, anim, now } = state;

  const cat = CATS.find((c) => c.id === join.category) || CATS[0];
  const isLockScreen = page === 'event' || page === 'promo';

  // Time & Date formatters
  const nowDate = new Date(now);
  const currentTime = hm(nowDate);

  const eDate = new Date(e.date + 'T' + (e.time || '20:00'));
  const lockEventDate = isNaN(eDate.getTime())
    ? nowDate
    : new Date(eDate.getTime() - 90 * 60000);

  const lockD = (d: Date) =>
    d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  const lockScreenDate = lockD(page === 'event' ? lockEventDate : nowDate);
  const lockScreenTime = hm(page === 'event' ? lockEventDate : nowDate);

  // Promotion helpers
  const promoHours = parseInt(p.valid, 10) || 24;
  const isPromoSentLive = Boolean(p.sentAt && now - p.sentAt < promoHours * 3600000);
  const promoUntil = p.sentAt
    ? hm(new Date(p.sentAt + promoHours * 3600000))
    : '';

  const promoDist =
    p.radius === '1 km'
      ? '0.3 km away'
      : p.radius === 'City' || p.radius === 'Whole city'
      ? 'in ' + join.city
      : '0.6 km away';

  // Event helpers
  const eventShortDate = () => {
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

  const eventIcon =
    {
      Music: 'ph-music-notes',
      Food: 'ph-bowl-food',
      Culture: 'ph-mask-happy',
      Market: 'ph-storefront',
      Sport: 'ph-soccer-ball',
    }[e.type] || 'ph-calendar-star';

  const radiusTxt = (rad: string) =>
    rad === 'Whole city' || rad === 'City' ? 'in the city' : 'within ' + rad;

  // Tour route
  const pickupCity =
    t.pickup.split(',').pop()?.trim().replace(/ medina$/i, '') || 'Marrakech';
  const tourRoute = [
    t.pickup.split(',').pop()?.trim().replace(/ medina$/i, '') || 'Pickup',
    ...t.stops,
  ];

  // Studio text
  const studioViewLang = s.langs.includes(s.view)
    ? s.view
    : s.langs[0] || 'English';
  const studioText =
    s.texts[studioViewLang] || 'Generate to preview this language.';
  const studioDir = studioViewLang === 'العربية' ? 'rtl' : 'ltr';

  // Labels & Hints
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
    join: 'Updates as you type in the form.',
    listings: 'Everything you publish, as travellers see it.',
    restaurant: 'Every field updates the card instantly.',
    event: 'The push notification travellers get on the day.',
    tour: 'Tap stops and extras — the route card follows.',
    studio: 'Tap a language pill to preview it on the phone.',
    promo: isPromoSentLive
      ? 'Sent — this is on travellers’ lock screens now.'
      : 'Preview of the push. Tap Send now to go live.',
  };

  return (
    <aside
      className={`flex flex-col items-center gap-3.5 mx-auto ${
        isMobileModal ? 'w-full' : 'w-[310px] shrink-0 sticky top-24'
      }`}
    >
      {/* Top Header Label */}
      <div className="w-full flex items-center justify-between">
        <span className="text-xs font-semibold tracking-[0.12em] text-text-muted">
          {labels[page]}
        </span>
        {isMobileModal && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="w-7 h-7 rounded-full bg-page-muted flex items-center justify-center text-text-main"
          >
            <i className="ph ph-x"></i>
          </button>
        )}
      </div>

      {/* Realistic Smartphone Chassis */}
      <div className="w-[310px] h-[640px] p-2.5 rounded-[50px] bg-[#0b1620] shadow-phone box-border select-none relative">
        <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-white">
          {/* Dynamic Island / Top Camera Notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-7 rounded-[20px] bg-[#0b1620] z-20 pointer-events-none"></div>

          {/* MODE 1: White Consumer App View */}
          {!isLockScreen && (
            <div className="absolute inset-0 overflow-y-auto px-4 pt-3.5 pb-6 flex flex-col gap-3 custom-scrollbar bg-white">
              {/* Phone Status Bar */}
              <div className="h-7 flex items-center justify-between px-2.5 text-xs font-semibold text-text-main">
                <span>{currentTime}</span>
                <span className="flex items-center gap-1">
                  <i className="ph-fill ph-cell-signal-full text-[13px]"></i>
                  <i className="ph-fill ph-battery-full text-base"></i>
                </span>
              </div>

              {/* App Category Bar */}
              <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-[#12a585] mt-1">
                <span className="flex flex-col gap-[1px]">
                  <span className="flex gap-[1px]">
                    <span className="w-[3px] h-[3px] rounded-full bg-[#5b4be8]"></span>
                    <span className="w-[6px] h-[3px] rounded-[2px] bg-[#17c99a]"></span>
                  </span>
                  <span className="flex gap-[1px]">
                    <span className="w-[6px] h-[3px] rounded-[2px] bg-[#4f6ef0]"></span>
                    <span className="w-[3px] h-[3px] rounded-full bg-[#17c99a]"></span>
                  </span>
                  <span className="flex gap-[1px]">
                    <span className="w-[3px] h-[3px] rounded-full bg-[#5b4be8]"></span>
                    <span className="w-[6px] h-[3px] rounded-[2px] bg-[#17c99a]"></span>
                  </span>
                </span>
                {page === 'tour'
                  ? 'ESIMLIVE · EXPERIENCES'
                  : 'ESIMLIVE · NEAR YOU'}
              </div>

              {/* View 1: JOIN PAGE PREVIEW */}
              {page === 'join' && (
                <div className="flex flex-col gap-3">
                  <div
                    className="relative h-[150px] rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${cat.color}, #0f2533)`,
                    }}
                  >
                    <span className="absolute top-2.5 left-2.5 bg-[#0b1620]/75 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                      New on eSIMLive
                    </span>
                    <i className={`ph ${cat.icon} text-[52px] text-white`}></i>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[19px] font-bold tracking-[-0.01em] text-text-main">
                      {join.business || 'Your Business'}
                    </span>
                    <span className="text-xs text-text-muted">
                      {cat.label} · {join.city || 'City'},{' '}
                      {join.country || 'Country'}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed m-0">
                    Finish sign-up to pin your location and write your listing.
                    Travellers nearby will see this card.
                  </p>
                  <div className="flex gap-2">
                    <span className="flex-1 h-9 rounded-full bg-primary text-[#06251c] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                      <i className="ph-fill ph-navigation-arrow"></i>
                      Directions
                    </span>
                    <span className="flex-1 h-9 rounded-full bg-page-muted text-text-main text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                      <i className="ph-fill ph-whatsapp-logo text-[#25d366]"></i>
                      WhatsApp
                    </span>
                  </div>
                </div>
              )}

              {/* View 2: LISTINGS DASHBOARD FEED */}
              {page === 'listings' && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-lg font-bold tracking-[-0.01em] text-text-main">
                    Around you in {join.city}
                  </span>
                  {published.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2.5 text-text-muted text-center text-xs py-8">
                      <i className="ph ph-map-trifold text-4xl text-[#b4c4c9]"></i>
                      Your published listings show up here, just as travellers
                      see them.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {published.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-page-bg hover:bg-page-muted/80 transition-colors"
                        >
                          <span
                            className="w-10 h-10 shrink-0 rounded-[11px] text-white flex items-center justify-center"
                            style={{ backgroundColor: f.color }}
                          >
                            <i className={`ph ${f.icon} text-lg`}></i>
                          </span>
                          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                            <span className="text-[13px] font-semibold text-text-main truncate">
                              {f.title}
                            </span>
                            <span className="text-[11px] text-text-muted truncate">
                              {f.sub}
                            </span>
                          </div>
                          <i className="ph ph-caret-right text-text-dim"></i>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* View 3: RESTAURANT LISTING */}
              {page === 'restaurant' && (
                <div className="flex flex-col gap-3">
                  <div className="relative h-[140px] rounded-2xl bg-gradient-to-br from-primary to-[#4fb8f0] flex items-center justify-center">
                    <span className="absolute top-2.5 left-2.5 bg-[#0b1620]/80 text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                      <i className="ph-fill ph-navigation-arrow"></i>
                      0.4 km
                    </span>
                    <i className="ph ph-bowl-steam text-[54px] text-white"></i>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[19px] font-bold tracking-[-0.01em] text-text-main">
                      {r.name || 'Restaurant Name'}
                    </span>
                    <span className="text-xs text-text-muted">
                      {r.cuisine} · {r.price} · Open {r.hours}
                    </span>
                  </div>
                  {r.offer && (
                    <span className="self-start text-[11px] font-semibold text-primary-dark bg-primary-light px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <i className="ph-fill ph-tag"></i>
                      {r.offer}
                    </span>
                  )}
                  <p className="text-xs text-text-sub leading-relaxed m-0">
                    {r.desc ||
                      'Your description appears here. Tap Write with AI to create one from your details.'}
                  </p>
                  <div className="flex gap-2">
                    <span className="flex-1 h-9 rounded-full bg-primary text-[#06251c] text-xs font-semibold flex items-center justify-center gap-1.5">
                      <i className="ph-fill ph-navigation-arrow"></i>
                      Directions
                    </span>
                    <span className="flex-1 h-9 rounded-full bg-page-muted text-text-main text-xs font-semibold flex items-center justify-center gap-1.5">
                      <i className="ph-fill ph-phone"></i>
                      Call
                    </span>
                  </div>
                </div>
              )}

              {/* View 4: TOUR & EXPERIENCE */}
              {page === 'tour' && (
                <div className="flex flex-col gap-2.5">
                  <div className="relative h-[130px] rounded-2xl bg-gradient-to-br from-[#f6a54a] via-[#e8730c] to-[#b84d06] flex items-end justify-end p-3 box-border">
                    <span className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#ffe9b8]/90"></span>
                    <span className="absolute bottom-2.5 left-2.5 bg-[#0b1620]/80 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                      ● {t.duration}
                    </span>
                    <i className="ph ph-sun-horizon text-4xl text-white"></i>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[17px] font-bold leading-tight tracking-[-0.01em] text-text-main">
                      {t.name || 'Tour Title'}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {t.duration} · {t.group} · from {pickupCity}
                    </span>
                  </div>
                  {/* Route Timeline */}
                  <div className="flex flex-col gap-1.5 py-1">
                    {tourRoute.map((st, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-2 text-xs text-text-main"
                      >
                        <span className="w-2 h-2 rounded-full border-2 border-accent-tour shrink-0"></span>
                        <span className="truncate">{st}</span>
                      </span>
                    ))}
                  </div>
                  {/* Included tags */}
                  <div className="flex flex-wrap gap-1">
                    {t.included.map((inc, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold text-[#b4530b] bg-accent-tourLight px-2 py-0.5 rounded-full"
                      >
                        {inc}
                      </span>
                    ))}
                  </div>
                  {/* Price & Booking */}
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-border-light">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-muted">From</span>
                      <span className="text-[17px] font-bold text-text-main">
                        {t.price}
                      </span>
                    </div>
                    <span className="h-9 px-4 rounded-full bg-primary text-[#06251c] text-xs font-semibold flex items-center gap-1.5">
                      Book tour <i className="ph ph-arrow-right"></i>
                    </span>
                  </div>
                </div>
              )}

              {/* View 5: AI STUDIO PREVIEW */}
              {page === 'studio' && (
                <div className="flex flex-col gap-2.5">
                  {/* Language Switching Pills on Phone */}
                  <div className="flex gap-1 flex-wrap">
                    {s.langs.map((l) => (
                      <button
                        key={l}
                        onClick={() => onUpdateStudioView && onUpdateStudioView(l)}
                        className={`h-6.5 px-2.5 rounded-full text-[11px] font-semibold transition-all ${
                          l === studioViewLang
                            ? 'bg-dark-bg text-white'
                            : 'bg-page-muted text-text-sub hover:bg-page-muted/80'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <div className="relative h-[120px] rounded-2xl bg-gradient-to-br from-primary to-[#4fb8f0] flex items-center justify-center">
                    <i className="ph ph-sparkle text-[46px] text-white"></i>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[19px] font-bold tracking-[-0.01em] text-text-main">
                      {s.title}
                    </span>
                    <span className="text-xs text-text-muted">{s.tagline}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {s.tags.map((tg, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold text-primary-dark bg-primary-light px-2 py-0.5 rounded-full"
                      >
                        #{tg}
                      </span>
                    ))}
                  </div>
                  <p
                    dir={studioDir}
                    className="text-xs text-text-sub leading-relaxed m-0"
                  >
                    {studioText}
                  </p>
                </div>
              )}

              {/* View 6: INSIGHTS & PUBLIC PROFILE */}
              {page === 'insights' && (
                <div className="flex flex-col gap-2.5">
                  <div className="relative h-[130px] rounded-2xl bg-gradient-to-br from-primary to-[#4fb8f0] flex items-center justify-center">
                    <span className="absolute top-2.5 left-2.5 bg-[#0b1620]/80 text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                      <i className="ph-fill ph-fire text-[#ff7043]"></i>
                      Popular this {ins.period.toLowerCase()}
                    </span>
                    <i className="ph ph-bowl-steam text-[50px] text-white"></i>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[19px] font-bold tracking-[-0.01em] text-text-main">
                      {join.business}
                    </span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <i className="ph-fill ph-star text-star-gold"></i>
                      <b className="text-text-main">4.8</b> · 128 reviews ·{' '}
                      {join.city}
                    </span>
                  </div>
                  <span className="self-start text-[11px] font-semibold text-primary-dark bg-primary-light px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <i className="ph-fill ph-thumbs-up"></i>
                    84 travellers recommend
                  </span>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-[11px] font-semibold tracking-[0.08em] text-text-muted">
                      LOVED FOR
                    </span>
                    {ins.featured.length === 0 ? (
                      <span className="text-xs text-text-dim">
                        Star items in Insights to show them here.
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {ins.featured.map((fl, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-semibold text-[#a8264f] bg-accent-eventLight px-2.5 py-1 rounded-full flex items-center gap-1"
                          >
                            <i className="ph-fill ph-heart text-xs"></i>
                            {fl}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="flex-1 h-9 rounded-full bg-primary text-[#06251c] text-xs font-semibold flex items-center justify-center gap-1.5">
                      <i className="ph-fill ph-navigation-arrow"></i>
                      Directions
                    </span>
                    <span className="flex-1 h-9 rounded-full bg-page-muted text-text-main text-xs font-semibold flex items-center justify-center gap-1.5">
                      <i className="ph-fill ph-chat-circle-text"></i>
                      Reviews
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: Dark Lock Screen Push View (Events & Promotions) */}
          {isLockScreen && (
            <div className="absolute inset-0 px-3 pt-14 pb-5 text-white flex flex-col gap-3 select-none bg-[radial-gradient(circle_at_90%_100%,rgba(232,115,12,0.45),transparent_40%),linear-gradient(180deg,#1b5562_0%,#0f2533_45%,#0b1620_100%)]">
              {/* Lock Icon & Big Time */}
              <div className="flex flex-col items-center gap-1">
                <i className="ph-fill ph-lock-simple text-sm text-white/90"></i>
                <span className="text-sm font-medium text-white/90">
                  {lockScreenDate}
                </span>
                <span className="text-[64px] font-semibold tracking-[-0.03em] leading-none">
                  {lockScreenTime}
                </span>
              </div>

              <div className="flex-1"></div>

              {/* EVENT LOCK SCREEN NOTIFICATION */}
              {page === 'event' && (
                <div className="flex flex-col gap-2">
                  {/* Push notification banner */}
                  <div className="bg-[#f4f8f7]/95 text-text-main rounded-[18px] p-3 flex gap-2.5 shadow-lg backdrop-blur-sm">
                    <span className="w-8.5 h-8.5 shrink-0 rounded-[9px] bg-white flex items-center justify-center shadow-xs">
                      <i className="ph-fill ph-calendar-star text-accent-event text-lg"></i>
                    </span>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex justify-between items-center text-[9px] font-semibold tracking-[0.06em] text-text-muted">
                        <span>ESIMLIVE · HAPPENING NEARBY</span>
                        <span>now</span>
                      </div>
                      <span className="text-[13px] font-bold text-text-main truncate">
                        {e.title || 'Event Title'}
                      </span>
                      <span className="text-[11px] leading-tight text-text-sub">
                        Tonight at {e.time || '20:00'}, {radiusTxt(e.radius)}.
                        Tickets {e.price}.
                      </span>
                    </div>
                  </div>

                  {/* Lock Screen Event Card */}
                  <div className="bg-gradient-to-r from-white/10 to-[rgba(214,51,108,0.3)] border border-white/15 rounded-[18px] p-3 flex gap-2.5 items-center">
                    <span className="w-9 h-9 shrink-0 rounded-xl bg-accent-event text-white flex items-center justify-center">
                      <i className={`ph ${eventIcon} text-lg`}></i>
                    </span>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="text-[9px] font-semibold tracking-[0.08em] text-[#f9b8cf]">
                        {eventShortDate()}
                      </span>
                      <span className="text-xs font-semibold leading-snug truncate">
                        {e.venue || 'Venue Location'}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold bg-primary text-[#06251c] px-3 py-1.5 rounded-full shrink-0">
                      Book
                    </span>
                  </div>
                </div>
              )}

              {/* PROMOTION LOCK SCREEN NOTIFICATION */}
              {page === 'promo' && (
                <div
                  className={`bg-[#f4f8f7]/95 text-text-main rounded-[20px] p-3 flex flex-col gap-2.5 shadow-xl transition-all duration-500 ${
                    anim
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-8 opacity-0'
                  }`}
                >
                  <div className="flex gap-2.5">
                    {/* App icon with badge */}
                    <span className="relative w-9 h-9 shrink-0 rounded-[10px] bg-white flex items-center justify-center shadow-xs">
                      <span className="flex flex-col gap-[2px]">
                        <span className="flex gap-[2px]">
                          <span className="w-[5px] h-[5px] rounded-full bg-[#5b4be8]"></span>
                          <span className="w-[10px] h-[5px] rounded-[3px] bg-primary"></span>
                        </span>
                        <span className="flex gap-[2px]">
                          <span className="w-[10px] h-[5px] rounded-[3px] bg-[#4f6ef0]"></span>
                          <span className="w-[5px] h-[5px] rounded-full bg-primary"></span>
                        </span>
                        <span className="flex gap-[2px]">
                          <span className="w-[5px] h-[5px] rounded-full bg-[#5b4be8]"></span>
                          <span className="w-[10px] h-[5px] rounded-[3px] bg-primary"></span>
                        </span>
                      </span>
                      <span className="absolute -right-1 -bottom-1 w-4.5 h-4.5 rounded-full bg-accent-tour text-white flex items-center justify-center border-2 border-white">
                        <i className="ph-fill ph-tag text-[9px]"></i>
                      </span>
                    </span>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex justify-between items-center text-[9px] font-semibold tracking-[0.06em] text-text-muted">
                        <span>ESIMLIVE · OFFER</span>
                        <span>now</span>
                      </div>
                      <span className="text-[15px] font-bold leading-snug text-text-main">
                        {p.offer || 'Special Discount'}
                      </span>
                      <span className="text-[11px] text-text-sub truncate">
                        {join.business} · {promoDist}
                      </span>
                    </div>
                  </div>

                  {/* Promo code dashed box */}
                  <div className="flex gap-2">
                    <span className="flex-1 h-8.5 border-1.5 border-dashed border-border-dashed rounded-xl bg-primary-surface flex items-center justify-center gap-1.5 text-xs font-bold text-primary-dark">
                      <i className="ph ph-ticket text-sm"></i>
                      {p.code}
                    </span>
                    <span className="h-8.5 px-2.5 rounded-xl bg-accent-tourLight text-alert-red flex items-center gap-1 text-[11px] font-semibold">
                      <i className="ph-fill ph-clock"></i>
                      {p.valid}
                    </span>
                  </div>

                  {/* Push Action Buttons */}
                  <div className="flex gap-2">
                    <span className="flex-1 h-8.5 rounded-full bg-primary text-[#06251c] text-xs font-semibold flex items-center justify-center gap-1">
                      <i className="ph-fill ph-navigation-arrow"></i>
                      Directions
                    </span>
                    <span className="flex-1 h-8.5 rounded-full bg-white text-text-main border border-border-light text-xs font-semibold flex items-center justify-center gap-1">
                      <i className="ph-fill ph-bookmark-simple"></i>
                      Save
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Home Indicator Bar */}
              <div className="self-center w-28 h-1 rounded-full bg-white/70 mt-1.5"></div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Hint Text */}
      <span className="text-xs text-text-muted text-center max-w-[280px]">
        {hints[page]}
      </span>
    </aside>
  );
};

