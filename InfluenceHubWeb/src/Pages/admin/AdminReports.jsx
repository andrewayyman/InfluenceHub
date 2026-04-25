import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  XCircle,
} from "lucide-react";
import {
  AdminHero,
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  EmptyState,
  ErrorState,
  FilterTabs,
  LoadingState,
  SearchField,
  StatusBadge,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  approveReport,
  getReports,
  rejectReport,
} from "../../services/api/adminService";
import { resolveApiUrl } from "../../services/api/client";
import {
  getEngagementRate,
  getEngagementTotal,
  getStatusTone,
  humanizeEnum,
  REPORT_STATUS_OPTIONS,
} from "../../utils/admin";
import {
  formatCompactNumber,
  formatDate,
  formatDateTime,
  formatPercent,
} from "../../utils/formatters";
import { isAbortError } from "../../services/api/client";

const AdminReports = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actingId, setActingId] = useState("");
  const [rejectingId, setRejectingId] = useState("");
  const [rejectionDrafts, setRejectionDrafts] = useState({});
  const debouncedSearch = useDebouncedValue(search, 250);

  const loadReports = useCallback(async (signal) => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getReports(token, {
        status: statusFilter,
        search: debouncedSearch,
      }, signal);

      setReports(response);
    } catch (requestError) {
      if (isAbortError(requestError) || signal?.aborted) {
        return;
      }

      setError(requestError.message || "Unable to load reports.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, statusFilter, token]);

  useEffect(() => {
    const controller = new AbortController();

    loadReports(controller.signal);

    return () => controller.abort();
  }, [loadReports]);

  const summary = useMemo(() => reports.reduce((result, report) => {
    result.total += 1;

    const statusKey = report.status?.toLowerCase();

    if (statusKey && Object.hasOwn(result, statusKey)) {
      result[statusKey] += 1;
    }

    return result;
  }, {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  }), [reports]);

  const handleApprove = async (report) => {
    try {
      setActingId(report.id);
      setNotice("");
      await approveReport(token, report.id);
      setNotice(`${report.campaignTitle} has been approved.`);
      await loadReports();
    } catch (requestError) {
      setError(requestError.message || "That report could not be approved.");
    } finally {
      setActingId("");
    }
  };

  const handleReject = async (report) => {
    try {
      setActingId(report.id);
      setNotice("");
      await rejectReport(token, report.id, rejectionDrafts[report.id]?.trim());
      setNotice(`${report.campaignTitle} has been rejected.`);
      setRejectingId("");
      setRejectionDrafts((current) => ({ ...current, [report.id]: "" }));
      await loadReports();
    } catch (requestError) {
      setError(requestError.message || "That report could not be rejected.");
    } finally {
      setActingId("");
    }
  };

  return (
    <AdminPage>


      {error ? <ErrorState message={error} onRetry={() => loadReports()} /> : null}

      <AdminPanel tone="brand">
        <AdminPanelHeader
          kicker="Review queue"
          title="Reports"
          description="Switch between pending, approved, and rejected reports without leaving the review surface."
          actions={notice ? <span role="status" aria-live="polite"><StatusBadge tone="success">{notice}</StatusBadge></span> : null}
        />

        <div className="mb-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by campaign, influencer, email, or post URL" />
            <button
              type="button"
              onClick={() => setSearch("")}
              className="ih-button-secondary ih-focus-ring px-4 py-3 text-sm"
            >
              Clear search
            </button>
          </div>
          <FilterTabs label="Filter reports by review status" items={REPORT_STATUS_OPTIONS} value={statusFilter} onSelect={setStatusFilter} />
        </div>

        {loading ? <LoadingState label="Loading reports..." /> : null}

        {!loading && reports.length === 0 ? (
          <EmptyState title="No reports match this queue" description="Try another search term or switch to a different report status." />
        ) : null}

        {!loading && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => {
              const campaignTitle = report.campaignTitle?.trim() || "Untitled campaign";
              const influencerName = report.influencerName?.trim() || "Unknown influencer";
              const influencerEmail = report.influencerEmail?.trim() || "No email provided";
              const screenshotUrl = report.screenshotPath ? resolveApiUrl(report.screenshotPath) : null;
              const isPending = report.status === "Pending";
              const isActing = actingId === report.id;

              return (
                <article key={report.id} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{campaignTitle}</p>
                      <p className="ih-text-muted mt-1 text-sm">{influencerName} · {influencerEmail}</p>
                    </div>
                    <StatusBadge tone={getStatusTone(report.status)}>{humanizeEnum(report.status)}</StatusBadge>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-white/8 bg-slate-950/20 px-3 py-3">
                      <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Views</p>
                      <p className="mt-2 text-lg font-semibold text-white">{formatCompactNumber(report.views)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-slate-950/20 px-3 py-3">
                      <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Engagement</p>
                      <p className="mt-2 text-lg font-semibold text-white">{formatCompactNumber(getEngagementTotal(report))}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-slate-950/20 px-3 py-3">
                      <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Engagement rate</p>
                      <p className="mt-2 text-lg font-semibold text-white">{formatPercent(getEngagementRate(report))}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-slate-950/20 px-3 py-3">
                      <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Posting date</p>
                      <p className="mt-2 text-lg font-semibold text-white">{formatDate(report.postingDate)}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div className="space-y-3">
                      <p className="ih-text-secondary text-sm leading-6">
                        Reporting window: <span className="text-white">{formatDate(report.startDate)}</span> to <span className="text-white">{formatDate(report.endDate)}</span>
                      </p>
                      {report.reviewedAt ? (
                        <p className="ih-text-muted text-sm">Reviewed {formatDateTime(report.reviewedAt)}</p>
                      ) : null}
                      {report.rejectionReason ? (
                        <div className="rounded-2xl border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm text-red-50">
                          <span className="font-semibold">Rejection reason:</span> {report.rejectionReason}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-3 lg:justify-end">
                      <a href={report.postUrl} target="_blank" rel="noreferrer" className="ih-button-secondary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm">
                        Open post
                        <ExternalLink size={16} aria-hidden="true" />
                      </a>
                      {screenshotUrl ? (
                        <a href={screenshotUrl} target="_blank" rel="noreferrer" className="ih-button-secondary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm">
                          Open screenshot
                          <ExternalLink size={16} aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {isPending ? (
                    <div className="mt-5 rounded-[1.35rem] border border-white/8 bg-slate-950/20 p-4">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleApprove(report)}
                          disabled={isActing}
                          className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm"
                        >
                          <CheckCircle2 size={16} aria-hidden="true" />
                          {isActing ? "Updating..." : "Approve report"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingId((current) => current === report.id ? "" : report.id)}
                          disabled={isActing}
                          aria-expanded={rejectingId === report.id}
                          aria-controls={`reject-panel-${report.id}`}
                          className="ih-focus-ring rounded-lg border border-red-400/18 bg-red-500/8 px-4 py-3 text-sm font-medium text-red-100 transition hover:bg-red-500/12"
                        >
                          <span className="inline-flex items-center gap-2">
                            <XCircle size={16} aria-hidden="true" />
                            Reject report
                          </span>
                        </button>
                      </div>

                      {rejectingId === report.id ? (
                        <div id={`reject-panel-${report.id}`} className="mt-4 space-y-3">
                          <label className="ih-label mb-0" htmlFor={`reject-${report.id}`}>
                            Rejection reason (optional)
                          </label>
                          <textarea
                            id={`reject-${report.id}`}
                            value={rejectionDrafts[report.id] || ""}
                            onChange={(event) => setRejectionDrafts((current) => ({
                              ...current,
                              [report.id]: event.target.value,
                            }))}
                            maxLength={600}
                            rows={3}
                            placeholder="Tell the influencer what needs to be corrected."
                            className="ih-input ih-focus-ring min-h-28 resize-y"
                          />
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleReject(report)}
                              disabled={isActing}
                              className="ih-button-secondary ih-focus-ring px-4 py-3 text-sm"
                            >
                              {isActing ? "Updating..." : "Confirm rejection"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectingId("")}
                              className="ih-focus-ring rounded-lg border border-white/8 bg-white/4 px-4 py-3 text-sm text-white transition hover:bg-white/8"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}
      </AdminPanel>
    </AdminPage>
  );
};

export default AdminReports;
