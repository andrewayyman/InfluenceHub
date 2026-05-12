import React from "react";
import { BriefcaseBusiness, ShieldCheck, Users } from "lucide-react";

const services = [
  {
    id: "01",
    title: "Brands",
    description: "Create campaigns, review matched influencers, and track ROI.",
    icon: BriefcaseBusiness,
    notes: ["Create campaigns", "Review applications", "Track ROI"],
    iconClass: "ih-icon-chip-brand",
    panelClass: "ih-service-panel-brand",
    pillClass: "ih-note-pill-brand",
    idClass: "ih-text-accent",
  },
  {
    id: "02",
    title: "Influencers",
    description: "Build a profile, find campaigns, apply, and submit reports.",
    icon: Users,
    notes: ["Profile setup", "Campaign matches", "Report submission"],
    iconClass: "ih-icon-chip-success",
    panelClass: "ih-service-panel-emerald",
    pillClass: "ih-note-pill-emerald",
    idClass: "ih-text-emerald",
  },
  {
    id: "03",
    title: "Admin",
    description: "Manage users and campaigns, validate reports, and handle inquiries.",
    icon: ShieldCheck,
    notes: ["Manage users", "Review reports", "Handle messages"],
    iconClass: "ih-icon-chip-warning",
    panelClass: "ih-service-panel-warm",
    pillClass: "ih-note-pill-warm",
    idClass: "ih-text-amber",
  },
];

const Services = () => {
  return (
    <section id="services" className="ih-section-shell ih-section-tint-emerald px-6 py-24" aria-labelledby="services-heading">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(260px,0.78fr)_minmax(0,1.22fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start" data-ih-reveal style={{ "--ih-delay": "80ms" }}>
          <p className="ih-kicker mb-5">What each role can do</p>
          <h2 id="services-heading" className="max-w-sm text-4xl font-semibold tracking-[-0.04em] ih-text-primary sm:text-5xl">
            One platform. <span className="ih-text-accent">Three workflows.</span>
          </h2>
          <p className="ih-text-muted mt-6 max-w-md text-base leading-7 sm:text-lg">
            Tailored tools for campaigns, matching, reporting, and oversight.
          </p>
        </div>

        <div className="space-y-5">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.id}
                className={`ih-panel-outline ih-home-service-card ih-service-panel grid gap-6 rounded-[1.75rem] p-6 sm:p-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-start ${service.panelClass}`}
                data-ih-reveal
                style={{ "--ih-delay": `${160 + (Number(service.id) - 1) * 90}ms` }}
              >
                <div className="flex items-center gap-4 md:block md:space-y-6">
                  <span className={`${service.idClass} text-sm font-semibold tracking-[0.24em]`}>{service.id}</span>
                  <div className={`ih-icon-chip h-12 w-12 rounded-2xl ${service.iconClass}`}>
                    <Icon size={22} aria-hidden="true" />
                  </div>
                </div>

                <div>
                  <div className="ih-divider-bottom pb-5">
                    <h3 className="text-2xl font-semibold ih-text-primary sm:text-[1.75rem]">{service.title}</h3>
                    <p className="ih-text-secondary mt-3 max-w-2xl text-base leading-7">{service.description}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {service.notes.map((note) => (
                      <span key={note} className={`ih-note-pill ${service.pillClass}`}>
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
