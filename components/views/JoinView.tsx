'use client';

import React from 'react';
import { JoinData } from '@/types';
import { CATS, COUNTRIES } from '@/data/constants';

interface JoinViewProps {
  join: JoinData;
  joinError: string;
  onUpdateField: (field: keyof JoinData, value: string | boolean) => void;
  onSubmit: () => void;
  onSignIn: () => void;
}

export const JoinView: React.FC<JoinViewProps> = ({
  join,
  joinError,
  onUpdateField,
  onSubmit,
  onSignIn,
}) => {
  return (
    <div className="flex flex-col lg:flex-row bg-white rounded-[20px] overflow-hidden shadow-card border border-border-light">
      {/* Left Column: Visual Brand Hero & Features */}
      <div className="flex-1 lg:max-w-[420px] p-8 md:p-10 text-white bg-[radial-gradient(circle_at_80%_8%,rgba(23,201,154,0.35),transparent_40%),radial-gradient(circle_at_10%_100%,rgba(63,143,232,0.3),transparent_45%),#0f2533] flex flex-col justify-between gap-8">
        <div className="flex flex-col gap-6">
          {/* Logo badge */}
          <div className="flex items-center gap-2.5">
            <span className="w-9.5 h-9.5 rounded-xl bg-white flex items-center justify-center shadow-xs">
              <span className="flex flex-col gap-[2px]">
                <span className="flex gap-[2px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5b4be8]"></span>
                  <span className="w-2.5 h-1.5 rounded-[3px] bg-gradient-to-r from-[#4f6ef0] to-[#17c99a]"></span>
                </span>
                <span className="flex gap-[2px]">
                  <span className="w-2.5 h-1.5 rounded-[3px] bg-[#4f6ef0]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#17c99a]"></span>
                </span>
                <span className="flex gap-[2px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5b4be8]"></span>
                  <span className="w-2.5 h-1.5 rounded-[3px] bg-gradient-to-r from-[#4f6ef0] to-[#17c99a]"></span>
                </span>
              </span>
            </span>
            <span className="font-semibold text-lg">
              eSIMLive <span className="text-primary-accent">Partners</span>
            </span>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <span className="text-xs font-semibold tracking-[0.14em] text-primary-accent uppercase">
              FOR LOCAL BUSINESSES
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.15] text-balance">
              Put your business on every visitor&apos;s phone.
            </h1>
            <p className="text-sm md:text-[15px] leading-relaxed text-dark-muted text-pretty">
              List once. Your restaurant, event or tour shows up in the eSIMLive
              app for travellers who are nearby, right when they are deciding.
            </p>
          </div>
        </div>

        {/* 4 Feature Steps */}
        <div className="flex flex-col gap-3.5 my-2">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-primary/15 text-primary-accent flex items-center justify-center shrink-0">
              <i className="ph ph-identification-card text-lg"></i>
            </span>
            <span className="text-sm">
              <b className="text-white">Sign up</b> with your company details
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-primary/15 text-primary-accent flex items-center justify-center shrink-0">
              <i className="ph ph-map-pin text-lg"></i>
            </span>
            <span className="text-sm">
              <b className="text-white">Pin your location</b> in one click
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-primary/15 text-primary-accent flex items-center justify-center shrink-0">
              <i className="ph ph-sparkle text-lg"></i>
            </span>
            <span className="text-sm">
              <b className="text-white">Let AI write</b> your listing in every language
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-primary/15 text-primary-accent flex items-center justify-center shrink-0">
              <i className="ph ph-device-mobile text-lg"></i>
            </span>
            <span className="text-sm">
              <b className="text-white">Go live</b> in the eSIMLive app
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex-[1.3] p-6 sm:p-8 md:p-10 flex flex-col gap-5">
        <div className="flex justify-end items-center gap-2.5">
          <span className="text-text-muted text-xs sm:text-sm">
            Already a partner?
          </span>
          <button
            onClick={onSignIn}
            className="h-9 px-4 rounded-full border border-border-input bg-white text-xs sm:text-sm font-semibold text-text-main hover:bg-page-muted transition-colors"
          >
            Sign in
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-text-main">
            Create your partner account
          </h2>
          <span className="text-text-muted text-xs sm:text-sm">
            Free to join. Takes about two minutes.
          </span>
        </div>

        {/* Business Name */}
        <label className="flex flex-col gap-2">
          <span className="text-xs sm:text-sm font-semibold text-text-main">
            Business name
          </span>
          <input
            type="text"
            value={join.business}
            onChange={(e) => onUpdateField('business', e.target.value)}
            placeholder="e.g. Dar Zellij Rooftop"
            className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
          />
        </label>

        {/* Categories Grid */}
        <div className="flex flex-col gap-2">
          <span className="text-xs sm:text-sm font-semibold text-text-main">
            Category
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CATS.map((c) => {
              const isSelected = join.category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onUpdateField('category', c.id)}
                  className={`flex flex-col items-center gap-2 p-3 sm:py-3.5 rounded-xl border transition-all text-xs sm:text-sm ${
                    isSelected
                      ? 'border-1.5 border-primary bg-primary-tint text-primary-dark font-semibold shadow-xs'
                      : 'border-border-input bg-white text-text-main font-medium hover:border-primary/50'
                  }`}
                >
                  <i className={`ph ${c.icon} text-xl sm:text-2xl`}></i>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact & Legal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Contact name
            </span>
            <input
              type="text"
              value={join.contact}
              onChange={(e) => onUpdateField('contact', e.target.value)}
              className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Business licence no.
            </span>
            <input
              type="text"
              value={join.licence}
              onChange={(e) => onUpdateField('licence', e.target.value)}
              className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Email
            </span>
            <input
              type="email"
              value={join.email}
              onChange={(e) => onUpdateField('email', e.target.value)}
              className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Phone / WhatsApp
            </span>
            <input
              type="tel"
              value={join.phone}
              onChange={(e) => onUpdateField('phone', e.target.value)}
              className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              City
            </span>
            <input
              type="text"
              value={join.city}
              onChange={(e) => onUpdateField('city', e.target.value)}
              className="h-11 px-3.5 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-main">
              Country
            </span>
            <select
              value={join.country}
              onChange={(e) => onUpdateField('country', e.target.value)}
              className="h-11 px-3 border border-border-input rounded-xl text-sm text-text-main bg-white outline-none focus:border-primary focus:shadow-glow transition-all"
            >
              {COUNTRIES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Agreement Checkbox */}
        <label className="flex items-center gap-2.5 cursor-pointer text-text-sub text-xs sm:text-sm select-none">
          <input
            type="checkbox"
            checked={join.agree}
            onChange={(e) => onUpdateField('agree', e.target.checked)}
            className="w-4.5 h-4.5 accent-primary rounded cursor-pointer"
          />
          <span>I agree to the eSIMLive partner terms</span>
        </label>

        {/* Validation error message */}
        {joinError && (
          <span className="text-alert-red text-xs sm:text-sm font-medium">
            {joinError}
          </span>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="button"
            onClick={onSubmit}
            className="h-12 px-7 rounded-full bg-primary text-[#06251c] font-semibold text-sm sm:text-base cursor-pointer inline-flex items-center gap-2.5 shadow-btn hover:bg-primary-hover active:bg-primary-active transition-all"
          >
            <span>Create partner account</span>
            <i className="ph ph-arrow-right text-base"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

