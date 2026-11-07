'use client';

import React from 'react';
import { PromoData, JoinData } from '@/types';
import { hm } from '@/data/constants';

interface PromoViewProps {
  promo: PromoData;
  join: JoinData;
  now: number;
  onUpdateField: (field: keyof PromoData, value: string | number) => void;
  onSendPromo: () => void;
}

export const PromoView: React.FC<PromoViewProps> = ({
  promo,
  join,
  now,
  onUpdateField,
  onSendPromo,
}) => {
  const promoTypes: Array<{ label: string; icon: string }> = [
    { label: 'Restaurant', icon: 'ph-fork-knife' },
    { label: 'Event', icon: 'ph-calendar-star' },
    { label: 'Tour', icon: 'ph-compass' },
    { label: 'Spa', icon: 'ph-flower-lotus' },
    { label: 'Handicraft', icon: 'ph-hand-heart' },
  ];

  const valids = ['6 hrs', '12 hrs', '24 hrs'];
  const radii = ['1 km', '5 km', 'City'];

  const hrs = parseInt(promo.valid, 10) || 24;
  const isSentLive = Boolean(promo.sentAt && now - promo.sentAt < hrs * 3600000);
  const until = promo.sentAt ? hm(new Date(promo.sentAt + hrs * 3600000)) : '';

  return (
    <div className="flex flex-col gap-5">
      {/* Title Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs sm:text-sm font-medium">
            Promotions / New
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
            New promotion
          </h1>
        </div>
        <span className="text-xs font-semibold text-primary-active bg-primary-light px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap">
          <i className="ph-fill ph-lightning"></i>
          Instant
        </span>
      </div>

      {/* Main Promo Configuration Card */}
      <section className="bg-white border border-border-light rounded-2xl p-5 sm:p-6 flex flex-col gap-5 shadow-xs">
        {/* Business Type */}
        <div className="flex flex-col gap-2">
          <span className="text-xs sm:text-sm font-semibold text-text-main">
            Business type
          </span>
          <div className="flex flex-wrap gap-2">
            {promoTypes.map((t) => {
              const isSelected = promo.type === t.label;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => onUpdateField('type', t.label)}
                  className={`h-8.5 px-3.5 rounded-full text-xs sm:text-sm font-medium border flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-[#06251c] font-semibold'
                      : 'border-border-input bg-white text-text-main hover:bg-page-muted'
                  }`}
                >
                  <i className={`ph ${t.icon}`}></i>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Offer Input with Glowing Focus */}
        <label className="flex flex-col gap-2">
          <span className="text-xs sm:text-sm font-semibold text-text-main">
            Offer
          </span>
          <input
            type="text"
            value={promo.offer}
            onChange={(e) => onUpdateField('offer', e.target.value)}
            placeholder="e.g. 20% off this weekend"
            className="h-13 px-4 border-1.5 border-primary rounded-xl text-base sm:text-lg text-text-main bg-white outline-none shadow-glow-lg focus:border-primary transition-all font-medium"
          />
        </label>

        {/* Promo Code & Validity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Promo code
            </span>
            <span className="flex items-center gap-2.5 h-12 px-3.5 border-1.5 border-dashed border-border-dashed rounded-xl bg-primary-surface">
              <i className="ph ph-ticket text-primary-active text-lg"></i>
              <input
                type="text"
                value={promo.code}
                onChange={(e) => onUpdateField('code', e.target.value)}
                className="flex-1 min-w-0 border-0 bg-transparent text-base sm:text-[17px] font-bold text-primary-dark outline-none tracking-wide"
              />
            </span>
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Valid for
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-page-muted rounded-xl">
              {valids.map((v) => {
                const isSelected = promo.valid === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onUpdateField('valid', v)}
                    className={`h-8.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-white text-text-main font-semibold shadow-xs'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notification Radius */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Send to travellers within
            </span>
            <span className="text-text-muted text-xs">
              From {join.business || 'Business'}, {join.city || 'City'}
            </span>
          </div>
          <div className="inline-flex gap-1 p-1 bg-page-muted rounded-xl">
            {radii.map((rad) => {
              const isSelected = promo.radius === rad;
              return (
                <button
                  key={rad}
                  type="button"
                  onClick={() => onUpdateField('radius', rad)}
                  className={`h-8.5 px-3.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-white text-text-main font-semibold shadow-xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {rad}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real-time Status Banner & Send Button */}
      <div className="bg-dark-bg text-white rounded-2xl p-4.5 sm:p-5 flex items-center gap-4 flex-wrap shadow-md">
        <i className="ph ph-timer text-3xl sm:text-4xl text-primary-accent shrink-0"></i>
        <div className="flex-1 min-w-[200px] flex flex-col gap-0.5">
          <span className="font-semibold text-base sm:text-[17px]">
            {isSentLive
              ? `Live now · ends at ${until}`
              : `Goes live instantly · runs ${promo.valid}`}
          </span>
          <span className="text-dark-muted text-xs sm:text-sm">
            Expires automatically, no follow-up needed
          </span>
        </div>
        <button
          type="button"
          onClick={onSendPromo}
          className="h-12 px-6.5 rounded-full bg-primary text-[#06251c] font-semibold text-sm sm:text-base inline-flex items-center gap-2 hover:bg-primary-hover active:bg-primary-active transition-all shadow-btn"
        >
          <i className="ph-fill ph-paper-plane-tilt text-base"></i>
          <span>{isSentLive ? 'Send again' : 'Send now'}</span>
        </button>
      </div>
    </div>
  );
};

