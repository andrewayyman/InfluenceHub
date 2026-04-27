import React, { useCallback, useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import {
  AdminPage as DashboardPage,
  AdminPanel as Panel,
  AdminPanelHeader as PanelHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
  FilterTabs,
} from "../../Components/AdminShared";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { influencerService } from "../../services/api/influencerService";
import { formatDate } from "../../utils/formatters";
import { getStatusTone, humanizeEnum } from "../../utils/admin";
import { isAbortError } from "../../services/api/client";

const MyApplications = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const loadApplications = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const response = await influencerService.getMyApplications(token, signal);
      // Sort by newest first based on CreatedAt
      const sorted = [...response].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setApplications(sorted);
    } catch (err) {
      if (!isAbortError(err) && !signal?.aborted) {
        setError(err.message || "Unable to load applications.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    loadApplications(controller.signal);
    return () => controller.abort();
  }, [loadApplications]);

  return (
    <DashboardPage>

      <Panel tone="emerald">
        <PanelHeader
          kicker="Your Pipeline"
          title="My Applications"
          description="Track the status of all your pending, accepted, and rejected brand pitches."
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

        {loading ? (
          <LoadingState label="Loading your applications..." />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="You haven't pitched to any campaigns yet. Visit Campaigns to find your first match."
            action={
              <Link to="/dashboard/influencer/suggested" className="ih-button-primary px-5 py-2.5">
                Browse Campaigns
              </Link>
            }
          />
        ) : (() => {
          const filteredApps = applications.filter(app => filter === "All" || app.status === filter);
          if (filteredApps.length === 0) {
            return (
              <EmptyState
                title="No matching applications"
                description={`You don't have any applications with the status "${filter}".`}
                action={
                  <button onClick={() => setFilter("All")} className="ih-button-secondary px-5 py-2.5">
                    Clear filter
                  </button>
                }
              />
            );
          }
          return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredApps.map((app) => (
                <div key={app.id} className="ih-surface ih-panel-hover flex flex-col justify-between rounded-[1.35rem] p-5 border border-white/8 transition-all">
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="ih-icon-chip ih-icon-chip-emerald h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center">
                          <ClipboardList size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="ih-text-primary truncate font-medium">{app.campaignTitle || "Unknown Campaign"}</h3>
                          <p className="ih-text-muted text-xs truncate mt-0.5">{formatDate(app.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="ih-text-subtle text-xs mb-1">Your Pitch</p>
                      <p className="ih-text-secondary text-sm line-clamp-3">
                        {app.message || "No message included."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs text-slate-400">Status</span>
                    <StatusBadge tone={getStatusTone(app.status)}>
                      {humanizeEnum(app.status)}
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </Panel>
    </DashboardPage>
  );
};

export default MyApplications;
