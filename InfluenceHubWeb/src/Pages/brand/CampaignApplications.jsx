import React, { useCallback, useEffect, useState } from "react";
import { Check, User, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { getCampaignApplications, acceptOrRejectApplication } from "../../services/api/applicationService";
import { formatCompactNumber } from "../../utils/formatters";

const CampaignApplications = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApps = useCallback(async (signal) => {
    if (!token) return;
    if (!campaignId) {
      setLoading(false);
      setError("Please navigate here from a specific campaign.");
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
      await acceptOrRejectApplication(token, { applicationId, status });
      // Update the local state to reflect changes without reloading.
      setApplications((prev) => 
        prev.map(app => app.id === applicationId ? { ...app, status } : app)
      );
    } catch (err) {
      alert(err.message || "Action failed.");
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
        
        {error && applications.length === 0 ? (
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
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                      {/* Photo goes here. If URL available: <img src={app.influencer.photoUrl} className="..." /> */}
                      <User size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-white truncate max-w-[150px]">
                        {app.influencer?.name || "Unknown Influencer"}
                      </p>
                      <p className="text-sm text-slate-400">
                        {formatCompactNumber(app.influencer?.followerCount || 0)} Followers
                      </p>
                    </div>
                  </div>
                  
                  {app.influencer?.tags && app.influencer.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {app.influencer.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="ih-pill-warm text-xs px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-slate-300 mb-6 italic border-l-2 border-indigo-500/50 pl-3">
                    "{app.pitch || "No specific pitch provided."}"
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  {app.status === "Pending" ? (
                    <>
                      <button
                        onClick={() => handleAction(app.id, "Rejected")}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-medium mr-2"
                      >
                        <X size={16} /> Reject
                      </button>
                      <button
                        onClick={() => handleAction(app.id, "Accepted")}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-colors text-sm font-medium ml-2"
                      >
                        <Check size={16} /> Accept
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-center py-2 text-sm font-medium">
                      Status: <span className={app.status === "Accepted" ? "text-emerald-400" : "text-red-400"}>{app.status}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
    </AdminPage>
  );
};

export default CampaignApplications;
