import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ClipboardList,
  Layers,
  Megaphone,
  Radar,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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
import { getBrandCampaigns, getBrandProfile } from "../../services/api/brandService";
import { isAbortError } from "../../services/api/client";
import { getStatusTone, humanizeEnum } from "../../utils/admin";
import { formatCompactNumber, formatCurrency, formatDate } from "../../utils/formatters";

const summarizeCampaigns = (campaigns) => {
  const list = campaigns || [];
  const open = list.filter((c) => c.status === "Open").length;
  const inDelivery = list.filter((c) =>
    c.status === "InfluencerSelected" || c.status === "ReportSubmitted",
  ).length;
  const completed = list.filter((c) => c.status === "Completed").length;
  const closed = list.filter((c) => c.status === "Closed").length;
  const applicationReach = list.reduce((sum, c) => sum + (c.applicationCount || 0), 0);

  const sorted = [...list].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  );

  const mockPerformanceData = [
    { name: "Jan", campaigns: 1, applications: 4 },
    { name: "Feb", campaigns: 2, applications: 9 },
    { name: "Mar", campaigns: 1, applications: 15 },
    { name: "Apr", campaigns: 3, applications: 28 },
    { name: "May", campaigns: 4, applications: 45 },
  ];

  const mockEngagementData = [
    { platform: "Instagram", reach: 12000, clicks: 4500 },
    { platform: "TikTok", reach: 25000, clicks: 8000 },
    { platform: "YouTube", reach: 18000, clicks: 3200 },
  ];

  return {
    open,
    inDelivery,
    completed,
    closed,
    applicationReach,
    upcoming: sorted.slice(0, 5),
    performanceData: mockPerformanceData,
    engagementData: mockEngagementData,
  };
};

const BrandDashboard = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
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
      ]);

      if (signal?.aborted) {
        return;
      }

      const [profileResult, campaignsResult] = results;

      if (profileResult.status === "rejected" && campaignsResult.status === "rejected") {
        throw new Error("Unable to load your brand workspace.");
      }

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      }

      if (campaignsResult.status === "fulfilled") {
        setCampaigns(campaignsResult.value);
      }

      const parts = [];
      if (profileResult.status === "rejected") {
        parts.push("company profile");
      }
      if (campaignsResult.status === "rejected") {
        parts.push("campaign list");
      }
      setError(parts.length ? `Some sections could not load: ${parts.join(", ")}.` : "");
    } catch (requestError) {
      if (isAbortError(requestError) || signal?.aborted) {
        return;
      }
      setError(requestError.message || "Unable to load your brand workspace.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const pulse = useMemo(() => summarizeCampaigns(campaigns), [campaigns]);

  if (loading && !profile && !campaigns) {
    return (
      <AdminPage>
        <LoadingState label="Loading your brand command center..." />
      </AdminPage>
    );
  }

  if (!loading && !profile && !campaigns && error) {
    return (
      <AdminPage>
        <ErrorState message={error} onRetry={() => load()} />
      </AdminPage>
    );
  }

  const brandLabel = profile?.name?.trim() || "Your brand";
  const totalCampaigns = campaigns?.length ?? 0;

  return (
    <AdminPage>
      <AdminHero
        kicker="Brand dashboard"
        title={`${brandLabel}, keep campaigns funded, staffed, and ready for results.`}
        description="Track open briefs, inbound creator interest, and delivery-stage work from one premium surface. Depth lives in each campaign—this home view is your daily control room."
        badges={[
          { label: `${pulse.open} open`, className: "ih-pill-brand" },
          { label: `${pulse.inDelivery} in delivery`, className: "ih-pill-emerald" },
          { label: `${formatCompactNumber(pulse.applicationReach)} applications`, className: "ih-pill-warm" },
          { label: `${pulse.completed} completed`, className: "ih-pill-brand" },
        ]}
        aside={(
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="ih-icon-chip ih-icon-chip-brand h-10 w-10 shrink-0 rounded-2xl">
                <Target size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Match with intent</p>
                <p className="ih-text-muted mt-1 text-sm leading-6">
                  Open campaigns signal the marketplace; watch application volume to know when to tighten briefs or expand budget.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="ih-icon-chip ih-icon-chip-success h-10 w-10 shrink-0 rounded-2xl">
                <Radar size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Delivery radar</p>
                <p className="ih-text-muted mt-1 text-sm leading-6">
                  {pulse.inDelivery
                    ? `${pulse.inDelivery} campaigns are past selection and moving toward reporting. Stay close to deadlines.`
                    : "No campaigns are mid-delivery yet. Opening a brief is the fastest way to attract aligned creators."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="ih-icon-chip ih-icon-chip-warning h-10 w-10 shrink-0 rounded-2xl">
                <Layers size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Portfolio balance</p>
                <p className="ih-text-muted mt-1 text-sm leading-6">
                  {totalCampaigns
                    ? `You are running ${totalCampaigns} campaign${totalCampaigns === 1 ? "" : "s"}—audit closed work to protect brand consistency.`
                    : "Launch your first campaign to activate matching and applications across the marketplace."}
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
          <TransitionLink
            to="/dashboard/brand/applications"
            className="ih-button-secondary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm"
          >
            Review applications
          </TransitionLink>
        </div>
      </AdminHero>

      {error ? <ErrorState message={error} onRetry={() => load()} /> : null}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          index={0}
          accentClass="ih-metric-card-brand"
          icon={Megaphone}
          label="Active campaigns"
          value={totalCampaigns}
          note="Every live brief you own across InfluenceHub."
        />
        <AdminMetricCard
          index={1}
          accentClass="ih-metric-card-warm"
          icon={ClipboardList}
          label="Open for applications"
          value={pulse.open}
          note="Campaigns currently accepting creator submissions."
        />
        <AdminMetricCard
          index={2}
          accentClass="ih-metric-card-success"
          icon={Target}
          label="Creator applications"
          value={pulse.applicationReach}
          note="Total applications recorded across your campaigns."
        />
        <AdminMetricCard
          index={3}
          accentClass="ih-metric-card-danger"
          icon={Layers}
          label="In delivery"
          value={pulse.inDelivery}
          note="Selected influencers working toward reports."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)]">
        <AdminPanel tone="brand">
          <AdminPanelHeader
            kicker="Upcoming deadlines"
            title="Campaigns closest on the calendar"
            description="Prioritize approvals, budget checks, and influencer messaging before these dates pass."
            actions={(
              <TransitionLink to="/dashboard/brand/campaigns" className="ih-link ih-focus-ring rounded-sm text-sm font-medium">
                Full list
              </TransitionLink>
            )}
          />

          {pulse.upcoming.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[40rem] w-full text-left">
                <thead className="ih-table-head border-b text-sm">
                  <tr>
                    <th className="pb-3" scope="col">Campaign</th>
                    <th scope="col">Status</th>
                    <th scope="col">Budget</th>
                    <th scope="col">Applications</th>
                    <th scope="col">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {pulse.upcoming.map((campaign) => (
                    <tr key={campaign.id} className="ih-table-row border-b last:border-none">
                      <td className="py-4 min-w-[10rem]">
                        <p className="ih-text-primary font-medium ih-clamp-2" title={campaign.title}>{campaign.title}</p>
                        <p className="ih-text-muted mt-1 text-sm ih-truncate" title={`${campaign.platforms?.join(", ")} · ${campaign.location}`}>
                          {campaign.platforms?.join(", ")} · {campaign.location}
                        </p>
                      </td>
                      <td>
                        <StatusBadge tone={getStatusTone(campaign.status)}>{humanizeEnum(campaign.status)}</StatusBadge>
                      </td>
                      <td className="ih-text-secondary text-sm ih-truncate" title={formatCurrency(campaign.budget)}>
                        {formatCurrency(campaign.budget)}
                      </td>
                      <td className="ih-text-secondary text-sm ih-truncate" title={formatCompactNumber(campaign.applicationCount)}>
                        {formatCompactNumber(campaign.applicationCount)}
                      </td>
                      <td className="ih-text-secondary text-sm ih-truncate" title={formatDate(campaign.deadline)}>
                        {formatDate(campaign.deadline)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No campaigns yet"
              description="Publish your first campaign to unlock matching, applications, and ROI reporting across the marketplace."
              action={(
                <TransitionLink
                  to="/dashboard/brand/create-campaign"
                  className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm"
                >
                  Create campaign
                  <ArrowUpRight size={16} aria-hidden="true" />
                </TransitionLink>
              )}
            />
          )}
        </AdminPanel>

        <AdminPanel tone="emerald">
          <AdminPanelHeader
            kicker="Status mix"
            title="Where your portfolio sits"
            description="A quick read on pipeline health without opening every brief."
          />
          <div className="space-y-4">
            <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 ih-grid-min">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="ih-text-muted text-sm">Open</p>
                  <p className="mt-2 text-3xl font-semibold text-white ih-truncate" title={pulse.open}>{pulse.open}</p>
                </div>
                <StatusBadge tone="brand">Recruiting</StatusBadge>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 ih-grid-min">
                <p className="ih-text-muted text-sm">Completed</p>
                <p className="mt-2 text-2xl font-semibold text-white ih-truncate" title={pulse.completed}>{pulse.completed}</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 ih-grid-min">
                <p className="ih-text-muted text-sm">Closed</p>
                <p className="mt-2 text-2xl font-semibold text-white ih-truncate" title={pulse.closed}>{pulse.closed}</p>
              </div>
            </div>
            <TransitionLink
              to="/dashboard/brand/reports"
              className="ih-button-secondary ih-focus-ring inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm"
            >
              Open reports workspace
            </TransitionLink>
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-6 mt-6 xl:grid-cols-2">
        <AdminPanel tone="brand">
          <AdminPanelHeader
            kicker="Charts"
            title="Campaign Performance"
            description="Visualize the growth of campaigns and application volume over time."
          />
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pulse.performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="name" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend />
                <Line type="monotone" dataKey="campaigns" stroke="#6366f1" strokeWidth={3} />
                <Line type="monotone" dataKey="applications" stroke="#f43f5e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>

        <AdminPanel tone="emerald">
          <AdminPanelHeader
            kicker="Analytics"
            title="Engagement Breakdowns"
            description="Platform specific reach and clicks from reported statistics."
          />
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pulse.engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="platform" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "transparent" }}
                />
                <Legend />
                <Bar dataKey="reach" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>
      </div>
    </AdminPage>
  );
};

export default BrandDashboard;
