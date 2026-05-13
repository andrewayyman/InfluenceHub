import React, { useCallback, useEffect, useState, useMemo } from "react";
import { 
  Star, MessageSquare, Award, TrendingUp, BarChart, 
  ArrowUpRight, Filter, ChevronDown, Search, Calendar,
  MoreVertical, ThumbsUp
} from "lucide-react";
import {
  AdminPage as DashboardPage,
  AdminMetricCard as MetricCard,
  ErrorState,
  LoadingState,
  EmptyState,
  SearchField,
  FilterTabs
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { influencerService } from "../../services/api/influencerService";
import { isAbortError } from "../../services/api/client";

const InfluencerRatings = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState("all");

  const loadData = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      // 1. Get Influencer Profile to find influencerId
      const prof = await influencerService.getProfile(token, signal);
      setProfile(prof);

      if (prof) {
        // 2. Fetch Reviews & Summary in parallel
        const [reviewsData, summaryData] = await Promise.all([
          influencerService.getMyReviews(prof.id, token, signal),
          influencerService.getMyReviewSummary(prof.id, token, signal)
        ]);

        if (!signal?.aborted) {
          setReviews(reviewsData || []);
          setSummary(summaryData);
        }
      }
    } catch (err) {
      if (!isAbortError(err) && !signal?.aborted) {
        setError(err.message || "Unable to load ratings data.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Search
    if (search) {
      result = result.filter(r => 
        r.reviewerName?.toLowerCase().includes(search.toLowerCase()) ||
        r.comment?.toLowerCase().includes(search.toLowerCase()) ||
        r.campaignTitle?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Rating Filter
    if (ratingFilter !== "all") {
      result = result.filter(r => r.rating === parseInt(ratingFilter));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });

    return result;
  }, [reviews, search, sortBy, ratingFilter]);

  if (loading && !profile) {
    return (
      <DashboardPage>
        <LoadingState label="Analyzing your performance ratings..." />
      </DashboardPage>
    );
  }

  const ratingStats = [
    { label: "Average Rating", value: summary?.averageRating || 0, icon: Star, color: "text-amber-500", bg: "bg-amber-50", note: "Based on all brand reviews" },
    { label: "Total Reviews", value: summary?.totalReviews || 0, icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-50", note: "Verified brand collaborations" },
    { label: "Completion Rate", value: "100%", icon: Award, color: "text-emerald-500", bg: "bg-emerald-50", note: "Successful campaign deliveries" },
    { label: "Platform Growth", value: "+12%", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50", note: "Last 30 days performance" }
  ];

  return (
    <DashboardPage>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="ih-min-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="ih-pill-tint ih-status-pill-brand px-3 py-1 text-[10px] uppercase tracking-widest font-bold">Performance Analytics</span>
            {summary?.averageRating >= 4.5 && (
               <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                 <Star size={10} className="fill-amber-500" /> Top Rated Influencer
               </span>
            )}
          </div>
          <h1 className="text-3xl font-bold ih-text-primary tracking-tight">Ratings & Feedback</h1>
          <p className="ih-text-muted mt-2 max-w-xl text-sm leading-relaxed">
            Manage your professional reputation. View verified brand reviews, track your average rating, and analyze performance feedback from your collaborations.
          </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
        {ratingStats.map((stat, i) => (
          <div key={i} className="ih-panel ih-panel-hover p-6 rounded-[1.75rem] border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={22} />
              </div>
              <ArrowUpRight size={18} className="text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-medium ih-text-muted mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold ih-text-primary">
                  {typeof stat.value === 'number' && stat.label.includes('Rating') ? stat.value.toFixed(1) : stat.value}
                </h3>
                {stat.label.includes('Rating') && (
                  <div className="flex mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < Math.floor(stat.value) ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs ih-text-secondary mt-3 leading-relaxed">{stat.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Rating Distribution */}
        <div className="lg:col-span-1 space-y-6">
          <div className="ih-panel p-6 rounded-[1.75rem] border border-slate-200">
            <h3 className="text-lg font-bold ih-text-primary mb-6">Rating Distribution</h3>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary?.ratingDistribution?.[star] || 0;
                const percentage = summary?.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm font-bold ih-text-primary w-4">{star}</span>
                    <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs ih-text-muted w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                   <BarChart size={16} />
                 </div>
                 <p className="text-sm font-bold ih-text-primary">Performance Tip</p>
              </div>
              <p className="text-xs ih-text-muted leading-relaxed">
                Consistency is key! High ratings increase your visibility to premium brands by 40%. Keep delivering high-quality content.
              </p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:max-w-xs">
              <SearchField 
                placeholder="Search reviews..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
               <div className="relative flex-1 sm:flex-none">
                 <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="ih-input py-2.5 pl-4 pr-10 text-sm w-full appearance-none bg-white cursor-pointer"
                 >
                   <option value="newest">Newest First</option>
                   <option value="highest">Highest Rating</option>
                   <option value="lowest">Lowest Rating</option>
                 </select>
                 <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
               </div>
               <div className="relative flex-1 sm:flex-none">
                 <select 
                   value={ratingFilter}
                   onChange={(e) => setRatingFilter(e.target.value)}
                   className="ih-input py-2.5 pl-4 pr-10 text-sm w-full appearance-none bg-white cursor-pointer"
                 >
                   <option value="all">All Ratings</option>
                   <option value="5">5 Stars</option>
                   <option value="4">4 Stars</option>
                   <option value="3">3 Stars</option>
                   <option value="2">2 Stars</option>
                   <option value="1">1 Star</option>
                 </select>
                 <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
               </div>
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <EmptyState 
              title={search || ratingFilter !== "all" ? "No matches found" : "No reviews yet"}
              description={search || ratingFilter !== "all" ? "Try adjusting your filters to see more results." : "Complete your first campaign to receive professional feedback from brand partners."}
              icon={MessageSquare}
              action={search || ratingFilter !== "all" ? (
                <button 
                  onClick={() => { setSearch(""); setRatingFilter("all"); }}
                  className="ih-button-secondary px-5 py-2"
                >
                  Clear Filters
                </button>
              ) : null}
            />
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="ih-panel p-6 rounded-[1.75rem] border border-slate-200 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <span className="text-lg font-bold">{(review.reviewerName || "B").charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold ih-text-primary">{review.reviewerName}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <div className="flex">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={14} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                             ))}
                           </div>
                           <span className="text-xs ih-text-muted">• {new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-slate-300 hover:text-slate-600">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  
                  <div className="relative pl-6 py-1 mb-4">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-100 rounded-full group-hover:bg-indigo-300 transition-colors" />
                    <p className="ih-text-primary text-[15px] italic leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50 mt-4">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Campaign</span>
                       <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-xs font-medium border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                         {review.campaignTitle || "Private Campaign"}
                       </span>
                    </div>
                    <div className="flex items-center gap-3">
                       <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors">
                         <ThumbsUp size={14} /> Helpful
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardPage>
  );
};

export default InfluencerRatings;
