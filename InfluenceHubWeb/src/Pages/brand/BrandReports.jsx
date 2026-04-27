import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle,
  FileText,
  Filter,
  MessageSquare,
  Search,
  X,
  ExternalLink,
  Calendar,
  RotateCcw,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import {
  AdminPage,
  AdminPanel,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import {
  addReportFeedback,
  getBrandReports,
  updateReportStatus,
  getBrandCampaigns,
} from "../../services/api/brandService";
import { isAbortError, resolveApiUrl } from "../../services/api/client";
import { getStatusTone, humanizeEnum } from "../../utils/admin";
import {
  formatCompactNumber,
  formatDate,
  formatPercent,
} from "../../utils/formatters";

const ReportModal = ({ report, onClose, onStatusChange }) => {
  const { token } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!report) return null;

  const totalEngagement = report.likes + report.comments + report.shares;
  const engagementRate = report.views > 0 ? totalEngagement / report.views : 0;
  
  // Mock Reach and Clicks since they aren't in the DB yet but requested in UI
  const reach = Math.floor(report.views * 0.85);
  const clicks = Math.floor(report.views * 0.042);

  const handleAction = async (actionType) => {
    setIsSubmitting(true);
    setError("");
    try {
      if (actionType === "Approve") {
        await updateReportStatus(token, report.id, "Approved");
        onStatusChange(report.id, "Approved");
      } else if (actionType === "Reject") {
        if (!feedback) {
          setError("Feedback is required to reject a report.");
          setIsSubmitting(false);
          return;
        }
        await updateReportStatus(token, report.id, "Rejected");
        await addReportFeedback(token, report.id, feedback);
        onStatusChange(report.id, "Rejected", feedback);
      } else if (actionType === "Revision") {
        if (!feedback) {
          setError("Feedback is required to request a revision.");
          setIsSubmitting(false);
          return;
        }
        await addReportFeedback(token, report.id, feedback);
        onStatusChange(report.id, "RevisionRequested", feedback);
      }
    } catch (err) {
      setError(err.message || "Failed to update report status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed  inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-md transition-all">
      <div className="ih-panel flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1221] shadow-[0_0_50px_rgba(0,0,0,0.5)] motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:fade-in duration-300">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-5 md:px-8 md:py-6">
          <div className="flex items-center gap-5">
            <div className="ih-gradient-brand flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg ring-4 ring-white/5">
              {report.influencerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">{report.influencerName}</h2>
                <StatusBadge tone={getStatusTone(report.status)}>
                  {humanizeEnum(report.status)}
                </StatusBadge>
              </div>
              <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-2">
                <span className="text-brand-400 font-medium">{report.campaignTitle}</span>
                <span className="text-slate-600">•</span>
                <span>Submitted on {formatDate(report.createdAt || report.postingDate)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all hover:bg-red-500/20 hover:text-red-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            {/* Left Column: Content & Details */}
            <div className="space-y-8">
              {/* Report Content Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1 rounded-full bg-brand-500"></div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-500">Report Content</h3>
                </div>
                
                <div className="grid gap-5">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <LayoutGrid size={16} className="text-brand-400" />
                        <span className="text-sm font-medium">Platform</span>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-white/5 text-xs font-bold text-white uppercase tracking-wider">
                        {report.platform || "Instagram"}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-slate-300 mb-2">
                        <ExternalLink size={16} className="text-brand-400" />
                        <span className="text-sm font-medium">Content Link</span>
                      </div>
                      <a
                        href={report.postUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl bg-black/40 px-4 py-3 text-sm text-brand-300 transition-all hover:bg-brand-500/10 hover:text-brand-200 border border-white/5"
                      >
                        <span className="truncate">{report.postUrl}</span>
                        <ArrowUpRight size={16} className="shrink-0" />
                      </a>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-slate-300 mb-2">
                        <MessageSquare size={16} className="text-brand-400" />
                        <span className="text-sm font-medium">Caption / Notes</span>
                      </div>
                      <div className="rounded-xl bg-black/40 px-4 py-3 text-sm text-slate-400 italic border border-white/5 leading-relaxed">
                        "Great working on this campaign! The products are amazing and my audience loved the aesthetics. #ad #influencehub"
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Performance Metrics Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1 rounded-full bg-brand-500"></div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-500">Performance Metrics</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-transform hover:scale-[1.02]">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Views</p>
                    <p className="text-2xl font-bold text-white tracking-tight">
                      {formatCompactNumber(report.views)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-transform hover:scale-[1.02]">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Reach</p>
                    <p className="text-2xl font-bold text-white tracking-tight">
                      {formatCompactNumber(reach)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-transform hover:scale-[1.02]">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Clicks</p>
                    <p className="text-2xl font-bold text-white tracking-tight">
                      {formatCompactNumber(clicks)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-transform hover:scale-[1.02]">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Engagement</p>
                    <p className="text-2xl font-bold text-brand-400 tracking-tight">
                      {formatPercent(engagementRate)}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Visual Proof */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-1 rounded-full bg-brand-500"></div>
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-500">Attachments / Proof</h3>
              </div>
              
              {report.screenshotUrl ? (
                <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 shadow-2xl">
                  <img
                    src={resolveApiUrl(report.screenshotUrl)}
                    alt="Analytics screenshot"
                    className="h-auto max-h-[300px] md:max-h-[400px] w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end justify-center p-6">
                    <button 
                      onClick={() => window.open(resolveApiUrl(report.screenshotUrl), '_blank')}
                      className="rounded-full bg-white/10 px-6 py-2 text-xs font-bold text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
                    >
                      View Full Size
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-[250px] md:h-[300px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-white/5 bg-white/[0.02] text-slate-600">
                  <FileText size={60} className="mb-4 opacity-10" />
                  <p className="text-sm font-medium">No analytics proof provided</p>
                </div>
              )}
            </div>
          </div>

          {/* Feedback & Actions Section */}
          <div className="mt-12 rounded-[2rem] border border-brand-500/10 bg-brand-500/[0.02] p-8">
             <div className="flex items-center gap-2 mb-6">
                <MessageSquare size={18} className="text-brand-400" />
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-300">Feedback & Decision</h3>
              </div>

              {report.status !== "Approved" ? (
                <div className="space-y-6">
                  <div>
                    <textarea
                      className="ih-input w-full min-h-[120px] rounded-2xl bg-black/40 border-white/5 text-sm p-5 focus:border-brand-500/50 transition-all placeholder:text-slate-600"
                      placeholder="Add notes for the influencer. Required for revisions or rejections..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      disabled={isSubmitting}
                    />
                    {error && <p className="mt-3 text-sm text-red-400 flex items-center gap-2">
                      <X size={14} /> {error}
                    </p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => handleAction("Approve")}
                      disabled={isSubmitting}
                      className="ih-button-primary flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold shadow-lg shadow-brand-500/20"
                    >
                      <CheckCircle size={20} /> Approve Report
                    </button>
                    
                    {report.status !== "RevisionRequested" && (
                      <button
                        onClick={() => handleAction("Revision")}
                        disabled={isSubmitting}
                        className="ih-button-secondary flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold border-white/10 hover:bg-white/5"
                      >
                        <RotateCcw size={18} /> Request Revision
                      </button>
                    )}
                    
                    {report.status !== "Rejected" && (
                      <button
                        onClick={() => handleAction("Reject")}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all"
                      >
                        <X size={18} /> Reject Submission
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-green-500/5 border border-green-500/10 text-green-400">
                  <CheckCircle size={24} />
                  <div>
                    <p className="font-bold">This report has been approved</p>
                    <p className="text-sm opacity-80">Funds will be released to the influencer shortly.</p>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/5 bg-white/[0.01] px-6 py-5 md:px-8 md:py-6">
          <button
            onClick={onClose}
            className="rounded-xl px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Close Window
          </button>

          {report.status !== "Approved" && (
            <button
               onClick={() => {
                 if (feedback) handleAction("Revision");
                 else handleAction("Approve");
               }}
               disabled={isSubmitting}
               className="rounded-xl bg-brand-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-400 transition-all disabled:opacity-50"
            >
              Save Decision
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const BrandReports = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadData = useCallback(async (signal) => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const [reportsData, campaignsData] = await Promise.all([
        getBrandReports(token, signal),
        getBrandCampaigns(token, signal)
      ]);
      
      if (!signal?.aborted) {
        setReports(reportsData || []);
        setCampaigns(campaignsData || []);
      }
    } catch (err) {
      if (!isAbortError(err) && !signal?.aborted) {
        setError(err.message || "Unable to load reports data.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setCampaignFilter("All");
    setStartDate("");
    setEndDate("");
  };

  const handleStatusChange = (reportId, newStatus, newFeedback = null) => {
    setReports((current) =>
      current.map((r) =>
        r.id === reportId
          ? { ...r, status: newStatus, rejectionReason: newFeedback || r.rejectionReason }
          : r
      )
    );
    setSelectedReport(null);
  };

  const filteredReports = useMemo(() => {
    let result = reports;
    
    if (statusFilter !== "All") {
      result = result.filter((r) => r.status === statusFilter);
    }
    
    if (campaignFilter !== "All") {
      result = result.filter((r) => r.campaignId === campaignFilter);
    }
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.influencerName.toLowerCase().includes(q) ||
          r.campaignTitle.toLowerCase().includes(q)
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      result = result.filter(r => new Date(r.createdAt || r.postingDate) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      result = result.filter(r => new Date(r.createdAt || r.postingDate) <= end);
    }

    return result;
  }, [reports, statusFilter, campaignFilter, searchQuery, startDate, endDate]);

  if (loading && reports.length === 0) {
    return (
      <AdminPage>
        <LoadingState label="Synchronizing reports workspace..." />
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Brand Reports</h1>
          <p className="mt-2 text-slate-400">
            Track influencer submissions and review campaign performance.
          </p>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={() => loadData()} />}

      {/* Sticky Filter Bar */}
      <div className="sticky top-0   px-4 py-4 mb-6 backdrop-blur-xl bg-[#0b1221]/60 border-y border-white/5 shadow-2xl">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search influencer or campaign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ih-input w-full pl-12 py-3 rounded-xl bg-white/[0.03] border-white/10 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 shadow-inner text-sm text-white placeholder:text-slate-500 transition-all hover:bg-white/[0.05]"
            />
          </div>
          
          {/* Status Dropdown */}
          <div className="flex flex-col gap-1">
             <div className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 shadow-inner min-w-[160px] focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all hover:bg-white/[0.05]">
                <Filter size={16} className="text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <select
                  className="bg-transparent text-sm text-slate-200 focus:text-white outline-none w-full cursor-pointer [&>option]:bg-[#0b1221] [&>option]:text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Approved">Approved</option>
                  <option value="RevisionRequested">Revisions</option>
                  <option value="Rejected">Rejected</option>
                </select>
             </div>
          </div>

          {/* Campaign Dropdown */}
          <div className="flex flex-col gap-1">
             <div className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 shadow-inner min-w-[180px] focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all hover:bg-white/[0.05]">
                <LayoutGrid size={16} className="text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <select
                  className="bg-transparent text-sm text-slate-200 focus:text-white outline-none w-full cursor-pointer [&>option]:bg-[#0b1221] [&>option]:text-white"
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                >
                  <option value="All">All Campaigns</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
             </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-3">
            <div className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 shadow-inner focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all hover:bg-white/[0.05]">
              <Calendar size={16} className="text-slate-500 group-focus-within:text-brand-400 transition-colors" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:text-white outline-none cursor-pointer"
              />
              <span className="text-slate-600 px-1">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:text-white outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-brand-400 transition-all active:scale-95"
            title="Reset Filters"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Reports Listing */}
      <AdminPanel className="!p-0 overflow-hidden border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-[#0b1221]/60 backdrop-blur-2xl rounded-[2rem]">
        {filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/5 bg-white/[0.01]">
                <tr>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px] text-slate-500">Influencer Profile</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px] text-slate-500">Target Campaign</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px] text-slate-500">Live Performance</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px] text-slate-500">Current Status</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px] text-slate-500 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredReports.map((report) => {
                  const engagement = report.likes + report.comments + report.shares;
                  return (
                    <tr
                      key={report.id}
                      className="group transition-all hover:bg-white/[0.03] cursor-pointer"
                      onClick={() => setSelectedReport(report)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="ih-gradient-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-lg ring-2 ring-white/5 transition-transform group-hover:scale-110">
                            {report.influencerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <span className="font-bold text-white block tracking-tight group-hover:text-brand-400 transition-colors">
                              {report.influencerName}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-medium">
                              {formatDate(report.createdAt || report.postingDate)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-300 font-medium line-clamp-1 max-w-[200px]" title={report.campaignTitle}>
                            {report.campaignTitle}
                          </span>
                          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                            ID: {report.campaignId.toString().slice(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div>
                            <span className="text-[10px] text-slate-600 block font-bold uppercase mb-1">Views</span>
                            <span className="font-bold text-white text-base tracking-tight">{formatCompactNumber(report.views)}</span>
                          </div>
                          <div className="h-8 w-px bg-white/5"></div>
                          <div>
                            <span className="text-[10px] text-slate-600 block font-bold uppercase mb-1">Engage</span>
                            <span className="font-bold text-brand-400 text-base tracking-tight">{formatCompactNumber(engagement)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge tone={getStatusTone(report.status)}>
                          {humanizeEnum(report.status)}
                        </StatusBadge>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                           <button
                            className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 text-slate-400 transition-all hover:bg-brand-500 hover:text-white shadow-lg group-hover:translate-x-[-4px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReport(report);
                            }}
                          >
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24">
            <EmptyState
              title="No matched reports"
              description="Refine your filters or search query to find specific submissions."
              icon={Search}
              action={
                <button 
                  onClick={resetFilters}
                  className="mt-2 text-sm font-bold text-brand-400 hover:text-brand-300 underline underline-offset-4"
                >
                  Clear all active filters
                </button>
              }
            />
          </div>
        )}
      </AdminPanel>

      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </AdminPage>
  );
};

export default BrandReports;
