import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  ClipboardList,
  MessageSquareText,
  ShieldCheck,
  Tags,
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
  getUsers,
  markContactReplied,
} from "../../services/api/adminService";
import { createTag, getTags } from "../../services/api/tagService";
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
  const [tags, setTags] = useState([]);
  const [tagName, setTagName] = useState("");
  const [tagError, setTagError] = useState("");
  const [isSavingTag, setIsSavingTag] = useState(false);

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

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const controller = new AbortController();

    const loadTags = async () => {
      try {
        setTagError("");
        const response = await getTags(token, controller.signal);
        if (!controller.signal.aborted) {
          setTags(response || []);
        }
      } catch (requestError) {
        if (!isAbortError(requestError) && !controller.signal.aborted) {
          setTagError(requestError.message || "Unable to load tags.");
        }
      }
    };

    loadTags();

    return () => controller.abort();
  }, [token]);

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

  const handleCreateTag = async (event) => {
    event.preventDefault();

    const normalizedTagName = tagName.trim();
    if (!normalizedTagName) {
      setTagError("Tag name is required.");
      return;
    }

    try {
      setIsSavingTag(true);
      setTagError("");
      const createdTag = await createTag(token, { name: normalizedTagName });
      setTags((current) => {
        const next = [...current, createdTag];
        next.sort((left, right) => left.name.localeCompare(right.name));
        return next;
      });
      setTagName("");
    } catch (requestError) {
      setTagError(requestError.message || "The tag could not be created.");
    } finally {
      setIsSavingTag(false);
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


      {error ? <ErrorState message={error} onRetry={() => loadDashboard()} /> : null}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard index={0} accentClass="ih-metric-card-brand" icon={Users} label="Total users" value={stats?.totalUsers || 0} note="All registered accounts across the marketplace." />
        <AdminMetricCard index={1} accentClass="ih-metric-card-warm" icon={ClipboardList} label="Campaigns" value={stats?.totalCampaigns || 0} note="Campaigns created and tracked by the platform." />
        <AdminMetricCard index={2} accentClass="ih-metric-card-success" icon={MessageSquareText} label="Applications" value={stats?.totalApplications || 0} note="Applications moving brands toward influencer selection." />
      </div>

      <div className="grid gap-6 xl:grid-cols-1">


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

      <AdminPanel tone="emerald">
        <AdminPanelHeader
          kicker="Tag governance"
          title="Seed and expand matching tags"
          description="Create shared tags once so brands and influencers can assign the same taxonomy across campaign matching."
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <form onSubmit={handleCreateTag} className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="ih-icon-chip ih-icon-chip-brand flex h-10 w-10 items-center justify-center rounded-2xl">
                <Tags size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Create new tag</p>
                <p className="ih-text-muted text-sm">Keep names short and reusable across brands and creators.</p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-medium text-white" htmlFor="tagName">Tag name</label>
            <input
              id="tagName"
              type="text"
              value={tagName}
              onChange={(event) => setTagName(event.target.value)}
              className="ih-input w-full"
              placeholder="e.g. Streetwear"
            />

            {tagError ? <p className="mt-3 text-sm text-red-400">{tagError}</p> : null}

            <button
              type="submit"
              disabled={isSavingTag}
              className="ih-button-primary ih-focus-ring mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
            >
              {isSavingTag ? "Saving..." : "Create tag"}
            </button>
          </form>

          <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Current tag library</p>
                <p className="ih-text-muted text-sm">These tags are available to brands and influencers right now.</p>
              </div>
              <StatusBadge tone="brand">{tags.length} tags</StatusBadge>
            </div>

            <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto">
              {tags.length > 0 ? tags.map((tag) => (
                <span key={tag.id} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200">
                  {tag.name}
                </span>
              )) : (
                <p className="text-sm text-slate-400">No tags available yet.</p>
              )}
            </div>
          </div>
        </div>
      </AdminPanel>

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
