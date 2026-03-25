import React, { useEffect } from "react";

const Hero = () => {

  // ===== Floating Shapes Animation =====
  useEffect(() => {
    const shapes = document.querySelectorAll(".floating-shape");
    // Apply different animation durations for each shape
    shapes.forEach((shape, index) => {
      shape.style.animation = `float ${15 + index * 2}s infinite`;
    });
  }, []);

  return (
    <section id="Hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-26 pb-20 bg-[#0F172A]">

      {/* ===== Floating Gradient Shapes in Background ===== */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-shape absolute top-20 left-20 w-96 h-96 rounded-full bg-gradient-to-r from-purple-600 to-emerald-500 opacity-20 blur-3xl"></div>

        <div
          className="floating-shape absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-amber-400 to-purple-600 opacity-20 blur-3xl"
          style={{ animationDelay: "-5s" }} // start offset
        ></div>

        <div
          className="floating-shape absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 opacity-10 blur-3xl"
          style={{ animationDelay: "-10s" }}
        ></div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">

        {/* ===== Badge ===== */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm animate-bounce-slow">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-sm text-white/90">Top Influencer Platform in MENA</span>
        </div>

        {/* ===== Heading ===== */}
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">

          <span className="bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
            MENA's Leading
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
            Content & Influencer
          </span>
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-purple-500 bg-clip-text text-transparent">
            Marketing Agency
          </span>

        </h1>

        {/* ===== Description ===== */}
        <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
          A network that helps your channel grow and connects you with
          <span className="text-amber-400 font-semibold"> great brand partnerships</span>
        </p>

        {/* ===== Call to Action Buttons ===== */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">

          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-emerald-500 rounded-xl font-semibold text-lg hover:scale-105 transition">
            Join Now
          </button>

          <button className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition">
            Watch Demo
          </button>

        </div>

        {/* ===== Stats ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-3xl font-bold text-emerald-400">500+</div>
            <div className="text-white/70">Active Brands</div>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-3xl font-bold text-purple-400">10K+</div>
            <div className="text-white/70">Influencers</div>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-3xl font-bold text-amber-400">$2.5M</div>
            <div className="text-white/70">Campaign Value</div>
          </div>

        </div>

      </div>

      {/* ===== Animations ===== */}
      <style>{`
        @keyframes float {
          0%,100% { transform: translate(0,0) rotate(0deg);}
          50% { transform: translate(60px,-60px) rotate(180deg);}
        }

        @keyframes bounce-slow {
          0%,100% { transform: translateY(0);}
          50% { transform: translateY(-10px);}
        }

        .animate-bounce-slow{
          animation:bounce-slow 3s infinite;
        }
      `}</style>

    </section>
  );
};

export default Hero;