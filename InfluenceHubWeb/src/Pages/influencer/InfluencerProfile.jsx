import React, { useCallback, useEffect, useState } from "react";
import { User, Link as LinkIcon, Instagram, Youtube, Facebook, Twitter, Linkedin } from "lucide-react";
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

const InfluencerProfile = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    followersCount: 0,
    location: "",
    platforms: "",
    tags: "",
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
      const data = await influencerService.getProfile(token, signal);
      setProfile(data);
      if (data) {
        setFormData({
          name: data.name || user?.displayName || "",
          bio: data.bio || "",
          followersCount: data.followersCount || 0,
          location: data.location || "",
          platforms: data.platforms?.join(", ") || "",
          tags: data.tags?.join(", ") || "",
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
        platforms: formData.platforms.split(",").map(s => s.trim()).filter(Boolean),
        tags: formData.tags.split(",").map(s => s.trim()).filter(Boolean),
      };

      const updatedProfile = await influencerService.updateProfile(submitData, token);
      setProfile(updatedProfile);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <DashboardPage>
        <LoadingState label="Loading your profile..." />
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
                <label className="text-sm font-medium text-white">Platforms (comma separated)</label>
                <input
                  type="text"
                  name="platforms"
                  value={formData.platforms}
                  onChange={handleChange}
                  className="ih-input bg-black/40 w-full"
                  placeholder="e.g. Instagram, TikTok, YouTube"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Niche Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="ih-input bg-black/40 w-full"
                  placeholder="e.g. Tech, Lifestyle, Beauty"
                />
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
            <div className="flex justify-end">
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
