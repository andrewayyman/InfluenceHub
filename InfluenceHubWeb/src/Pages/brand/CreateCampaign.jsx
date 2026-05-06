import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  ErrorState,
  LoadingState,
} from "../../Components/AdminShared";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { useAuth } from "../../hooks/useAuth";
import {
  createCampaign,
  getBrandCampaign,
  updateCampaign,
} from "../../services/api/brandService";
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
import { BUDGET_TYPE_OPTIONS, EGYPT_CITIES, PLATFORM_OPTIONS } from "../../utils/catalog";

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

const validationSchema = Yup.object({
  title: Yup.string().required("Campaign title is required"),
  description: Yup.string().required("A brief description is required"),
  budget: Yup.number()
    .typeError("Budget must be a number")
    .positive("Budget must be greater than zero")
    .required("Budget is required"),
  deadline: Yup.date()
    .min(new Date(), "Deadline cannot be in the past")
    .required("Deadline is required"),
  budgetType: Yup.number().oneOf([0, 1, 2, 3]).required("Budget type is required"),
  platforms: Yup.array().of(Yup.string()).min(1, "Select at least one platform").required("Platform is required"),
  location: Yup.string().required("Location is required"),
  tags: Yup.array().of(Yup.string()).min(1, "Select at least one tag").required("Tags are required"),
});

const EMPTY_VALUES = {
  title: "",
  description: "",
  budget: "",
  deadline: "",
  budgetType: 0,
  platforms: [],
  location: "",
  tags: [],
};

const formatCampaignForForm = (campaign) => ({
  title: campaign?.title || "",
  description: campaign?.description || "",
  budget: campaign?.budget ?? "",
  deadline: campaign?.deadline ? new Date(campaign.deadline).toISOString().slice(0, 10) : "",
  budgetType: Number(campaign?.budgetType ?? 0),
  platforms: campaign?.platforms || [],
  location: campaign?.location || "",
  tags: campaign?.tags || [],
});

const CreateCampaign = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const isEditMode = Boolean(campaignId);
  const [globalError, setGlobalError] = useState("");
  const [tagsError, setTagsError] = useState("");
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [availableTags, setAvailableTags] = useState([]);

  const tagNames = useMemo(
    () => availableTags.map((tag) => tag.name).filter(Boolean),
    [availableTags],
  );

  const formik = useFormik({
    initialValues: EMPTY_VALUES,
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmittingForm(true);
      setGlobalError("");

      try {
        const payload = {
          title: values.title,
          description: values.description,
          budget: Number(values.budget),
          deadline: new Date(values.deadline).toISOString(),
          budgetType: Number(values.budgetType),
          platforms: values.platforms,
          location: values.location,
          tags: values.tags,
        };

        if (isEditMode) {
          await updateCampaign(token, campaignId, payload);
        } else {
          await createCampaign(token, payload);
        }

        navigate("/dashboard/brand/campaigns");
      } catch (err) {
        setGlobalError(err.message || `Failed to ${isEditMode ? "update" : "create"} campaign. Please try again.`);
      } finally {
        setIsSubmittingForm(false);
      }
    },
  });

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const controller = new AbortController();

    const loadData = async () => {
      setIsLoading(isEditMode);
      setGlobalError("");
      setTagsError("");

      try {
        const [tags, campaign] = await Promise.all([
          getTags(token, controller.signal),
          isEditMode ? getBrandCampaign(token, campaignId, controller.signal) : Promise.resolve(null),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        setAvailableTags(tags || []);

        if (campaign) {
          formik.setValues(formatCampaignForForm(campaign));
        } else if (!isEditMode) {
          formik.setValues(EMPTY_VALUES);
        }
      } catch (err) {
        if (isAbortError(err) || controller.signal.aborted) {
          return;
        }

        if (isEditMode) {
          setGlobalError(err.message || "Failed to load campaign details.");
        } else {
          setTagsError(err.message || "Failed to load tags.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => controller.abort();
  }, [token, isEditMode, campaignId]);

  if (isLoading) {
    return (
      <AdminPage>
        <LoadingState label={isEditMode ? "Loading campaign details..." : "Loading campaign form..."} />
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPanel>
        <AdminPanelHeader
          kicker={isEditMode ? "Campaign update" : "Campaign launch"}
          title={isEditMode ? "Edit campaign" : "Create a new campaign"}
          description={isEditMode
            ? "Update an open campaign while keeping matching tags and targeting aligned with your current brief."
            : "Define budget, creative guardrails, and matching tags so the right influencers can apply with confidence."}
          actions={(
            <TransitionLink
              to="/dashboard/brand/campaigns"
              className="ih-button-secondary ih-focus-ring inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              Cancel
            </TransitionLink>
          )}
        />

        {globalError && (
          <div className="mb-6">
            <ErrorState message={globalError} />
          </div>
        )}

        {tagsError ? (
          <div className="mb-6">
            <ErrorState message={tagsError} />
          </div>
        ) : null}

        <form onSubmit={formik.handleSubmit} className="max-w-2xl space-y-6">
          <div className="space-y-1">
            <label htmlFor="title" className="block text-sm font-medium ih-text-primary">Campaign Title</label>
            <input
              id="title"
              name="title"
              type="text"
              className="ih-input w-full"
              placeholder="e.g., Summer Getaway Launch"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.title}
            />
            {formik.touched.title && formik.errors.title ? (
              <p className="text-sm text-red-500">{formik.errors.title}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium ih-text-primary">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="ih-input w-full"
              placeholder="Detail what you expect from the influencer..."
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
            />
            {formik.touched.description && formik.errors.description ? (
              <p className="text-sm text-red-500">{formik.errors.description}</p>
            ) : null}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="budget" className="block text-sm font-medium ih-text-primary">Budget ($)</label>
              <input
                id="budget"
                name="budget"
                type="number"
                min="0"
                step="0.01"
                className="ih-input w-full"
                placeholder="0.00"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.budget}
              />
              {formik.touched.budget && formik.errors.budget ? (
                <p className="text-sm text-red-500">{formik.errors.budget}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label htmlFor="deadline" className="block text-sm font-medium ih-text-primary">Deadline</label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                className="ih-input w-full"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.deadline}
              />
              {formik.touched.deadline && formik.errors.deadline ? (
                <p className="text-sm text-red-500">{formik.errors.deadline}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium ih-text-primary">Budget Type</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BUDGET_TYPE_OPTIONS.map((option) => {
                const active = Number(formik.values.budgetType) === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => formik.setFieldValue("budgetType", option.value)}
                    className={[
                      "flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all duration-150 focus:outline-none",
                      active
                        ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/40"
                        : "border-slate-200 bg-slate-50 hover:border-slate-900/25 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    <span className={["text-sm font-semibold", active ? "text-indigo-300" : "ih-text-primary"].join(" ")}>
                      {option.label}
                    </span>
                    <span className={["text-xs leading-tight", active ? "text-indigo-600/80" : "text-slate-500"].join(" ")}>
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
            {formik.touched.budgetType && formik.errors.budgetType ? (
              <p className="text-sm text-red-500">{formik.errors.budgetType}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium ih-text-primary">Platforms</label>
            <div className="flex flex-wrap gap-3">
              {PLATFORM_OPTIONS.map((platform) => {
                const selected = formik.values.platforms.includes(platform);
                const Icon = PLATFORM_ICONS[platform];
                const brandColor = PLATFORM_COLORS[platform];
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? formik.values.platforms.filter((p) => p !== platform)
                        : [...formik.values.platforms, platform];
                      formik.setFieldValue("platforms", next);
                    }}
                    className={[
                      "flex w-[86px] flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 transition-all duration-150 focus:outline-none",
                      selected
                        ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                        : "border-slate-200 bg-slate-50 hover:border-slate-900/25 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    {Icon && (
                      <Icon
                        size={22}
                        style={{ color: selected ? brandColor : undefined }}
                        className={selected ? "" : "ih-text-muted"}
                      />
                    )}
                    <span className={["text-xs font-medium leading-tight text-center", selected ? "ih-text-primary" : "ih-text-muted"].join(" ")}>
                      {platform}
                    </span>
                  </button>
                );
              })}
            </div>
            {formik.touched.platforms && formik.errors.platforms ? (
              <p className="text-sm text-red-500">{formik.errors.platforms}</p>
            ) : null}
          </div>

          <div className="max-w-xs space-y-1">
            <label htmlFor="location" className="block text-sm font-medium ih-text-primary">Location / Region</label>
            <select
              id="location"
              name="location"
              className="ih-input w-full bg-[#1E293B] ih-text-primary"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.location}
            >
              <option value="" disabled className="bg-[#1E293B]">Select a city…</option>
              {EGYPT_CITIES.map((city) => (
                <option key={city} value={city} className="bg-[#1E293B]">{city}</option>
              ))}
            </select>
            {formik.touched.location && formik.errors.location ? (
              <p className="text-sm text-red-500">{formik.errors.location}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium ih-text-primary">Tags</label>
            <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-black/20 p-3">
              {tagNames.map((tag) => {
                const checked = formik.values.tags.includes(tag);
                return (
                  <label key={tag} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs ih-text-secondary hover:border-slate-900/30">
                    <input
                      type="checkbox"
                      className="accent-indigo-500"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? formik.values.tags.filter((value) => value !== tag)
                          : [...formik.values.tags, tag];
                        formik.setFieldValue("tags", next);
                      }}
                    />
                    {tag}
                  </label>
                );
              })}
              {tagNames.length === 0 ? (
                <p className="text-sm ih-text-muted">No tags are available yet. Ask an admin to seed or create tags first.</p>
              ) : null}
            </div>
            {formik.touched.tags && formik.errors.tags ? (
              <p className="text-sm text-red-500">{formik.errors.tags}</p>
            ) : null}
            <p className="mt-1 text-xs ih-text-muted">Choose the most relevant niche tags for matching.</p>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <button
              type="submit"
              disabled={isSubmittingForm}
              className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmittingForm
                ? isEditMode ? "Saving..." : "Publishing..."
                : isEditMode ? "Save Changes" : "Create Campaign"}
            </button>
          </div>
        </form>
      </AdminPanel>
    </AdminPage>
  );
};

export default CreateCampaign;
