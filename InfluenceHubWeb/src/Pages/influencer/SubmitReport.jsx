import React, { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, UploadCloud, CheckCircle, AlertCircle, Calendar, Info } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  AdminPage as DashboardPage,
  AdminPanel as Panel,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { influencerService } from "../../services/api/influencerService";
import { PLATFORM_OPTIONS } from "../../utils/catalog";

// Only campaigns with this campaign status can be submitted against
const SUBMITTABLE_STATUSES = ["InfluencerSelected"];

const getDaysLeft = (deadline) => {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const SubmitReport = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Support both ?appId=<applicationId> and legacy ?campaignId=
  const preSelectedAppId = searchParams.get("appId");

  const [submittableApps, setSubmittableApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    applicationId: preSelectedAppId || "",
    postingDate: today,
    startDate: lastWeek,
    endDate: today,
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
        if (!active) return;

        // Only show apps that are Accepted AND campaign is still in InfluencerSelected phase
        const eligible = (apps || []).filter(app =>
          app.status === "Accepted" &&
          SUBMITTABLE_STATUSES.includes(app.campaignStatus)
        );
        setSubmittableApps(eligible);

        if (eligible.length > 0 && !preSelectedAppId) {
          setFormData(prev => ({ ...prev, applicationId: eligible[0].id }));
        } else if (preSelectedAppId && eligible.some(a => a.id === preSelectedAppId)) {
          setFormData(prev => ({ ...prev, applicationId: preSelectedAppId }));
        } else if (preSelectedAppId && eligible.length > 0) {
          // Fallback: preSelectedAppId not in eligible list, pick first
          setFormData(prev => ({ ...prev, applicationId: eligible[0].id }));
        }
      } catch (err) {
        setError("Could not load your active campaigns. Please try again.");
      } finally {
        if (active) setLoadingApps(false);
      }
    };

    if (token) fetchApps();
    return () => { active = false; };
  }, [token, preSelectedAppId]);

  const selectedApp = useMemo(() =>
    submittableApps.find(a => a.id === formData.applicationId) || null,
    [formData.applicationId, submittableApps]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setScreenshot(e.target.files[0]);
  };

  const updatePlatformInsight = (index, field, value) => {
    setPlatformInsights(prev => prev.map((row, i) =>
      i === index
        ? { ...row, [field]: ["views", "likes", "comments", "shares"].includes(field) ? Number(value) : value }
        : row
    ));
  };

  const addPlatformInsightRow = () =>
    setPlatformInsights(prev => [...prev, { platform: "Instagram", postUrl: "", views: 0, likes: 0, comments: 0, shares: 0 }]);

  const removePlatformInsightRow = (index) =>
    setPlatformInsights(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.applicationId) {
      setError("Please select a campaign.");
      return;
    }
    if (!screenshot) {
      setError("A screenshot of your post metrics is required as proof of delivery.");
      return;
    }
    if (platformInsights.length === 0) {
      setError("Please add at least one platform insight row.");
      return;
    }
    for (const insight of platformInsights) {
      if (!insight.platform) { setError("Platform is required for each insight row."); return; }
      if (insight.views < 0 || insight.likes < 0 || insight.comments < 0 || insight.shares < 0) {
        setError("Metric values cannot be negative."); return;
      }
    }
    if (formData.startDate > formData.endDate) {
      setError("Metrics start date must be before end date."); return;
    }

    setIsSubmitting(true);
    setSuccess("");

    try {
      const data = new FormData();
      // PascalCase keys for ASP.NET [FromForm] binder
      data.append("ApplicationId", formData.applicationId);
      data.append("PostingDate", formData.postingDate);
      data.append("StartDate", formData.startDate);
      data.append("EndDate", formData.endDate);

      const pascalInsights = platformInsights.map(row => ({
        Platform: row.platform,
        PostUrl: row.postUrl || null,
        Views: Number(row.views),
        Likes: Number(row.likes),
        Comments: Number(row.comments),
        Shares: Number(row.shares),
      }));
      data.append("PlatformInsightsJson", JSON.stringify(pascalInsights));
      data.append("Screenshot", screenshot);

      await influencerService.submitReport(data, token);

      setSuccess("Report submitted successfully! Redirecting to Campaign Insights...");
      setPlatformInsights([{ platform: "Instagram", postUrl: "", views: 0, likes: 0, comments: 0, shares: 0 }]);
      setScreenshot(null);
      setTimeout(() => navigate("/dashboard/influencer/insights"), 2000);
    } catch (err) {
      setError(err.message || "Failed to submit report. Please check your data and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormReady = formData.applicationId && screenshot && platformInsights.length > 0 && !isSubmitting;

  return (
    <DashboardPage>
      <div className="mb-6">
        <h1 className="text-2xl font-bold ih-text-primary tracking-tight mb-2">Submit Report</h1>
        <p className="ih-text-muted text-sm max-w-xl">Provide final engagement metrics and proof of delivery so brands can approve your work.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Main Form */}
        <div className="lg:col-span-2">
          <Panel tone="brand">
            <form onSubmit={handleSubmit} className="space-y-8">

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3 text-red-400 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 flex items-center gap-3 text-emerald-600 text-sm">
                  <CheckCircle size={18} className="shrink-0" />
                  <p>{success}</p>
                </div>
              )}

              {/* Step 1 */}
              <section className="space-y-4">
                <h3 className="text-xs font-semibold ih-text-muted uppercase tracking-widest">Step 1 â€” Campaign & Dates</h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium ih-text-primary">Select Campaign</label>
                  {loadingApps ? (
                    <div className="h-12 w-full animate-pulse rounded-xl bg-slate-50" />
                  ) : submittableApps.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-900/20 bg-slate-50 p-4 text-center text-sm ih-text-muted">
                      You have no active campaigns eligible for report submission.
                    </div>
                  ) : (
                    <select
                      name="applicationId"
                      value={formData.applicationId}
                      onChange={handleInputChange}
                      className="ih-input bg-white w-full text-sm"
                      required
                    >
                      <option value="" disabled>â€” Choose a campaign â€”</option>
                      {submittableApps.map(app => {
                        const daysLeft = getDaysLeft(app.campaignDeadline);
                        const deadlinePart = daysLeft !== null
                          ? (daysLeft === 0 ? " آ· Due Today!" : ` آ· Due in ${daysLeft}d`)
                          : "";
                        const brandPart = app.brandName ? ` â€” ${app.brandName}` : "";
                        return (
                          <option key={app.id} value={app.id}>
                            {app.campaignTitle}{brandPart}{deadlinePart}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { name: "postingDate", label: "Posting Date" },
                    { name: "startDate", label: "Metrics Start" },
                    { name: "endDate", label: "Metrics End" },
                  ].map(({ name, label }) => (
                    <div key={name} className="space-y-2">
                      <label className="text-sm font-medium ih-text-primary">{label}</label>
                      <input
                        type="date"
                        name={name}
                        value={formData[name]}
                        onChange={handleInputChange}
                        className="ih-input bg-white w-full"
                        required
                      />
                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-slate-200" />

              {/* Step 2 */}
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-semibold ih-text-muted uppercase tracking-widest">Step 2 â€” Performance Metrics</h3>
                    <p className="text-xs text-slate-500 mt-1">Provide accurate engagement numbers per platform.</p>
                  </div>
                  <button type="button" onClick={addPlatformInsightRow} className="ih-button-secondary inline-flex items-center gap-2 px-3 py-1.5 text-xs">
                    <Plus size={14} /> Add Platform
                  </button>
                </div>

                <div className="space-y-4">
                  {platformInsights.map((row, index) => (
                    <div key={`platform-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />

                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-[200px]">
                          <label className="text-xs ih-text-muted block mb-1">Platform</label>
                          <select
                            className="ih-input bg-white w-full text-sm py-1.5"
                            value={row.platform}
                            onChange={(e) => updatePlatformInsight(index, "platform", e.target.value)}
                          >
                            {PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        {platformInsights.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePlatformInsightRow(index)}
                            className="ih-text-muted hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors mt-4"
                            title="Remove platform"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs ih-text-muted block mb-1">Content Link / Post URL <span className="opacity-50">(Optional)</span></label>
                          <input
                            type="url"
                            value={row.postUrl}
                            onChange={(e) => updatePlatformInsight(index, "postUrl", e.target.value)}
                            placeholder="https://instagram.com/p/..."
                            className="ih-input bg-white w-full text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-900/5">
                          {[
                            { key: "views", label: "Views" },
                            { key: "likes", label: "Likes" },
                            { key: "comments", label: "Comments" },
                            { key: "shares", label: "Shares" },
                          ].map(metric => (
                            <div key={metric.key}>
                              <label className="text-xs ih-text-muted block mb-1">{metric.label}</label>
                              <input
                                type="number"
                                min="0"
                                value={row[metric.key]}
                                onChange={(e) => updatePlatformInsight(index, metric.key, e.target.value)}
                                className="ih-input bg-white w-full text-sm font-mono text-center"
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-slate-200" />

              {/* Step 3 */}
              <section className="space-y-4">
                <h3 className="text-xs font-semibold ih-text-muted uppercase tracking-widest">Step 3 â€” Proof of Delivery</h3>

                <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 px-6 py-10 transition-colors hover:bg-indigo-500/10 cursor-pointer">
                  <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-sm font-semibold ih-text-primary text-center">
                    {screenshot ? screenshot.name : "Click to upload screenshot"}
                  </p>
                  <p className="ih-text-muted mt-2 text-xs text-center max-w-sm">
                    Upload an image showing your analytics dashboard or the final published post.
                  </p>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  />
                  {screenshot && (
                    <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle size={12} /> Image attached
                    </div>
                  )}
                </div>
              </section>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormReady || submittableApps.length === 0}
                  className="ih-button-primary w-full justify-center px-4 py-3.5 text-base shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting securely..." : "Submit Campaign Report"}
                </button>
                {!screenshot && !isSubmitting && (
                  <p className="text-center text-xs text-slate-500 mt-2">A screenshot is required before you can submit.</p>
                )}
              </div>
            </form>
          </Panel>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="ih-surface rounded-[1.5rem] p-6 border border-slate-200 sticky top-6">
            <h3 className="text-lg font-semibold ih-text-primary mb-4 flex items-center gap-2">
              <Info size={18} className="text-brand-600" /> Campaign Details
            </h3>

            {!selectedApp ? (
              <p className="text-sm ih-text-muted italic">Select a campaign to see its details here.</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Campaign</p>
                  <p className="text-sm font-semibold ih-text-primary">{selectedApp.campaignTitle}</p>
                </div>

                {selectedApp.brandName && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Brand</p>
                    <p className="text-sm ih-text-secondary">{selectedApp.brandName}</p>
                  </div>
                )}

                {selectedApp.campaignDeadline && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Deadline</p>
                    <p className="text-sm font-medium ih-text-primary flex items-center gap-2">
                      <Calendar size={14} className="ih-text-muted" />
                      {new Date(selectedApp.campaignDeadline).toLocaleDateString()}
                      {(() => {
                        const d = getDaysLeft(selectedApp.campaignDeadline);
                        if (d === null) return null;
                        return (
                          <span className={`text-xs ${d <= 3 ? "text-amber-600" : "ih-text-muted"}`}>
                            ({d === 0 ? "Today!" : `${d}d left`})
                          </span>
                        );
                      })()}
                    </p>
                  </div>
                )}

                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mt-4">
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Reminder</h4>
                  <p className="text-xs text-amber-200/70 leading-relaxed">
                    Ensure your screenshot clearly shows the post URL and all key metrics. Inaccurate reports may affect your standing on the platform.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardPage>
  );
};

export default SubmitReport;

