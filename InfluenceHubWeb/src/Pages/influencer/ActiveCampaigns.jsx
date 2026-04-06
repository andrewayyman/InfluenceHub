import React, { useCallback, useEffect, useState } from "react";
import { FolderKanban } from "lucide-react";
import {
  AdminPage as DashboardPage,
  AdminPanel as Panel,
  AdminPanelHeader as PanelHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { influencerService } from "../../services/api/influencerService";
import { formatDate } from "../../utils/formatters";
import { isAbortError } from "../../services/api/client";

const ActiveCampaigns = () => {
  const { token } = useAuth();
  const [activeApps, setActiveApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActive = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const response = await influencerService.getMyApplications(token, signal);
      const active = response.filter(app => app.status === "Accepted");
      const sorted = active.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActiveApps(sorted);
    } catch (err) {
      if (!isAbortError(err) && !signal?.aborted) {
        setError(err.message || "Unable to load active campaigns.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    loadActive(controller.signal);
    return () => controller.abort();
  }, [loadActive]);

  return (
    <DashboardPage>

      <Panel tone="emerald">
        <PanelHeader
          kicker="Currently Working"
          title="Active Campaigns"
          description="Campaigns where you have been approved. Focus on delivering great content for these brands."
        />

        {loading ? (
          <LoadingState label="Loading your active work..." />
        ) : activeApps.length === 0 ? (
          <EmptyState
            title="No active campaigns"
            description="You don't have any accepted campaigns at the moment."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeApps.map((app) => (
              <div key={app.id} className="ih-surface flex flex-col justify-between rounded-[1.35rem] p-5 border border-white/8">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="ih-icon-chip ih-icon-chip-emerald flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
                      <FolderKanban size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="ih-text-primary font-medium truncate" title={app.campaignTitle}>{app.campaignTitle}</h3>
                      <div className="mt-1">
                        <StatusBadge tone="success">Ready for Content</StatusBadge>
                      </div>
                    </div>
                  </div>
                  <p className="ih-text-secondary text-sm mb-4">
                    Date accepted: {formatDate(app.createdAt)}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-white/10">
                  <p className="ih-text-muted text-xs italic">
                    Remember to submit your report when the campaign is completed!
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </DashboardPage>
  );
};

export default ActiveCampaigns;
