'use client';

import React from 'react';
import { InsightsConfig } from '@/types';
import { PERIODS, METRICS, LIKED, series, fmt } from '@/data/constants';

interface InsightsViewProps {
  insights: InsightsConfig;
  busy: string;
  onUpdatePeriod: (period: 'Week' | 'Month' | 'Year') => void;
  onUpdateMetric: (metric: string) => void;
  onToggleFeature: (item: string) => void;
  onRefreshRec: () => void;
  onApplyRec: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  insights,
  busy,
  onUpdatePeriod,
  onUpdateMetric,
  onToggleFeature,
  onRefreshRec,
  onApplyRec,
}) => {
  const P = PERIODS[insights.period];
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

  // Compute KPI cards
  const kpis = METRICS.map((m) => {
    const s = series(insights.period, m.label);
    const c = sum(s.cur);
    const p = sum(s.prev);
    const d = Math.round(((c - p) / (p || 1)) * 100);
    const isActive = insights.metric === m.label;
    return {
      label: m.label,
      icon: m.icon,
      value: fmt(c),
      delta: (d >= 0 ? '▲ ' : '▼ ') + Math.abs(d) + '% vs last ' + P.unit,
      isPositive: d >= 0,
      isActive,
      onClick: () => onUpdateMetric(m.label),
    };
  });

  // Compute chart series
  const s = series(insights.period, insights.metric);
  const max = Math.max(...s.cur, ...s.prev) || 1;
  const best = s.cur.indexOf(Math.max(...s.cur));

  // Compute footfall gap for AI recommendation
  const w = series('Week', 'Visits').cur;
  const wkday = sum(w.slice(0, 4)) / 4;
  const wkend = sum(w.slice(4)) / 3;
  const gap = Math.round((1 - wkday / (wkend || 1)) * 100);

  const defaultRec = {
    title: `Weekday visits are ${gap}% lower than weekends. Offer a Monday–Thursday promotion.`,
    body: `Fridays to Sundays are busy, but Monday to Thursday has room to spare. A 15% weekday offer sent to travellers within 5 km at lunchtime could fill those quieter tables.`,
  };

  const rec = insights.rec || defaultRec;
  const reviewsTotal = sum(series(insights.period, 'Reviews').cur);

  const rangeLabels: Record<string, string> = {
    Week: 'Last 7 days',
    Month: 'Last 4 weeks',
    Year: 'Last 12 months',
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Title & Period Selector */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs sm:text-sm font-medium">
            {rangeLabels[insights.period]}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
            Insights
          </h1>
        </div>

        <div className="inline-flex gap-1 p-1 bg-page-muted rounded-xl">
          {(['Week', 'Month', 'Year'] as const).map((p) => {
            const isSelected = insights.period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onUpdatePeriod(p)}
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

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={k.onClick}
            className={`text-left rounded-2xl p-4 flex flex-col gap-1.5 transition-all cursor-pointer ${
              k.isActive
                ? 'bg-white border-1.5 border-primary shadow-glow'
                : 'bg-white border border-border-light hover:border-primary/50'
            }`}
          >
            <span className="flex items-center gap-2 text-xs font-medium text-text-muted truncate">
              <i className={`ph ${k.icon} text-base text-[#12a585] shrink-0`}></i>
              <span className="truncate">{k.label}</span>
            </span>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-text-main">
              {k.value}
            </span>
            <span
              className={`text-xs font-semibold ${
                k.isPositive ? 'text-primary-dark' : 'text-alert-red'
              }`}
            >
              {k.delta}
            </span>
          </button>
        ))}
      </div>

      {/* Comparison Bar Chart */}
      <section className="bg-white border border-border-light rounded-2xl p-5 sm:p-6 flex flex-col gap-4.5 shadow-xs">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-base text-text-main">
              {insights.metric} · this {P.unit} vs last {P.unit}
            </span>
            <span className="text-text-muted text-xs">
              Busiest: {P.labels[best]} with {fmt(s.cur[best])}{' '}
              {insights.metric.toLowerCase()}
            </span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-primary"></span>
              This {P.unit}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-dark-muted"></span>
              Last {P.unit}
            </span>
          </div>
        </div>

        {/* Bars Container */}
        <div className="flex items-end gap-1.5 sm:gap-2 h-52 pt-2 border-b border-border-light">
          {P.labels.map((label, i) => {
            const curH = Math.max(4, (s.cur[i] / max) * 100);
            const prevH = Math.max(4, (s.prev[i] / max) * 100);
            const tooltip = `${label}: ${fmt(s.cur[i])} this ${P.unit}, ${fmt(
              s.prev[i]
            )} last ${P.unit}`;
            return (
              <div
                key={label}
                title={tooltip}
                className="flex-1 min-w-0 h-full flex items-end justify-center gap-1 group cursor-pointer"
              >
                {/* Prev bar */}
                <span
                  style={{ height: `${prevH}%` }}
                  className="w-2.5 sm:w-4 rounded-t bg-dark-muted transition-all duration-300 group-hover:bg-dark-muted/80"
                ></span>
                {/* Cur bar */}
                <span
                  style={{ height: `${curH}%` }}
                  className="w-2.5 sm:w-4 rounded-t bg-primary transition-all duration-300 group-hover:bg-primary-hover"
                ></span>
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels */}
        <div className="flex gap-1.5 sm:gap-2 -mt-2">
          {P.labels.map((label) => (
            <span
              key={label}
              className="flex-1 min-w-0 text-center text-[10px] sm:text-xs text-text-muted overflow-hidden truncate"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* 2 Bottom Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* Left: AI Recommendation Card */}
        <section className="rounded-2xl p-6 text-white bg-[radial-gradient(circle_at_90%_0%,rgba(23,201,154,0.3),transparent_45%),#0f2533] flex flex-col justify-between gap-4 shadow-card">
          <div className="flex items-center justify-between gap-2.5">
            <span className="flex items-center gap-2.5 font-semibold text-base">
              <span className="w-8.5 h-8.5 rounded-xl bg-primary text-[#06251c] flex items-center justify-center shrink-0">
                <i className="ph-fill ph-sparkle text-lg"></i>
              </span>
              <span>AI recommendation</span>
            </span>

            <button
              type="button"
              onClick={onRefreshRec}
              disabled={busy === 'ins'}
              className="h-8 px-3 rounded-full border border-white/25 bg-transparent text-white font-semibold text-xs inline-flex items-center gap-1.5 hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              <i className="ph ph-arrows-clockwise text-xs"></i>
              <span>{busy === 'ins' ? 'Thinking…' : 'Ask again'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-base sm:text-lg font-semibold leading-snug text-pretty">
              {rec.title}
            </span>
            <p className="text-xs sm:text-sm leading-relaxed text-dark-muted text-pretty m-0">
              {rec.body}
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={onApplyRec}
              className="h-11 px-5 rounded-full bg-primary text-[#06251c] font-semibold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-primary-hover transition-colors whitespace-nowrap shadow-xs"
            >
              <i className="ph-fill ph-lightning"></i>
              <span>Create weekday promotion</span>
            </button>
          </div>
        </section>

        {/* Right: What People Liked Sentiment Card */}
        <section className="bg-white border border-border-light rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-2.5 font-semibold text-base text-text-main">
              <i className="ph-fill ph-heart text-xl text-accent-event"></i>
              <span>What people liked</span>
            </span>
            <span className="text-text-muted text-xs">
              From {fmt(reviewsTotal)} reviews this {P.unit}. Star items to
              feature them on your app card.
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {LIKED.map(([label, k]) => {
              const isStarred = insights.featured.includes(label);
              const count = Math.max(1, Math.round(reviewsTotal * k * 2.4));
              const barPercent = (k / LIKED[0][1]) * 100;
              return (
                <div key={label} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleFeature(label)}
                    title="Feature on app card"
                    className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isStarred
                        ? 'border-star-border bg-star-bg text-star-text shadow-xs'
                        : 'border-border-light bg-white text-text-dim hover:text-star-text'
                    }`}
                  >
                    <i
                      className={`${
                        isStarred ? 'ph-fill ph-star' : 'ph ph-star'
                      } text-base`}
                    ></i>
                  </button>

                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="font-medium text-text-main truncate">
                        {label}
                      </span>
                      <span className="text-text-muted whitespace-nowrap">
                        {count} likes
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-page-muted overflow-hidden">
                      <div
                        style={{ width: `${barPercent}%` }}
                        className="h-full rounded-full bg-accent-event"
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

