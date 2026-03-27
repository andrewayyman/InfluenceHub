import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  ClipboardList,
  MessageSquareText,
  ShieldCheck,
  Users,
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
import {
  getCampaigns,
  getContactMessages,
  getDashboard,
  getReports,
  getUsers,
  markContactReplied,
} from "../../services/api/adminService";
import {
  getActivityLabel,
  getEngagementRate,
  getEngagementTotal,
  getMessageLabel,
  getMessagePreview,
  getStatusTone,
  humanizeEnum,
} from "../../utils/admin";
import {
  formatCompactNumber,
  formatDate,
  formatDateTime,
  formatPercent,
} from "../../utils/formatters";
import { isAbortError } from "../../services/api/client";

const EMPTY_DASHBOARD_DATA = {
  stats: null,
  pendingReports: [],
  unreadMessages: [],
  recentUsers: [],
  campaigns: [],
};

const AdminDashboard = () => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState("");

  const loadDashboard = useCallback(async (signal) => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const sections = [
        { key: "stats", label: "overview", request: getDashboard(token, signal) },
        { key: "pendingReports", label: "reports", request: getReports(token, { status: "Pending" }, signal) },
        { key: "unreadMessages", label: "messages", request: getContactMessages(token, { isReplied: false }, signal) },
        { key: "recentUsers", label: "users", request: getUsers(token, {}, signal), select: (users) => users.slice(0, 5) },
        { key: "campaigns", label: "campaigns", request: getCampaigns(token, {}, signal) },
      ];

      const settled = await Promise.allSettled(sections.map((section) => section.request));

      if (signal?.aborted) {
        return;
      }

      const resolvedSections = sections.map((section, index) => ({
        ...section,
        result: settled[index],
      }));

      const fulfilledSections = resolvedSections.filter((section) => section.result.status === "fulfilled");

      if (fulfilledSections.length === 0) {
        throw new Error("Unable to load the admin dashboard.");
      }

      setDashboardData((current) => {
        const nextData = current ? { ...current } : { ...EMPTY_DASHBOARD_DATA };

        fulfilledSections.forEach((section) => {
          const value = section.result.value;
          nextData[section.key] = section.select ? section.select(value) : value;
        });

        return nextData;
      });

      const failedSections = resolvedSections
        .filter((section) => section.result.status === "rejected")
        .map((section) => section.label);

      setError(
        failedSections.length
          ? `Some dashboard sections could not be refreshed: ${failedSections.join(", ")}.`
          : "",
      );
    } catch (requestError) {
      if (isAbortError(requestError) || signal?.aborted) {
        return;
      }

      setError(requestError.message || "Unable to load the admin dashboard.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();

    loadDashboard(controller.signal);

    return () => controller.abort();
  }, [loadDashboard]);

  const campaignPulse = useMemo(() => {
    const campaigns = dashboardData?.campaigns || [];

    return campaigns.reduce((summary, campaign) => {
      if (campaign.status === "Open") {
        summary.open += 1;
      }

      if (campaign.status === "Completed") {
        summary.completed += 1;
      }

      if (campaign.status === "Closed") {
        summary.closed += 1;
      }

      return summary;
    }, { open: 0, completed: 0, closed: 0 });
  }, [dashboardData?.campaigns]);

  const handleMarkReplied = async (messageId) => {
    try {
      setReplyingId(messageId);
      await markContactReplied(token, messageId);
      setDashboardData((current) => ({
        ...current,
        unreadMessages: current.unreadMessages.filter((message) => message.id !== messageId),
      }));
    } catch (requestError) {
      setError(requestError.message || "The message could not be updated.");
    } finally {
      setReplyingId("");
    }
  };

  if (loading && !dashboardData) {
    return (
      <AdminPage>
        <LoadingState label="Loading the admin command view..." />
      </AdminPage>
    );
  }

  if (error && !dashboardData) {
    return (
      <AdminPage>
        <ErrorState message={error} onRetry={() => loadDashboard()} />
      </AdminPage>
    );
  }

  const stats = dashboardData?.stats;

  return (
    <AdminPage>
      <AdminHero
        kicker="Admin dashboard"
        title="Keep platform trust, campaign delivery, and support queues aligned."
        description="This workspace brings together the accounts, reports, campaigns, and contact requests that shape marketplace confidence every day."
        badges={[
          { label: `${stats?.totalBrands || 0} brands`, className: "ih-pill-brand" },
          { label: `${stats?.totalInfluencers || 0} influencers`, className: "ih-pill-emerald" },
          { label: `${campaignPulse.open} open campaigns`, className: "ih-pill-warm" },
          { label: `${dashboardData?.unreadMessages.length || 0} messages waiting`, className: "ih-pill-brand" },
        ]}
        aside={(
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="ih-icon-chip ih-icon-chip-success h-10 w-10 shrink-0 rounded-2xl">
                <ShieldCheck size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Trust first</p>
                <p className="ih-text-muted mt-1 text-sm leading-6">
                  Review pending reports and unresolved messages before they slow active campaigns.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="ih-icon-chip ih-icon-chip-warning h-10 w-10 shrink-0 rounded-2xl">
                <ClipboardList size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Queue health</p>
                <p className="ih-text-muted mt-1 text-sm leading-6">
                  {stats?.pendingReports || 0} reports still need review and {dashboardData?.unreadMessages.length || 0} messages still need a reply.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="ih-icon-chip ih-icon-chip-brand h-10 w-10 shrink-0 rounded-2xl">
                <Users size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Marketplace balance</p>
                <p className="ih-text-muted mt-1 text-sm leading-6">
                  Watch the mix between brands and influencers so campaigns always have matching supply and demand.
                </p>
              </div>
            </div>
          </div>
        )}
      >
        <div className="flex flex-wrap gap-3">
          <TransitionLink to="/dashboard/admin/reports" className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm">
            Review reports
            <ArrowUpRight size={16} aria-hidden="true" />
          </TransitionLink>
          <TransitionLink to="/dashboard/admin/messages" className="ih-button-secondary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm">
            Open support inbox
          </TransitionLink>
        </div>
      </AdminHero>

      {error ? <ErrorState message={error} onRetry={() => loadDashboard()} /> : null}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard index={0} accentClass="ih-metric-card-brand" icon={Users} label="Total users" value={stats?.totalUsers || 0} note="All registered accounts across the marketplace." />
        <AdminMetricCard index={1} accentClass="ih-metric-card-warm" icon={ClipboardList} label="Campaigns" value={stats?.totalCampaigns || 0} note="Campaigns created and tracked by the platform." />
        <AdminMetricCard index={2} accentClass="ih-metric-card-success" icon={MessageSquareText} label="Applications" value={stats?.totalApplications || 0} note="Applications moving brands toward influencer selection." />
        <AdminMetricCard index={3} accentClass="ih-metric-card-danger" icon={AlertCircle} label="Pending reports" value={stats?.pendingReports || 0} note="Reports waiting for admin validation and final approval." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <AdminPanel tone="brand">
          <AdminPanelHeader
            kicker="Priority queue"
            title="Pending report review"
            description="Start with the reports most likely to unblock campaign completion today."
            actions={(
              <TransitionLink to="/dashboard/admin/reports" className="ih-link ih-focus-ring rounded-sm text-sm font-medium">
                View full queue
              </TransitionLink>
            )}
          />

          {dashboardData?.pendingReports.length ? (
            <div className="space-y-4">
              {dashboardData.pendingReports.slice(0, 3).map((report) => (
                <article key={report.id} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 ih-grid-min">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="ih-min-0">
                      <p className="text-sm font-semibold text-white ih-clamp-2" title={report.campaignTitle}>{report.campaignTitle}</p>
                      <p className="ih-text-muted mt-1 text-sm ih-wrap ih-clamp-2" title={`${report.influencerName} · ${report.influencerEmail}`}>
                        {report.influencerName} · {report.influencerEmail}
                      </p>
                    </div>
                    <StatusBadge tone={getStatusTone(report.status)}>{humanizeEnum(report.status)}</StatusBadge>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/8 bg-slate-950/20 px-3 py-3 ih-grid-min">
                      <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Views</p>
                      <p className="mt-2 text-lg font-semibold text-white ih-truncate" title={formatCompactNumber(report.views)}>{formatCompactNumber(report.views)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-slate-950/20 px-3 py-3 ih-grid-min">
                      <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Engagement</p>
                      <p className="mt-2 text-lg font-semibold text-white ih-truncate" title={formatCompactNumber(getEngagementTotal(report))}>{formatCompactNumber(getEngagementTotal(report))}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-slate-950/20 px-3 py-3 ih-grid-min">
                      <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Rate</p>
                      <p className="mt-2 text-lg font-semibold text-white ih-truncate" title={formatPercent(getEngagementRate(report))}>{formatPercent(getEngagementRate(report))}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <p className="ih-text-muted ih-wrap ih-clamp-2" title={`Submitted for ${formatDate(report.startDate)} to ${formatDate(report.endDate)}`}>
                      Submitted for {formatDate(report.startDate)} to {formatDate(report.endDate)}
                    </p>
                    <a href={report.postUrl} target="_blank" rel="noreferrer" className="ih-link ih-focus-ring rounded-sm inline-flex items-center gap-1 font-medium ih-truncate" title={report.postUrl}>
                      Open post
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No pending reports right now" description="The review queue is clear. New submitted reports will show up here first." />
          )}
        </AdminPanel>

        <AdminPanel tone="emerald">
          <AdminPanelHeader
            kicker="Campaign pulse"
            title="Current delivery shape"
            description="A quick read on how active work is moving across the marketplace."
          />

          <div className="space-y-4">
            <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 ih-grid-min">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="ih-text-muted text-sm">Open campaigns</p>
                  <p className="mt-2 text-3xl font-semibold text-white ih-truncate" title={campaignPulse.open}>{campaignPulse.open}</p>
                </div>
                <StatusBadge tone="brand">Needs monitoring</StatusBadge>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 ih-grid-min">
                <p className="ih-text-muted text-sm">Completed</p>
                <p className="mt-2 text-2xl font-semibold text-white ih-truncate" title={campaignPulse.completed}>{campaignPulse.completed}</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 ih-grid-min">
                <p className="ih-text-muted text-sm">Closed</p>
                <p className="mt-2 text-2xl font-semibold text-white ih-truncate" title={campaignPulse.closed}>{campaignPulse.closed}</p>
              </div>
            </div>
            <TransitionLink to="/dashboard/admin/campaigns" className="ih-button-secondary ih-focus-ring inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm">
              Go to campaigns
            </TransitionLink>
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
        <AdminPanel>
          <AdminPanelHeader
            kicker="Newest accounts"
            title="Recent brand and influencer signups"
            description="Use this list to spot suspicious accounts early and keep onboarding healthy."
            actions={(
              <TransitionLink to="/dashboard/admin/users" className="ih-link ih-focus-ring rounded-sm text-sm font-medium">
                Manage users
              </TransitionLink>
            )}
          />

          <div className="overflow-x-auto">
            <table className="min-w-[42rem] w-full text-left">
              <thead className="ih-table-head border-b text-sm">
                <tr>
                  <th className="pb-3" scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.recentUsers.map((user) => (
                  <tr key={user.id} className="ih-table-row border-b last:border-none">
                    <td className="py-4 min-w-[12rem]">
                      <p className="ih-text-primary font-medium ih-clamp-2" title={user.displayName}>{user.displayName}</p>
                      <p className="ih-text-muted mt-1 text-sm ih-wrap ih-clamp-2" title={user.email}>{user.email}</p>
                    </td>
                    <td>
                      <StatusBadge tone={getStatusTone(user.roleName)}>{user.roleName}</StatusBadge>
                    </td>
                    <td>
                      <StatusBadge tone={getStatusTone(user.isActive)}>{getActivityLabel(user.isActive)}</StatusBadge>
                    </td>
                    <td className="ih-text-secondary text-sm ih-truncate" title={formatDateTime(user.createdAt)}>{formatDateTime(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <AdminPanel tone="brand">
          <AdminPanelHeader
            kicker="Contact follow-up"
            title="Messages still waiting for reply"
            description="Keep inbound requests moving so the marketplace always feels responsive."
            actions={(
              <TransitionLink to="/dashboard/admin/messages" className="ih-link ih-focus-ring rounded-sm text-sm font-medium">
                Open inbox
              </TransitionLink>
            )}
          />

          {dashboardData?.unreadMessages.length ? (
            <div className="space-y-4">
              {dashboardData.unreadMessages.slice(0, 4).map((message) => (
                <article key={message.id} className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 ih-grid-min">
                  <div className="flex items-start justify-between gap-3">
                    <div className="ih-min-0">
                      <p className="text-sm font-semibold text-white ih-clamp-2" title={message.subject}>{message.subject}</p>
                      <p className="ih-text-muted mt-1 text-sm ih-wrap ih-clamp-2" title={`${message.name} · ${message.email}`}>
                        {message.name} · {message.email}
                      </p>
                    </div>
                    <StatusBadge tone={message.isReplied ? "success" : "warning"}>{getMessageLabel(message.isReplied)}</StatusBadge>
                  </div>
                  <p className="ih-text-secondary mt-3 text-sm leading-6 ih-wrap ih-clamp-3" title={getMessagePreview(message)}>{getMessagePreview(message)}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="ih-text-subtle text-xs uppercase tracking-[0.18em] ih-truncate" title={formatDateTime(message.createdAt)}>{formatDateTime(message.createdAt)}</p>
                    <button
                      type="button"
                      onClick={() => handleMarkReplied(message.id)}
                      disabled={replyingId === message.id}
                      className="ih-button-secondary ih-focus-ring px-3 py-2 text-sm"
                    >
                      {replyingId === message.id ? "Updating..." : "Mark replied"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No waiting contact messages" description="Support follow-up is clear. New contact submissions will land here automatically." />
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  );
};

export default AdminDashboard;
