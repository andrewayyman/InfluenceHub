import React from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { prefersReducedMotion } from "../../utils/overdrive";

/* ─── Proof-point data ────────────────────────────────────────────────────── */
const proofPoints = [
  {
    value: "500+",
    label: "Brand teams",
    sub: "running live campaigns",
    icon: Building2,
    iconClass: "ih-icon-chip-brand",
    valueClass: "ih-stat-value-brand",
  },
  {
    value: "10K+",
    label: "Influencer profiles",
    sub: "matched by niche & platform",
    icon: TrendingUp,
    iconClass: "ih-icon-chip-success",
    valueClass: "ih-stat-value-emerald",
  },
  {
    value: "$2.5M",
    label: "Budget tracked",
    sub: "with ROI reporting",
    icon: CheckCircle2,
    iconClass: "ih-icon-chip-warning",
    valueClass: "ih-stat-value-warm",
  },
];

/* ─── Feature pills ───────────────────────────────────────────────────────── */
const featurePills = [
  { label: "Campaign creation", cls: "ih-pill-brand" },
  { label: "Smart matching", cls: "ih-pill-emerald" },
  { label: "ROI tracking", cls: "ih-pill-warm" },
];

/* ─── Hero ────────────────────────────────────────────────────────────────── */
const Hero = () => {
  const handleScrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section
      id="Hero"
      className="ih-section-shell ih-hero-section relative overflow-hidden px-6 pb-24 pt-36 sm:pt-44"
      aria-labelledby="hero-heading"
    >
      {/* ── Decorative beam at top ── */}
      <div
        className="ih-section-beam pointer-events-none absolute inset-x-0 top-0 h-px"
        aria-hidden="true"
      />

      {/* ── Ambient aurora orbs ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-28 h-[28rem] w-[28rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(147 51 234 / 0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: prefersReducedMotion()
            ? "none"
            : "ih-home-orb-drift 20s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[6%] top-32 h-[22rem] w-[22rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(16 185 129 / 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: prefersReducedMotion()
            ? "none"
            : "ih-home-orb-drift 16s 2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-16 left-[38%] h-[18rem] w-[18rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(245 158 11 / 0.12) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: prefersReducedMotion()
            ? "none"
            : "ih-home-orb-drift 14s 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative mx-auto max-w-5xl text-center">
        {/* Kicker badge */}
        <div
          className="ih-hero-kicker-badge inline-flex items-center gap-2 mb-8"
          data-ih-reveal
          style={{ "--ih-delay": "60ms" }}
        >
          <Zap size={13} className="ih-hero-kicker-icon" aria-hidden="true" />
          <span>Campaign management for brands, influencers &amp; admins</span>
        </div>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="ih-hero-headline mb-7"
          data-ih-reveal
          style={{ "--ih-delay": "130ms" }}
        >
          Create campaigns.{" "}
          <span className="ih-hero-headline-accent">Match influencers.</span>{" "}
          Track results.
        </h1>

        {/* Supporting text */}
        <p
          className="ih-text-secondary mx-auto mb-10 max-w-2xl text-lg leading-8 sm:text-xl"
          data-ih-reveal
          style={{ "--ih-delay": "200ms" }}
        >
          InfluenceHub is the unified workspace where brands launch campaigns,
          influencers apply and report results, and admins maintain full
          oversight — all in one place.
        </p>

        {/* CTA group */}
        <div
          className="ih-hero-cta-group mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          data-ih-reveal
          style={{ "--ih-delay": "280ms" }}
        >
          <TransitionLink
            to="/auth/register"
            id="hero-cta-register"
            className="ih-button-primary ih-hero-cta ih-focus-ring inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-3.5 text-base font-semibold"
          >
            Get started free
            <ArrowRight
              size={17}
              aria-hidden="true"
              className="ih-home-cta-icon"
            />
          </TransitionLink>

          <button
            type="button"
            id="hero-cta-workflow"
            onClick={handleScrollToServices}
            className="ih-button-secondary ih-hero-cta ih-hero-cta-secondary ih-focus-ring inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-3.5 text-base font-medium"
          >
            <ChevronDown size={16} aria-hidden="true" className="ih-home-cta-icon ih-hero-cta-secondary-icon" />
            Explore workflows
          </button>
        </div>

        {/* Feature pills */}
        <div
          className="mb-20 flex flex-wrap justify-center gap-2.5"
          data-ih-reveal
          style={{ "--ih-delay": "340ms" }}
        >
          {featurePills.map((pill) => (
            <span
              key={pill.label}
              className={`ih-pill-tint ${pill.cls}`}
            >
              {pill.label}
            </span>
          ))}
        </div>

        {/* ── Proof points strip ── */}
        <div
          className="ih-hero-proof-strip"
          data-ih-reveal
          style={{ "--ih-delay": "420ms" }}
          aria-label="Platform statistics"
        >
          {proofPoints.map((point, i) => {
            const Icon = point.icon;
            return (
              <React.Fragment key={point.label}>
                {/* Separator */}
                {i > 0 && (
                  <div
                    className="ih-hero-proof-divider"
                    aria-hidden="true"
                  />
                )}
                <div className="ih-hero-proof-item">
                  <div
                    className={`ih-icon-chip h-10 w-10 shrink-0 rounded-xl ${point.iconClass}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <p className={`text-2xl font-bold leading-none ${point.valueClass}`}>
                      {point.value}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white/90">
                      {point.label}
                    </p>
                    <p className="ih-text-muted text-xs leading-5">
                      {point.sub}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Hero;
