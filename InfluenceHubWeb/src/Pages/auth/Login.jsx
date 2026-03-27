import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { navigateWithOverdrive } from "../../utils/overdrive";
import { getRoleDashboardPath } from "../../utils/auth";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password too short").required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (values, { setStatus, setSubmitting }) => {
    setStatus(null);

    try {
      const session = await login({
        email: values.email.trim(),
        password: values.password,
      });

      const fallbackTarget = getRoleDashboardPath(session.user.role);
      const requestedTarget = location.state?.from;
      const nextTarget = session.user.role === "admin" && requestedTarget
        ? requestedTarget
        : fallbackTarget;

      await navigateWithOverdrive(navigate, nextTarget);
    } catch (error) {
      setStatus(error.message || "Unable to sign in right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ih-auth-shell ih-page-shell ih-motion-stage relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden px-4 pb-10 pt-24 sm:px-6">
      <div aria-hidden="true" className="ih-auth-atmosphere pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="ih-auth-grid pointer-events-none absolute inset-0" />

        <div className="ih-auth-card relative w-full max-w-md rounded-[1.75rem] p-6 sm:p-8" data-ih-reveal style={{ "--ih-delay": "90ms" }}>
        <div className="inline-flex items-center gap-3">
          <span className="ih-brand-mark">IH</span>
          <div>
            <p className="ih-kicker">Secure access</p>
            <p className="ih-text-subtle mt-1 text-xs uppercase tracking-[0.18em]">
              Brands, influencers, and admins
            </p>
          </div>
        </div>

        <h2 className="mb-2 mt-6 text-3xl font-semibold text-white">
          Log in to InfluenceHub
        </h2>
        <p className="ih-text-muted mb-8 leading-7">
          Access campaigns, applications, reports, and admin tools from one account.
        </p>

        {location.state?.registered ? (
          <div className="ih-choice-chip-brand-active mb-6 rounded-2xl px-4 py-3 text-sm leading-6">
            Account created for <span className="font-semibold">{location.state.registered}</span>. Sign in to continue.
          </div>
        ) : null}

        <div className="ih-choice-chip mb-6 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm leading-6">
          <div className="ih-icon-chip ih-icon-chip-success mt-0.5 h-9 w-9 shrink-0 rounded-2xl">
            <ShieldCheck size={16} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Admin access seeded locally</p>
            <p className="ih-text-muted mt-1">Use <span className="font-medium text-white">admin@influencehub.com</span> with <span className="font-medium text-white">Admin@123</span>.</p>
          </div>
        </div>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, status, touched }) => {
            return (
              <Form className="space-y-4">

              <div>
                <label className="ih-label" htmlFor="login-email">
                  Email address
                </label>
                <Field
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  aria-invalid={touched.email && errors.email ? "true" : "false"}
                  aria-describedby="login-email-help login-email-error"
                  className={`ih-input ih-focus-ring ${
                    touched.email && errors.email ? "ih-input-error" : ""
                  }`}
                />
                <p id="login-email-help" className="ih-helper-text">
                  Use the email on your account.
                </p>
                {touched.email && errors.email ? (
                  <p id="login-email-error" className="ih-error-text" role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="ih-label" htmlFor="login-password">
                  Password
                </label>
                <Field
                  id="login-password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={touched.password && errors.password ? "true" : "false"}
                  aria-describedby="login-password-help login-password-error"
                  className={`ih-input ih-focus-ring ${
                    touched.password && errors.password ? "ih-input-error" : ""
                  }`}
                />
                <p id="login-password-help" className="ih-helper-text">
                  At least 6 characters.
                </p>
                {touched.password && errors.password ? (
                  <p id="login-password-error" className="ih-error-text" role="alert">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              <p className="ih-text-subtle text-sm leading-6">
                The same sign-in works for brand, influencer, and admin accounts.
              </p>

              {status ? (
                <p className="ih-error-text" role="alert">{status}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="ih-button-primary ih-focus-ring w-full py-3"
              >
                {isSubmitting ? "Signing in..." : "Log in"}
              </button>
            </Form>
          );
          }}
        </Formik>

        <p className="ih-divider-top ih-text-muted mt-6 pt-5 text-center">
          Don't have an account?{" "}
          <TransitionLink
            to="/auth/register"
            className="ih-link ih-focus-ring rounded-sm font-medium"
          >
            Register
          </TransitionLink>
        </p>
      </div>
    </div>
  );
};

export default Login;
