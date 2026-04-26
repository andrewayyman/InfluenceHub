import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, Facebook, Instagram, Link as LinkIcon, Linkedin, User, Youtube, Twitter } from "lucide-react";
import {
  AdminPage as DashboardPage,
  AdminPanel as Panel,
  AdminPanelHeader as PanelHeader,
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
  TikTok: "#69C9D0",
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

  const loadProfile = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const [data, tags] = await Promise.all([
        influencerService.getProfile(token, signal),
        getTags(token, signal),
      ]);

      if (signal?.aborted) {
        return;
      }

      setAvailableTags(tags || []);
      setProfile(data);

      if (data) {
        setFormData({
          name: data.name || user?.displayName || "",
          bio: data.bio || "",
          followersCount: data.followersCount || 0,
          location: data.location || "",
          platforms: data.platforms || [],
          tags: data.tags || [],
          instagramUrl: data.instagramUrl || "",
          facebookUrl: data.facebookUrl || "",
          twitterUrl: data.twitterUrl || "",
          youTubeUrl: data.youTubeUrl || "",
          tikTokUrl: data.tikTokUrl || "",
          linkedInUrl: data.linkedInUrl || "",
        });
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
    loadProfile(controller.signal);
    return () => controller.abort();
  }, [loadProfile]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Format lists from comma-separated strings
      const submitData = {
        ...formData,
      };

      const updatedProfile = await influencerService.updateProfile(submitData, token);
      setProfile(updatedProfile);
      setSuccess("Profile updated successfully.");
      setIsEditing(false);
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

  if (loading && !profile) {
    return (
      <DashboardPage>
        <LoadingState label="Loading your profile..." />
      </DashboardPage>
    );
  }

  const toggleSelection = (field, value) => {
    setFormData((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists ? prev[field].filter((x) => x !== value) : [...prev[field], value],
      };
    });
  };

  if (!isEditing) {
    return (
      <DashboardPage>
        <Panel tone="brand">
          <PanelHeader
            kicker="Identity"
            title="Influencer Profile"
            description="View your profile details used for campaign matching. Switch to edit only when you want to make changes."
            actions={(
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Edit3 size={16} /> Edit profile
              </button>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Name</p>
              <p className="mt-1 text-sm text-white">{formData.name || "-"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Followers</p>
              <p className="mt-1 text-sm text-white">{Number(formData.followersCount || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-2">
              <p className="text-xs text-slate-400">Bio</p>
              <p className="mt-1 text-sm text-white">{formData.bio || "-"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Location</p>
              <p className="mt-1 text-sm text-white">{formData.location || "-"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Platforms</p>
              <p className="mt-1 text-sm text-white">{formData.platforms.join(", ") || "-"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-2">
              <p className="text-xs text-slate-400">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.length === 0 ? <span className="text-sm text-slate-300">-</span> : formData.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-200">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <Panel tone="brand">
        <PanelHeader
          kicker="Identity"
          title="Influencer Profile"
          description="Keep your metrics and niche tags up to date to get matched with the best campaigns."
        />

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mt-2">
          {success && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
              {success}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Core Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Core Identity</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="ih-input bg-black/40 w-full pl-10"
                    placeholder="Your creator name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Bio</label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="ih-input bg-black/40 w-full resize-none"
                  placeholder="Tell brands about your audience and style..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Total Followers / Subs</label>
                  <input
                    type="number"
                    name="followersCount"
                    min="0"
                    value={formData.followersCount}
                    onChange={handleChange}
                    className="ih-input bg-black/40 w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="ih-input bg-black/40 w-full"
                    placeholder="e.g. New York, USA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Platforms</label>
                <div className="flex flex-wrap gap-3">
                  {PLATFORM_OPTIONS.map((platform) => {
                    const selected = formData.platforms.includes(platform);
                    const Icon = PLATFORM_ICONS[platform];
                    const brandColor = PLATFORM_COLORS[platform];
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => toggleSelection("platforms", platform)}
                        className={[
                          "flex w-[86px] flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 transition-all duration-150 focus:outline-none",
                          selected
                            ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                            : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10",
                        ].join(" ")}
                      >
                        {Icon && (
                          <Icon
                            size={22}
                            style={{ color: selected ? brandColor : undefined }}
                            className={selected ? "" : "text-slate-400"}
                          />
                        )}
                        <span className={["text-xs font-medium leading-tight text-center", selected ? "text-white" : "text-slate-400"].join(" ")}>
                          {platform}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Niche Tags</label>
                <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
                  {tagNames.map((tag) => (
                    <label key={tag} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-white/30">
                      <input
                        type="checkbox"
                        className="accent-indigo-500"
                        checked={formData.tags.includes(tag)}
                        onChange={() => toggleSelection("tags", tag)}
                      />
                      {tag}
                    </label>
                  ))}
                  {tagNames.length === 0 ? (
                    <p className="text-sm text-slate-400">No tags are available yet. Ask an admin to create one first.</p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Social Links & Portfolios</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Instagram</label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="url"
                    name="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={handleChange}
                    className="ih-input bg-black/40 w-full pl-10"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">TikTok</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="url"
                    name="tikTokUrl"
                    value={formData.tikTokUrl}
                    onChange={handleChange}
                    className="ih-input bg-black/40 w-full pl-10"
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">YouTube</label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="url"
                    name="youTubeUrl"
                    value={formData.youTubeUrl}
                    onChange={handleChange}
                    className="ih-input bg-black/40 w-full pl-10"
                    placeholder="https://youtube.com/c/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Twitter / X</label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="url"
                    name="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={handleChange}
                    className="ih-input bg-black/40 w-full pl-10"
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Facebook</label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="url"
                    name="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={handleChange}
                    className="ih-input bg-black/40 w-full pl-10"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">LinkedIn</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="url"
                    name="linkedInUrl"
                    value={formData.linkedInUrl}
                    onChange={handleChange}
                    className="ih-input bg-black/40 w-full pl-10"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="ih-button-secondary ih-focus-ring px-6 py-2.5 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="ih-button-primary ih-focus-ring px-6 py-2.5 font-medium"
              >
                {saving ? "Saving Changes..." : "Save Profile"}
              </button>
            </div>
          </div>
        </form>
      </Panel>
    </DashboardPage>
  );
};

export default InfluencerProfile;
