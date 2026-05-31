import React from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { prefersReducedMotion } from "../../utils/overdrive";
import { motion } from "framer-motion";

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

/* ─── Animation Variants ─────────────────────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

/* ─── Hero ────────────────────────────────────────────────────────────────── */
const Hero = () => {
  const isReducedMotion = prefersReducedMotion();

  return (
    <section
      id="Hero"
      className="ih-section-shell ih-hero-section relative overflow-hidden px-6 pb-24 pt-36 sm:pt-44 min-h-[90vh] flex items-center justify-center"
      aria-labelledby="hero-heading"
    >
      {/* ── Decorative beam at top ── */}
      <div
        className="ih-section-beam pointer-events-none absolute inset-x-0 top-0 h-px"
        aria-hidden="true"
      />

      {/* ── Background Grid & Noise ── */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>

      {/* ── Ambient aurora orbs (Animated via Framer Motion) ── */}
      {!isReducedMotion && (
        <>
          <motion.div
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
            className="pointer-events-none absolute left-[5%] top-20 h-[32rem] w-[32rem] rounded-full"
            style={{
              background: "radial-gradient(circle, var(--ih-aurora-plum) 0%, transparent 70%)",
              filter: "blur(70px)",
            }}
          />
          <motion.div
            animate={{
              y: [0, 40, 0],
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            aria-hidden="true"
            className="pointer-events-none absolute right-[2%] top-10 h-[28rem] w-[28rem] rounded-full"
            style={{
              background: "radial-gradient(circle, var(--ih-aurora-emerald) 0%, transparent 70%)",
              filter: "blur(70px)",
            }}
          />
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 20, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-10 left-[40%] h-[20rem] w-[20rem] rounded-full"
            style={{
              background: "radial-gradient(circle, var(--ih-aurora-warm) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </>
      )}

      {/* ── Main content ── */}
      <motion.div 
        className="relative mx-auto max-w-5xl text-center z-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Kicker badge */}
        <motion.div variants={fadeInUp} className="flex justify-center mb-8">
          <div className="ih-hero-kicker-badge inline-flex items-center gap-2 bg-white/70 backdrop-blur-md px-5 py-2 rounded-full border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">
              Platform Overview
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          id="hero-heading"
          variants={fadeInUp}
          className="ih-hero-headline mb-8 text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-[5rem] leading-[1.1]"
        >
          Create campaigns. <br className="hidden sm:block" />
          <span className="relative inline-block">
            <span className="absolute -inset-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-emerald-500/20 blur-xl opacity-50"></span>
            <span className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              Match influencers.
            </span>
          </span>{" "}
          <br className="hidden sm:block" />
          Track results.
        </motion.h1>

        {/* Supporting text */}
        <motion.p
          variants={fadeInUp}
          className="ih-text-secondary mx-auto mb-12 max-w-2xl text-lg leading-relaxed sm:text-xl font-medium"
        >
          The all-in-one platform to launch high-converting campaigns, connect with top-tier influencers, and measure ROI with precision.
        </motion.p>

        {/* CTA group */}
        <motion.div
          variants={fadeInUp}
          className="ih-hero-cta-group mb-16 flex flex-col items-center gap-5 sm:flex-row sm:justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <TransitionLink
              to="/auth/register"
              id="hero-cta-register"
              className="group relative inline-flex items-center justify-center gap-3 rounded-2xl px-10 py-4 text-lg font-bold text-white overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_10px_40px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(124,58,237,0.6)] transition-all duration-300"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[ih-trace-sheen_1.5s_ease-in-out_infinite]" />
              <span className="relative">Start</span>
              <ArrowRight
                size={20}
                aria-hidden="true"
                className="relative transition-transform duration-300 group-hover:translate-x-1"
              />
            </TransitionLink>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <TransitionLink
              to="/auth/login"
              id="hero-cta-login"
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl px-10 py-4 text-lg font-semibold bg-white border-2 border-slate-200 text-slate-700 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300 shadow-sm"
            >
              Sign In
            </TransitionLink>
          </motion.div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          variants={fadeInUp}
          className="mb-20 flex flex-wrap justify-center gap-3"
        >
          {featurePills.map((pill, idx) => (
            <motion.span
              key={pill.label}
              whileHover={{ y: -2 }}
              className={`ih-pill-tint px-4 py-2 rounded-xl text-sm font-semibold border ${pill.cls} backdrop-blur-sm bg-white/50 cursor-default shadow-sm`}
            >
              {pill.label}
            </motion.span>
          ))}
        </motion.div>

        {/* ── Proof points strip ── */}
        <motion.div
          variants={fadeInUp}
          className="mx-auto max-w-4xl rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/60 p-8 shadow-xl shadow-slate-200/50"
          aria-label="Platform statistics"
        >
          <div className="grid gap-8 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60">
            {proofPoints.map((point, i) => {
              const Icon = point.icon;
              return (
                <motion.div 
                  key={point.label} 
                  className={`flex flex-col items-center text-center ${i !== 0 ? 'pt-8 sm:pt-0' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${point.iconClass} shadow-inner`}>
                    <Icon size={26} aria-hidden="true" />
                  </div>
                  <p className={`text-4xl font-extrabold tracking-tight mb-2 ${point.valueClass}`}>
                    {point.value}
                  </p>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-1">
                    {point.label}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {point.sub}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

