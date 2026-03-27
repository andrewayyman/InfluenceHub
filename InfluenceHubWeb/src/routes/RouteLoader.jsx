import React from "react";

const RouteLoader = () => (
  <div className="ih-app-shell flex min-h-[40vh] items-center justify-center px-4 py-10 text-center">
    <div className="ih-panel-outline rounded-3xl px-8 py-7">
      <div className="ih-loader-ring mx-auto h-10 w-10 motion-safe:animate-spin rounded-full border-2" />
      <p className="ih-text-muted mt-4 text-sm">Loading InfluenceHub...</p>
    </div>
  </div>
);

export default RouteLoader;
