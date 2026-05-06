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
  const [data, setData] = useState({ applications: [], reports: [], suggested: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const [applicationsReq, reportsReq, suggestedReq] = await Promise.allSettled([
        influencerService.getMyApplications(token),
        influencerService.getMyReports(token),
        influencerService.getSuggestedCampaigns({}, token),
      ]);

      if (signal?.aborted) return;

      if (applicationsReq.status === "rejected" || reportsReq.status === "rejected") {
        setError("Some dashboard sections could not be loaded.");
      }

      setData({
        applications: applicationsReq.status === "fulfilled" ? applicationsReq.value : [],
        reports: reportsReq.status === "fulfilled" ? reportsReq.value : [],
        suggested: suggestedReq.status === "fulfilled" ? suggestedReq.value : [],
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
    const totalApps = data.applications.length;
    const accepted = data.applications.filter((a) => a.status === "Accepted").length;
    const pending = data.applications.filter((a) => a.status === "Pending").length;
    const rejected = data.applications.filter((a) => a.status === "Rejected").length;
    const completed = data.reports.length;
    const suggestedCount = data.suggested.length;
    
    const acceptanceRate = totalApps > 0 ? Math.round((accepted / totalApps) * 100) : 0;
    const pendingRate = totalApps > 0 ? Math.round((pending / totalApps) * 100) : 0;
    const rejectedRate = totalApps > 0 ? Math.round((rejected / totalApps) * 100) : 0;

    return { 
      totalApps, 
      accepted, 
      pending, 
      rejected, 
      completed, 
      suggestedCount,
      acceptanceRate,
      pendingRate,
      rejectedRate,
      hasHighAcceptance: acceptanceRate > 40 && accepted >= 2,
    };
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
          label="Total Applications"
          value={stats.totalApps}
          note="Total pitches sent to brands."
        />
        <MetricCard
          index={1}
          accentClass="ih-metric-card-success"
          icon={CheckCircle}
          label="Accepted (Active)"
          value={stats.accepted}
          note="Campaigns you are currently working on."
        />
        <MetricCard
          index={2}
          accentClass="ih-metric-card-warning"
          icon={Activity}
          label="Pending Review"
          value={stats.pending}
          note="Waiting for brand response."
        />
        <MetricCard
          index={3}
          accentClass="ih-metric-card-emerald"
          icon={DollarSign}
          label="Suggested Campaigns"
          value={stats.suggestedCount}
          note="Opportunities matching your profile."
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Application Funnel Chart & Insights */}
        <div className="lg:col-span-2 ih-surface rounded-[1.75rem] p-6 border border-slate-200">
          <h2 className="text-xl font-semibold ih-text-primary mb-6">Application Pipeline</h2>
          
          <div className="flex flex-col gap-6">
            {/* Visual Progress Bar Chart */}
            <div className="w-full">
              <div className="flex justify-between text-xs ih-text-muted mb-2">
                <span>Accepted ({stats.accepted})</span>
                <span>Pending ({stats.pending})</span>
                <span>Rejected ({stats.rejected})</span>
              </div>
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-50">
                {stats.totalApps > 0 ? (
                  <>
                    <div style={{ width: `${stats.acceptanceRate}%` }} className="bg-emerald-500 transition-all duration-1000" title={`Accepted: ${stats.acceptanceRate}%`} />
                    <div style={{ width: `${stats.pendingRate}%` }} className="bg-amber-400 transition-all duration-1000" title={`Pending: ${stats.pendingRate}%`} />
                    <div style={{ width: `${stats.rejectedRate}%` }} className="bg-red-500/80 transition-all duration-1000" title={`Rejected: ${stats.rejectedRate}%`} />
                  </>
                ) : (
                  <div className="w-full bg-slate-100" />
                )}
              </div>
            </div>

            {/* Smart Insights generated from data */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-900/5 bg-slate-50 p-4 flex gap-3 items-start ih-panel-hover transition-all">
                <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Activity size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium ih-text-primary mb-1">Conversion Rate</p>
                  <p className="text-xs ih-text-muted">
                    {stats.totalApps === 0 ? "You haven't applied to any campaigns yet. Start pitching!" : 
                     stats.hasHighAcceptance ? `Great job! Your acceptance rate is ${stats.acceptanceRate}%, which is above average.` :
                     `Your current acceptance rate is ${stats.acceptanceRate}%. Try refining your pitch messages.`}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-900/5 bg-slate-50 p-4 flex gap-3 items-start ih-panel-hover transition-all">
                <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ClipboardList size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium ih-text-primary mb-1">Pending Responses</p>
                  <p className="text-xs ih-text-muted">
                    {stats.pending > 0 
                      ? `You have ${stats.pending} application${stats.pending > 1 ? 's' : ''} currently awaiting a brand's decision.` 
                      : "You have no pending applications at the moment."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps / Suggested Actions */}
        <div className="ih-surface rounded-[1.75rem] p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold ih-text-primary mb-4">Opportunities</h2>
            <p className="text-sm ih-text-secondary mb-6">
              {stats.suggestedCount > 0 
                ? `We found ${stats.suggestedCount} new campaigns that perfectly match your niche and audience metrics.`
                : "Keep your profile updated to receive personalized campaign suggestions."}
            </p>
          </div>
          
          <a href="/dashboard/influencer/suggested" className="ih-button-primary w-full flex justify-center px-4 py-3">
            Browse Suggested Campaigns
          </a>
        </div>
      </div>
    </DashboardPage>
  );
};

export default InfluencerDashboard;
