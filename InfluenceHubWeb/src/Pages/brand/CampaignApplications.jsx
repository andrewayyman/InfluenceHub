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
  FilterTabs,
  StatusBadge,
} from "../../Components/AdminShared";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { useAuth } from "../../hooks/useAuth";
import { getCampaignApplications, acceptOrRejectApplication } from "../../services/api/applicationService";
import { getBrandCampaigns } from "../../services/api/brandService";
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
  const [filter, setFilter] = useState("All");

  const loadApps = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      if (campaignId) {
        const data = await getCampaignApplications(token, campaignId, signal);
        if (!signal?.aborted) {
          setApplications(data || []);
        }
      } else {
        // Fetch all campaigns for the brand
        const campaigns = await getBrandCampaigns(token, signal);
        if (!campaigns || campaigns.length === 0) {
          if (!signal?.aborted) setApplications([]);
          return;
        }
        
        // Fetch applications for all campaigns
        const allAppsPromises = campaigns.map(c => 
          getCampaignApplications(token, c.id, signal).catch(() => []) // swallow individual errors
        );
        const results = await Promise.all(allAppsPromises);
        
        if (!signal?.aborted) {
          const flattened = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setApplications(flattened);
        }
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

  const filteredApplications = applications.filter(app => filter === "All" || app.status === filter);

  return (
    <AdminPage>
      <AdminPanel tone="brand">
        <AdminPanelHeader
          kicker="Selection"
          title={campaignId ? "Campaign Applications" : "All Applications"}
          description="Review pitches from influencers looking to collaborate. Evaluate and accept the ones that fit your brand vision."
        />
        
        <div className="mb-6">
          <FilterTabs
            items={[
              { label: "All", value: "All" },
              { label: "Pending", value: "Pending" },
              { label: "Accepted", value: "Accepted" },
              { label: "Rejected", value: "Rejected" },
            ]}
            value={filter}
            onSelect={setFilter}
          />
        </div>

        {error && applications.length === 0 ? (
          <ErrorState message={error} onRetry={() => loadApps()} />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="You don't have any incoming applications at the moment. Make sure your campaigns are active and well-described."
            action={
              <TransitionLink
                to="/dashboard/brand/campaigns"
                className="ih-button-primary px-5 py-2.5"
              >
                Manage Campaigns
              </TransitionLink>
            }
          />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            title="No matching applications"
            description={`There are no applications with the status "${filter}".`}
            action={
              <button onClick={() => setFilter("All")} className="ih-button-secondary px-5 py-2.5">
                Clear filter
              </button>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredApplications.map((app) => (
              <div key={app.id} className="ih-surface ih-panel-hover flex flex-col justify-between rounded-[1.5rem] p-6 border border-white/8 transition-all">
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-sm font-semibold text-indigo-300">
                        {getInitials(app.influencerName)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white" title={app.influencerName}>
                          {app.influencerName || "Unknown Influencer"}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          Applied {formatDateTime(app.createdAt)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge tone={app.status === "Accepted" ? "success" : app.status === "Rejected" ? "danger" : "warning"}>
                      {app.status}
                    </StatusBadge>
                  </div>

                  <p className="mb-4 line-clamp-3 text-sm italic text-slate-300 border-l-2 border-indigo-500/50 pl-3">
                    "{app.message || "No specific pitch provided."}"
                  </p>

                  <div className="mb-6 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Campaign:</span>
                    <span className="ih-pill-tint ih-pill-brand truncate max-w-[200px]">
                      {app.campaignTitle || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-auto border-t border-white/10 pt-4">
                  <button
                    onClick={() => setSelectedApplication(app)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    <Eye size={16} /> View Details
                  </button>
                  
                  {app.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleAction(app.id, "Rejected")}
                        disabled={updatingId === app.id}
                        className="flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2.5 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={() => handleAction(app.id, "Accepted")}
                        disabled={updatingId === app.id}
                        className="flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-2.5 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        title="Accept"
                      >
                        <Check size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      {selectedApplication ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-lg font-bold text-indigo-300">
                  {getInitials(selectedApplication.influencerName)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedApplication.influencerName || "Unknown Influencer"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-400">Campaign: {selectedApplication.campaignTitle || "-"}</span>
                    <StatusBadge tone={selectedApplication.status === "Accepted" ? "success" : selectedApplication.status === "Rejected" ? "danger" : "warning"}>
                      {selectedApplication.status}
                    </StatusBadge>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedApplication(null)} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Applied On</p>
                  <p className="text-sm font-semibold text-white">{formatDateTime(selectedApplication.createdAt)}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Proposed Budget</p>
                  <p className="text-sm font-semibold text-emerald-400">${Number(selectedApplication.proposedBudget || 0).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-2">Message to Brand</p>
                <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300 leading-relaxed italic border-l-2 border-indigo-500/50">
                  "{selectedApplication.message || "No specific message provided."}"
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-white mb-2">Influencer Bio</p>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300 leading-relaxed min-h-[100px]">
                    {selectedApplication.bio || "No bio provided."}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-2">Proposal Details</p>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300 leading-relaxed min-h-[100px]">
                    {selectedApplication.proposal || "No proposal provided."}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-white mb-2">Attached Links</p>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <ul className="space-y-2 text-sm text-indigo-300">
                      {(selectedApplication.links || []).length === 0 ? <li className="text-slate-500">-</li> : (selectedApplication.links || []).map((link, i) => (
                        <li key={i} className="truncate hover:text-indigo-200 transition-colors">
                          <a href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-2">Media Files</p>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <ul className="space-y-2 text-sm text-slate-300">
                      {(selectedApplication.mediaFiles || []).length === 0 ? <li className="text-slate-500">-</li> : (selectedApplication.mediaFiles || []).map((item, i) => (
                        <li key={i} className="truncate flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer (Actions) */}
            <div className="p-6 border-t border-white/10 bg-[#0f172a] rounded-b-2xl flex items-center justify-end gap-3">
              <button 
                onClick={() => setSelectedApplication(null)} 
                className="ih-button-secondary px-5 py-2.5 text-sm"
              >
                Close
              </button>
              
              {selectedApplication.status === "Pending" && (
                <>
                  <button
                    onClick={() => {
                      handleAction(selectedApplication.id, "Rejected");
                      setSelectedApplication(null);
                    }}
                    disabled={updatingId === selectedApplication.id}
                    className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all"
                  >
                    <X size={16} /> Reject
                  </button>
                  <button
                    onClick={() => {
                      handleAction(selectedApplication.id, "Accepted");
                      setSelectedApplication(null);
                    }}
                    disabled={updatingId === selectedApplication.id}
                    className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition-all"
                  >
                    <Check size={16} /> Accept
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      ) : null}
    </AdminPage>
  );
};

export default CampaignApplications;
