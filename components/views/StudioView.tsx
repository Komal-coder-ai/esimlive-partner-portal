'use client';

import React from 'react';
import { StudioData } from '@/types';
import { LANGS } from '@/data/constants';

interface StudioViewProps {
  studio: StudioData;
  busy: string;
  onUpdateField: (field: keyof StudioData, value: string | string[]) => void;
  onToggleLanguage: (lang: string) => void;
  onGenerate: () => void;
  onUseInListing: () => void;
  onCopyText: (text: string, lang: string) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  studio,
  busy,
  onUpdateField,
  onToggleLanguage,
  onGenerate,
  onUseInListing,
  onCopyText,
}) => {
  const tones = ['Friendly', 'Premium', 'Family'];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Left Column: AI Studio Controls */}
      <section className="w-full lg:max-w-[420px] rounded-[20px] p-6 sm:p-7 text-white bg-[radial-gradient(circle_at_85%_0%,rgba(23,201,154,0.3),transparent_45%),#0f2533] flex flex-col gap-5 shadow-card">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-primary text-[#06251c] flex items-center justify-center shrink-0">
            <i className="ph-fill ph-sparkle text-2xl"></i>
          </span>
          <div className="flex flex-col">
            <span className="text-xl font-bold leading-tight">
              AI listing studio
            </span>
            <span className="text-dark-muted text-xs sm:text-sm">
              Describe your business in one line
            </span>
          </div>
        </div>

        {/* Natural Language Prompt */}
        <textarea
          rows={4}
          value={studio.prompt}
          onChange={(e) => onUpdateField('prompt', e.target.value)}
          placeholder="e.g. Family-run rooftop café near the Koutoubia. Mint tea, tagines, live oud on Fridays."
          className="p-3.5 border border-white/20 rounded-xl bg-white/6 text-sm leading-relaxed text-white outline-none focus:border-primary-accent transition-all resize-y"
        ></textarea>

        {/* Languages Selection */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs sm:text-sm font-semibold">
            Languages for travellers
          </span>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((lang) => {
              const isSelected = studio.langs.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onToggleLanguage(lang)}
                  className={`h-8.5 px-3.5 rounded-full text-xs sm:text-sm font-medium border flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-[#06251c] font-semibold'
                      : 'border-white/20 bg-transparent text-white hover:bg-white/10'
                  }`}
                >
                  {isSelected && <i className="ph ph-check text-xs"></i>}
                  <span>{lang}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone Selector */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs sm:text-sm font-semibold">Tone</span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-white/8 rounded-xl">
            {tones.map((t) => {
              const isSelected = studio.tone === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onUpdateField('tone', t)}
                  className={`h-8.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-white text-text-main font-semibold shadow-xs'
                      : 'text-dark-muted hover:text-white'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={busy === 'studio'}
          className="h-13 rounded-full bg-primary text-[#06251c] font-semibold text-base cursor-pointer flex items-center justify-center gap-2.5 hover:bg-primary-hover active:bg-primary-active transition-all shadow-btn"
        >
          <i className="ph ph-magic-wand text-lg"></i>
          <span>{busy === 'studio' ? 'Generating…' : 'Generate listing'}</span>
        </button>

        <span className="text-[#9fb2bb] text-xs">
          You review everything before it goes live in the app.
        </span>
      </section>

      {/* Right Column: Generated Listing Results */}
      <section className="flex-1 w-full flex flex-col gap-4">
        <span className="text-text-muted text-xs sm:text-sm font-medium">
          Generated listing
        </span>

        {/* Title, Tagline & "Use in listing" button */}
        <div className="flex justify-between items-start gap-4 flex-wrap bg-white p-5 rounded-2xl border border-border-light">
          <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
            <input
              type="text"
              value={studio.title}
              onChange={(e) => onUpdateField('title', e.target.value)}
              className="font-bold text-2xl sm:text-[28px] tracking-tight text-text-main border-0 bg-transparent p-0 outline-none w-full"
            />
            <input
              type="text"
              value={studio.tagline}
              onChange={(e) => onUpdateField('tagline', e.target.value)}
              className="text-sm sm:text-[15px] text-text-sub border-0 bg-transparent p-0 outline-none w-full"
            />
          </div>
          <button
            type="button"
            onClick={onUseInListing}
            className="h-11 px-5 rounded-full bg-primary text-[#06251c] font-semibold text-sm inline-flex items-center gap-2 hover:bg-primary-hover transition-colors whitespace-nowrap shadow-xs"
          >
            <i className="ph ph-arrow-bend-down-right text-base"></i>
            Use in listing
          </button>
        </div>

        {/* Generated Keyword Tags */}
        <div className="flex flex-wrap gap-2">
          {studio.tags.map((tg, i) => (
            <span
              key={i}
              className="text-xs sm:text-[13px] font-semibold text-primary-dark bg-primary-light px-3 py-1.5 rounded-full"
            >
              # {tg}
            </span>
          ))}
        </div>

        {/* Multilingual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {studio.langs.map((l) => {
            const text =
              studio.texts[l] ||
              'Press Generate listing to write this language.';
            const isRtl = l === 'العربية';
            return (
              <div
                key={l}
                className="bg-white border border-border-light rounded-2xl p-4.5 flex flex-col gap-3 shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-primary-accent bg-dark-bg px-2.5 py-1 rounded-md">
                    {l}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCopyText(text, l)}
                    title={`Copy ${l} text`}
                    className="p-1.5 text-text-muted hover:text-primary-active transition-colors text-base"
                  >
                    <i className="ph ph-copy"></i>
                  </button>
                </div>
                <p
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className="text-sm leading-relaxed text-text-main text-pretty m-0"
                >
                  {text}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

