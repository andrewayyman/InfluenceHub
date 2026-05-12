import React from "react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { createContactMessage } from "../../services/api/contactService";

const BriefingSchema = Yup.object({
  name: Yup.string().trim().min(2, "Please enter your name").max(80, "Keep the name under 80 characters").required("Name is required"),
  email: Yup.string().trim().email("Enter a valid work email").required("Work email is required"),
});

const Subscription = () => {
  const handleSubmit = async (values, { resetForm, setStatus, setSubmitting }) => {
    setStatus(null);

    try {
      await createContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: "Monthly briefing request",
        message: "Please add this contact to the monthly InfluiX briefing follow-up list.",
      });

      resetForm();
      setStatus({
        tone: "success",
        message: "Request sent. The team will follow up by email with the monthly briefing.",
      });
    } catch (error) {
      setStatus({
        tone: "error",
        message: error.message || "The briefing request could not be sent right now.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="Subscription" className="ih-section-shell ih-section-tint-warm px-6 py-24" aria-labelledby="subscription-heading">
      <div className="mx-auto max-w-7xl">
        <div className="ih-panel-outline ih-briefing-panel ih-home-briefing-panel grid gap-10 rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,1.1fr)] lg:items-end lg:px-10">
          <div data-ih-reveal style={{ "--ih-delay": "100ms" }}>
            <p className="ih-kicker ih-kicker-warm mb-4">Monthly briefing</p>
            <h2 id="subscription-heading" className="max-w-xl text-3xl font-semibold tracking-[-0.04em] ih-text-primary sm:text-4xl lg:text-[2.75rem]">
              Request the monthly briefing.
            </h2>
            <p className="ih-text-muted mt-5 max-w-xl text-base leading-7 sm:text-lg">
              Get monthly updates sent directly to your inbox.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="ih-pill-tint ih-pill-warm">Monthly digest</span>
              <span className="ih-pill-tint ih-pill-brand">Platform updates</span>
              <span className="ih-pill-tint ih-pill-emerald">Campaign insights</span>
            </div>
          </div>

          <Formik
            initialValues={{ email: "", name: "" }}
            validationSchema={BriefingSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, isSubmitting, status, touched }) => (
              <Form className="space-y-4" data-ih-reveal style={{ "--ih-delay": "180ms" }}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="briefing-name" className="ih-label">
                      Name
                    </label>
                    <Field
                      id="briefing-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Full name"
                      aria-invalid={touched.name && errors.name ? "true" : "false"}
                      aria-describedby="briefing-name-error"
                      className={`ih-input ih-focus-ring rounded-xl px-5 py-4 ${touched.name && errors.name ? "ih-input-error" : ""}`}
                    />
                    {touched.name && errors.name ? (
                      <p id="briefing-name-error" className="ih-error-text" role="alert">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="subscription-email" className="ih-label">
                      Work email
                    </label>
                    <Field
                      id="subscription-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      aria-invalid={touched.email && errors.email ? "true" : "false"}
                      aria-describedby="subscription-email-help subscription-email-error"
                      className={`ih-input ih-focus-ring rounded-xl px-5 py-4 ${touched.email && errors.email ? "ih-input-error" : ""}`}
                    />
                    <p id="subscription-email-help" className="ih-helper-text">
                      We'll send updates to this email.
                    </p>
                    {touched.email && errors.email ? (
                      <p id="subscription-email-error" className="ih-error-text" role="alert">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                {status ? (
                  <p
                    className={status.tone === "success" ? "ih-helper-text" : "ih-error-text"}
                    role={status.tone === "success" ? "status" : "alert"}
                  >
                    {status.message}
                  </p>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="ih-text-subtle text-sm leading-6">
                    Stay updated with platform news and insights.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="ih-button-primary ih-focus-ring rounded-xl px-7 py-3.5 text-base font-semibold"
                  >
                    {isSubmitting ? "Sending request..." : "Request briefing"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </section>
  );
};

export default Subscription;
