'use client';

import React from 'react';
import { PageType, JoinData } from '@/types';

interface HeaderProps {
  page: PageType;
  onNavigate: (page: PageType) => void;
  join: JoinData;
  onSignOut: () => void;
  onToggleMobilePreview?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  page,
  onNavigate,
  join,
  onSignOut,
  onToggleMobilePreview,
}) => {
  const navDefs: [string, PageType, PageType[]][] = [
    ['Listings', 'listings', ['listings', 'restaurant', 'event', 'tour']],
    ['AI studio', 'studio', ['studio']],
    ['Promotions', 'promo', ['promo']],
    ['Insights', 'insights', ['insights']],
  ];

  const initials = join.business
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'DZ';

  return (
    <header className="bg-white border-b border-border-light sticky top-0 z-20 shadow-sm">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 h-[68px] flex items-center justify-between gap-4 md:gap-9">
        {/* Brand / Logo */}
        <div
          onClick={() => onNavigate('listings')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
        >
          {/* Logo Mark */}
          <div className="flex flex-col gap-[3px]">
            <div className="flex gap-[3px]">
              <span className="w-[7px] h-[7px] rounded-full bg-[#5b4be8]"></span>
              <span className="w-[14px] h-[7px] rounded-[4px] bg-gradient-to-r from-[#4f6ef0] to-[#17c99a]"></span>
            </div>
            <div className="flex gap-[3px]">
              <span className="w-[14px] h-[7px] rounded-[4px] bg-gradient-to-r from-[#5b4be8] to-[#3f8fe8]"></span>
              <span className="w-[7px] h-[7px] rounded-full bg-[#17c99a]"></span>
            </div>
            <div className="flex gap-[3px]">
              <span className="w-[7px] h-[7px] rounded-full bg-[#5b4be8]"></span>
              <span className="w-[14px] h-[7px] rounded-[4px] bg-gradient-to-r from-[#4f6ef0] to-[#17c99a]"></span>
            </div>
          </div>
          <span className="font-semibold text-[17px] tracking-[-0.01em] text-text-main">
            eSIMLive <span className="text-[#12a585]">Partners</span>
          </span>
        </div>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden sm:flex items-center gap-1.5 flex-1 flex-wrap overflow-x-auto py-1">
          {navDefs.map(([label, to, activeGroup]) => {
            const isActive = activeGroup.includes(page);
            return (
              <button
                key={to}
                onClick={() => onNavigate(to)}
                className={`h-9 px-3.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-page-muted text-text-main font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text-main hover:bg-page-muted/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Mobile Simulator Trigger + User Profile + Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile phone preview toggle button */}
          {onToggleMobilePreview && (
            <button
              onClick={onToggleMobilePreview}
              title="Preview on phone"
              className="lg:hidden flex items-center gap-1.5 px-3 h-8.5 rounded-full text-xs font-semibold bg-primary-light text-primary-dark border border-primary/20 hover:bg-primary-tint"
            >
              <i className="ph ph-device-mobile text-sm"></i>
              <span className="hidden xs:inline">Live Phone</span>
            </button>
          )}

          {/* User Initials Avatar */}
          <span className="w-8.5 h-8.5 rounded-full bg-primary-light text-primary-active flex items-center justify-center text-xs font-semibold">
            {initials}
          </span>

          {/* Business Name */}
          <span className="hidden md:inline-block text-sm font-medium max-w-[140px] truncate text-text-main">
            {join.business}
          </span>

          {/* Sign Out Button */}
          <button
            onClick={onSignOut}
            title="Sign out"
            className="w-8.5 h-8.5 rounded-full border border-border-light bg-white text-text-muted hover:text-alert-red hover:border-alert-border hover:bg-page-bg transition-colors flex items-center justify-center"
          >
            <i className="ph ph-sign-out text-base"></i>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="sm:hidden flex items-center gap-1 px-4 py-2 border-t border-border-light/60 overflow-x-auto bg-white">
        {navDefs.map(([label, to, activeGroup]) => {
          const isActive = activeGroup.includes(page);
          return (
            <button
              key={to}
              onClick={() => onNavigate(to)}
              className={`h-7.5 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-page-muted text-text-main font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text-main hover:bg-page-muted/60'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

