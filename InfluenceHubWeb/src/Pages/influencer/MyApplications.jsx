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
} from "../../Components/AdminShared";
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

        {loading ? (
          <LoadingState label="Loading your applications..." />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="You haven't pitched to any campaigns yet. Visit Suggested Campaigns to find your first match."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="ih-table min-w-[50rem]">
              <thead className="ih-table-head">
                <tr>
                  <th scope="col" className="pb-3 pl-2">Campaign</th>
                  <th scope="col">Status</th>
                  <th scope="col">Brand Message/Context</th>
                  <th scope="col">Date Applied</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="ih-table-row border-b last:border-0 align-top">
                    <td className="py-4 pl-2 min-w-[14rem]">
                      <div className="flex gap-3">
                        <div className="ih-icon-chip ih-icon-chip-emerald mt-1 h-10 w-10 shrink-0 rounded-2xl">
                          <ClipboardList size={18} />
                        </div>
                        <div>
                          <p className="ih-text-primary font-medium">{app.campaignTitle || "Unknown Campaign"}</p>
                          <p className="ih-text-muted mt-1 text-xs">ID: {app.campaignId?.split("-")[0]}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <StatusBadge tone={getStatusTone(app.status)}>
                        {humanizeEnum(app.status)}
                      </StatusBadge>
                    </td>
                    <td className="py-4 max-w-[20rem]">
                      <p className="ih-text-secondary text-sm line-clamp-2">
                        {app.message || "No message included."}
                      </p>
                    </td>
                    <td className="py-4 ih-text-secondary text-sm">
                      {formatDate(app.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </DashboardPage>
  );
};

export default MyApplications;
