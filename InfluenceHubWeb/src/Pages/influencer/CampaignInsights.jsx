import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  BarChart3, Clock, DollarSign, ExternalLink, CheckCircle,
  AlertCircle, X, FileText, Calendar, Star,
} from "lucide-react";
import {
  AdminPage as DashboardPage,
  EmptyState, ErrorState, LoadingState, StatusBadge, SearchField,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { influencerService } from "../../services/api/influencerService";
import { formatCurrency } from "../../utils/formatters";
import { getBudgetTypeLabel } from "../../utils/catalog";
import { isAbortError } from "../../services/api/client";

// Campaigns move here once the brand has acknowledged the report
// ReportSubmitted=2, Completed=3, Closed=4
const INSIGHTS_CAMPAIGN_STATUSES = ["ReportSubmitted", "Completed", "Closed"];

const reportStatusLabel = (status) => {
  if (status === "Approved") return <StatusBadge tone="success">Approved</StatusBadge>;
  if (status === "Rejected") return <StatusBadge tone="danger">Rejected</StatusBadge>;
  return <StatusBadge tone="info">Under Review</StatusBadge>;
};

const campaignStatusLabel = (campaignStatus) => {
  if (campaignStatus === "Completed") return <StatusBadge tone="success">Completed</StatusBadge>;
  if (campaignStatus === "Closed") return <StatusBadge tone="neutral">Closed</StatusBadge>;
  if (campaignStatus === "ReportSubmitted") return <StatusBadge tone="info">Under Review</StatusBadge>;
  return <StatusBadge tone="neutral">Unknown</StatusBadge>;
};

const CampaignInsights = () => {
  const { token } = useAuth();
  const [insightsData, setInsightsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedInsight, setSelectedInsight] = useState(null);

  const loadData = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const [applicationsRaw, reportsRaw] = await Promise.all([
        influencerService.getMyApplications(token, signal).catch(() => []),
        influencerService.getMyReports(token, signal).catch(() => []),
      ]);

      const reports = reportsRaw || [];

      // Only accepted applications whose campaign has moved past active delivery
      const completedCampaigns = (applicationsRaw || []).filter(app =>
        app.status === "Accepted" &&
        INSIGHTS_CAMPAIGN_STATUSES.includes(app.campaignStatus)
      );

      const enriched = completedCampaigns.map(app => {
        const campaignReports = reports.filter(r => r.campaignId === app.campaignId);
        return { app, reports: campaignReports };
      }).sort((a, b) => new Date(b.app.createdAt) - new Date(a.app.createdAt));

      if (!signal?.aborted) setInsightsData(enriched);
    } catch (err) {
      if (!isAbortError(err) && !signal?.aborted)
        setError(err.message || "Unable to load campaign insights.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const filteredInsights = useMemo(() => {
    return insightsData.filter(item =>
      item.app.campaignTitle?.toLowerCase().includes(search.toLowerCase()) ||
      item.app.brandName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [insightsData, search]);

  if (loading && insightsData.length === 0) {
    return (
      <DashboardPage>
        <LoadingState label="Loading your performance history..." />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold ih-text-primary tracking-tight mb-2">Campaign Insights</h1>
          <p className="ih-text-muted text-sm max-w-xl">
            Review your completed campaign history, track submitted performance reports, and analyze brand feedback.
          </p>
        </div>
      </div>

      <div className="mb-6 w-full sm:max-w-md">
        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by campaign or brand name..."
        />
      </div>

      {error && insightsData.length === 0 ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : insightsData.length === 0 ? (
        <EmptyState
          title="No completed campaigns yet"
          description="Once you submit a report for an active campaign, it will appear here with full performance analytics."
        />
      ) : filteredInsights.length === 0 ? (
        <EmptyState
          title="No matches found"
          description="Try adjusting your search to find the campaign you are looking for."
          action={
            <button onClick={() => setSearch("")} className="ih-button-secondary px-5 py-2.5 mt-2">
              Clear Search
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredInsights.map(({ app, reports }) => {
            const latestReport = reports[0];
            const totalEngagement = (latestReport?.likes || 0) + (latestReport?.comments || 0) + (latestReport?.shares || 0);
            const engagementRate = latestReport?.views > 0
              ? ((totalEngagement / latestReport.views) * 100).toFixed(1)
              : "0.0";

            return (
              <div key={app.id} className="ih-panel ih-panel-hover flex flex-col justify-between rounded-[1.5rem] p-6 border border-slate-200 transition-all">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                        <BarChart3 size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold ih-text-primary truncate" title={app.campaignTitle}>
                          {app.campaignTitle}
                        </h3>
                        <p className="text-sm ih-text-muted truncate">{app.brandName || "Brand Partner"}</p>
                      </div>
                    </div>
                    {campaignStatusLabel(app.campaignStatus)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-900/5">
                      <div className="flex items-center gap-1.5 ih-text-muted text-xs font-medium mb-1 uppercase tracking-wider">
                        <Calendar size={14} /> Submitted
                      </div>
                      <p className="text-sm font-semibold ih-text-primary">
                        {latestReport ? new Date(latestReport.postingDate).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-900/5">
                      <div className="flex items-center gap-1.5 ih-text-muted text-xs font-medium mb-1 uppercase tracking-wider">
                        <DollarSign size={14} /> Payout
                      </div>
                      <p className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(app.proposedBudget)}
                      </p>
                    </div>
                  </div>

                  {latestReport && (
                    <div className="mb-5 bg-white/[0.02] border border-slate-900/5 rounded-xl p-4">
                      <h4 className="text-xs font-semibold ih-text-muted uppercase tracking-wider mb-3">Top-Line Performance</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          ["Views", latestReport.views],
                          ["Likes", latestReport.likes],
                          ["Comments", latestReport.comments],
                          ["Eng. Rate", `${engagementRate}%`],
                        ].map(([label, val]) => (
                          <div key={label} className="text-center">
                            <p className="text-base font-bold ih-text-primary">
                              {typeof val === "number" ? val.toLocaleString() : val}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-auto">
                  <div className="text-xs text-slate-500">
                    {reports.length} report{reports.length !== 1 ? "s" : ""} submitted
                  </div>
                  <button
                    onClick={() => setSelectedInsight({ app, reports })}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-200"
                  >
                    Full Breakdown
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deep Dive Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-200 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <BarChart3 size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold ih-text-primary leading-tight mb-1">
                    {selectedInsight.app.campaignTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm ih-text-muted">
                    {campaignStatusLabel(selectedInsight.app.campaignStatus)}
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> Accepted: {new Date(selectedInsight.app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedInsight(null)} className="rounded-xl border border-slate-200 p-2 ih-text-muted hover:bg-slate-50 transition-colors self-start sm:self-center">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">

              {/* Campaign Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 border border-slate-900/5 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Brand</p>
                  <p className="text-sm font-medium ih-text-primary">{selectedInsight.app.brandName || "—"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-900/5 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Agreed Payout</p>
                  <p className="text-sm font-semibold text-emerald-600">{formatCurrency(selectedInsight.app.proposedBudget)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-900/5 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Campaign Deadline</p>
                  <p className="text-sm font-medium ih-text-primary">
                    {selectedInsight.app.campaignDeadline ? new Date(selectedInsight.app.campaignDeadline).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>

              {/* Admin Feedback Banner & Brand Review */}
              <div className="space-y-4">
                {selectedInsight.reports[0] && selectedInsight.reports[0].review && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                          <CheckCircle size={18} />
                        </div>
                        <h4 className="font-bold ih-text-primary text-sm uppercase tracking-wider">Brand Review</h4>
                      </div>
                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-indigo-100 shadow-sm">
                        <span className="text-sm font-bold text-indigo-600">{selectedInsight.reports[0].review.rating}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`h-3.5 w-3.5 ${i < selectedInsight.reports[0].review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <blockquote className="ih-text-primary italic text-sm leading-relaxed mb-4 border-l-2 border-indigo-200 pl-4 py-1 bg-white/40 rounded-r-lg">
                      "{selectedInsight.reports[0].review.comment}"
                    </blockquote>
                    <div className="flex items-center justify-between text-xs ih-text-muted mt-2">
                      <span className="font-medium text-indigo-700">Reviewed by {selectedInsight.reports[0].review.reviewerName}</span>
                      <span>{new Date(selectedInsight.reports[0].review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {selectedInsight.reports[0] && (
                  <div>
                    {selectedInsight.reports[0].rejectionReason ? (
                      <div className="rounded-xl border border-red-500/20 bg-red-50 p-4 flex items-start gap-3">
                        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-red-800 font-semibold">Report Issue</p>
                          <p className="text-xs text-red-700 mt-1">{selectedInsight.reports[0].rejectionReason}</p>
                        </div>
                      </div>
                    ) : selectedInsight.app.campaignStatus === "Completed" ? (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 p-4 flex items-center gap-3">
                        <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                        <p className="text-sm text-emerald-800 font-medium">Your report has been approved. Excellent work!</p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-blue-500/20 bg-blue-50 p-4 flex items-center gap-3">
                        <Clock size={18} className="text-blue-600 shrink-0" />
                        <p className="text-sm text-blue-800 font-medium">Your report is currently being reviewed by the brand manager.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Report History */}
              <section>
                <h4 className="text-sm font-semibold ih-text-primary mb-4 flex items-center gap-2">
                  <FileText size={16} className="ih-text-muted" /> Submitted Reports
                </h4>

                {selectedInsight.reports.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white/[0.02] p-8 text-center">
                    <p className="text-sm ih-text-muted">No report data found for this campaign.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedInsight.reports.map((report, index) => {
                      const totalEng = (report.likes || 0) + (report.comments || 0) + (report.shares || 0);
                      const engRate = report.views > 0 ? ((totalEng / report.views) * 100).toFixed(1) : "0.0";

                      return (
                        <div key={report.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                          <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                            <span className="text-sm font-bold ih-text-primary">
                              Submission #{selectedInsight.reports.length - index}
                            </span>
                            <div className="flex items-center gap-3">
                              {reportStatusLabel(report.status)}
                              <span className="text-xs ih-text-muted">{new Date(report.postingDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="p-5">
                            {report.postUrl && (
                              <a href={report.postUrl} target="_blank" rel="noopener noreferrer"
                                className="mb-5 flex items-center gap-2 text-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 px-3 py-2 rounded-lg w-fit hover:bg-indigo-100 transition-colors">
                                <ExternalLink size={16} /> View Content Post
                              </a>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                              {[
                                ["Views", report.views],
                                ["Likes", report.likes],
                                ["Comments", report.comments],
                                ["Shares", report.shares],
                                ["Eng. %", `${engRate}%`],
                              ].map(([label, val]) => (
                                <div key={label} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-900/5">
                                  <p className="text-xs ih-text-muted uppercase tracking-wider mb-1">{label}</p>
                                  <p className="text-lg font-bold ih-text-primary">
                                    {typeof val === "number" ? val.toLocaleString() : val}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="ih-text-muted flex justify-between bg-slate-50 px-3 py-2 rounded">
                                <span>Posting Date:</span>
                                <span className="ih-text-primary">{new Date(report.postingDate).toLocaleDateString()}</span>
                              </div>
                              <div className="ih-text-muted flex justify-between bg-slate-50 px-3 py-2 rounded">
                                <span>Metrics Window:</span>
                                <span className="ih-text-primary">
                                  {new Date(report.startDate).toLocaleDateString()} — {new Date(report.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {report.platformInsights && report.platformInsights.length > 0 && (
                              <div className="mt-4 space-y-2">
                                <p className="text-xs font-semibold ih-text-secondary uppercase tracking-wider">Per Platform</p>
                                {report.platformInsights.map((pi, i) => (
                                  <div key={i} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-lg">
                                    <span className="font-semibold text-brand-600">{pi.platform}</span>
                                    <span className="ih-text-muted font-medium">
                                      {pi.views?.toLocaleString()} views · {pi.likes?.toLocaleString()} likes
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </DashboardPage>
  );
};

export default CampaignInsights;

