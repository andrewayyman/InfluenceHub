import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ClipboardList,
  Target,
  Activity,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Megaphone
} from "lucide-react";
import {
  AdminHero,
  AdminMetricCard,
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "../../Components/AdminShared";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { useAuth } from "../../hooks/useAuth";
import { getBrandCampaigns, getBrandProfile, getBrandReports } from "../../services/api/brandService";
import { isAbortError } from "../../services/api/client";
import { getStatusTone, humanizeEnum } from "../../utils/admin";
import { formatCompactNumber, formatDate, formatDateTime } from "../../utils/formatters";

const summarizeDashboard = (campaigns, reports) => {
  const campList = campaigns || [];
  const repList = reports || [];

  const activeCampaigns = campList.filter(c => ["Open", "InfluencerSelected", "ReportSubmitted"].includes(c.status)).length;
  const completedCampaigns = campList.filter(c => ["Completed", "Closed"].includes(c.status)).length;
  const openForApplications = campList.filter(c => c.status === "Open").length;

  const totalReportsSubmitted = repList.length;
  const pendingReviews = repList.filter(r => r.status === "Submitted" || r.status === "PendingReview" || r.status === "RevisionRequested").length;

  const endingSoon = [...campList]
    .filter(c => ["Open", "InfluencerSelected"].includes(c.status))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  const influencerPerfRaw = {};
  repList.forEach(r => {
    if (!influencerPerfRaw[r.influencerName]) influencerPerfRaw[r.influencerName] = { name: r.influencerName, email: r.influencerEmail, reach: 0, engagements: 0, reports: 0 };
    influencerPerfRaw[r.influencerName].reach += (r.views || 0);
    influencerPerfRaw[r.influencerName].engagements += ((r.likes || 0) + (r.comments || 0) + (r.shares || 0));
    influencerPerfRaw[r.influencerName].reports += 1;
  });
  const topInfluencers = Object.values(influencerPerfRaw)
    .sort((a, b) => b.engagements - a.engagements)
    .slice(0, 7)
    .map(inf => ({
      ...inf,
      engagementRate: inf.reach > 0 ? ((inf.engagements / inf.reach) * 100).toFixed(2) : 0
    }));

  const recentReports = [...repList].sort((a, b) => new Date(b.postingDate || 0).getTime() - new Date(a.postingDate || 0).getTime()).slice(0, 6);

  return {
    activeCampaigns,
    completedCampaigns,
    openForApplications,
    totalReportsSubmitted,
    pendingReviews,
    endingSoon,
    topInfluencers,
    recentReports
  };
};

const BrandDashboard = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [reports, setReports] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal) => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        getBrandProfile(token, signal),
        getBrandCampaigns(token, signal),
        getBrandReports(token, signal)
      ]);

      if (signal?.aborted) return;

      const [profileResult, campaignsResult, reportsResult] = results;

      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      if (campaignsResult.status === "fulfilled") setCampaigns(campaignsResult.value);
      if (reportsResult.status === "fulfilled") setReports(reportsResult.value);

      const parts = [];
      if (profileResult.status === "rejected") parts.push("company profile");
      if (campaignsResult.status === "rejected") parts.push("campaigns");
      if (reportsResult.status === "rejected") parts.push("reports");
      
      if (parts.length === 3) throw new Error("Unable to load your brand workspace.");
      else if (parts.length) setError(`Some sections could not load: ${parts.join(", ")}.`);
    } catch (err) {
      if (isAbortError(err) || signal?.aborted) return;
      setError(err.message || "Unable to load your brand workspace.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const pulse = useMemo(() => summarizeDashboard(campaigns, reports), [campaigns, reports]);

  if (loading && !profile && !campaigns && !reports) {
    return (
      <AdminPage>
        <LoadingState label="Loading your dashboard analytics..." />
      </AdminPage>
    );
  }

  if (!loading && !profile && !campaigns && !reports && error) {
    return (
      <AdminPage>
        <ErrorState message={error} onRetry={() => load()} />
      </AdminPage>
    );
  }

  const brandLabel = profile?.name?.trim() || "Your brand";

  return (
    <AdminPage>
      <AdminHero
        kicker="Brand Control Center"
        title={`${brandLabel}, your campaign pipeline at a glance.`}
        description="Monitor active initiatives, track creator applications, and review influencer reports from a single unified view."
        badges={[
          { label: `${pulse.activeCampaigns} active campaigns`, className: "ih-pill-brand" },
          { label: `${pulse.openForApplications} accepting applications`, className: "ih-pill-success" },
          { label: `${pulse.pendingReviews} pending reviews`, className: "ih-pill-warning" },
          { label: `${pulse.totalReportsSubmitted} total reports`, className: "ih-pill-emerald" },
        ]}
        aside={(
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="ih-icon-chip ih-icon-chip-brand h-10 w-10 shrink-0 rounded-2xl">
                <Target size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Campaign Pipeline</p>
                <p className="ih-text-muted mt-1 text-sm leading-6">
                  {pulse.activeCampaigns > 0 
                    ? `You have ${pulse.activeCampaigns} active campaigns driving influencer applications and content delivery.`
                    : "Open a campaign to attract creators and start building your brand presence."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="ih-icon-chip ih-icon-chip-warning h-10 w-10 shrink-0 rounded-2xl">
                <ClipboardList size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Action Items</p>
                <p className="ih-text-muted mt-1 text-sm leading-6">
                  {pulse.pendingReviews > 0
                    ? `You have ${pulse.pendingReviews} report${pulse.pendingReviews === 1 ? "" : "s"} waiting for your approval.`
                    : "All submitted influencer reports have been reviewed. You're up to date."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="ih-icon-chip ih-icon-chip-success h-10 w-10 shrink-0 rounded-2xl">
                <Users size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Creator Applications</p>
                <p className="ih-text-muted mt-1 text-sm leading-6">
                  {pulse.openForApplications > 0
                    ? `You are currently accepting applications for ${pulse.openForApplications} campaigns.`
                    : "No campaigns are currently open for new applications."}
                </p>
              </div>
            </div>
          </div>
        )}
      >
        <div className="flex flex-wrap gap-3">
          <TransitionLink
            to="/dashboard/brand/create-campaign"
            className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm"
          >
            Create campaign
            <ArrowUpRight size={16} aria-hidden="true" />
          </TransitionLink>
          <TransitionLink
            to="/dashboard/brand/campaigns"
            className="ih-button-secondary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm"
          >
            View all campaigns
          </TransitionLink>
        </div>
      </AdminHero>

      {error ? <div className="mb-6"><ErrorState message={error} onRetry={() => load()} /></div> : null}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          index={0}
          accentClass="ih-metric-card-primary"
          icon={Megaphone}
          label="Active Campaigns"
          value={pulse.activeCampaigns}
          note="Campaigns currently in progress."
        />
        <AdminMetricCard
          index={1}
          accentClass="ih-metric-card-success"
          icon={Target}
          label="Open for Applications"
          value={pulse.openForApplications}
          note="Accepting creator submissions."
        />
        <AdminMetricCard
          index={2}
          accentClass="ih-metric-card-warning"
          icon={AlertCircle}
          label="Pending Reviews"
          value={pulse.pendingReviews}
          note="Reports awaiting your feedback."
        />
        <AdminMetricCard
          index={3}
          accentClass="ih-metric-card-emerald"
          icon={ClipboardList}
          label="Total Reports"
          value={pulse.totalReportsSubmitted}
          note="All time submitted influencer reports."
        />
      </div>

      <div className="grid gap-6 mt-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-6">
          <AdminPanel tone="warning">
            <AdminPanelHeader
              kicker="Action Center"
              title="Tasks & Alerts"
              description="High-priority items that require your immediate attention."
              actions={(
                <TransitionLink to="/dashboard/brand/reports" className="ih-link ih-focus-ring text-sm font-medium">
                  Go to Reports
                </TransitionLink>
              )}
            />
            <div className="space-y-4 mt-2">
              {pulse.pendingReviews > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
                   <div className="flex gap-4">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                       <AlertCircle size={20} />
                     </div>
                     <div>
                       <p className="font-semibold text-white">Pending Report Reviews</p>
                       <p className="mt-1 text-sm text-zinc-400">You have {pulse.pendingReviews} report(s) waiting for review.</p>
                     </div>
                   </div>
                   <TransitionLink to="/dashboard/brand/reports" className="ih-button-primary shrink-0 px-4 py-2 text-sm sm:w-auto w-full text-center">
                     Review
                   </TransitionLink>
                </div>
              ) : (
                <div className="flex items-start gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                     <CheckCircle size={20} />
                   </div>
                   <div>
                     <p className="font-semibold text-white">All Caught Up</p>
                     <p className="mt-1 text-sm text-zinc-400">No pending reports require your review at this time.</p>
                   </div>
                </div>
              )}

              {pulse.endingSoon.length > 0 && (
                <div>
                  <h4 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">Campaigns Ending Soon</h4>
                  <div className="space-y-3">
                    {pulse.endingSoon.map(c => (
                      <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white-[0.02] p-4 transition-colors hover:bg-white-[0.04]">
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-amber-400" />
                          <div>
                            <p className="text-sm font-medium text-white">{c.title}</p>
                            <p className="text-xs text-zinc-500">Ends {formatDate(c.deadline)}</p>
                          </div>
                        </div>
                        <TransitionLink to="/dashboard/brand/campaigns" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                          Manage
                        </TransitionLink>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {pulse.endingSoon.length === 0 && pulse.pendingReviews === 0 && (
                 <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-500">
                   <Target size={32} className="mb-3 opacity-20" />
                   <p className="text-sm">No urgent tasks right now.</p>
                 </div>
              )}
            </div>
          </AdminPanel>

          <AdminPanel tone="primary">
            <AdminPanelHeader
              kicker="Timeline"
              title="Recent Activity Feed"
              description="Latest updates from influencer submissions."
            />
            {pulse.recentReports.length > 0 ? (
              <div className="mt-4 space-y-0">
                {pulse.recentReports.map((r, idx) => (
                  <div key={r.id} className="flex gap-4">
                    <div className="relative mt-1 flex flex-col items-center">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 z-10">
                        <Activity size={14} />
                      </div>
                      {idx !== pulse.recentReports.length - 1 && (
                        <div className="w-[1px] h-full bg-white/10 -mt-2 pb-6" />
                      )}
                    </div>
                    <div className="pb-6 pt-1.5 w-full">
                      <p className="text-sm text-zinc-300">
                        <span className="font-medium text-white">{r.influencerName}</span> submitted a report for <span className="font-medium text-white">{r.campaignTitle}</span>
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                        <span>{formatDateTime(r.postingDate || r.reviewedAt || new Date())}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-700"></span>
                        <StatusBadge tone={getStatusTone(r.status)}>{humanizeEnum(r.status)}</StatusBadge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent activity"
                description="Your activity feed will populate as campaigns progress and reports are submitted."
              />
            )}
          </AdminPanel>
        </div>

        <div className="flex flex-col gap-6">
          <AdminPanel tone="emerald" className="h-full">
            <AdminPanelHeader
              kicker="Leaderboard"
              title="Top Performing Creators"
              description="Influencers driving the highest engagement across your campaigns."
            />
            {pulse.topInfluencers.length > 0 ? (
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left">
                  <thead className="border-b border-white/10 text-xs text-zinc-500">
                    <tr>
                      <th className="pb-3 font-medium" scope="col">Creator</th>
                      <th className="pb-3 font-medium text-right" scope="col">Total Reach</th>
                      <th className="pb-3 font-medium text-right" scope="col">Engagements</th>
                      <th className="pb-3 font-medium text-right" scope="col">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pulse.topInfluencers.map((inf, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-white-[0.02]">
                        <td className="py-4">
                          <p className="font-medium text-white">{inf.name}</p>
                          <p className="text-xs text-zinc-500">{inf.reports} report{inf.reports > 1 ? "s" : ""}</p>
                        </td>
                        <td className="py-4 text-right text-sm text-zinc-300">{formatCompactNumber(inf.reach)}</td>
                        <td className="py-4 text-right text-sm text-zinc-300">{formatCompactNumber(inf.engagements)}</td>
                        <td className="py-4 text-right text-sm font-medium text-emerald-400">{inf.engagementRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No creator data yet"
                description="Approve influencer reports to start building your performance leaderboard."
              />
            )}
          </AdminPanel>
        </div>
      </div>

    </AdminPage>
  );
};

export default BrandDashboard;
