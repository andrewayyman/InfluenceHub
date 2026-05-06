import React, { useCallback, useEffect, useState } from "react";
import { ExternalLink, Eye, Pencil, Plus, Trash2, X } from "lucide-react";
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
import { getBudgetTypeLabel } from "../../utils/catalog";

const BrandCampaigns = () => {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

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
                {campaigns.map((campaign) => {
                  const isOpenCampaign = campaign.status === "Open";

                  return (
                    <tr key={campaign.id} className="ih-table-row border-b last:border-none">
                      <td className="py-4 px-4 max-w-[20rem]">
                        <p className="ih-text-primary font-medium ih-truncate" title={campaign.title}>
                          {campaign.title}
                        </p>
                        <p className="ih-text-muted mt-1 text-sm ih-truncate" title={`${campaign.platforms?.join(", ")} · ${campaign.location}`}>
                          {campaign.platforms?.join(", ")} · {campaign.location}
                        </p>
                      </td>
                      <td className="px-4">
                        <StatusBadge tone={getStatusTone(campaign.status)}>
                          {humanizeEnum(campaign.status)}
                        </StatusBadge>
                      </td>
                      <td className="px-4 ih-text-secondary text-sm">
                        {formatCurrency(campaign.budget)}
                        <p className="text-xs ih-text-muted">{getBudgetTypeLabel(campaign.budgetType)}</p>
                      </td>
                      <td className="px-4 ih-text-secondary text-sm">
                        {formatDate(campaign.deadline)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="ih-button-secondary-icon ih-focus-ring rounded-lg p-2 transition-colors hover:bg-slate-100"
                            title="View Applications"
                            onClick={() => window.location.href = `/dashboard/brand/applications?campaignId=${campaign.id}`}
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            className="ih-button-secondary-icon ih-focus-ring rounded-lg p-2 transition-colors hover:bg-slate-100"
                            title="View campaign profile"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <Eye size={16} />
                          </button>
                          {isOpenCampaign ? (
                            <>
                              <TransitionLink
                                to={`/dashboard/brand/edit-campaign/${campaign.id}`}
                                className="ih-button-secondary-icon ih-focus-ring inline-flex rounded-lg p-2 transition-colors hover:bg-slate-100"
                                title="Edit Campaign"
                              >
                                <Pencil size={16} />
                              </TransitionLink>
                              <button
                                className="ih-button-danger-icon ih-focus-ring rounded-lg p-2 transition-colors hover:text-red-400"
                                title="Delete Campaign"
                                onClick={() => handleDelete(campaign.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      {selectedCampaign ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-[#0f172a] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] ih-text-muted uppercase">Campaign profile</p>
                <h3 className="mt-1 text-xl font-semibold ih-text-primary">{selectedCampaign.title}</h3>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="rounded-lg border border-slate-900/20 p-2 ih-text-secondary hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <p className="mb-4 text-sm ih-text-secondary">{selectedCampaign.description || "-"}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs ih-text-muted">Budget</p>
                <p className="mt-1 font-semibold ih-text-primary">{formatCurrency(selectedCampaign.budget)}</p>
                <p className="text-xs ih-text-muted">{getBudgetTypeLabel(selectedCampaign.budgetType)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs ih-text-muted">Deadline</p>
                <p className="mt-1 font-semibold ih-text-primary">{formatDate(selectedCampaign.deadline)}</p>
                <p className="text-xs ih-text-muted">Location: {selectedCampaign.location || "-"}</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs ih-text-muted">Platforms</p>
              <p className="mt-1 text-sm ih-text-primary">{selectedCampaign.platforms?.join(", ") || "-"}</p>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs ih-text-muted">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(selectedCampaign.tags || []).map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-800">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPage>
  );
};

export default BrandCampaigns;
