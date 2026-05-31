import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Send } from "lucide-react";
import {
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  ErrorState,
  LoadingState,
} from "./AdminShared";
import { useAuth } from "../hooks/useAuth";
import { getBrandProfile } from "../services/api/brandService";
import { isAbortError } from "../services/api/client";
import { createContactMessage } from "../services/api/contactService";
import { influencerService } from "../services/api/influencerService";

const ContactSupportSchema = Yup.object({
  name: Yup.string().trim().min(2, "Enter a valid name.").max(256, "Keep the name under 256 characters.").required("Name is required."),
  email: Yup.string().trim().email("Enter a valid email address.").max(256, "Keep the email under 256 characters.").required("Email is required."),
  subject: Yup.string().trim().min(4, "Add a short subject.").max(500, "Keep the subject under 500 characters.").required("Subject is required."),
  message: Yup.string().trim().min(20, "Add a bit more detail.").max(4000, "Keep the message under 4000 characters.").required("Message is required."),
});

const PAGE_COPY = {
  brand: {
    description: "Ask for help with campaigns, payments, or account issues.",
    messagePlaceholder: "Describe the issue, include the campaign name if relevant, and say what you need from the admin team.",
  },
  influencer: {
    description: "Ask for help with payouts, profile issues, or campaign questions.",
    messagePlaceholder: "Describe the issue, include the campaign name if relevant, and say what you need from the admin team.",
  },
};

const getFieldClassName = (hasError) => `ih-input ih-focus-ring w-full rounded-[1rem] px-4 py-3 text-sm ${hasError ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`;

const ContactSupportWorkspace = () => {
  const { token, user } = useAuth();
  const [defaults, setDefaults] = useState({ name: "", email: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState("");
  const role = user?.role === "influencer" ? "influencer" : "brand";
  const copy = PAGE_COPY[role];

  const initialValues = useMemo(() => ({
    name: defaults.name,
    email: defaults.email,
    subject: "",
    message: "",
  }), [defaults.email, defaults.name]);

  const loadProfile = useCallback(async (signal) => {
    if (!token) {
      setDefaults({ name: "", email: user?.email || "" });
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    setLoadError("");

    try {
      const profile = role === "brand"
        ? await getBrandProfile(token, signal)
        : await influencerService.getProfile(token, signal);

      if (signal?.aborted) {
        return;
      }

      const fallbackName = user?.displayName && !user.displayName.includes("@")
        ? user.displayName
        : "";

      setDefaults({
        name: profile?.name?.trim() || fallbackName,
        email: user?.email || "",
      });
    } catch (requestError) {
      if (isAbortError(requestError) || signal?.aborted) {
        return;
      }

      setLoadError(requestError.message || "Your account details could not be loaded.");
      setDefaults({
        name: "",
        email: user?.email || "",
      });
    } finally {
      if (!signal?.aborted) {
        setLoadingProfile(false);
      }
    }
  }, [role, token, user?.displayName, user?.email]);

  useEffect(() => {
    const controller = new AbortController();

    loadProfile(controller.signal);

    return () => controller.abort();
  }, [loadProfile]);

  if (loadingProfile) {
    return (
      <AdminPage>
        <LoadingState label="Preparing contact form..." />
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <div className="mx-auto w-full max-w-3xl">
        {loadError ? <ErrorState message={loadError} onRetry={() => loadProfile()} /> : null}

        <AdminPanel tone="default" className="mt-0">
          <AdminPanelHeader
            title="Contact admin"
            description={copy.description}
          />

          <p className="mb-6 text-sm ih-text-muted">Messages from this form go directly to the admin inbox.</p>

          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={ContactSupportSchema}
            onSubmit={async (values, { resetForm, setStatus, setSubmitting }) => {
              setStatus(null);

              try {
                await createContactMessage({
                  name: values.name.trim(),
                  email: values.email.trim(),
                  subject: values.subject.trim(),
                  message: values.message.trim(),
                }, { token });

                resetForm();
                setStatus({
                  tone: "success",
                  message: "Message sent to the admin team.",
                });
              } catch (requestError) {
                setStatus({
                  tone: "error",
                  message: requestError.message || "The message could not be sent right now.",
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ errors, isSubmitting, status, touched }) => (
              <Form className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-2 block text-sm font-medium ih-text-primary">Name</label>
                    <Field id="contact-name" name="name" type="text" maxLength="256" className={getFieldClassName(Boolean(touched.name && errors.name))} />
                    {touched.name && errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="mb-2 block text-sm font-medium ih-text-primary">Reply email</label>
                    <Field id="contact-email" name="email" type="email" maxLength="256" className={getFieldClassName(Boolean(touched.email && errors.email))} />
                    {touched.email && errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email}</p> : null}
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="mb-2 block text-sm font-medium ih-text-primary">Subject</label>
                  <Field id="contact-subject" name="subject" type="text" maxLength="500" placeholder="What do you need help with?" className={getFieldClassName(Boolean(touched.subject && errors.subject))} />
                  {touched.subject && errors.subject ? <p className="mt-2 text-sm text-red-600">{errors.subject}</p> : null}
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-2 block text-sm font-medium ih-text-primary">Message</label>
                  <Field id="contact-message" name="message" as="textarea" rows="7" maxLength="4000" placeholder={copy.messagePlaceholder} className={getFieldClassName(Boolean(touched.message && errors.message))} />
                  {touched.message && errors.message ? <p className="mt-2 text-sm text-red-600">{errors.message}</p> : null}
                </div>

                {status ? (
                  <div className={`rounded-[1rem] border px-4 py-3 text-sm ${status.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`} role={status.tone === "success" ? "status" : "alert"}>
                    {status.message}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm ih-text-muted">Use a different reply email above if needed.</p>
                  <button type="submit" disabled={isSubmitting} className="ih-button-primary ih-focus-ring inline-flex items-center justify-center gap-2 px-5 py-3 text-sm disabled:opacity-60">
                    {isSubmitting ? "Sending..." : "Send message"}
                    <Send size={16} aria-hidden="true" />
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </AdminPanel>
      </div>
    </AdminPage>
  );
};

export default ContactSupportWorkspace;
