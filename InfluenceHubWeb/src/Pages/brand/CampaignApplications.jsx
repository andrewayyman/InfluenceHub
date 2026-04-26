import React, { useCallback, useEffect, useState } from "react";
import { Check, Eye, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../Components/AdminShared";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { useAuth } from "../../hooks/useAuth";
import { getCampaignApplications, acceptOrRejectApplication } from "../../services/api/applicationService";
import { formatDateTime } from "../../utils/formatters";

const getStatusTone = (status) => {
  if (status === "Accepted") return "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";
  if (status === "Rejected") return "text-rose-300 border-rose-500/30 bg-rose-500/10";
  return "text-amber-200 border-amber-500/30 bg-amber-500/10";
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

const CampaignApplications = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const missingCampaignContext = !campaignId;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const loadApps = useCallback(async (signal) => {
    if (!token) return;
    if (!campaignId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getCampaignApplications(token, campaignId, signal);
      if (!signal?.aborted) {
        setApplications(data || []);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setError(err.message || "Failed to load applications.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [token, campaignId]);

  useEffect(() => {
    const controller = new AbortController();
    loadApps(controller.signal);
    return () => controller.abort();
  }, [loadApps]);

  const handleAction = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      await acceptOrRejectApplication(token, { applicationId, status });
      // Update the local state to reflect changes without reloading.
      setApplications((prev) => 
        prev.map(app => app.id === applicationId ? { ...app, status } : app)
      );
    } catch (err) {
      alert(err.message || "Action failed.");
    } finally {
      setUpdatingId("");
    }
  };

  if (loading && applications.length === 0) {
    return <AdminPage><LoadingState label="Loading campaign applications..." /></AdminPage>;
  }

  return (
    <AdminPage>
      <AdminPanel tone="warm">
        <AdminPanelHeader
          kicker="Selection"
          title="Applications inbox"
          description="Review pitches from influencers looking to collaborate on this brief. Accept the ones that fit your brand vision."
        />
        
        {missingCampaignContext ? (
          <EmptyState
            title="Choose a campaign first"
            description="Applications belong to a specific campaign. Open your campaign list and select View Applications on the campaign you want to review."
            action={(
              <TransitionLink
                to="/dashboard/brand/campaigns"
                className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm"
              >
                Go to campaigns
              </TransitionLink>
            )}
          />
        ) : error && applications.length === 0 ? (
          <ErrorState message={error} onRetry={() => loadApps()} />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Influencers haven't applied to this campaign yet. Check back soon."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((app) => (
              <div key={app.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between">
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-200">
                        {getInitials(app.influencerName)}
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-[180px] truncate font-semibold text-white" title={app.influencerName}>
                          {app.influencerName || "Unknown Influencer"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Applied {formatDateTime(app.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusTone(app.status)}`}>
                      {app.status}
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-3 text-sm italic text-slate-300 border-l-2 border-indigo-500/50 pl-3">
                    "{app.message || "No specific pitch provided."}"
                  </p>

                  <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Campaign: {app.campaignTitle || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  {app.status === "Pending" ? (
                    <>
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className="flex items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                        title="View profile"
                      >
                        <Eye size={16} /> View
                      </button>
                      <button
                        onClick={() => handleAction(app.id, "Rejected")}
                        disabled={updatingId === app.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-medium mr-2"
                      >
                        <X size={16} /> {updatingId === app.id ? "Saving..." : "Reject"}
                      </button>
                      <button
                        onClick={() => handleAction(app.id, "Accepted")}
                        disabled={updatingId === app.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-colors text-sm font-medium ml-2"
                      >
                        <Check size={16} /> {updatingId === app.id ? "Saving..." : "Accept"}
                      </button>
                    </>
                  ) : (
                    <div className="flex w-full items-center justify-between gap-2 py-2 text-sm font-medium">
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className="flex items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                        title="View profile"
                      >
                        <Eye size={16} /> View
                      </button>
                      Status: <span className={app.status === "Accepted" ? "text-emerald-400" : "text-red-400"}>{app.status}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      {selectedApplication ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Influencer profile</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{selectedApplication.influencerName || "Unknown Influencer"}</h3>
              </div>
              <button onClick={() => setSelectedApplication(null)} className="rounded-lg border border-white/20 p-2 text-slate-300 hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Applied on</p>
                <p className="mt-1 text-sm text-white">{formatDateTime(selectedApplication.createdAt)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Proposed budget</p>
                <p className="mt-1 text-sm text-white">${Number(selectedApplication.proposedBudget || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Bio</p>
              <p className="mt-1 text-sm text-white">{selectedApplication.bio || "-"}</p>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Proposal</p>
              <p className="mt-1 text-sm text-white">{selectedApplication.proposal || "-"}</p>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Attached links</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {(selectedApplication.links || []).length === 0 ? <li>-</li> : (selectedApplication.links || []).map((link) => <li key={link} className="truncate">{link}</li>)}
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Media files</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {(selectedApplication.mediaFiles || []).length === 0 ? <li>-</li> : (selectedApplication.mediaFiles || []).map((item) => <li key={item} className="truncate">{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPage>
  );
};

export default CampaignApplications;
