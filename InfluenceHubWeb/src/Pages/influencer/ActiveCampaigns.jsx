import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  FolderKanban, Calendar, Clock, DollarSign, ExternalLink, FileText,
  CheckCircle, AlertCircle, Eye, X, MessageSquare, UploadCloud,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AdminPage as DashboardPage,
  EmptyState, ErrorState, LoadingState, StatusBadge, FilterTabs, SearchField,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { influencerService } from "../../services/api/influencerService";
import { formatCurrency } from "../../utils/formatters";
import { getBudgetTypeLabel } from "../../utils/catalog";
import { isAbortError } from "../../services/api/client";

// CampaignStatus enum values (must match backend JsonStringEnumConverter output)
// Open=0, InfluencerSelected=1, ReportSubmitted=2, Completed=3, Closed=4
const ACTIVE_CAMPAIGN_STATUSES = ["InfluencerSelected"];

const getDaysRemaining = (deadline) => {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const ActiveCampaigns = () => {
  const { token } = useAuth();
  const [campaignsData, setCampaignsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const loadData = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const [applicationsRaw, reportsRaw] = await Promise.all([
        influencerService.getMyApplications(token, signal).catch(() => []),
        influencerService.getMyReports(token, signal).catch(() => []),
      ]);

      // Only accepted applications whose campaign is still InfluencerSelected
      const activeCampaigns = (applicationsRaw || []).filter(app =>
        app.status === "Accepted" &&
        ACTIVE_CAMPAIGN_STATUSES.includes(app.campaignStatus)
      );

      const reports = reportsRaw || [];

      const enriched = activeCampaigns.map(app => {
        // Reports are now matched via campaignId (available since backend fix)
        const campaignReports = reports.filter(r => r.campaignId === app.campaignId);
        const daysRemaining = getDaysRemaining(app.campaignDeadline);
        return { app, reports: campaignReports, daysRemaining };
      }).sort((a, b) => {
        // Sort by deadline ascending so most urgent is first
        if (a.daysRemaining !== null && b.daysRemaining !== null)
          return a.daysRemaining - b.daysRemaining;
        return new Date(b.app.createdAt) - new Date(a.app.createdAt);
      });

      if (!signal?.aborted) setCampaignsData(enriched);
    } catch (err) {
      if (!isAbortError(err) && !signal?.aborted)
        setError(err.message || "Unable to load active campaigns.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const filteredCampaigns = useMemo(() => {
    return campaignsData.filter(item => {
      const titleMatches = item.app.campaignTitle?.toLowerCase().includes(search.toLowerCase()) ||
        item.app.brandName?.toLowerCase().includes(search.toLowerCase());
      if (!titleMatches) return false;
      if (filter === "Ending Soon") return item.daysRemaining !== null && item.daysRemaining <= 7;
      if (filter === "Needs Report") return item.reports.length === 0;
      return true;
    });
  }, [campaignsData, search, filter]);

  if (loading && campaignsData.length === 0) {
    return (
      <DashboardPage>
        <LoadingState label="Loading your active campaigns..." />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold ih-text-primary tracking-tight mb-2">Active Campaigns</h1>
          <p className="ih-text-muted text-sm max-w-xl">
            Track your ongoing collaborations. Only campaigns awaiting your content delivery are shown here.
          </p>
        </div>
        <Link to="/dashboard/influencer/report" className="ih-button-primary px-4 py-2.5 whitespace-nowrap flex items-center gap-2">
          <UploadCloud size={18} /> Submit Report
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <FilterTabs
          items={[
            { label: "All Active", value: "All" },
            { label: "Needs Report", value: "Needs Report" },
            { label: "Ending Soon", value: "Ending Soon" },
          ]}
          value={filter}
          onSelect={setFilter}
        />
        <div className="w-full sm:max-w-xs">
          <SearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns or brands..."
          />
        </div>
      </div>

      {error && campaignsData.length === 0 ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : campaignsData.length === 0 ? (
        <EmptyState
          title="No active campaigns"
          description="You don't have any campaigns in progress. Apply for campaigns to get started!"
          action={
            <Link to="/dashboard/influencer/suggested" className="ih-button-primary px-5 py-2.5 mt-2">
              Browse Campaigns
            </Link>
          }
        />
      ) : filteredCampaigns.length === 0 ? (
        <EmptyState
          title="No matches found"
          description="No campaigns match your current search or filter."
          action={
            <button onClick={() => { setSearch(""); setFilter("All"); }} className="ih-button-secondary px-5 py-2.5 mt-2">
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredCampaigns.map(({ app, reports, daysRemaining }) => {
            const isUrgent = daysRemaining !== null && daysRemaining <= 3;
            const hasReport = reports.length > 0;

            return (
              <div key={app.id} className="ih-surface ih-panel-hover flex flex-col justify-between rounded-[1.5rem] p-6 border border-slate-200 transition-all">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                        <FolderKanban size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold ih-text-primary truncate" title={app.campaignTitle}>
                          {app.campaignTitle}
                        </h3>
                        <p className="text-sm ih-text-muted truncate">
                          {app.brandName || "Brand Partner"}
                        </p>
                      </div>
                    </div>
                    {hasReport ? (
                      <StatusBadge tone="success">Report Submitted</StatusBadge>
                    ) : (
                      <StatusBadge tone="warning">Needs Report</StatusBadge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-900/5">
                      <div className="flex items-center gap-1.5 ih-text-muted text-xs font-medium mb-1 uppercase tracking-wider">
                        <Clock size={14} /> Deadline
                      </div>
                      <p className={`text-sm font-semibold truncate ${isUrgent ? 'text-amber-600' : 'ih-text-primary'}`}>
                        {app.campaignDeadline ? new Date(app.campaignDeadline).toLocaleDateString() : "No deadline"}
                        {daysRemaining !== null && (
                          <span className={`ml-2 text-xs font-normal opacity-80 ${isUrgent ? 'text-amber-600' : 'ih-text-muted'}`}>
                            ({daysRemaining === 0 ? "Today!" : `${daysRemaining}d left`})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-900/5">
                      <div className="flex items-center gap-1.5 ih-text-muted text-xs font-medium mb-1 uppercase tracking-wider">
                        <DollarSign size={14} /> Reward
                      </div>
                      <p className="text-sm font-semibold text-emerald-600 truncate">
                        {formatCurrency(app.proposedBudget)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs ih-text-muted mb-2">
                      <span>Delivery Progress</span>
                      <span>{hasReport ? `${reports.length} report${reports.length > 1 ? 's' : ''} submitted` : "Awaiting first report"}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-50 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${hasReport ? 'bg-emerald-500' : 'bg-brand-500 w-[15%]'}`}
                        style={{ width: hasReport ? '100%' : '15%' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-auto gap-3">
                  <button
                    onClick={() => setSelectedCampaign({ app, reports })}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-900/15 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <Eye size={16} /> View Brief
                  </button>

                  <Link
                    to={`/dashboard/influencer/report?appId=${app.id}`}
                    className="ih-button-primary px-4 py-2 text-sm flex items-center gap-2"
                  >
                    <UploadCloud size={16} /> Submit Report
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-[#0f172a] shadow-2xl flex flex-col max-h-[90vh]">

            <div className="flex items-start justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <FolderKanban size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold ih-text-primary">{selectedCampaign.app.campaignTitle}</h3>
                  <p className="text-sm ih-text-muted mt-0.5">{selectedCampaign.app.brandName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="rounded-xl border border-slate-200 p-2 ih-text-muted hover:bg-slate-50 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <section>
                <h4 className="text-sm font-semibold ih-text-primary mb-3 flex items-center gap-2">
                  <FileText size={16} className="ih-text-muted" /> Your Original Proposal
                </h4>
                <div className="rounded-xl border border-slate-900/5 bg-slate-50 p-4 text-sm ih-text-secondary leading-relaxed italic border-l-2 border-indigo-500/50">
                  "{selectedCampaign.app.message || "No pitch message provided."}"
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold ih-text-primary mb-4 flex items-center gap-2">
                  <CheckCircle size={16} className="ih-text-muted" /> Submitted Reports
                </h4>

                {selectedCampaign.reports.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white/[0.02] p-8 text-center">
                    <p className="text-sm ih-text-muted mb-4">No reports submitted yet. Ready to deliver?</p>
                    <Link
                      to={`/dashboard/influencer/report?appId=${selectedCampaign.app.id}`}
                      className="ih-button-primary inline-flex px-4 py-2 gap-2"
                    >
                      <UploadCloud size={16} /> Submit First Report
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCampaign.reports.map(report => (
                      <div key={report.id} className="rounded-xl border border-slate-200 bg-[#162032] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold ih-text-primary">Report #{report.id.substring(0, 6)}</span>
                          <span className="text-xs ih-text-muted">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          {[["Views", report.views], ["Likes", report.likes], ["Comments", report.comments]].map(([label, val]) => (
                            <div key={label} className="bg-slate-50 rounded-lg p-2 text-center">
                              <p className="text-xs ih-text-muted">{label}</p>
                              <p className="text-sm font-semibold ih-text-primary">{val?.toLocaleString() || 0}</p>
                            </div>
                          ))}
                        </div>
                        {report.postUrl && (
                          <a href={report.postUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                            <ExternalLink size={12} /> View post
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="p-6 border-t border-slate-200 bg-[#0f172a] rounded-b-2xl flex items-center justify-end gap-3">
              <button onClick={() => setSelectedCampaign(null)} className="ih-button-secondary px-5 py-2.5 text-sm">
                Close
              </button>
              <Link
                to={`/dashboard/influencer/report?appId=${selectedCampaign.app.id}`}
                className="ih-button-primary px-5 py-2.5 text-sm flex items-center gap-2"
              >
                <UploadCloud size={16} /> Submit New Report
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardPage>
  );
};

export default ActiveCampaigns;
