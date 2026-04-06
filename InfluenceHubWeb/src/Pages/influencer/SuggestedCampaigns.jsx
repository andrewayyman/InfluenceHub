import React, { useCallback, useEffect, useState } from "react";
import { Megaphone, CheckCircle } from "lucide-react";
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

const SuggestedCampaigns = () => {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState("");
  const [appliedIds, setAppliedIds] = useState(new Set());
  const debouncedSearch = useDebouncedValue(search, 300);

  const loadCampaigns = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      // The API takes platform and location, we can pass search as a param if backend supports it,
      // but for now we'll fetch and filter client side if needed, or pass it as search.
      // `getOpenCampaigns` in backend accepts platform & location.
      const response = await influencerService.getSuggestedCampaigns({}, token, signal);
      setCampaigns(response);
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

  const handleApply = async (campaignId) => {
    try {
      setApplyingId(campaignId);
      setError("");
      await influencerService.applyForCampaign(
        { campaignId, message: "I am interested in this campaign!" }, 
        token
      );
      setAppliedIds((prev) => new Set(prev).add(campaignId));
    } catch (err) {
      setError(err.message || "Failed to apply for campaign.");
    } finally {
      setApplyingId("");
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    c.platform?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <DashboardPage>

      <Panel tone="brand">
        <PanelHeader
          kicker="Discover"
          title="Suggested Campaigns"
          description="Find brands that match your aesthetic and audience. Apply to deals and start creating."
        />

        <div className="mb-6">
          <SearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by title or platform..."
          />
        </div>

        {loading ? (
          <LoadingState label="Loading opportunities..." />
        ) : filteredCampaigns.length === 0 ? (
          <EmptyState
            title="No campaigns found"
            description="We couldn't find any open campaigns matching your criteria right now. Check back later!"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => {
              const isApplied = appliedIds.has(campaign.id);
              const isApplying = applyingId === campaign.id;

              return (
                <div key={campaign.id} className="ih-surface flex flex-col justify-between rounded-[1.35rem] p-5 border border-white/8">
                  <div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="ih-icon-chip ih-icon-chip-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
                        <Megaphone size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="ih-text-primary truncate font-medium">{campaign.title}</h3>
                        <p className="ih-text-muted text-xs truncate">By Platform: {campaign.platform}</p>
                      </div>
                    </div>
                    
                    <p className="ih-text-secondary text-sm mb-4 line-clamp-3">
                      {campaign.description || "No description provided."}
                    </p>

                    <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-white/5 p-2 text-center">
                        <p className="ih-text-subtle text-xs mb-1">Budget</p>
                        <p className="font-semibold text-white">{formatCurrency(campaign.budget)}</p>
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
                    onClick={() => handleApply(campaign.id)}
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
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </DashboardPage>
  );
};

export default SuggestedCampaigns;
