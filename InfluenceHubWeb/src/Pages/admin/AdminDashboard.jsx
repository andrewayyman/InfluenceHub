import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
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
  getContactSourceLabel,
  getContactSourceTone,
  getMessagePreview,
  getStatusTone,
} from "../../utils/admin";
import {
  formatDate,
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
      <AdminHero
        kicker="Platform Overview"
        title="Command Center"
        description="Monitor marketplace health, moderate new accounts, and manage taxonomy. Your oversight ensures a high-quality environment for brands and creators."
        aside={(
          <div className="grid grid-cols-2 gap-3 h-full">
            <div className="rounded-2xl bg-brand-500/10 border border-brand-500/20 p-4 flex flex-col justify-center">
              <p className="text-brand-600 text-[10px] font-bold uppercase tracking-widest">Live Campaigns</p>
              <p className="ih-text-primary text-2xl font-bold mt-1">{campaignPulse.open}</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex flex-col justify-center">
              <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Applications</p>
              <p className="ih-text-primary text-2xl font-bold mt-1">{stats?.totalApplications || 0}</p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex flex-col justify-center">
              <p className="text-amber-600 text-[10px] font-bold uppercase tracking-widest">New Users</p>
              <p className="ih-text-primary text-2xl font-bold mt-1">{dashboardData?.recentUsers.length || 0}</p>
            </div>
            <div className="rounded-2xl bg-slate-500/10 border border-slate-500/20 p-4 flex flex-col justify-center">
              <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Support</p>
              <p className="ih-text-primary text-2xl font-bold mt-1">{dashboardData?.unreadMessages.length || 0}</p>
            </div>
          </div>
        )}
      />

      {error ? <ErrorState message={error} onRetry={() => loadDashboard()} /> : null}

      {/* Main Command Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        
        {/* Primary Activity Column */}
        <div className="space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminMetricCard index={0} accentClass="ih-metric-card-brand" icon={Users} label="Total Users" value={stats?.totalUsers || 0} note="Growth tracked since launch." />
            <AdminMetricCard index={1} accentClass="ih-metric-card-warm" icon={ClipboardList} label="Campaigns" value={stats?.totalCampaigns || 0} note="Active marketplace volume." />
            <AdminMetricCard index={2} accentClass="ih-metric-card-success" icon={MessageSquareText} label="Engagements" value={stats?.totalApplications || 0} note="Brand-Influencer connects." />
          </div>

          {/* Recent Users List */}
          <AdminPanel>
            <AdminPanelHeader
              kicker="Moderate"
              title="Newest Platform Members"
              description="Review recently joined accounts for quality and authenticity."
              actions={(
                <TransitionLink to="/dashboard/admin/users" className="ih-button-secondary px-4 py-2 text-xs font-bold flex items-center gap-2">
                  View All <ArrowUpRight size={14} />
                </TransitionLink>
              )}
            />

            <div className="space-y-3">
              {dashboardData?.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-brand-600">
                      {user.displayName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="ih-text-primary font-bold truncate text-sm">{user.displayName}</p>
                      <p className="ih-text-muted text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge tone={getStatusTone(user.roleName)}>{user.roleName}</StatusBadge>
                    <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>

          {/* Unread Messages */}
          <AdminPanel tone="brand">
            <AdminPanelHeader
              kicker="Support"
              title="Pending Inbound Inquiries"
              description="Respond to contact requests to maintain high marketplace trust."
              actions={(
                <TransitionLink to="/dashboard/admin/messages" className="ih-button-secondary px-4 py-2 text-xs font-bold flex items-center gap-2">
                  Inbox <ArrowUpRight size={14} />
                </TransitionLink>
              )}
            />

            {dashboardData?.unreadMessages.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {dashboardData.unreadMessages.slice(0, 4).map((message) => (
                  <article key={message.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="ih-min-0">
                        <p className="text-sm font-bold ih-text-primary truncate" title={message.subject}>{message.subject}</p>
                        <p className="ih-text-muted mt-0.5 text-[11px] truncate">{message.name}</p>
                        <p className="ih-text-subtle mt-1 text-[10px] truncate uppercase tracking-[0.18em]">{message.email}</p>
                      </div>
                      <StatusBadge tone={getContactSourceTone(message.senderRole)}>{getContactSourceLabel(message.senderRole)}</StatusBadge>
                    </div>
                    <p className="ih-text-secondary text-xs leading-relaxed line-clamp-2 mb-4 h-8" title={getMessagePreview(message)}>
                      {getMessagePreview(message)}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{formatDate(message.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => handleMarkReplied(message.id)}
                        disabled={replyingId === message.id}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 disabled:opacity-50"
                      >
                        {replyingId === message.id ? "..." : "Resolve"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="All clear!" description="No pending contact messages at this time." />
            )}
          </AdminPanel>
        </div>

        {/* Sidebar Oversight Column */}
        <div className="space-y-8">
          
          {/* Campaign Pulse */}
          <AdminPanel tone="emerald" className="h-fit">
            <AdminPanelHeader
              title="Market Health"
              description="Live campaign distribution."
            />

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="ih-text-muted text-[10px] font-bold uppercase tracking-widest">Open Ops</p>
                    <p className="mt-1 text-3xl font-black ih-text-primary">{campaignPulse.open}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                    <ShieldCheck size={20} />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="ih-text-muted text-[10px] font-bold uppercase tracking-tighter">Finished</p>
                  <p className="mt-1 text-xl font-bold ih-text-primary">{campaignPulse.completed}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="ih-text-muted text-[10px] font-bold uppercase tracking-tighter">Archived</p>
                  <p className="mt-1 text-xl font-bold ih-text-primary">{campaignPulse.closed}</p>
                </div>
              </div>

              <TransitionLink to="/dashboard/admin/campaigns" className="ih-button-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                Manage Delivery
              </TransitionLink>
            </div>
          </AdminPanel>

          {/* Tag Governance */}
          <AdminPanel tone="default" className="h-fit">
            <AdminPanelHeader
              title="Taxonomy"
              description="Manage global tags."
            />

            <form onSubmit={handleCreateTag} className="mb-6">
              <div className="relative">
                <Tags size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={tagName}
                  onChange={(event) => setTagName(event.target.value)}
                  className="ih-input w-full pl-9 py-2.5 text-sm"
                  placeholder="New tag..."
                />
              </div>
              {tagError ? <p className="mt-2 text-[10px] text-red-500 font-bold">{tagError}</p> : null}
              <button
                type="submit"
                disabled={isSavingTag}
                className="ih-button-secondary w-full mt-3 py-2 text-xs font-bold"
              >
                {isSavingTag ? "Saving..." : "Add Tag"}
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto pr-1">
              {tags.map((tag) => (
                <span key={tag.id} className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 border border-slate-200">
                  {tag.name}
                </span>
              ))}
            </div>
          </AdminPanel>

        </div>
      </div>
    </AdminPage>
  );
};

export default AdminDashboard;
