import React from "react";

const Subscription = () => {
  return (
    <section
      id="Subscription"
      className="relative py-24 px-6 bg-[#0F172A] text-white overflow-hidden"
    >
      {/* ===== Glow Background ===== */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-600 to-emerald-500 opacity-20 blur-3xl rounded-full"></div>
      </div>

      {/* ===== Main Content Container ===== */}
      <div className="relative max-w-4xl mx-auto text-center">

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Stay Updated
        </h2>

        {/* Subtitle / description */}
        <p className="text-white/70 mb-10 text-lg">
          Subscribe to our newsletter and get the latest updates about influencers,
          brands, and campaigns.
        </p>

        {/* ===== Subscription Form ===== */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">

          {/* Email input */}
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Subscribe button */}
          <button className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-emerald-500 hover:scale-105 transition duration-300 shadow-lg shadow-purple-500/20">
            Subscribe
          </button>

        </div>

        {/* Small note under the form */}
        <p className="text-white/50 text-sm mt-6">
          No spam. Only valuable updates.
        </p>

      </div>
    </section>
  );
};

export default Subscription;