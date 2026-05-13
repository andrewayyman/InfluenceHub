import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Facebook,
  Instagram,
  Link as LinkIcon,
  Linkedin,
  User,
  Youtube,
  Twitter,
  MapPin,
  CheckCircle,
  Star,
  Layers,
  Zap,
  Globe,
  Plus,
  X,
  Camera,
  Mail,
  ShieldCheck,
  TrendingUp,
  Award
} from "lucide-react";
import {
  AdminPage as DashboardPage,
  AdminMetricCard,
  StatusBadge,
  ErrorState,
  LoadingState,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { influencerService } from "../../services/api/influencerService";
import { isAbortError } from "../../services/api/client";
import { getTags } from "../../services/api/tagService";
import {
  SiInstagram,
  SiTiktok,
  SiYoutube,
  SiFacebook,
  SiSnapchat,
  SiPinterest,
  SiTwitch,
} from "react-icons/si";
import { FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { PLATFORM_OPTIONS } from "../../utils/catalog";
import { getUserInitials } from "../../utils/auth";
import { ReviewList } from "../../Components/Shared/ReviewList";
import { formatCompactNumber } from "../../utils/formatters";

const PLATFORM_ICONS = {
  Instagram: SiInstagram,
  TikTok: SiTiktok,
  YouTube: SiYoutube,
  Facebook: SiFacebook,
  LinkedIn: FaLinkedinIn,
  Twitter: FaTwitter,
  Snapchat: SiSnapchat,
  Pinterest: SiPinterest,
  Twitch: SiTwitch,
};

const PLATFORM_COLORS = {
  Instagram: "#E1306C",
  TikTok: "#000000",
  YouTube: "#FF0000",
  Facebook: "#1877F2",
  LinkedIn: "#0A66C2",
  Twitter: "#1DA1F2",
  Snapchat: "#FFFC00",
  Pinterest: "#E60023",
  Twitch: "#9146FF",
};

const InfluencerProfile = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availableTags, setAvailableTags] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    followersCount: 0,
    location: "",
    platforms: [],
    tags: [],
    instagramUrl: "",
    facebookUrl: "",
    twitterUrl: "",
    youTubeUrl: "",
    tikTokUrl: "",
    linkedInUrl: "",
  });

  const loadData = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      // Fetch profile first to get influencerId
      const profileData = await influencerService.getProfile(token, signal);
      
      if (signal?.aborted) return;
      setProfile(profileData);

      if (profileData) {
        setFormData({
          name: profileData.name || user?.displayName || "",
          bio: profileData.bio || "",
          followersCount: profileData.followersCount || 0,
          location: profileData.location || "",
          platforms: profileData.platforms || [],
          tags: profileData.tags || [],
          instagramUrl: profileData.instagramUrl || "",
          facebookUrl: profileData.facebookUrl || "",
          twitterUrl: profileData.twitterUrl || "",
          youTubeUrl: profileData.youTubeUrl || "",
          tikTokUrl: profileData.tikTokUrl || "",
          linkedInUrl: profileData.linkedInUrl || "",
        });

        // Parallel fetch for other data
        const [tags, summary, reviewList, apps] = await Promise.all([
          getTags(token, signal).catch(() => []),
          influencerService.getMyReviewSummary(profileData.id, token, signal).catch(() => null),
          influencerService.getMyReviews(profileData.id, token, signal).catch(() => []),
          influencerService.getMyApplications(token, signal).catch(() => []),
        ]);

        if (!signal?.aborted) {
          setAvailableTags(tags || []);
          setReviewSummary(summary);
          setReviews(reviewList || []);
          setApplications(apps || []);
        }
      }
    } catch (err) {
      if (!isAbortError(err) && !signal?.aborted) {
        setError(err.message || "Unable to load profile data.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const toggleSelection = (field, value) => {
    setFormData((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists ? prev[field].filter((x) => x !== value) : [...prev[field], value],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedProfile = await influencerService.updateProfile(formData, token);
      setProfile(updatedProfile);
      setSuccess("Profile updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
      setIsEditing(false);
      // Reload stats if necessary
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const tagNames = useMemo(
    () => availableTags.map((tag) => tag.name).filter(Boolean),
    [availableTags],
  );

  const stats = useMemo(() => {
    const active = applications.filter(a => a.campaignStatus === "Active").length;
    const completed = applications.filter(a => ["Completed", "Closed"].includes(a.campaignStatus)).length;
    
    return [
      { label: "Reach", value: profile?.followersCount || 0, icon: TrendingUp, accent: "ih-metric-card-brand" },
      { label: "Rating", value: reviewSummary?.averageRating?.toFixed(1) || "0.0", icon: Star, accent: "ih-metric-card-warm" },
      { label: "Reviews", value: reviewSummary?.totalReviews || 0, icon: Award, accent: "ih-metric-card-success" },
      { label: "Completed", value: completed, icon: CheckCircle, accent: "ih-metric-card-brand" },
      { label: "Active", value: active, icon: Zap, accent: "ih-metric-card-warm" },
    ];
  }, [profile, reviewSummary, applications]);

  const profileCompletion = useMemo(() => {
    const fields = [
      profile?.name,
      profile?.bio,
      profile?.location,
      profile?.platforms?.length > 0,
      profile?.tags?.length > 0,
      profile?.instagramUrl || profile?.tikTokUrl || profile?.youTubeUrl
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  if (loading && !profile) {
    return (
      <DashboardPage>
        <LoadingState label="Preparing your creator profile..." />
      </DashboardPage>
    );
  }

  const profileInitials = getUserInitials(profile || user);

  return (
    <DashboardPage>
      {/* Success Notification */}
      {success && (
        <div className="fixed top-24 right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50 p-4 shadow-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">Success!</p>
              <p className="text-xs text-emerald-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[var(--ih-bg-card)] shadow-xl shadow-slate-200/50">
        {/* Banner */}
        <div className="h-48 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 sm:h-64">
          <div className="ih-home-atmosphere h-full w-full opacity-30"></div>
        </div>
        
        {/* Profile Info Overlay */}
        <div className="relative px-6 pb-8 sm:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-8">
            {/* Avatar */}
            <div className="relative -mt-16 h-32 w-32 shrink-0 overflow-hidden rounded-[2rem] border-[6px] border-[var(--ih-bg-card)] bg-[var(--ih-bg-card)] shadow-2xl sm:-mt-20 sm:h-40 sm:w-40">
              <div className="ih-gradient-brand flex h-full w-full items-center justify-center text-4xl font-black text-white sm:text-5xl">
                {profileInitials}
              </div>
              <button 
                title="Change Profile Picture"
                className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-lg transition-transform hover:scale-110 active:scale-95"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* Basic Details */}
            <div className="mt-6 flex-1 sm:mt-0 sm:pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight ih-text-primary sm:text-4xl">
                  {profile?.name || user?.displayName || "Influencer"}
                </h1>
                {reviewSummary?.averageRating > 4.5 && (
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 shadow-sm border border-amber-200">
                    <Award size={14} fill="currentColor" />
                    Top Rated
                  </div>
                )}
                <ShieldCheck size={24} className="text-indigo-500" fill="rgba(99, 102, 241, 0.1)" />
              </div>
              
              <p className="mt-1 text-lg font-medium text-slate-500">
                @{profile?.name?.toLowerCase().replace(/\s+/g, '') || user?.email?.split('@')[0]}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                {profile?.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-indigo-400" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Globe size={16} className="text-emerald-400" />
                  Creator Level: <span className="ih-text-primary font-bold">Elite</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={16} className="text-purple-400" />
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3 sm:mt-0 sm:pb-4">
              <button
                onClick={() => setIsEditing(true)}
                className="ih-button-primary flex items-center gap-2 px-6 py-3 text-sm shadow-lg shadow-indigo-200"
              >
                <Edit3 size={18} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left Column */}
        <div className="space-y-8">
          {/* About Section */}
          <section className="ih-panel p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold ih-text-primary flex items-center gap-2">
                <User size={20} className="text-indigo-500" />
                About Creator
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile Completion</span>
                <div className="h-6 w-32 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" 
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <span className="text-xs font-black text-indigo-600">{profileCompletion}%</span>
              </div>
            </div>
            <p className="text-lg leading-relaxed ih-text-secondary italic">
              "{profile?.bio || "No bio provided yet. Tell brands about your creative journey and what makes your content unique."}"
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Category</p>
                <p className="font-semibold ih-text-primary">Lifestyle & Tech</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Languages</p>
                <p className="font-semibold ih-text-primary">English, Arabic</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Member Since</p>
                <p className="font-semibold ih-text-primary">{new Date(profile?.createdAt || Date.now()).getFullYear()}</p>
              </div>
            </div>
          </section>

          {/* Connected Platforms */}
          <section className="ih-panel p-8">
            <h2 className="mb-6 text-xl font-bold ih-text-primary flex items-center gap-2">
              <Layers size={20} className="text-emerald-500" />
              Connected Platforms
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { name: "Instagram", url: profile?.instagramUrl, color: PLATFORM_COLORS.Instagram, icon: SiInstagram },
                { name: "TikTok", url: profile?.tikTokUrl, color: "#000000", icon: SiTiktok },
                { name: "YouTube", url: profile?.youTubeUrl, color: PLATFORM_COLORS.YouTube, icon: SiYoutube },
                { name: "Twitter", url: profile?.twitterUrl, color: PLATFORM_COLORS.Twitter, icon: FaTwitter },
              ].map((plat) => (
                <div key={plat.name} className={`relative overflow-hidden rounded-3xl border p-6 transition-all hover:shadow-lg ${plat.url ? 'border-slate-200 bg-[var(--ih-bg-card)]' : 'border-dashed border-slate-200 bg-slate-50/50 grayscale'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 shadow-inner" style={{ color: plat.url ? plat.color : '#cbd5e1' }}>
                        <plat.icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold ih-text-primary">{plat.name}</h4>
                        <p className="text-xs text-slate-400">
                          {plat.url ? "Active Connection" : "Not Linked"}
                        </p>
                      </div>
                    </div>
                    {plat.url && (
                      <a href={plat.url} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-indigo-500 hover:text-white transition-colors">
                        <LinkIcon size={14} />
                      </a>
                    )}
                  </div>
                  {plat.url && (
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-lg font-black ih-text-primary">{formatCompactNumber(profile?.followersCount || 0)}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Followers</p>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <p className="text-lg font-black ih-text-primary">4.2%</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Engagement</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Ratings & Reviews */}
          <section className="ih-panel p-8">
            <h2 className="mb-6 text-xl font-bold ih-text-primary flex items-center gap-2">
              <Star size={20} className="text-amber-500" />
              Brand Reviews
            </h2>
            <ReviewList reviews={reviews} summary={reviewSummary} />
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Niche Tags Card */}
          <section className="ih-panel p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Zap size={16} className="text-indigo-500" />
              Niche & Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile?.tags?.length > 0 ? (
                profile.tags.map(tag => (
                  <span key={tag} className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm transition-transform hover:scale-105">
                    #{tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">No niche tags selected yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Modern Edit Profile Modal Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300">
          <div className="relative flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[var(--ih-bg-card)] shadow-[0_30px_70px_rgba(15,23,42,0.12)] animate-in zoom-in-95 duration-500">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6 dark:bg-slate-900/50 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-black ih-text-primary tracking-tight">Refine Your Identity</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Keep your creator profile fresh to attract premium brands.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 shadow-sm dark:bg-slate-800 dark:border-slate-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8">
              <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-10">
                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-50 p-4 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                <div className="grid gap-12 lg:grid-cols-2">
                  {/* Left Col - Core */}
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                        <User size={14} className="text-indigo-500" />
                        Display Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="ih-input h-14 bg-slate-50 border-transparent focus:bg-[var(--ih-bg-card)] px-6 text-lg font-bold"
                        placeholder="e.g. Sarah Jenkins"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                        <Mail size={14} className="text-purple-500" />
                        Bio & Story
                      </label>
                      <textarea
                        name="bio"
                        rows={5}
                        value={formData.bio}
                        onChange={handleChange}
                        className="ih-input bg-slate-50 border-transparent focus:bg-[var(--ih-bg-card)] p-6 resize-none leading-relaxed"
                        placeholder="Tell brands what makes you unique..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Est. Reach</label>
                        <input
                          type="number"
                          name="followersCount"
                          value={formData.followersCount}
                          onChange={handleChange}
                          className="ih-input bg-slate-50 border-transparent focus:bg-[var(--ih-bg-card)] h-12 px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="ih-input bg-slate-50 border-transparent focus:bg-[var(--ih-bg-card)] h-12 px-4"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Niche Categories</label>
                      <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-3xl bg-slate-50 p-4 border border-slate-100">
                        {tagNames.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleSelection("tags", tag)}
                            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                              formData.tags.includes(tag)
                                ? "bg-indigo-600 text-white shadow-lg scale-105"
                                : "bg-[var(--ih-bg-card)] text-slate-500 border border-slate-200 hover:border-indigo-300"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Col - Socials */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Social Connections</h4>
                    
                    {[
                      { name: "Instagram", key: "instagramUrl", icon: Instagram, color: "text-pink-500" },
                      { name: "TikTok", key: "tikTokUrl", icon: TrendingUp, color: "text-black" },
                      { name: "YouTube", key: "youTubeUrl", icon: Youtube, color: "text-red-500" },
                      { name: "Twitter", key: "twitterUrl", icon: Twitter, color: "text-blue-400" },
                      { name: "Facebook", key: "facebookUrl", icon: Facebook, color: "text-blue-600" },
                      { name: "LinkedIn", key: "linkedInUrl", icon: Linkedin, color: "text-blue-700" },
                    ].map(social => (
                      <div key={social.key} className="group relative">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${social.color}`}>
                          <social.icon size={18} />
                        </div>
                        <input
                          type="url"
                          name={social.key}
                          value={formData[social.key]}
                          onChange={handleChange}
                          className="ih-input h-14 bg-slate-50 border-transparent focus:bg-[var(--ih-bg-card)] pl-12 pr-4 text-sm font-medium transition-all group-hover:border-slate-200"
                          placeholder={`${social.name} URL`}
                        />
                      </div>
                    ))}

                    <div className="mt-8 rounded-3xl bg-indigo-50/50 p-6 border border-indigo-100">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap size={18} className="text-indigo-600" />
                        <span className="text-sm font-black text-indigo-900">Optimization Tip</span>
                      </div>
                      <p className="text-xs text-indigo-700 leading-relaxed">
                        Influencers with at least 3 connected platforms and a bio longer than 150 characters get 40% more campaign invites on average.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-4 border-t border-slate-100 px-8 py-6 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="ih-button-secondary px-8 py-3"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                form="edit-profile-form"
                disabled={saving}
                className="ih-button-primary px-10 py-3 shadow-lg shadow-indigo-200"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <StatusBadge tone="neutral" className="animate-spin" />
                    Synchronizing...
                  </span>
                ) : "Publish Updates"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPage>
  );
};

export default InfluencerProfile;


