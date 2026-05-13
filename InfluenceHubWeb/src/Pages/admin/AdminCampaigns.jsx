import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Megaphone, Trash2, X } from "lucide-react";
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
import { getBudgetTypeLabel } from "../../utils/catalog";

const AdminCampaigns = () => {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actingId, setActingId] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
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
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => {
              const title = campaign.title?.trim() || "Untitled campaign";
              const brandName = campaign.brandName?.trim() || "Unknown brand";
              const platforms = campaign.platforms?.join(", ") || "Platform pending";
              const location = campaign.location?.trim() || "Location pending";

              return (
                <div key={campaign.id} className="ih-panel-outline flex flex-col p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border border-slate-200">
                  {/* Card Header */}
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="ih-icon-chip ih-icon-chip-brand h-12 w-12 shrink-0 rounded-2xl shadow-sm">
                        <Megaphone size={22} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="ih-text-primary truncate text-lg font-bold leading-tight" title={title}>
                          {title}
                        </h3>
                        <p className="ih-text-muted mt-1 truncate text-sm font-medium">
                          {brandName}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge tone={getStatusTone(campaign.status)}>
                        {humanizeEnum(campaign.status)}
                      </StatusBadge>
                    </div>
                  </div>

                  {/* Campaign Details */}
                  <div className="mb-6 space-y-5">
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Platforms</span>
                        <span className="truncate font-medium text-slate-700">{platforms}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Location</span>
                        <span className="truncate font-medium text-slate-700">{location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 shadow-sm">
                        <p className="ih-text-muted text-[10px] font-bold uppercase tracking-wider">Budget</p>
                        <p className="ih-text-primary mt-1 text-base font-bold">{formatCurrency(campaign.budget)}</p>
                        <p className="mt-0.5 text-[11px] font-medium ih-text-muted">
                          {getBudgetTypeLabel(campaign.budgetType)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 shadow-sm">
                        <p className="ih-text-muted text-[10px] font-bold uppercase tracking-wider">Deadline</p>
                        <p className="ih-text-primary mt-1 text-base font-bold">{formatDate(campaign.deadline)}</p>
                        <p className="mt-0.5 text-[11px] font-medium text-amber-600/80">Active Phase</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-emerald-50/50 px-4 py-3 border border-emerald-100/50">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-bold text-emerald-700">Live Applications</span>
                      </div>
                      <span className="ih-pill-tint ih-pill-emerald px-3 py-1 text-sm font-bold shadow-sm">
                        {campaign.applicationCount}
                      </span>
                    </div>

                    {campaign.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {campaign.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="ih-pill-tint ih-pill-brand text-[10px] uppercase tracking-wider font-bold">
                            {tag}
                          </span>
                        ))}
                        {campaign.tags.length > 3 && (
                          <span className="ih-pill-tint ih-pill-brand text-[10px] font-bold">
                            +{campaign.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedCampaign(campaign)}
                      className="ih-button-secondary ih-focus-ring flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold shadow-sm hover:shadow-md"
                    >
                      <Eye size={18} aria-hidden="true" />
                      View
                    </button>
                    {campaign.status !== "Closed" ? (
                      <button
                        type="button"
                        onClick={() => handleClose(campaign)}
                        disabled={actingId === campaign.id}
                        className="ih-button-secondary ih-focus-ring flex-1 px-3 py-2.5 text-sm font-bold shadow-sm hover:shadow-md"
                      >
                        {actingId === campaign.id ? "Updating..." : "Close"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleDelete(campaign)}
                      disabled={actingId === campaign.id}
                      className="ih-button-danger ih-focus-ring flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                      <Trash2 size={18} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </AdminPanel>

      {selectedCampaign ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] ih-text-muted">Campaign profile</p>
                <h3 className="mt-1 text-xl font-semibold ih-text-primary">{selectedCampaign.title || "Untitled campaign"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="rounded-lg border border-slate-900/20 p-2 ih-text-secondary hover:bg-slate-100"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs ih-text-muted">Brand</p>
                <p className="mt-1 text-sm ih-text-primary">{selectedCampaign.brandName || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs ih-text-muted">Status</p>
                <p className="mt-1 text-sm ih-text-primary">{humanizeEnum(selectedCampaign.status)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs ih-text-muted">Budget</p>
                <p className="mt-1 text-sm ih-text-primary">{formatCurrency(selectedCampaign.budget)}</p>
                <p className="text-xs ih-text-muted">{getBudgetTypeLabel(selectedCampaign.budgetType)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs ih-text-muted">Deadline</p>
                <p className="mt-1 text-sm ih-text-primary">{formatDate(selectedCampaign.deadline)}</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs ih-text-muted">Platforms</p>
              <p className="mt-1 text-sm ih-text-primary">{selectedCampaign.platforms?.join(", ") || "-"}</p>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs ih-text-muted">Location</p>
              <p className="mt-1 text-sm ih-text-primary">{selectedCampaign.location || "-"}</p>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs ih-text-muted">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(selectedCampaign.tags || []).length > 0 ? selectedCampaign.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-800">{tag}</span>
                )) : <span className="text-sm ih-text-secondary">-</span>}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPage>
  );
};

export default AdminCampaigns;

