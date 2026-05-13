import React from "react";
import { BriefcaseBusiness, ShieldCheck, Users } from "lucide-react";
import { motion } from "framer-motion";
import { prefersReducedMotion } from "../../utils/overdrive";

const services = [
  {
    id: "01",
    title: "Brands",
    description: "Create campaigns, review matched influencers, and track ROI.",
    icon: BriefcaseBusiness,
    notes: ["Create campaigns", "Review applications", "Track ROI"],
    iconClass: "ih-icon-chip-brand",
    panelClass: "ih-service-panel-brand border-purple-200/50 hover:border-purple-300",
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
    panelClass: "ih-service-panel-emerald border-emerald-200/50 hover:border-emerald-300",
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
    panelClass: "ih-service-panel-warm border-amber-200/50 hover:border-amber-300",
    pillClass: "ih-note-pill-warm",
    idClass: "ih-text-amber",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const Services = () => {
  const isReducedMotion = prefersReducedMotion();

  return (
    <section id="services" className="ih-section-shell ih-section-tint-emerald px-6 py-24 sm:py-32 relative overflow-hidden" aria-labelledby="services-heading">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[40rem] h-[40rem] bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[30rem] h-[30rem] bg-purple-100/30 rounded-full blur-[80px] pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(260px,0.78fr)_minmax(0,1.22fr)] lg:gap-20">
        <motion.div 
          className="lg:sticky lg:top-32 lg:self-start"
          initial={isReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0, x: -30 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">How it works</span>
          </div>
          
          <h2 id="services-heading" className="max-w-sm text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-[1.15]">
            One platform. <br/>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Three workflows.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600 font-medium">
            Tailored tools for campaigns, matching, reporting, and oversight. Experience a seamless workflow no matter your role.
          </p>
        </motion.div>

        <div className="space-y-8">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.article
                key={service.id}
                custom={index}
                initial={isReducedMotion ? "visible" : "hidden"}
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={cardVariants}
                whileHover={isReducedMotion ? {} : { scale: 1.02, translateY: -5 }}
                className={`group relative grid gap-6 rounded-[2rem] p-8 sm:p-10 md:grid-cols-[auto_minmax(0,1fr)] md:items-start bg-white/80 backdrop-blur-xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 ${service.panelClass}`}
              >
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/60 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative flex items-center gap-5 md:block md:space-y-6">
                  <span className={`${service.idClass} text-sm font-bold tracking-[0.2em] bg-white/50 px-2 py-1 rounded-md shadow-sm`}>
                    {service.id}
                  </span>
                  <div className={`ih-icon-chip flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner ${service.iconClass}`}>
                    <Icon size={26} aria-hidden="true" />
                  </div>
                </div>

                <div className="relative">
                  <div className="pb-6 border-b border-slate-100/80">
                    <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl mb-3">{service.title}</h3>
                    <p className="text-slate-600 max-w-2xl text-base sm:text-lg leading-relaxed font-medium">{service.description}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {service.notes.map((note) => (
                      <span key={note} className={`ih-note-pill font-semibold px-4 py-1.5 rounded-xl border bg-white/50 shadow-sm ${service.pillClass}`}>
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
