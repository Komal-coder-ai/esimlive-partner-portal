'use client';

import React from 'react';
import { RestaurantData } from '@/types';

interface RestaurantViewProps {
  restaurant: RestaurantData;
  busy: string;
  onUpdateField: (field: keyof RestaurantData, value: string | number) => void;
  onFindAddress: () => void;
  onLocate: () => void;
  onWriteAI: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export const RestaurantView: React.FC<RestaurantViewProps> = ({
  restaurant,
  busy,
  onUpdateField,
  onFindAddress,
  onLocate,
  onWriteAI,
  onSaveDraft,
  onPublish,
}) => {
  const cuisines = [
    'Moroccan',
    'Mediterranean',
    'Street food',
    'Café',
    'Vegetarian',
  ];
  const prices = ['$', '$$', '$$$'];

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    restaurant.lng - 0.008
  },${restaurant.lat - 0.005},${restaurant.lng + 0.008},${
    restaurant.lat + 0.005
  }&layer=mapnik&marker=${restaurant.lat},${restaurant.lng}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs sm:text-sm font-medium">
            Listings / New
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
            Add your restaurant
          </h1>
        </div>
        <span className="text-xs font-semibold text-alert-red bg-alert-bg px-3 py-1 rounded-full whitespace-nowrap">
          ● Draft
        </span>
      </div>

      {/* Section 1: Basics */}
      <section className="bg-white border border-border-light rounded-2xl p-5 sm:p-6 flex flex-col gap-4.5 shadow-xs">
        <div className="flex items-center gap-2.5 font-semibold text-base text-text-main">
          <i className="ph ph-fork-knife text-xl text-[#12a585]"></i>
          <span>Basics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Restaurant name
            </span>
            <input
              type="text"
              value={restaurant.name}
              onChange={(e) => onUpdateField('name', e.target.value)}
              className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Opening hours
            </span>
            <input
              type="text"
              value={restaurant.hours}
              onChange={(e) => onUpdateField('hours', e.target.value)}
              placeholder="e.g. 12:00 – 23:00"
              className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            />
          </label>
        </div>

        {/* Cuisine Chips & Price Segments */}
        <div className="flex flex-wrap gap-5 justify-between items-end pt-1">
          <div className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Cuisine
            </span>
            <div className="flex flex-wrap gap-2">
              {cuisines.map((c) => {
                const isSelected = restaurant.cuisine === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdateField('cuisine', c)}
                    className={`h-8.5 px-3.5 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-[#06251c] font-semibold'
                        : 'border-border-input bg-white text-text-main hover:bg-page-muted'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Price range
            </span>
            <div className="inline-flex gap-1 p-1 bg-page-muted rounded-xl">
              {prices.map((p) => {
                const isSelected = restaurant.price === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onUpdateField('price', p)}
                    className={`h-8.5 px-3.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-white text-text-main font-semibold shadow-xs'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Location */}
      <section className="bg-white border border-border-light rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2.5 font-semibold text-base text-text-main">
            <i className="ph ph-map-pin text-xl text-[#12a585]"></i>
            <span>Location</span>
          </div>
          <span className="text-text-muted text-xs sm:text-sm">
            Travellers see your distance from them
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <input
            type="text"
            value={restaurant.address}
            onChange={(e) => onUpdateField('address', e.target.value)}
            placeholder="Address or landmark"
            className="flex-1 min-w-[220px] h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
          />
          <button
            type="button"
            onClick={onFindAddress}
            className="h-11 px-4.5 rounded-full bg-primary-light text-primary-dark font-semibold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-[#ccf0e4] transition-colors whitespace-nowrap"
          >
            <i className="ph ph-magnifying-glass text-base"></i>
            Find address
          </button>
          <button
            type="button"
            onClick={onLocate}
            className="h-11 px-4.5 rounded-full bg-primary text-[#06251c] font-semibold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-primary-hover transition-colors whitespace-nowrap"
          >
            <i className="ph ph-crosshair text-base"></i>
            Use my location
          </button>
        </div>

        {/* Embedded Map */}
        <div className="relative h-[260px] rounded-xl overflow-hidden bg-page-muted border border-border-light">
          <iframe
            src={mapUrl}
            title="Restaurant Location Map"
            className="w-full h-full border-0"
          ></iframe>
          <span className="absolute left-3 bottom-3 bg-white/95 rounded-full px-3 py-1.5 text-xs font-medium shadow-md flex items-center gap-1.5 backdrop-blur-xs">
            <i className="ph-fill ph-map-pin text-[#e5484d]"></i>
            {restaurant.lat.toFixed(5)}, {restaurant.lng.toFixed(5)}
          </span>
        </div>

        <span className="text-text-muted text-xs flex items-center gap-1.5">
          <i className="ph ph-info text-sm text-[#12a585]"></i>
          {restaurant.note}
        </span>
      </section>

      {/* Section 3: Description & Traveller Offer */}
      <section className="bg-white border border-border-light rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 font-semibold text-base text-text-main">
            <i className="ph ph-text-align-left text-xl text-[#12a585]"></i>
            <span>Description</span>
          </div>
          <button
            type="button"
            onClick={onWriteAI}
            disabled={busy === 'r'}
            className="h-9.5 px-4 rounded-full bg-dark-bg text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-[#1c3a4c] transition-colors whitespace-nowrap"
          >
            <i className="ph ph-sparkle text-primary-accent"></i>
            {busy === 'r' ? 'Writing…' : 'Write with AI'}
          </button>
        </div>

        <textarea
          rows={4}
          value={restaurant.desc}
          onChange={(e) => onUpdateField('desc', e.target.value)}
          placeholder="Tell travellers what makes you special, or let AI write it from the details above."
          className="p-3.5 border border-border-input rounded-xl text-sm leading-relaxed text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all resize-y"
        ></textarea>

        <label className="flex flex-col gap-2">
          <span className="text-xs sm:text-sm font-semibold text-text-main">
            Offer for eSIMLive travellers
          </span>
          <input
            type="text"
            value={restaurant.offer}
            onChange={(e) => onUpdateField('offer', e.target.value)}
            placeholder="e.g. 10% off for eSIMLive travellers"
            className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
          />
        </label>
      </section>

      {/* Bottom Action Bar */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onSaveDraft}
          className="h-11.5 px-6 border border-border-input rounded-full bg-white text-text-main font-semibold text-sm hover:bg-page-muted transition-colors"
        >
          Save draft
        </button>
        <button
          type="button"
          onClick={onPublish}
          className="h-11.5 px-6.5 rounded-full bg-primary text-[#06251c] font-semibold text-sm inline-flex items-center gap-2 hover:bg-primary-hover transition-colors shadow-sm"
        >
          <i className="ph ph-rocket-launch text-base"></i>
          Publish to app
        </button>
      </div>
    </div>
  );
};

