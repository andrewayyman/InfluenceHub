import React, { useCallback, useEffect, useState } from "react";
import { Megaphone, CheckCircle, Eye, X } from "lucide-react";
import {
  AdminPage as DashboardPage,
  AdminPanel as Panel,
  AdminPanelHeader as PanelHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  SearchField,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { influencerService } from "../../services/api/influencerService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { isAbortError } from "../../services/api/client";
import { getBudgetTypeLabel } from "../../utils/catalog";

const SuggestedCampaigns = () => {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState("");
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [suggestedIds, setSuggestedIds] = useState(new Set());
  const [showOnlySuggested, setShowOnlySuggested] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [applyingCampaign, setApplyingCampaign] = useState(null);
  const [applyForm, setApplyForm] = useState({
    message: "",
    bio: "",
    proposal: "",
    proposedBudget: "",
    linksText: "",
    mediaFilesText: "",
  });
  const debouncedSearch = useDebouncedValue(search, 300);

  const loadCampaigns = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const [allCampaigns, suggested, apps] = await Promise.all([
        influencerService.getOpenCampaigns({}, token, signal),
        influencerService.getSuggestedCampaigns({}, token, signal),
        influencerService.getMyApplications(token, signal)
      ]);
      setCampaigns(allCampaigns || []);
      setSuggestedIds(new Set((suggested || []).map(c => c.id)));
      setAppliedIds(new Set((apps || []).map(a => a.campaignId)));
    } catch (err) {
      if (!isAbortError(err) && !signal?.aborted) {
        setError(err.message || "Unable to load campaigns.");
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

  const openApply = (campaign) => {
    setApplyingCampaign(campaign);
    setApplyForm({
      message: "I am interested in this campaign!",
      bio: "",
      proposal: "",
      proposedBudget: campaign?.budget ? String(campaign.budget) : "",
      linksText: "",
      mediaFilesText: "",
    });
  };

  const closeApply = () => {
    setApplyingCampaign(null);
    setApplyingId("");
  };

  const submitApply = async (e) => {
    e.preventDefault();
    if (!applyingCampaign) return;

    const links = applyForm.linksText
      .split(/[\n,]/)
      .map((x) => x.trim())
      .filter(Boolean);

    const mediaFiles = applyForm.mediaFilesText
      .split(/[\n,]/)
      .map((x) => x.trim())
      .filter(Boolean);

    try {
      setApplyingId(applyingCampaign.id);
      setError("");
      await influencerService.applyForCampaign(
        {
          campaignId: applyingCampaign.id,
          message: applyForm.message,
          bio: applyForm.bio,
          proposal: applyForm.proposal,
          proposedBudget: Number(applyForm.proposedBudget || 0),
          links,
          mediaFiles,
        },
        token
      );
      setAppliedIds((prev) => new Set(prev).add(applyingCampaign.id));
      closeApply();
    } catch (err) {
      setError(err.message || "Failed to apply for campaign.");
    } finally {
      setApplyingId("");
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.platforms?.some(p => p.toLowerCase().includes(debouncedSearch.toLowerCase()));
      
    if (showOnlySuggested && !suggestedIds.has(c.id)) {
      return false;
    }
    
    return matchesSearch;
  });

  return (
    <DashboardPage>

      <Panel tone="brand">
        <PanelHeader
          kicker="Discover"
          title="Campaigns"
          description="Find brands that match your aesthetic and audience. Apply to deals and start creating."
        />

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <SearchField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns by title or platform..."
            />
          </div>
          
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <span className="text-sm font-medium text-slate-300">Show only suggested</span>
            <button
              type="button"
              role="switch"
              aria-checked={showOnlySuggested}
              onClick={() => setShowOnlySuggested(!showOnlySuggested)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#0f172a] ${
                showOnlySuggested ? "bg-emerald-500" : "bg-white/10"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showOnlySuggested ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </label>
        </div>

        {loading ? (
          <LoadingState label="Loading opportunities..." />
        ) : filteredCampaigns.length === 0 ? (
          <EmptyState
            title="No campaigns found"
            description="We couldn't find any open campaigns matching your criteria right now. Check back later!"
            action={
              (search || showOnlySuggested) ? (
                <button 
                  onClick={() => { setSearch(""); setShowOnlySuggested(false); }} 
                  className="ih-button-secondary px-5 py-2.5"
                >
                  Clear filters
                </button>
              ) : null
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => {
              const isApplied = appliedIds.has(campaign.id);
              const isApplying = applyingId === campaign.id;

              return (
                <div key={campaign.id} className="ih-surface flex flex-col justify-between rounded-[1.35rem] p-5 border border-white/8">
                  <div>
                    <div className="mb-3 flex items-start gap-3">
                      <div className="ih-icon-chip ih-icon-chip-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
                        <Megaphone size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="ih-text-primary truncate font-medium">{campaign.title}</h3>
                          {suggestedIds.has(campaign.id) && (
                            <span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                              Suggested for you
                            </span>
                          )}
                        </div>
                        <p className="ih-text-muted text-xs truncate mt-0.5">Platforms: {campaign.platforms?.join(", ") || "—"}</p>
                      </div>
                    </div>
                    
                    <p className="ih-text-secondary text-sm mb-4 line-clamp-3">
                      {campaign.description || "No description provided."}
                    </p>

                    <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-white/5 p-2 text-center">
                        <p className="ih-text-subtle text-xs mb-1">Budget</p>
                        <p className="font-semibold text-white">{formatCurrency(campaign.budget)}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{getBudgetTypeLabel(campaign.budgetType)}</p>
                      </div>
                      <div className="rounded-lg bg-white/5 p-2 text-center">
                        <p className="ih-text-subtle text-xs mb-1">Deadline</p>
                        <p className="font-semibold text-white truncate">{formatDate(campaign.deadline)}</p>
                      </div>
                    </div>

                    {campaign.tags?.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {campaign.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="ih-pill-tint ih-pill-brand text-xs">
                            {tag}
                          </span>
                        ))}
                        {campaign.tags.length > 3 && (
                          <span className="ih-pill-tint ih-pill-brand text-xs">+{campaign.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => openApply(campaign)}
                    disabled={isApplied || isApplying}
                    className={`mt-auto w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      isApplied 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed"
                        : "ih-button-primary"
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle size={16} /> Applied
                      </>
                    ) : isApplying ? (
                      "Applying..."
                    ) : (
                      "Apply for Campaign"
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                  >
                    <Eye size={16} /> View details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {selectedCampaign ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Campaign profile</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{selectedCampaign.title}</h3>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="rounded-lg border border-white/20 p-2 text-slate-300 hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-300">{selectedCampaign.description || "No description provided."}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Budget</p>
                <p className="mt-1 font-semibold text-white">{formatCurrency(selectedCampaign.budget)}</p>
                <p className="text-xs text-slate-400">{getBudgetTypeLabel(selectedCampaign.budgetType)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Deadline</p>
                <p className="mt-1 font-semibold text-white">{formatDate(selectedCampaign.deadline)}</p>
                <p className="text-xs text-slate-400">Location: {selectedCampaign.location || "-"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Platforms</p>
              <p className="mt-1 text-sm text-white">{selectedCampaign.platforms?.join(", ") || "-"}</p>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(selectedCampaign.tags || []).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-200">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {applyingCampaign ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={submitApply} className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Apply now</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{applyingCampaign.title}</h3>
              </div>
              <button type="button" onClick={closeApply} className="rounded-lg border border-white/20 p-2 text-slate-300 hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-200">Proposal</label>
                <textarea
                  rows={3}
                  className="ih-input w-full"
                  value={applyForm.proposal}
                  onChange={(e) => setApplyForm((p) => ({ ...p, proposal: e.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-200">Message to brand</label>
                <textarea
                  rows={2}
                  className="ih-input w-full"
                  value={applyForm.message}
                  onChange={(e) => setApplyForm((p) => ({ ...p, message: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-200">Your budget offer</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="ih-input w-full"
                  value={applyForm.proposedBudget}
                  onChange={(e) => setApplyForm((p) => ({ ...p, proposedBudget: e.target.value }))}
                  required
                />
                <p className="mt-1 text-xs text-slate-400">Based on: {getBudgetTypeLabel(applyingCampaign.budgetType)}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-200">Short bio</label>
                <textarea
                  rows={2}
                  className="ih-input w-full"
                  value={applyForm.bio}
                  onChange={(e) => setApplyForm((p) => ({ ...p, bio: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-200">Attached links (comma/new line)</label>
                <textarea
                  rows={2}
                  className="ih-input w-full"
                  value={applyForm.linksText}
                  onChange={(e) => setApplyForm((p) => ({ ...p, linksText: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-200">Media files/portfolio links</label>
                <textarea
                  rows={2}
                  className="ih-input w-full"
                  value={applyForm.mediaFilesText}
                  onChange={(e) => setApplyForm((p) => ({ ...p, mediaFilesText: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeApply} className="ih-button-secondary px-4 py-2">Cancel</button>
              <button type="submit" disabled={applyingId === applyingCampaign.id} className="ih-button-primary px-4 py-2">
                {applyingId === applyingCampaign.id ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </DashboardPage>
  );
};

export default SuggestedCampaigns;
