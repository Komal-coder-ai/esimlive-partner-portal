'use client';

import React from 'react';
import { TourData } from '@/types';
import { STOPS } from '@/data/constants';

interface TourViewProps {
  tour: TourData;
  busy: string;
  onUpdateField: (field: keyof TourData, value: string | string[] | number) => void;
  onToggleIncluded: (item: string) => void;
  onToggleStop: (stop: string) => void;
  onFindPickup: () => void;
  onLocate: () => void;
  onWriteAI: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export const TourView: React.FC<TourViewProps> = ({
  tour,
  busy,
  onUpdateField,
  onToggleIncluded,
  onToggleStop,
  onFindPickup,
  onLocate,
  onWriteAI,
  onSaveDraft,
  onPublish,
}) => {
  const durations = ['1 day', '2 days', '3 days', '4+ days'];

  const includedOptions: Array<{ label: string; icon: string }> = [
    { label: 'Transport', icon: 'ph-van' },
    { label: 'Camel trek', icon: 'ph-sun-horizon' },
    { label: 'Desert camp', icon: 'ph-tent' },
    { label: 'Breakfast & dinner', icon: 'ph-bowl-food' },
    { label: 'Local guide', icon: 'ph-user-sound' },
    { label: 'Sandboarding', icon: 'ph-mountains' },
  ];

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    tour.lng - 0.008
  },${tour.lat - 0.005},${tour.lng + 0.008},${
    tour.lat + 0.005
  }&layer=mapnik&marker=${tour.lat},${tour.lng}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Title Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs sm:text-sm font-medium">
            Listings / New
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
            Add a tour or experience
          </h1>
        </div>
        <span className="text-xs font-semibold text-alert-red bg-alert-bg px-3 py-1 rounded-full whitespace-nowrap">
          ● Draft
        </span>
      </div>

      {/* Section 1: Tour Details */}
      <section className="bg-white border border-border-light rounded-2xl p-5 sm:p-6 flex flex-col gap-4.5 shadow-xs">
        <div className="flex items-center gap-2.5 font-semibold text-base text-text-main">
          <i className="ph ph-compass text-xl text-accent-tour"></i>
          <span>Tour details</span>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-xs sm:text-sm font-semibold text-text-main">
            Tour name
          </span>
          <input
            type="text"
            value={tour.name}
            onChange={(e) => onUpdateField('name', e.target.value)}
            placeholder="e.g. Marrakech to Merzouga: 3-day Sahara trip"
            className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
          />
        </label>

        {/* Duration, Price, Group size */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Duration
            </span>
            <div className="inline-flex gap-1 p-1 bg-page-muted rounded-xl self-start">
              {durations.map((d) => {
                const isSelected = tour.duration === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onUpdateField('duration', d)}
                    className={`h-8.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-white text-text-main font-semibold shadow-xs'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex flex-col gap-2 w-full sm:w-[140px]">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Price per person
            </span>
            <input
              type="text"
              value={tour.price}
              onChange={(e) => onUpdateField('price', e.target.value)}
              placeholder="e.g. €180"
              className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            />
          </label>

          <label className="flex flex-col gap-2 w-full sm:w-[140px]">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Group size
            </span>
            <input
              type="text"
              value={tour.group}
              onChange={(e) => onUpdateField('group', e.target.value)}
              placeholder="e.g. Max 12"
              className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            />
          </label>
        </div>

        {/* What's Included */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-xs sm:text-sm font-semibold text-text-main">
            What&apos;s included
          </span>
          <div className="flex flex-wrap gap-2">
            {includedOptions.map((inc) => {
              const isSelected = tour.included.includes(inc.label);
              return (
                <button
                  key={inc.label}
                  type="button"
                  onClick={() => onToggleIncluded(inc.label)}
                  className={`h-8.5 px-3.5 rounded-full text-xs sm:text-sm font-medium border flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-[#06251c] font-semibold'
                      : 'border-border-input bg-white text-text-main hover:bg-page-muted'
                  }`}
                >
                  <i className={`ph ${inc.icon}`}></i>
                  <span>{inc.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 2: Route & Pickup */}
      <section className="bg-white border border-border-light rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2.5 font-semibold text-base text-text-main">
            <i className="ph ph-path text-xl text-[#12a585]"></i>
            <span>Route &amp; pickup</span>
          </div>
          <span className="text-text-muted text-xs sm:text-sm">
            Tap stops to build the route
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <input
            type="text"
            value={tour.pickup}
            onChange={(e) => onUpdateField('pickup', e.target.value)}
            placeholder="Pickup location"
            className="flex-1 min-w-[220px] h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
          />
          <button
            type="button"
            onClick={onFindPickup}
            className="h-11 px-4.5 rounded-full bg-primary-light text-primary-dark font-semibold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-[#ccf0e4] transition-colors whitespace-nowrap"
          >
            <i className="ph ph-magnifying-glass text-base"></i>
            Find pickup
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

        {/* Route Stops Selector */}
        <div className="flex flex-wrap gap-2">
          {STOPS.map((st) => {
            const isSelected = tour.stops.includes(st);
            return (
              <button
                key={st}
                type="button"
                onClick={() => onToggleStop(st)}
                className={`h-8.5 px-3.5 rounded-full text-xs sm:text-sm font-medium border flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-[#06251c] font-semibold'
                    : 'border-border-input bg-white text-text-main hover:bg-page-muted'
                }`}
              >
                <i className="ph ph-map-pin"></i>
                <span>{st}</span>
              </button>
            );
          })}
        </div>

        {/* Embedded Map */}
        <div className="relative h-[230px] rounded-xl overflow-hidden bg-page-muted border border-border-light">
          <iframe
            src={mapUrl}
            title="Tour Pickup Map"
            className="w-full h-full border-0"
          ></iframe>
          <span className="absolute left-3 bottom-3 bg-white/95 rounded-full px-3 py-1.5 text-xs font-medium shadow-md flex items-center gap-1.5 backdrop-blur-xs">
            <i className="ph-fill ph-map-pin text-[#e5484d]"></i>
            Pickup · {tour.lat.toFixed(5)}, {tour.lng.toFixed(5)}
          </span>
        </div>

        <span className="text-text-muted text-xs flex items-center gap-1.5">
          <i className="ph ph-info text-sm text-[#12a585]"></i>
          {tour.note}
        </span>
      </section>

      {/* Section 3: Description */}
      <section className="bg-white border border-border-light rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 font-semibold text-base text-text-main">
            <i className="ph ph-text-align-left text-xl text-[#12a585]"></i>
            <span>Description</span>
          </div>
          <button
            type="button"
            onClick={onWriteAI}
            disabled={busy === 't'}
            className="h-9.5 px-4 rounded-full bg-dark-bg text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-[#1c3a4c] transition-colors whitespace-nowrap"
          >
            <i className="ph ph-sparkle text-primary-accent"></i>
            {busy === 't' ? 'Writing…' : 'Write with AI'}
          </button>
        </div>

        <textarea
          rows={4}
          value={tour.desc}
          onChange={(e) => onUpdateField('desc', e.target.value)}
          placeholder="Describe the journey day by day, or let AI write it from the route above."
          className="p-3.5 border border-border-input rounded-xl text-sm leading-relaxed text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all resize-y"
        ></textarea>
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
          Publish tour
        </button>
      </div>
    </div>
  );
};

