import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Plus } from "lucide-react";
import {
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  ErrorState,
} from "../../Components/AdminShared";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { useAuth } from "../../hooks/useAuth";
import { createCampaign } from "../../services/api/brandService";

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
  platforms: Yup.array().of(Yup.string()).min(1, "Select at least one platform").required("Platform is required"),
  location: Yup.string().required("Location is required"),
  tags: Yup.string().required("Tags are required (comma separated)"),
});

const CreateCampaign = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState("");
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      budget: "",
      deadline: "",
      platforms: [],
      location: "",
      tags: "",
    },
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
          platforms: values.platforms,
          location: values.location,
          tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
          budgetType: 0,
        };

        await createCampaign(token, payload);
        navigate("/dashboard/brand/campaigns");
      } catch (err) {
        setGlobalError(err.message || "Failed to create campaign. Please try again.");
      } finally {
        setIsSubmittingForm(false);
      }
    },
  });

  return (
    <AdminPage>
      <AdminPanel>
        <AdminPanelHeader
          kicker="Campaign launch"
          title="Create a new campaign"
          description="Define budget, creative guardrails, and matching tags so the right influencers can apply with confidence."
          actions={(
            <TransitionLink
              to="/dashboard/brand"
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

        <form onSubmit={formik.handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-1">
            <label htmlFor="title" className="block text-sm font-medium text-white">Campaign Title</label>
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
            <label htmlFor="description" className="block text-sm font-medium text-white">Description</label>
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
              <label htmlFor="budget" className="block text-sm font-medium text-white">Budget ($)</label>
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
              <label htmlFor="deadline" className="block text-sm font-medium text-white">Deadline</label>
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

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white">Platforms</label>
              <div className="flex flex-wrap gap-3 pt-1">
                {["Instagram", "TikTok", "YouTube", "Twitter", "LinkedIn"].map((p) => {
                  const checked = formik.values.platforms.includes(p);
                  return (
                    <label key={p} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="accent-indigo-500"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? formik.values.platforms.filter((v) => v !== p)
                            : [...formik.values.platforms, p];
                          formik.setFieldValue("platforms", next);
                        }}
                      />
                      <span className="text-sm text-slate-300">{p}</span>
                    </label>
                  );
                })}
              </div>
              {formik.touched.platforms && formik.errors.platforms ? (
                <p className="text-sm text-red-500">{formik.errors.platforms}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label htmlFor="location" className="block text-sm font-medium text-white">Location / Region</label>
              <input
                id="location"
                name="location"
                type="text"
                className="ih-input w-full"
                placeholder="e.g., Global, US, London"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.location}
              />
              {formik.touched.location && formik.errors.location ? (
                <p className="text-sm text-red-500">{formik.errors.location}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="tags" className="block text-sm font-medium text-white">Tags (Comma Separated)</label>
            <input
              id="tags"
              name="tags"
              type="text"
              className="ih-input w-full"
              placeholder="e.g., Tech, Fashion, Lifestyle"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.tags}
            />
            {formik.touched.tags && formik.errors.tags ? (
              <p className="text-sm text-red-500">{formik.errors.tags}</p>
            ) : null}
            <p className="text-xs text-slate-400 mt-1">Helps match campaigns with the right influencers.</p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={isSubmittingForm}
              className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingForm ? "Publishing..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </AdminPanel>
    </AdminPage>
  );
};

export default CreateCampaign;
