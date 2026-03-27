import React from "react";
import { ArrowRight, Building2, CheckCircle2, Play, TrendingUp } from "lucide-react";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { prefersReducedMotion } from "../../utils/overdrive";

const proofPoints = [
  {
    value: "500+",
    label: "brand teams using campaign workflows",
    icon: Building2,
    iconClass: "ih-icon-chip-brand",
    valueClass: "ih-stat-value-brand",
  },
  {
    value: "10K+",
    label: "influencer profiles organized by niche, platform, and location",
    icon: TrendingUp,
    iconClass: "ih-icon-chip-success",
    valueClass: "ih-stat-value-emerald",
  },
  {
    value: "$2.5M",
    label: "campaign budget tracked with reporting and ROI metrics",
    icon: CheckCircle2,
    iconClass: "ih-icon-chip-warning",
    valueClass: "ih-stat-value-warm",
  },
];

const Hero = () => {
  const handleViewWorkflow = () => {
    document.getElementById("services")?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section
      id="Hero"
      className="ih-section-shell ih-section-tint-brand relative overflow-hidden px-6 pb-20 pt-32 sm:pt-36"
      aria-labelledby="hero-heading"
    >
      <div className="ih-section-beam pointer-events-none absolute inset-x-0 top-0 h-px" />
      <div className="pointer-events-none absolute left-[18%] top-20 h-72 w-72 rounded-full blur-3xl" style={{ background: "var(--ih-aurora-plum)" }} />
      <div className="pointer-events-none absolute right-[12%] top-24 h-56 w-56 rounded-full blur-3xl" style={{ background: "var(--ih-aurora-emerald)" }} />
      <div className="pointer-events-none absolute bottom-10 right-[24%] h-40 w-40 rounded-full blur-3xl" style={{ background: "var(--ih-aurora-warm)" }} />

      <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
        <div className="ih-home-hero-copy max-w-3xl" data-ih-reveal style={{ "--ih-delay": "80ms" }}>
          <p className="ih-kicker ih-kicker-warm mb-6">Campaign management for brands, influencers, and admins</p>

          <h1 id="hero-heading" className="max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Create campaigns, match the right influencers, and track results in one place.
          </h1>

          <p className="ih-text-secondary mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
            InfluenceHub helps brands launch campaigns, helps influencers apply and report results, and gives admins clear oversight.
          </p>

          <div className="ih-home-cta-group mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <TransitionLink to="/auth/register" className="ih-button-primary ih-home-cta ih-focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold">
              Create account
              <ArrowRight size={18} aria-hidden="true" className="ih-home-cta-icon" />
            </TransitionLink>

            <button type="button" onClick={handleViewWorkflow} className="ih-button-secondary ih-home-cta ih-home-cta-secondary ih-focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-medium">
              <Play size={16} aria-hidden="true" className="ih-home-cta-icon" />
              View workflow
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="ih-pill-tint ih-pill-brand">Campaign creation</span>
            <span className="ih-pill-tint ih-pill-emerald">Tag matching</span>
            <span className="ih-pill-tint ih-pill-warm">ROI tracking</span>
          </div>
        </div>

        <aside className="ih-panel-outline ih-hero-panel ih-home-hero-panel rounded-[1.75rem] p-6 sm:p-8" aria-label="Marketplace proof points" data-ih-reveal style={{ "--ih-delay": "180ms" }}>
          <div className="ih-divider-bottom mb-6 pb-5">
            <p className="ih-kicker ih-kicker-warm mb-3">Operational signal</p>
            <p className="text-xl font-semibold text-white sm:text-2xl">One workspace for campaign setup, matching, applications, reporting, and review.</p>
          </div>

          <div className="space-y-5">
            {proofPoints.map((point) => {
              const Icon = point.icon;

              return (
                <div key={point.label} className="ih-home-proof-item flex items-start gap-4">
                  <div className={`ih-icon-chip h-11 w-11 shrink-0 rounded-2xl ${point.iconClass}`}>
                    <Icon size={20} aria-hidden="true" />
                  </div>

                  <div>
                    <p className={`text-2xl font-semibold ${point.valueClass}`}>{point.value}</p>
                    <p className="ih-text-muted mt-1 text-sm leading-6">{point.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ih-divider-top mt-6 pt-5">
            <p className="ih-text-subtle text-sm leading-6">Built for teams that need clear handoffs between brand, influencer, and admin work.</p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Hero;
