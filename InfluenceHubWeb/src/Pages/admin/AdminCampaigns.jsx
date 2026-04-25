import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FolderKanban, Megaphone, ShieldAlert } from "lucide-react";
import {
  AdminHero,
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  EmptyState,
  ErrorState,
  FilterTabs,
  LoadingState,
  SearchField,
  StatusBadge,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  closeCampaign,
  deleteCampaign,
  getCampaigns,
} from "../../services/api/adminService";
import {
  CAMPAIGN_STATUS_OPTIONS,
  getStatusTone,
  humanizeEnum,
} from "../../utils/admin";
import {
  formatCurrency,
  formatDate,
} from "../../utils/formatters";
import { isAbortError } from "../../services/api/client";

const AdminCampaigns = () => {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actingId, setActingId] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);

  const loadCampaigns = useCallback(async (signal) => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getCampaigns(token, {
        status: statusFilter || undefined,
        search: debouncedSearch,
      }, signal);

      setCampaigns(response);
    } catch (requestError) {
      if (isAbortError(requestError) || signal?.aborted) {
        return;
      }

      setError(requestError.message || "Unable to load campaigns.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, statusFilter, token]);

  useEffect(() => {
    const controller = new AbortController();

    loadCampaigns(controller.signal);

    return () => controller.abort();
  }, [loadCampaigns]);

  const summary = useMemo(() => campaigns.reduce((result, campaign) => {
    result.total += 1;

    if (campaign.status === "Open") {
      result.open += 1;
    }

    if (campaign.status === "Completed") {
      result.completed += 1;
    }

    if (campaign.status === "Closed") {
      result.closed += 1;
    }

    return result;
  }, {
    total: 0,
    open: 0,
    completed: 0,
    closed: 0,
  }), [campaigns]);

  const handleClose = async (campaign) => {
    const confirmed = window.confirm(`Close ${campaign.title}?`);

    if (!confirmed) {
      return;
    }

    try {
      setActingId(campaign.id);
      setNotice("");
      await closeCampaign(token, campaign.id);
      setNotice(`${campaign.title} has been closed.`);
      await loadCampaigns();
    } catch (requestError) {
      setError(requestError.message || "That campaign could not be closed.");
    } finally {
      setActingId("");
    }
  };

  const handleDelete = async (campaign) => {
    const confirmed = window.confirm(`Delete ${campaign.title}? This will fail when campaign applications already exist.`);

    if (!confirmed) {
      return;
    }

    try {
      setActingId(campaign.id);
      setNotice("");
      await deleteCampaign(token, campaign.id);
      setNotice(`${campaign.title} has been deleted.`);
      await loadCampaigns();
    } catch (requestError) {
      setError(requestError.message || "That campaign could not be deleted.");
    } finally {
      setActingId("");
    }
  };

  return (
    <AdminPage>
      {error ? <ErrorState message={error} onRetry={() => loadCampaigns()} /> : null}

      <AdminPanel tone="emerald">
        <AdminPanelHeader
          kicker="Campaign oversight"
          title="Campaigns"
          description="The list updates with the current search and status filter so you can move through the queue fast."
          actions={notice ? <span role="status" aria-live="polite"><StatusBadge tone="success">{notice}</StatusBadge></span> : null}
        />

        <div className="mb-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, brand, platform, or tag" />
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
              className="ih-button-secondary ih-focus-ring px-4 py-3 text-sm"
            >
              Reset filters
            </button>
          </div>
          <FilterTabs label="Filter campaigns by status" items={CAMPAIGN_STATUS_OPTIONS} value={statusFilter} onSelect={setStatusFilter} />
        </div>

        {loading ? <LoadingState label="Loading campaigns..." /> : null}

        {!loading && campaigns.length === 0 ? (
          <EmptyState title="No campaigns match this view" description="Try a broader search or switch back to all statuses to see more activity." />
        ) : null}

        {!loading && campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[66rem] w-full text-left">
              <thead className="ih-table-head border-b text-sm">
                <tr>
                  <th className="pb-3" scope="col">Campaign</th>
                  <th scope="col">Budget</th>
                  <th scope="col">Deadline</th>
                  <th scope="col">Status</th>
                  <th scope="col">Applications</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const title = campaign.title?.trim() || "Untitled campaign";
                  const brandName = campaign.brandName?.trim() || "Unknown brand";
                  const platform = campaign.platforms?.join(", ") || "Platform pending";
                  const location = campaign.location?.trim() || "Location pending";

                  return (
                  <tr key={campaign.id} className="ih-table-row border-b last:border-none align-top">
                    <td className="py-4">
                      <div className="flex gap-3">
                        <div className="ih-icon-chip ih-icon-chip-brand mt-1 h-10 w-10 shrink-0 rounded-2xl">
                          <Megaphone size={18} aria-hidden="true" />
                        </div>
                        <div>
                          <p className="ih-text-primary font-medium">{title}</p>
                          <p className="ih-text-muted mt-1 text-sm">{brandName} · {platform} · {location}</p>
                          {campaign.tags?.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {campaign.tags.map((tag) => (
                                <span key={tag} className="ih-pill-tint ih-pill-brand text-xs">{tag}</span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="ih-text-primary py-4 font-medium">{formatCurrency(campaign.budget)}</td>
                    <td className="ih-text-secondary py-4 text-sm">{formatDate(campaign.deadline)}</td>
                    <td className="py-4">
                      <StatusBadge tone={getStatusTone(campaign.status)}>{humanizeEnum(campaign.status)}</StatusBadge>
                    </td>
                    <td className="py-4">
                      <span className="ih-pill-tint ih-pill-emerald text-sm">{campaign.applicationCount} applications</span>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        {campaign.status !== "Closed" ? (
                          <button
                            type="button"
                            onClick={() => handleClose(campaign)}
                            disabled={actingId === campaign.id}
                            className="ih-button-secondary ih-focus-ring px-3 py-2 text-sm"
                          >
                            {actingId === campaign.id ? "Updating..." : "Close"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDelete(campaign)}
                          disabled={actingId === campaign.id}
                          className="ih-focus-ring rounded-lg border border-red-400/18 bg-red-500/8 px-3 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/12"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdminPanel>
    </AdminPage>
  );
};

export default AdminCampaigns;
