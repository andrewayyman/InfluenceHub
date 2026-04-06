import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  ClipboardList,
  CheckCircle,
  Activity,
} from "lucide-react";
import {
  AdminPage as DashboardPage,
  AdminMetricCard as MetricCard,
  ErrorState,
  LoadingState,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { influencerService } from "../../services/api/influencerService";
import { isAbortError } from "../../services/api/client";

const InfluencerDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState({ applications: [], reports: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const [applicationsReq, reportsReq] = await Promise.allSettled([
        influencerService.getMyApplications(token),
        influencerService.getMyReports(token),
      ]);

      if (signal?.aborted) return;

      if (applicationsReq.status === "rejected" || reportsReq.status === "rejected") {
        setError("Some dashboard sections could not be loaded.");
      }

      setData({
        applications: applicationsReq.status === "fulfilled" ? applicationsReq.value : [],
        reports: reportsReq.status === "fulfilled" ? reportsReq.value : [],
      });
    } catch (err) {
      if (!isAbortError(err) && !signal?.aborted) {
        setError(err.message || "Unable to load dashboard.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    loadDashboard(controller.signal);
    return () => controller.abort();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const applied = data.applications.length;
    const active = data.applications.filter((a) => a.status === "Accepted").length;
    const completed = data.reports.length;
    
    // Mocking earnings based on active+completed or just a hardcoded value per user request
    const mockEarnings = "$2,450";

    return { applied, active, completed, mockEarnings };
  }, [data]);

  if (loading && !data.applications.length) {
    return (
      <DashboardPage>
        <LoadingState label="Loading your dashboard..." />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          index={0}
          accentClass="ih-metric-card-brand"
          icon={ClipboardList}
          label="Applied Campaigns"
          value={stats.applied}
          note="Total applications you have submitted."
        />
        <MetricCard
          index={1}
          accentClass="ih-metric-card-warm"
          icon={Activity}
          label="Active Campaigns"
          value={stats.active}
          note="Campaigns you are currently working on."
        />
        <MetricCard
          index={2}
          accentClass="ih-metric-card-success"
          icon={CheckCircle}
          label="Completed Campaigns"
          value={stats.completed}
          note="Campaigns where you have submitted a report."
        />
        <MetricCard
          index={3}
          accentClass="ih-metric-card-emerald"
          icon={DollarSign}
          label="Total Earnings"
          value={stats.mockEarnings}
          note="Estimated sum from completed work."
        />
      </div>

      {/* Here we could add recent applications or suggested campaigns snippet similar to AdminDashboard if needed */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Welcome back to your command center</h2>
        <p className="ih-text-secondary text-sm">
          Navigate to Suggested Campaigns to find brand deals, or check My Applications to track their status.
        </p>
      </div>
    </DashboardPage>
  );
};

export default InfluencerDashboard;
