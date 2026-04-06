import React, { useEffect, useState } from "react";
import { UploadCloud } from "lucide-react";
import {
  AdminPage as DashboardPage,
  AdminPanel as Panel,
  AdminPanelHeader as PanelHeader,
  ErrorState,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { influencerService } from "../../services/api/influencerService";

const SubmitReport = () => {
  const { token } = useAuth();
  const [activeApps, setActiveApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  
  const [formData, setFormData] = useState({
    applicationId: "",
    postUrl: "",
    postingDate: "",
    startDate: "",
    endDate: "",
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
  });
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

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      data.append("screenshot", screenshot);

      await influencerService.submitReport(data, token);
      
      setSuccess("Your campaign report has been submitted successfully!");
      setFormData({
        ...formData,
        postUrl: "",
        postingDate: "",
        startDate: "",
        endDate: "",
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      });
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

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white">Post URL</label>
              <input
                type="url"
                name="postUrl"
                value={formData.postUrl}
                onChange={handleInputChange}
                placeholder="https://instagram.com/p/..."
                className="ih-input bg-black/40 w-full"
                required
              />
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Views</label>
              <input
                type="number"
                name="views"
                min="0"
                value={formData.views}
                onChange={handleInputChange}
                className="ih-input bg-black/40 w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Likes</label>
              <input
                type="number"
                name="likes"
                min="0"
                value={formData.likes}
                onChange={handleInputChange}
                className="ih-input bg-black/40 w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Comments</label>
              <input
                type="number"
                name="comments"
                min="0"
                value={formData.comments}
                onChange={handleInputChange}
                className="ih-input bg-black/40 w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Shares</label>
              <input
                type="number"
                name="shares"
                min="0"
                value={formData.shares}
                onChange={handleInputChange}
                className="ih-input bg-black/40 w-full"
                required
              />
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
