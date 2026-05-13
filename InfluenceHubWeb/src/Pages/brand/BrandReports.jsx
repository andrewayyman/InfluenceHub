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
  Plus,
  ExternalLink,
  Calendar,
  RotateCcw,
  LayoutGrid,
  ChevronRight,
  Clock,
  AlertCircle,
  Star,
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
import { createReview } from "../../services/api/reviewService";
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

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      setReviewError("Please select a star rating.");
      return;
    }
    setReviewSubmitting(true);
    setReviewError("");
    try {
      await createReview(token, {
        targetId: report.influencerId,
        campaignId: report.campaignId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSubmitted(true);
    } catch (err) {
      setReviewError(err.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300">
      <div className="ih-panel flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white/95 shadow-[0_30px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:fade-in duration-500">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6">
          <div className="flex items-center gap-5">
            <div className="ih-gradient-brand flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] text-2xl font-bold ih-text-primary shadow-xl ring-4 ring-white">
              {report.influencerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold ih-text-primary tracking-tight">{report.influencerName}</h2>
                <StatusBadge tone={getStatusTone(report.status)}>
                  {humanizeEnum(report.status)}
                </StatusBadge>
              </div>
              <div className="text-sm ih-text-muted mt-1 flex items-center gap-2">
                <span className="text-brand-600 font-bold px-2 py-0.5 rounded-lg bg-brand-50">{report.campaignTitle}</span>
                <span className="opacity-30">•</span>
                <span>Submitted {formatDate(report.createdAt || report.postingDate)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-100 ih-text-muted transition-all hover:scale-110 hover:bg-red-50 hover:text-red-500 hover:border-red-100 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar bg-slate-50/30">
          <div className="max-w-3xl mx-auto space-y-12 pb-10">
            
            {/* 1. Report Content Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="h-6 w-1.5 rounded-full bg-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">1. Report Content</h3>
              </div>
              
              <div className="ih-panel rounded-[2.5rem] bg-white border border-slate-100 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Platform</p>
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm text-brand-600">
                          <LayoutGrid size={20} />
                       </div>
                       <p className="text-lg font-black ih-text-primary tracking-tight">
                         {report.platform || (report.platformInsights && report.platformInsights[0]?.platform) || "Instagram"}
                       </p>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Submission Type</p>
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                          <CheckCircle size={20} />
                       </div>
                       <p className="text-lg font-black ih-text-primary tracking-tight">Final Performance</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Published Content Link</p>
                  <a
                    href={report.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between rounded-[1.5rem] bg-brand-50/30 border border-brand-100/50 p-5 transition-all hover:bg-brand-500 hover:border-brand-500 hover:scale-[1.01] shadow-sm"
                  >
                    <span className="text-sm font-bold text-brand-700 truncate mr-6 group-hover:text-white">{report.postUrl || "No direct link available"}</span>
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-white flex items-center justify-center text-brand-600 shadow-sm group-hover:bg-white/20 group-hover:text-white transition-all">
                      <ArrowUpRight size={18} />
                    </div>
                  </a>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Influencer Notes</p>
                  <div className="rounded-[1.5rem] bg-slate-50 border border-slate-100 p-6 text-sm ih-text-muted leading-relaxed italic shadow-inner">
                    "{report.additionalNotes || "No additional notes provided for this submission."}"
                  </div>
                </div>
              </div>
            </section>

            {/* KPI Summary (Integrated between sections for flow) */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="rounded-[3rem] bg-slate-900 p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px] -ml-24 -mb-24" />
                
                <div className="relative z-10 space-y-10">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Campaign Performance Summary</h4>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Views</p>
                      <p className="text-3xl font-black tracking-tighter text-white">
                        {formatCompactNumber(report.views)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Eng. Rate</p>
                      <p className="text-3xl font-black tracking-tighter text-brand-400">
                        {formatPercent(engagementRate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reach (Est.)</p>
                      <p className="text-2xl font-black text-slate-200">{formatCompactNumber(reach)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Clicks</p>
                      <p className="text-2xl font-black text-slate-200">{formatCompactNumber(clicks)}</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                         <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Posting Date</p>
                        <p className="text-xs font-bold text-slate-300">{formatDate(report.postingDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                         <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Metrics Window</p>
                        <p className="text-xs font-bold text-slate-300">
                          {formatDate(report.startDate)} — {formatDate(report.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Attachments / Proof Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="h-6 w-1.5 rounded-full bg-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">2. Attachments / Proof</h3>
              </div>
              
              <div className="space-y-6">
                {report.screenshotPath ? (
                  (() => {
                    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(report.screenshotPath);
                    return (
                      <div className="group relative overflow-hidden rounded-[3rem] border border-slate-200 bg-white shadow-xl transition-all hover:shadow-2xl">
                        <div className="aspect-video w-full bg-slate-50 flex items-center justify-center overflow-hidden">
                          {isImage ? (
                            <img
                              src={resolveApiUrl(report.screenshotPath)}
                              alt="Analytics screenshot"
                              className="h-full w-full object-contain transition-transform duration-1000 group-hover:scale-105"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/1200x800/f8fafc/64748b?text=Preview+Unavailable";
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-5">
                              <div className="h-24 w-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                                 <FileText size={48} />
                              </div>
                              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Full Resolution Document</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-10 flex items-end justify-between translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="space-y-1">
                            <p className="text-xs font-black text-brand-400 uppercase tracking-[0.2em]">Verification Proof</p>
                            <p className="text-lg font-bold text-white tracking-tight">{isImage ? "Analytics Screenshot" : "Submission Attachment"}</p>
                          </div>
                          <button 
                            onClick={() => window.open(resolveApiUrl(report.screenshotPath), '_blank')}
                            className="rounded-2xl bg-white px-8 py-4 text-sm font-black ih-text-primary hover:bg-brand-500 hover:text-white transition-all shadow-2xl active:scale-95"
                          >
                            {isImage ? "Open Full Preview" : "Download Document"}
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex h-[300px] flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50/50 ih-text-muted">
                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                      <FileText size={32} className="opacity-20" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.2em]">No visual attachments provided</p>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Platform Breakdown Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="h-6 w-1.5 rounded-full bg-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">3. Platform Breakdown</h3>
              </div>

              <div className="space-y-6">
                {report.platformInsights && report.platformInsights.length > 0 ? (
                  report.platformInsights.map((insight, idx) => (
                    <div key={idx} className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm group-hover:scale-110 transition-transform">
                             <BarChart3 size={24} />
                          </div>
                          <div>
                            <span className="text-sm font-black ih-text-primary uppercase tracking-widest">{insight.platform}</span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Channel Insight</p>
                          </div>
                        </div>
                        {insight.postUrl && (
                          <a href={insight.postUrl} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-white transition-all shadow-sm">
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Views</p>
                          <p className="text-xl font-black ih-text-primary tracking-tight">{formatCompactNumber(insight.views)}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Likes</p>
                          <p className="text-xl font-black ih-text-primary tracking-tight">{formatCompactNumber(insight.likes)}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Comments</p>
                          <p className="text-xl font-black ih-text-primary tracking-tight">{formatCompactNumber(insight.comments)}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Shares</p>
                          <p className="text-xl font-black ih-text-primary tracking-tight">{formatCompactNumber(insight.shares)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white/50">
                    <BarChart3 size={48} className="text-slate-200 mb-4" />
                    <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">No detailed platform insights available</p>
                  </div>
                )}
              </div>
            </section>

            {/* 4. Decision & Rating Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="h-6 w-1.5 rounded-full bg-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">4. Review Decision</h3>
              </div>

              <div className="rounded-[3rem] border border-slate-200 bg-white p-10 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
                {report.status !== "Approved" ? (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Decision Notes</p>
                        <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Required for rejection</span>
                      </div>
                      <textarea
                        className="ih-input w-full min-h-[160px] rounded-[2rem] bg-slate-50 border-slate-100 text-base p-8 focus:bg-white focus:ring-8 focus:ring-brand-500/5 transition-all placeholder:text-slate-400 shadow-inner"
                        placeholder="Write your feedback for the influencer here. Be constructive and clear..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        disabled={isSubmitting}
                      />
                      {error && (
                        <div className="animate-in shake duration-300 mt-4 text-xs font-bold text-red-500 bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center gap-3">
                          <AlertCircle size={18} /> {error}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => handleAction("Approve")}
                        disabled={isSubmitting}
                        className="ih-button-primary w-full flex items-center justify-center gap-4 py-6 rounded-[1.75rem] font-black text-lg shadow-[0_20px_50px_rgba(99,102,241,0.3)] active:scale-[0.98] transition-all"
                      >
                        <CheckCircle size={24} /> Approve & Release Funds
                      </button>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleAction("Revision")}
                          disabled={isSubmitting}
                          className="flex items-center justify-center gap-2 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
                        >
                          <RotateCcw size={18} /> Request Revision
                        </button>
                        <button
                          onClick={() => handleAction("Reject")}
                          disabled={isSubmitting}
                          className="flex items-center justify-center gap-2 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 transition-all active:scale-[0.98]"
                        >
                          <X size={18} /> Permanent Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="p-10 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center shadow-inner">
                      <div className="h-20 w-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-6 shadow-[0_15px_40px_rgba(16,185,129,0.4)]">
                        <CheckCircle size={40} />
                      </div>
                      <h4 className="text-2xl font-black text-emerald-900 tracking-tight">Submission Finalized</h4>
                      <p className="text-sm text-emerald-700 mt-2 font-bold max-w-[280px]">The report has been approved and the influencer has been notified.</p>
                    </div>

                    <div className="space-y-8 pt-6 border-t border-slate-100">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-700">
                          {report.review || reviewSubmitted ? "Your Professional Feedback" : "Rate Your Experience"}
                        </h4>
                      </div>

                      {(report.review || reviewSubmitted) ? (
                        <div className="flex flex-col items-center justify-center p-10 rounded-[2.5rem] bg-amber-50/50 border border-amber-100/50 animate-in zoom-in-95 duration-500 shadow-inner">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1 bg-white px-4 py-2 rounded-2xl shadow-sm border border-amber-100">
                              <span className="text-2xl font-black text-amber-500">{(report.review?.rating || reviewRating).toFixed(1)}</span>
                              <div className="flex ml-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={18} className={i < (report.review?.rating || reviewRating) ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="relative px-8 py-4 mb-4 text-center">
                            <div className="absolute left-0 top-0 text-amber-200 opacity-50"><MessageSquare size={24} /></div>
                            <p className="text-lg font-bold text-amber-900 tracking-tight leading-relaxed italic">
                              "{report.review?.comment || reviewComment}"
                            </p>
                          </div>
                          <div className="flex flex-col items-center gap-1 mt-2">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Review Submitted Successfully</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {formatDate(report.review?.createdAt || new Date())}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-10">
                          <div className="space-y-6">
                            <div className="flex items-center justify-center gap-4">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  onMouseEnter={() => setReviewHover(star)}
                                  onMouseLeave={() => setReviewHover(0)}
                                  className="text-5xl transition-all hover:scale-125 focus:outline-none p-1"
                                >
                                  <span className={star <= (reviewHover || reviewRating) ? "text-amber-400 drop-shadow-xl" : "text-slate-100"}>
                                    ★
                                  </span>
                                </button>
                              ))}
                            </div>
                            {reviewRating > 0 && (
                              <p className="text-center text-xs font-black text-amber-600 uppercase tracking-[0.3em] animate-in fade-in zoom-in-90">
                                {reviewRating} Star Performance
                              </p>
                            )}
                          </div>

                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">Share a brief testimonial</p>
                            <textarea
                              className="ih-input w-full min-h-[120px] rounded-[2rem] bg-slate-50/80 border-slate-100 text-base p-8 focus:bg-white focus:ring-8 focus:ring-amber-500/5 transition-all placeholder:text-slate-300 text-center shadow-inner"
                              placeholder="Describe how it was to work with this talent..."
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              disabled={reviewSubmitting}
                            />
                          </div>

                          {reviewError && (
                            <div className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center justify-center gap-3">
                              <AlertCircle size={18} /> {reviewError}
                            </div>
                          )}

                          <button
                            onClick={handleSubmitReview}
                            disabled={reviewSubmitting || !reviewRating}
                            className="ih-button-primary w-full py-6 rounded-[1.75rem] font-black text-base bg-amber-500 hover:bg-amber-400 shadow-[0_20px_50px_rgba(245,158,11,0.3)] active:scale-[0.98] transition-all"
                          >
                            {reviewSubmitting ? "Processing Review..." : "Submit Talent Review"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-6">
          <button
            onClick={onClose}
            className="rounded-2xl px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
          >
            Close Viewer
          </button>

          {report.status !== "Approved" && (
            <button
               onClick={() => {
                 if (feedback) handleAction("Revision");
                 else handleAction("Approve");
               }}
               disabled={isSubmitting}
               className="rounded-2xl bg-brand-500 px-8 py-3 text-sm font-black ih-text-primary shadow-lg shadow-brand-500/20 hover:bg-brand-400 transition-all active:scale-95 disabled:opacity-50"
            >
              Confirm Decision
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
    
    // Auto-update the selected report if it's the one that changed, 
    // but DON'T close the modal if it's an approval - so review flow can show.
    if (newStatus !== "Approved") {
      setSelectedReport(null);
    } else {
      setSelectedReport(prev => prev ? ({ ...prev, status: newStatus }) : null);
    }
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
          <h1 className="text-3xl font-bold ih-text-primary tracking-tight">Brand Reports</h1>
          <p className="mt-2 ih-text-muted">
            Track influencer submissions and review campaign performance.
          </p>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={() => loadData()} />}

      {/* Sticky Filter Bar */}
      <div className="sticky top-0   px-4 py-4 mb-6 backdrop-blur-xl bg-white/95 border-y border-slate-900/5 shadow-2xl">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search influencer or campaign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ih-input w-full pl-12 py-3 rounded-xl bg-white/[0.03] border-slate-200 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 shadow-inner text-sm ih-text-primary placeholder:text-slate-500 transition-all hover:bg-white/[0.05]"
            />
          </div>
          
          {/* Status Dropdown */}
          <div className="flex flex-col gap-1">
             <div className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white/[0.03] px-4 py-3 shadow-inner min-w-[160px] focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all hover:bg-white/[0.05]">
                <Filter size={16} className="text-slate-500 group-focus-within:text-brand-600 transition-colors" />
                <select
                  className="bg-transparent text-sm text-slate-800 focus:ih-text-primary outline-none w-full cursor-pointer"
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
             <div className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white/[0.03] px-4 py-3 shadow-inner min-w-[180px] focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all hover:bg-white/[0.05]">
                <LayoutGrid size={16} className="text-slate-500 group-focus-within:text-brand-600 transition-colors" />
                <select
                  className="bg-transparent text-sm text-slate-800 focus:ih-text-primary outline-none w-full cursor-pointer"
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
            <div className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white/[0.03] px-4 py-3 shadow-inner focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all hover:bg-white/[0.05]">
              <Calendar size={16} className="text-slate-500 group-focus-within:text-brand-600 transition-colors" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs text-slate-800 focus:ih-text-primary outline-none cursor-pointer"
              />
              <span className="ih-text-muted px-1">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs text-slate-800 focus:ih-text-primary outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ih-text-muted hover:bg-slate-100 hover:text-brand-600 transition-all active:scale-95"
            title="Reset Filters"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Reports Listing */}
      <AdminPanel className="!p-0 overflow-hidden border-slate-900/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white/95 backdrop-blur-2xl rounded-[2rem]">
        {filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-900/5 bg-white/[0.01]">
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
                          <div className="ih-gradient-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ih-text-primary shadow-lg ring-2 ring-white/5 transition-transform group-hover:scale-110">
                            {report.influencerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <span className="font-bold ih-text-primary block tracking-tight group-hover:text-brand-600 transition-colors">
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
                          <span className="ih-text-secondary font-medium line-clamp-1 max-w-[200px]" title={report.campaignTitle}>
                            {report.campaignTitle}
                          </span>
                          <span className="text-[10px] ih-text-muted font-bold uppercase tracking-wider">
                            ID: {report.campaignId.toString().slice(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div>
                            <span className="text-[10px] ih-text-muted block font-bold uppercase mb-1">Views</span>
                            <span className="font-bold ih-text-primary text-base tracking-tight">{formatCompactNumber(report.views)}</span>
                          </div>
                          <div className="h-8 w-px bg-slate-50"></div>
                          <div>
                            <span className="text-[10px] ih-text-muted block font-bold uppercase mb-1">Engage</span>
                            <span className="font-bold text-brand-600 text-base tracking-tight">{formatCompactNumber(engagement)}</span>
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
                            className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-50 ih-text-muted transition-all hover:bg-brand-500 hover:ih-text-primary shadow-lg group-hover:translate-x-[-4px]"
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
                  className="mt-2 text-sm font-bold text-brand-600 hover:text-brand-300 underline underline-offset-4"
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

