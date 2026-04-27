import React from "react";
import { AlertCircle, LoaderCircle, Search, Sparkles } from "lucide-react";
import { useCountUp } from "../hooks/useCountUp";
import { formatCompactNumber } from "../utils/formatters";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const panelToneClasses = {
  default: "ih-table-panel",
  brand: "ih-table-panel ih-table-panel-brand",
  emerald: "ih-table-panel ih-table-panel-emerald",
};

const badgeToneClasses = {
  neutral: "ih-status-pill-neutral",
  brand: "ih-status-pill-brand",
  emerald: "ih-status-pill-emerald",
  success: "ih-status-pill-success",
  warning: "ih-status-pill-warning",
  danger: "ih-status-pill ih-status-pill-warning text-[var(--ih-status-danger-text)] bg-[var(--ih-status-danger-bg)]",
};

export const AdminPage = ({ children }) => (
  <div className="ih-app-shell ih-motion-stage min-h-screen px-4 py-8 sm:px-6 sm:py-10 lg:px-12">
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 ih-min-0">
      {children}
    </div>
  </div>
);

export const AdminHero = ({ badges = [], children, description, kicker, title, aside }) => (
  <section className="ih-dashboard-hero ih-auto-content grid gap-8 rounded-[2rem] p-6 sm:p-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] ih-grid-min" data-ih-reveal>
    <div className="ih-min-0">
      <p className="ih-kicker ih-kicker-warm mb-4 ih-truncate" title={kicker}>{kicker}</p>
      <h1 className="ih-text-primary max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-[2.75rem] ih-clamp-3">
        {title}
      </h1>
      <p className="ih-text-secondary mt-5 max-w-2xl text-base leading-7 sm:text-lg ih-wrap ih-clamp-3" title={description}>
        {description}
      </p>
      {badges.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {badges.map((badge) => (
            <span key={badge.label} className={cx("ih-pill-tint ih-truncate", badge.className)} title={badge.label}>
              {badge.label}
            </span>
          ))}
        </div>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>

    <div className="ih-dashboard-hero-aside ih-grid-min rounded-[1.5rem] p-5 sm:p-6">
      {aside}
    </div>
  </section>
);

export const AdminPanel = ({ children, className, tone = "default" }) => (
  <section className={cx(panelToneClasses[tone] || panelToneClasses.default, "ih-auto-content rounded-[1.75rem] p-4 sm:p-6 ih-grid-min", className)} data-ih-reveal>
    {children}
  </section>
);

export const AdminPanelHeader = ({ description, kicker, title, actions }) => (
  <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div className="ih-min-0">
      {kicker ? <p className="ih-kicker mb-2 ih-truncate" title={kicker}>{kicker}</p> : null}
      <h2 className="ih-text-primary text-xl font-semibold ih-clamp-2" title={title}>{title}</h2>
      {description ? <p className="ih-text-muted mt-2 max-w-2xl text-sm leading-6 ih-wrap ih-clamp-2" title={description}>{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
  </div>
);

export const AdminMetricCard = ({ accentClass, icon, index = 0, label, note, value }) => {
  const Icon = icon;
  const numericValue = typeof value === "number" ? value : Number(value || 0);
  const animatedValue = useCountUp(numericValue, { duration: 900 + (index * 120) });
  const displayValue = formatCompactNumber(animatedValue);

  return (
    <div className={cx("ih-metric-card ih-panel-hover ih-auto-content rounded-2xl p-5 sm:p-6", accentClass)} data-ih-reveal>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="ih-text-muted text-sm">{label}</p>
          <h3 className="mt-1 text-3xl font-bold ih-truncate" title={displayValue}>{displayValue}</h3>
        </div>
        <div className="ih-icon-chip ih-icon-chip-brand h-12 w-12">
          <Icon size={22} aria-hidden="true" />
        </div>
      </div>
      <p className="ih-text-secondary mt-3 text-sm leading-6 ih-wrap ih-clamp-2" title={note}>{note}</p>
    </div>
  );
};

export const StatusBadge = ({ children, tone = "neutral" }) => (
  <span className={cx("ih-status-pill", badgeToneClasses[tone] || badgeToneClasses.neutral)}>
    {children}
  </span>
);

export const SearchField = ({ onChange, placeholder, value }) => (
  <label className="relative block min-w-0 flex-1 ih-min-0 sm:min-w-[16rem]">
    <Search size={16} className="ih-text-muted absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
    <span className="sr-only">Search</span>
    <input
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={placeholder || "Search"}
      className="ih-input ih-focus-ring w-full py-3 pl-10 pr-4 text-sm"
    />
  </label>
);

export const FilterTabs = ({ items, label = "Filter results", onSelect, value }) => (
  <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
    {items.map((item) => {
      const isActive = item.value === value;

      return (
        <button
          key={item.label}
          type="button"
          onClick={() => onSelect(item.value)}
          aria-pressed={isActive}
          className={cx(
            "ih-focus-ring rounded-full px-3 py-2 text-sm transition",
            isActive
              ? "ih-nav-link-active"
              : "ih-nav-link-inactive border border-white/8 bg-white/4",
          )}
        >
          {item.label}
        </button>
      );
    })}
  </div>
);

export const EmptyState = ({ action, description, title, icon: Icon = Sparkles }) => (
  <div className="flex flex-col items-center justify-center gap-5 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center ih-min-0 transition-colors hover:bg-white/[0.03]">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/50 ring-8 ring-white/5">
      <Icon size={24} aria-hidden="true" />
    </div>
    <div className="max-w-md">
      <h3 className="ih-text-primary text-xl font-semibold ih-clamp-2" title={title}>{title}</h3>
      <p className="ih-text-muted mt-3 text-sm leading-relaxed ih-wrap ih-clamp-3" title={description}>{description}</p>
    </div>
    {action ? <div className="mt-2">{action}</div> : null}
  </div>
);

export const LoadingState = ({ label = "Loading workspace data..." }) => (
  <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/8 bg-white/4 px-4 py-4 ih-min-0" role="status" aria-live="polite">
    <LoaderCircle size={18} className="ih-text-secondary motion-safe:animate-spin" aria-hidden="true" />
    <p className="ih-text-muted text-sm">{label}</p>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col gap-4 rounded-[1.5rem] border border-red-400/20 bg-red-500/8 px-5 py-5" role="alert">
    <div className="flex items-start gap-3">
      <div className="ih-icon-chip ih-icon-chip-danger h-10 w-10 rounded-2xl">
        <AlertCircle size={18} aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">This section could not load.</h3>
        <p className="ih-text-muted mt-1 text-sm leading-6">{message}</p>
      </div>
    </div>
    {onRetry ? (
      <button type="button" onClick={onRetry} className="ih-button-secondary ih-focus-ring w-fit px-4 py-2 text-sm">
        Try again
      </button>
    ) : null}
  </div>
);
