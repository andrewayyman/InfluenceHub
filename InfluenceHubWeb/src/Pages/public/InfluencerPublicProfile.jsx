import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, MapPin, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook } from "react-icons/si";
import { FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { influencerService } from "../../services/api/influencerService";
import { getInfluencerReviews, getInfluencerReviewSummary } from "../../services/api/reviewService";
import { StarRating } from "../../Components/Shared/StarRating";
import { ReviewList } from "../../Components/Shared/ReviewList";

const PLATFORM_ICONS = {
  Instagram: SiInstagram,
  TikTok: SiTiktok,
  YouTube: SiYoutube,
  Facebook: SiFacebook,
  LinkedIn: FaLinkedinIn,
  Twitter: FaTwitter,
};

const SOCIAL_FIELDS = [
  { key: "instagramUrl", label: "Instagram" },
  { key: "tikTokUrl", label: "TikTok" },
  { key: "youTubeUrl", label: "YouTube" },
  { key: "twitterUrl", label: "Twitter / X" },
  { key: "facebookUrl", label: "Facebook" },
  { key: "linkedInUrl", label: "LinkedIn" },
];

const InfluencerPublicProfile = () => {
  const { influencerId } = useParams();
    const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const [profileData, reviewsData, summaryData] = await Promise.all([
        influencerService.getPublicProfile(influencerId, signal),
        getInfluencerReviews(influencerId, signal),
        getInfluencerReviewSummary(influencerId, signal),
      ]);
      if (!signal.aborted) {
        setProfile(profileData);
        setReviews(reviewsData || []);
        setReviewSummary(summaryData);
      }
    } catch (err) {
      if (!signal.aborted) setError(err.message || "Unable to load influencer profile.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [influencerId]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen ih-section-shell flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen ih-section-shell flex flex-col items-center justify-center gap-4">
        <AlertTriangle size={48} className="text-amber-400" />
        <p className="text-slate-400">{error || "Influencer not found."}</p>
        <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-500 text-sm">Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen ih-section-shell">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm ih-text-muted hover:ih-text-primary mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-600">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold ih-text-primary">{profile.name}</h1>
                {profile.isEligible ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                    <CheckCircle size={12} /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 border border-amber-500/20">
                    <AlertTriangle size={12} /> Under 10K
                  </span>
                )}
              </div>
              {profile.location && (
                <p className="flex items-center gap-1 text-sm text-slate-400 mb-2">
                  <MapPin size={14} /> {profile.location}
                </p>
              )}
              <p className="text-sm ih-text-secondary leading-relaxed">{profile.bio || "No bio provided."}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Followers</p>
              <p className="mt-1 text-xl font-bold ih-text-primary">{Number(profile.followersCount || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Rating</p>
              <p className="mt-1 text-xl font-bold text-amber-400">{profile.averageRating?.toFixed(1) || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Reviews</p>
              <p className="mt-1 text-xl font-bold ih-text-primary">{profile.totalReviews || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Campaigns</p>
              <p className="mt-1 text-xl font-bold ih-text-primary">{profile.completedCampaigns || 0}</p>
            </div>
          </div>
        </div>

        {profile.platforms?.length > 0 && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 mb-6">
            <h2 className="text-lg font-semibold ih-text-primary mb-4">Platforms</h2>
            <div className="flex flex-wrap gap-2">
              {profile.platforms.map((p) => {
                const Icon = PLATFORM_ICONS[p];
                return (
                  <span key={p} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm ih-text-secondary">
                    {Icon && <Icon size={16} />} {p}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {profile.tags?.length > 0 && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 mb-6">
            <h2 className="text-lg font-semibold ih-text-primary mb-4">Niche Tags</h2>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs ih-text-secondary">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {SOCIAL_FIELDS.some((f) => profile[f.key]) && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 mb-6">
            <h2 className="text-lg font-semibold ih-text-primary mb-4">Social Links</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIAL_FIELDS.filter((f) => profile[f.key]).map((f) => {
                const Icon = PLATFORM_ICONS[f.label] || ExternalLink;
                return (
                  <a key={f.key} href={profile[f.key]} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm ih-text-secondary hover:ih-text-primary hover:border-indigo-500/30 transition-all">
                    <Icon size={18} className="text-indigo-400" />
                    <span className="truncate">{f.label}</span>
                    <ExternalLink size={12} className="ml-auto text-slate-500" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold ih-text-primary mb-4">Reviews & Ratings</h2>
          <ReviewList reviews={reviews} summary={reviewSummary} />
        </div>
      </div>
    </div>
  );
};

export default InfluencerPublicProfile;
