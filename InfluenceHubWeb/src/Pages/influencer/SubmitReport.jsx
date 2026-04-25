import React, { useEffect, useState } from "react";
import { Plus, Trash2, UploadCloud } from "lucide-react";
import {
  AdminPage as DashboardPage,
  AdminPanel as Panel,
  AdminPanelHeader as PanelHeader,
  ErrorState,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { influencerService } from "../../services/api/influencerService";
import { PLATFORM_OPTIONS } from "../../utils/catalog";

const SubmitReport = () => {
  const { token } = useAuth();
  const [activeApps, setActiveApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  
  const [formData, setFormData] = useState({
    applicationId: "",
    postingDate: "",
    startDate: "",
    endDate: "",
  });
  const [platformInsights, setPlatformInsights] = useState([
    { platform: "Instagram", postUrl: "", views: 0, likes: 0, comments: 0, shares: 0 },
  ]);
  const [screenshot, setScreenshot] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    const fetchApps = async () => {
      try {
        const apps = await influencerService.getMyApplications(token);
        if (active) {
          const accepted = apps.filter(a => a.status === "Accepted");
          setActiveApps(accepted);
          if (accepted.length > 0) {
            setFormData(prev => ({ ...prev, applicationId: accepted[0].id }));
          }
        }
      } catch (err) {
        if (active) setError("Could not load your active campaigns.");
      } finally {
        if (active) setLoadingApps(false);
      }
    };
    
    if (token) fetchApps();
    return () => { active = false; };
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const updatePlatformInsight = (index, field, value) => {
    setPlatformInsights((prev) => prev.map((row, i) => (
      i === index
        ? { ...row, [field]: ["views", "likes", "comments", "shares"].includes(field) ? Number(value) : value }
        : row
    )));
  };

  const addPlatformInsightRow = () => {
    setPlatformInsights((prev) => ([
      ...prev,
      { platform: "Instagram", postUrl: "", views: 0, likes: 0, comments: 0, shares: 0 },
    ]));
  };

  const removePlatformInsightRow = (index) => {
    setPlatformInsights((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      setError("Please provide a screenshot to verify your post metrics.");
      return;
    }
    if (!formData.applicationId) {
      setError("Please select an active campaign application.");
      return;
    }
    if (platformInsights.length === 0) {
      setError("Please add at least one platform insight row.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      data.append("platformInsightsJson", JSON.stringify(platformInsights));
      data.append("screenshot", screenshot);

      await influencerService.submitReport(data, token);
      
      setSuccess("Your campaign report has been submitted successfully!");
      setFormData({
        ...formData,
        postingDate: "",
        startDate: "",
        endDate: "",
      });
      setPlatformInsights([{ platform: "Instagram", postUrl: "", views: 0, likes: 0, comments: 0, shares: 0 }]);
      setScreenshot(null);
    } catch (err) {
      setError(err.message || "Failed to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPage>
      <Panel tone="brand">
        <PanelHeader
          kicker="Delivery"
          title="Submit Campaign Report"
          description="Provide final metrics and proof of work so brands can review and close the campaign."
        />

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {success && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
              {success}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white">Select Campaign</label>
              {loadingApps ? (
                <p className="ih-text-muted text-sm">Loading campaigns...</p>
              ) : (
                <select
                  name="applicationId"
                  value={formData.applicationId}
                  onChange={handleInputChange}
                  className="ih-input bg-black/40 w-full"
                  required
                >
                  <option value="" disabled>-- Choose an active campaign --</option>
                  {activeApps.map(app => (
                    <option key={app.id} value={app.id}>{app.campaignTitle} (ID: {app.id.substring(0,8)})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Posting Date</label>
              <input
                type="date"
                name="postingDate"
                value={formData.postingDate}
                onChange={handleInputChange}
                className="ih-input bg-black/40 w-full"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="ih-input bg-black/40 w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="ih-input bg-black/40 w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Per Platform Insights</label>
                <button type="button" onClick={addPlatformInsightRow} className="ih-button-secondary inline-flex items-center gap-2 px-3 py-1.5 text-xs">
                  <Plus size={14} /> Add platform
                </button>
              </div>
              <div className="space-y-3">
                {platformInsights.map((row, index) => (
                  <div key={`${row.platform}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <select
                        className="ih-input bg-black/40 w-full max-w-xs"
                        value={row.platform}
                        onChange={(e) => updatePlatformInsight(index, "platform", e.target.value)}
                      >
                        {PLATFORM_OPTIONS.map((platform) => (
                          <option key={platform} value={platform}>{platform}</option>
                        ))}
                      </select>
                      {platformInsights.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removePlatformInsightRow(index)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-300">Post URL (optional)</label>
                      <input
                        type="url"
                        value={row.postUrl}
                        onChange={(e) => updatePlatformInsight(index, "postUrl", e.target.value)}
                        placeholder="https://instagram.com/p/..."
                        className="ih-input bg-black/40 w-full"
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { key: "views", label: "Views" },
                        { key: "likes", label: "Likes" },
                        { key: "comments", label: "Comments" },
                        { key: "shares", label: "Shares" },
                      ].map((metric) => (
                        <div key={metric.key} className="space-y-2">
                          <label className="text-xs text-slate-300">{metric.label}</label>
                          <input
                            type="number"
                            min="0"
                            value={row[metric.key]}
                            onChange={(e) => updatePlatformInsight(index, metric.key, e.target.value)}
                            className="ih-input bg-black/40 w-full"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">Add one or more platform rows. You can skip post links if unavailable.</p>
            </div>

            <div className="space-y-2 md:col-span-2 mt-2">
              <label className="text-sm font-medium text-white">Proof of Metrics (Screenshot)</label>
              <div className="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 px-6 py-8 transition-colors hover:bg-white/10">
                <UploadCloud size={32} className="ih-text-subtle mb-3" />
                <p className="text-sm font-medium text-white text-center">
                  {screenshot ? screenshot.name : "Click to upload screenshot"}
                </p>
                <p className="ih-text-subtle mt-1 text-xs text-center">
                  Upload an image showing the post metrics
                </p>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting || loadingApps}
              className="ih-button-primary ih-focus-ring w-full justify-center px-4 py-3"
            >
              {isSubmitting ? "Submitting Report..." : "Submit Campaign Report"}
            </button>
          </div>
        </form>
      </Panel>
    </DashboardPage>
  );
};

export default SubmitReport;
