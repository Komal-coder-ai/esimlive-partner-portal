'use client';

import React from 'react';
import { EventData } from '@/types';

interface EventViewProps {
  event: EventData;
  busy: string;
  onUpdateField: (field: keyof EventData, value: string | number) => void;
  onFindVenue: () => void;
  onLocate: () => void;
  onWriteAI: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export const EventView: React.FC<EventViewProps> = ({
  event,
  busy,
  onUpdateField,
  onFindVenue,
  onLocate,
  onWriteAI,
  onSaveDraft,
  onPublish,
}) => {
  const eventTypes: Array<{ label: string; icon: string }> = [
    { label: 'Music', icon: 'ph-music-notes' },
    { label: 'Food', icon: 'ph-bowl-food' },
    { label: 'Culture', icon: 'ph-mask-happy' },
    { label: 'Market', icon: 'ph-storefront' },
    { label: 'Sport', icon: 'ph-soccer-ball' },
  ];

  const radii = ['1 km', '5 km', '20 km', 'Whole city'];

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    event.lng - 0.008
  },${event.lat - 0.005},${event.lng + 0.008},${
    event.lat + 0.005
  }&layer=mapnik&marker=${event.lat},${event.lng}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <span className="text-text-muted text-xs sm:text-sm font-medium">
          Listings / New
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
          Add an event
        </h1>
      </div>

      {/* Section 1: Event Details */}
      <section className="bg-white border border-border-light rounded-2xl p-5 sm:p-6 flex flex-col gap-4.5 shadow-xs">
        <div className="flex items-center gap-2.5 font-semibold text-base text-text-main">
          <i className="ph ph-calendar-star text-xl text-accent-event"></i>
          <span>Event details</span>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-xs sm:text-sm font-semibold text-text-main">
            Event title
          </span>
          <input
            type="text"
            value={event.title}
            onChange={(e) => onUpdateField('title', e.target.value)}
            placeholder="e.g. Gnawa Night in the Medina"
            className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
          />
        </label>

        {/* Event Type Chips */}
        <div className="flex flex-col gap-2">
          <span className="text-xs sm:text-sm font-semibold text-text-main">
            Type
          </span>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((t) => {
              const isSelected = event.type === t.label;
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

        {/* Date, Starts, Ticket Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Date
            </span>
            <input
              type="date"
              value={event.date}
              onChange={(e) => onUpdateField('date', e.target.value)}
              className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Starts
            </span>
            <input
              type="time"
              value={event.time}
              onChange={(e) => onUpdateField('time', e.target.value)}
              className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Ticket price
            </span>
            <input
              type="text"
              value={event.price}
              onChange={(e) => onUpdateField('price', e.target.value)}
              placeholder="e.g. 150 MAD"
              className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            />
          </label>
        </div>
      </section>

      {/* Section 2: Venue & Notification Radius */}
      <section className="bg-white border border-border-light rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center gap-2.5 font-semibold text-base text-text-main">
          <i className="ph ph-map-pin text-xl text-[#12a585]"></i>
          <span>Venue</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <input
            type="text"
            value={event.venue}
            onChange={(e) => onUpdateField('venue', e.target.value)}
            placeholder="Venue or address"
            className="flex-1 min-w-[220px] h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
          />
          <button
            type="button"
            onClick={onFindVenue}
            className="h-11 px-4.5 rounded-full bg-primary-light text-primary-dark font-semibold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-[#ccf0e4] transition-colors whitespace-nowrap"
          >
            <i className="ph ph-magnifying-glass text-base"></i>
            Find venue
          </button>
          <button
            type="button"
            onClick={onLocate}
            className="h-11 px-4.5 rounded-full bg-primary text-[#06251c] font-semibold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-primary-hover transition-colors whitespace-nowrap"
          >
            <i className="ph ph-crosshair text-base"></i>
            I&apos;m at the venue
          </button>
        </div>

        {/* Embedded Map */}
        <div className="relative h-[240px] rounded-xl overflow-hidden bg-page-muted border border-border-light">
          <iframe
            src={mapUrl}
            title="Event Venue Map"
            className="w-full h-full border-0"
          ></iframe>
          <span className="absolute left-3 bottom-3 bg-white/95 rounded-full px-3 py-1.5 text-xs font-medium shadow-md flex items-center gap-1.5 backdrop-blur-xs">
            <i className="ph-fill ph-map-pin text-[#e5484d]"></i>
            {event.lat.toFixed(5)}, {event.lng.toFixed(5)}
          </span>
        </div>

        {/* Push Radius Segment */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Notify travellers within
            </span>
            <span className="text-text-muted text-xs">
              One push to eSIMLive users nearby on the day
            </span>
          </div>
          <div className="inline-flex gap-1 p-1 bg-page-muted rounded-xl">
            {radii.map((rad) => {
              const isSelected = event.radius === rad;
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
            disabled={busy === 'e'}
            className="h-9.5 px-4 rounded-full bg-dark-bg text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-[#1c3a4c] transition-colors whitespace-nowrap"
          >
            <i className="ph ph-sparkle text-primary-accent"></i>
            {busy === 'e' ? 'Writing…' : 'Write with AI'}
          </button>
        </div>

        <textarea
          rows={4}
          value={event.desc}
          onChange={(e) => onUpdateField('desc', e.target.value)}
          placeholder="What should visitors expect? Or let AI write it from the details above."
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
          Publish event
        </button>
      </div>
    </div>
  );
};

