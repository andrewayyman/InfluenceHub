import React, { useCallback, useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "../../Components/AdminShared";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { useAuth } from "../../hooks/useAuth";
import { getBrandCampaigns, deleteCampaign } from "../../services/api/brandService";
import { getStatusTone, humanizeEnum } from "../../utils/admin";
import { formatCurrency, formatDate } from "../../utils/formatters";

const BrandCampaigns = () => {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCampaigns = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await getBrandCampaigns(token, signal);
      if (!signal?.aborted) {
        setCampaigns(data || []);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setError(err.message || "Failed to load campaigns.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    loadCampaigns(controller.signal);
    return () => controller.abort();
  }, [loadCampaigns]);

  const handleDelete = async (campaignId) => {
    if (!window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteCampaign(token, campaignId);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    } catch (err) {
      alert(err.message || "Failed to delete campaign.");
    }
  };

  if (loading && campaigns.length === 0) {
    return (
      <AdminPage>
        <LoadingState label="Loading your campaigns..." />
      </AdminPage>
    );
  }

  if (error && campaigns.length === 0) {
    return (
      <AdminPage>
        <ErrorState message={error} onRetry={() => loadCampaigns()} />
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPanel>
        <AdminPanelHeader
          kicker="Portfolio"
          title="My campaigns"
          description="Manage all your open, active, and completed briefs. Control the lifecycle of your influencer partnerships here."
          actions={(
            <TransitionLink
              to="/dashboard/brand/create-campaign"
              className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              <Plus size={16} />
              New Campaign
            </TransitionLink>
          )}
        />
        
        {campaigns.length === 0 ? (
          <EmptyState
            title="No campaigns found"
            description="You haven't launched any campaigns yet. Create one to get started."
            action={(
              <TransitionLink
                to="/dashboard/brand/create-campaign"
                className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm"
              >
                Create campaign
              </TransitionLink>
            )}
          />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-[50rem] w-full text-left">
              <thead className="ih-table-head border-b text-sm">
                <tr>
                  <th className="pb-3 px-4" scope="col">Campaign Details</th>
                  <th className="px-4" scope="col">Status</th>
                  <th className="px-4" scope="col">Budget</th>
                  <th className="px-4" scope="col">Deadline</th>
                  <th className="px-4 text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="ih-table-row border-b last:border-none">
                    <td className="py-4 px-4 max-w-[20rem]">
                      <p className="ih-text-primary font-medium ih-truncate" title={campaign.title}>
                        {campaign.title}
                      </p>
                      <p className="ih-text-muted mt-1 text-sm ih-truncate" title={`${campaign.platform} · ${campaign.location}`}>
                        {campaign.platform} · {campaign.location}
                      </p>
                    </td>
                    <td className="px-4">
                      <StatusBadge tone={getStatusTone(campaign.status)}>
                        {humanizeEnum(campaign.status)}
                      </StatusBadge>
                    </td>
                    <td className="px-4 ih-text-secondary text-sm">
                      {formatCurrency(campaign.budget)}
                    </td>
                    <td className="px-4 ih-text-secondary text-sm">
                      {formatDate(campaign.deadline)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Note: The details view / edit can be wired up to individual pages if they existed, for now just buttons. */}
                        <button
                          className="ih-button-secondary-icon ih-focus-ring rounded-lg p-2 transition-colors hover:bg-white/10"
                          title="View Applications"
                          onClick={() => window.location.href = `/dashboard/brand/applications?campaignId=${campaign.id}`}
                        >
                          <ExternalLink size={16} />
                        </button>
                        <button
                          className="ih-button-secondary-icon ih-focus-ring rounded-lg p-2 transition-colors hover:bg-white/10"
                          title="Edit Campaign (Not Built Yet)"
                          onClick={() => alert("Edit view to be built!")}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="ih-button-danger-icon ih-focus-ring rounded-lg p-2 transition-colors hover:text-red-400"
                          title="Delete Campaign"
                          onClick={() => handleDelete(campaign.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </AdminPage>
  );
};

export default BrandCampaigns;
