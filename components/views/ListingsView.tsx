'use client';

import React from 'react';
import { PageType, PublishedItem, JoinData } from '@/types';

interface ListingsViewProps {
  join: JoinData;
  published: PublishedItem[];
  onNavigate: (page: PageType) => void;
  onRemoveItem: (id: string) => void;
}

export const ListingsView: React.FC<ListingsViewProps> = ({
  join,
  published,
  onNavigate,
  onRemoveItem,
}) => {
  const addCards: Array<{
    label: string;
    sub: string;
    icon: string;
    color: string;
    to: PageType;
  }> = [
    {
      label: 'Restaurant',
      sub: 'Menu, hours, price and a traveller offer',
      icon: 'ph-fork-knife',
      color: '#17c99a',
      to: 'restaurant',
    },
    {
      label: 'Event',
      sub: 'Date, venue and one push on the day',
      icon: 'ph-calendar-star',
      color: '#d6336c',
      to: 'event',
    },
    {
      label: 'Tour & experience',
      sub: 'Multi-day routes, stops and pickup',
      icon: 'ph-compass',
      color: '#e8730c',
      to: 'tour',
    },
    {
      label: 'Flash promotion',
      sub: 'An instant offer to phones nearby',
      icon: 'ph-lightning',
      color: '#6c5ce7',
      to: 'promo',
    },
    {
      label: 'AI listing studio',
      sub: 'One line in, every language out',
      icon: 'ph-sparkle',
      color: '#0f2533',
      to: 'studio',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <span className="text-text-muted text-xs sm:text-sm font-medium">
          Welcome, {join.contact || 'Partner'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
          Your listings
        </h1>
      </div>

      {/* Quick Add Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {addCards.map((card) => (
          <button
            key={card.label}
            onClick={() => onNavigate(card.to)}
            className="text-left bg-white border border-border-light rounded-2xl p-5 flex flex-col gap-3.5 cursor-pointer text-text-main hover:border-primary hover:shadow-md transition-all group"
          >
            <span
              className="w-10.5 h-10.5 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform"
              style={{ backgroundColor: card.color }}
            >
              <i className={`ph ${card.icon} text-xl`}></i>
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-sm sm:text-[15px] text-text-main">
                {card.label}
              </span>
              <span className="text-text-muted text-xs leading-snug">
                {card.sub}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Published Listings Feed */}
      <div className="bg-white border border-border-light rounded-2xl p-4 sm:px-6 divide-y divide-border-light">
        {published.length === 0 ? (
          <div className="py-10 text-text-muted text-center text-xs sm:text-sm">
            Nothing live yet. Publish a listing and it appears in the app
            preview straight away.
          </div>
        ) : (
          published.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3.5 py-4 first:pt-2 last:pb-2"
            >
              <span
                className="w-10 h-10 shrink-0 rounded-xl text-white flex items-center justify-center shadow-xs"
                style={{ backgroundColor: item.color }}
              >
                <i className={`ph ${item.icon} text-lg`}></i>
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="font-semibold text-sm text-text-main truncate">
                  {item.title}
                </span>
                <span className="text-text-muted text-xs truncate">
                  {item.sub}
                </span>
              </div>
              <span className="text-xs font-semibold text-primary-active bg-primary-light px-2.5 py-1 rounded-full whitespace-nowrap">
                {item.status}
              </span>
              <button
                onClick={() => onRemoveItem(item.id)}
                title="Remove listing"
                className="w-8.5 h-8.5 rounded-full border border-border-light bg-white text-text-muted hover:text-alert-red hover:border-alert-border hover:bg-alert-bg transition-colors flex items-center justify-center shrink-0"
              >
                <i className="ph ph-trash text-sm"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

