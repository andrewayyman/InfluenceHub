import React from "react";
import { Users, Briefcase, Video } from "lucide-react";

// ===== Services Data =====
// Array of objects defining each service.
// Each service has: title, description, icon component, and gradient color
const services = [
  {
    title: "Creators",
    description: "Engage audiences authentically and grow your influence with powerful partnerships.",
    icon: Users,
    color: "from-pink-500 to-rose-400",
  },
  {
    title: "Brands",
    description: "Maximize your media impact by collaborating with the most relevant influencers.",
    icon: Briefcase,
    color: "from-purple-500 to-indigo-500",
  },
  {
    title: "Producers",
    description: "Professional content management and production solutions for modern media.",
    icon: Video,
    color: "from-indigo-500 to-blue-500",
  },
];

const Services = () => {
  return (
    <section id="services" className="relative py-24 px-6 bg-[#0F172A] text-white">

      {/* ===== Section Header ===== */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Our <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">Services</span>
        </h2>

        <p className="text-white/70 max-w-2xl mx-auto text-lg">
          We help influencers, brands, and producers succeed through powerful digital partnerships.
        </p>
      </div>

      {/* ===== Services Grid ===== */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {services.map((service, index) => {
          const Icon = service.icon;

          return (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-400/40 transition duration-300 hover:-translate-y-2"
            >
              {/* Gradient Glow on hover */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-20 blur-2xl transition bg-gradient-to-r ${service.color}`}
              ></div>

              {/* Service Icon */}
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-r ${service.color}`}
              >
                <Icon size={28} />
              </div>

              {/* Service Title */}
              <h3 className="text-2xl font-bold mb-3">
                {service.title}
              </h3>

              {/* Service Description */}
              <p className="text-white/70 leading-relaxed">
                {service.description}
              </p>

            </div>
          );
        })}

      </div>
    </section>
  );
};

export default Services;