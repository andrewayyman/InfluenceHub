import React from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Navigate } from "react-router-dom";
import Footer from "../../Components/Layout/Footer";
import Navbar from "../../Components/Layout/Navbar";
import { TransitionLink } from "../../Components/Motion/TransitionLink";

const pageContent = {
  about: {
    kicker: "About InfluenceHub",
    title: "Built for campaigns that need trust, speed, and clear handoffs.",
    description:
      "InfluenceHub brings brands, influencers, and admins into one shared operating system for campaign setup, matching, reporting, and follow-up.",
    sections: [
      {
        title: "Who it serves",
        body:
          "The platform is designed for brand teams running influencer programs, creators looking for aligned campaigns, and admins protecting marketplace quality.",
      },
      {
        title: "How it works",
        body:
          "Brands create campaigns, influencers apply and report, and admins keep delivery, trust, and support queues moving without context switching.",
      },
    ],
    primaryCta: { label: "Create account", to: "/auth/register" },
    secondaryCta: { label: "View workflows", to: "/#services" },
  },
  contact: {
    kicker: "Contact",
    title: "Need help, a partnership conversation, or a monthly briefing follow-up?",
    description:
      "Use the product contact channels that best match your need. Partnership and support requests are monitored by the admin team.",
    sections: [
      {
        title: "Support and partnerships",
        body:
          "Email contact@influencehub.com for support, partnership requests, or security follow-up. Messages are reviewed inside the admin inbox.",
      },
      {
        title: "Monthly briefing",
        body:
          "The home-page briefing form routes requests into the same contact workflow so the team can follow up directly by email.",
      },
    ],
    primaryCta: { label: "Open briefing form", to: "/#Subscription" },
    secondaryCta: { label: "Email contact@influencehub.com", href: "mailto:contact@influencehub.com" },
  },
  security: {
    kicker: "Security",
    title: "Operational controls are built around role-based access and admin oversight.",
    description:
      "InfluenceHub separates access for brands, influencers, and admins, and keeps campaign review and contact follow-up inside authenticated admin surfaces.",
    sections: [
      {
        title: "Access control",
        body:
          "Authenticated dashboard routes are protected by role-aware routing. Admin tools remain separated from public marketing and auth screens.",
      },
      {
        title: "Review workflow",
        body:
          "Reports, campaigns, users, and contact messages all flow through admin review so the marketplace can respond quickly when quality or trust issues appear.",
      },
    ],
    primaryCta: { label: "Go to login", to: "/auth/login" },
    secondaryCta: { label: "Contact security team", href: "mailto:contact@influencehub.com?subject=Security%20question" },
  },
  privacy: {
    kicker: "Privacy",
    title: "Privacy decisions should stay understandable to brands, influencers, and admins.",
    description:
      "This local environment demonstrates product flows and admin operations. Production privacy policy language should be reviewed with legal counsel before launch.",
    sections: [
      {
        title: "What the app handles",
        body:
          "The platform stores account, campaign, report, and contact message data that supports campaign delivery and marketplace operations.",
      },
      {
        title: "Launch note",
        body:
          "Before production release, publish a formal privacy policy that covers retention, lawful basis, regional compliance, and contact processes.",
      },
    ],
    primaryCta: { label: "Contact the team", to: "/contact" },
    secondaryCta: { label: "Back to home", to: "/" },
  },
  terms: {
    kicker: "Terms",
    title: "The product already expresses platform roles and operational expectations.",
    description:
      "This environment is a product implementation, not a finalized legal document. Formal platform terms should be reviewed before public launch.",
    sections: [
      {
        title: "Platform roles",
        body:
          "Brands manage campaigns, influencers apply and report, and admins can disable users, close campaigns, and review submissions to protect delivery quality.",
      },
      {
        title: "Launch note",
        body:
          "Add final legal terms for acceptable use, payment handling, intellectual property, and dispute resolution before shipping externally.",
      },
    ],
    primaryCta: { label: "Create account", to: "/auth/register" },
    secondaryCta: { label: "Review security notes", to: "/security" },
  },
};

const PublicAction = ({ action, primary = false }) => {
  if (!action) {
    return null;
  }

  const className = primary
    ? "ih-button-primary ih-focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
    : "ih-button-secondary ih-focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm";

  if (action.href) {
    return (
      <a href={action.href} className={className}>
        {action.label}
        <ExternalLink size={16} aria-hidden="true" />
      </a>
    );
  }

  return (
    <TransitionLink to={action.to} className={className}>
      {action.label}
      <ArrowRight size={16} aria-hidden="true" />
    </TransitionLink>
  );
};

const PublicInfoPage = ({ pageKey }) => {
  const page = pageContent[pageKey];

  if (!page) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="ih-home-shell ih-page-shell relative min-h-screen overflow-hidden">
      <a href="#public-page-content" className="ih-skip-link">
        Skip to page content
      </a>

      <div aria-hidden="true" className="ih-home-atmosphere pointer-events-none" />
      <div aria-hidden="true" className="ih-home-grid pointer-events-none" />
      <div className="relative z-10">
        <Navbar showSectionLinks={false} />

        <main id="public-page-content" className="px-6 pb-20 pt-32 sm:pt-36">
          <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
            <div className="ih-panel-outline rounded-[2rem] p-6 sm:p-8" data-ih-reveal>
              <p className="ih-kicker ih-kicker-warm mb-5">{page.kicker}</p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                {page.title}
              </h1>
              <p className="ih-text-secondary mt-6 max-w-3xl text-base leading-8 sm:text-lg">
                {page.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <PublicAction action={page.primaryCta} primary />
                <PublicAction action={page.secondaryCta} />
              </div>
            </div>

            <aside className="ih-panel-outline rounded-[2rem] p-6 sm:p-8" data-ih-reveal style={{ "--ih-delay": "90ms" }}>
              <p className="ih-kicker mb-3">What to expect</p>
              <p className="ih-text-secondary text-sm leading-7 sm:text-base">
                These pages are intentionally concise and written to remove dead-end footer links while keeping the product truthful during launch hardening.
              </p>
            </aside>
          </section>

          <section className="mx-auto mt-8 grid max-w-7xl gap-6 lg:grid-cols-2">
            {page.sections.map((section, index) => (
              <article
                key={section.title}
                className="ih-panel-outline rounded-[1.75rem] p-6 sm:p-7"
                data-ih-reveal
                style={{ "--ih-delay": `${140 + (index * 70)}ms` }}
              >
                <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                <p className="ih-text-secondary mt-4 text-sm leading-7 sm:text-base">{section.body}</p>
              </article>
            ))}
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default PublicInfoPage;
