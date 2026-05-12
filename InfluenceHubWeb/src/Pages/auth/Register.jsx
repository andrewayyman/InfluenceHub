import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { register as registerRequest } from "../../services/api/authService";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { navigateWithOverdrive } from "../../utils/overdrive";

const roleOptions = [
  {
    label: "Brand",
    value: "Brand",
    helper: "Create campaigns and review applications.",
    activeClass: "ih-choice-chip-brand-active",
  },
  {
    label: "Influencer",
    value: "Influencer",
    helper: "Apply to campaigns and submit reports.",
    activeClass: "ih-choice-chip-emerald-active",
  },
];

const RegisterSchema = Yup.object().shape({
  role: Yup.string().required("Please select a role"),
  name: Yup.string().min(3, "Too short").required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password too short")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm your password"),
});

const Register = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setStatus, setSubmitting }) => {
    setStatus(null);

    try {
      await registerRequest({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });

      await navigateWithOverdrive(navigate, "/auth/login", {
        state: { registered: values.email.trim() },
      });
    } catch (error) {
      setStatus(error.message || "Unable to create your account right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ih-auth-shell ih-page-shell ih-motion-stage relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden px-4 pb-10 pt-24 sm:px-6">
      <div aria-hidden="true" className="ih-auth-atmosphere pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="ih-auth-grid pointer-events-none absolute inset-0" />

      <div className="ih-auth-card relative w-full max-w-lg rounded-[1.75rem] p-6 sm:p-8" data-ih-reveal style={{ "--ih-delay": "90ms" }}>
        <div className="inline-flex items-center gap-3">
          <span className="ih-brand-mark">IH</span>
          <div>
            <p className="ih-kicker">Create account</p>
            <p className="ih-text-subtle mt-1 text-xs uppercase tracking-[0.18em]">
              Brands and influencers
            </p>
          </div>
        </div>

        <h2 className="mb-2 mt-6 text-3xl font-semibold ih-text-primary">
          Create your InfluiX account
        </h2>
        <p className="ih-text-muted mb-8 leading-7">
          Pick your role, add your details, and set up the account you will use to sign in.
        </p>

        <Formik
          initialValues={{
            role: "",
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, status, touched, values }) => (
            <Form className="space-y-4">

              <fieldset>
                <legend className="ih-label">Account type</legend>
                <p id="register-role-help" className="ih-helper-text mt-0">
                  Choose how you will use InfluiX.
                </p>
                <div
                  className="mt-4 grid grid-cols-2 gap-3"
                  role="radiogroup"
                  aria-describedby="register-role-help register-role-error"
                  aria-invalid={touched.role && errors.role ? "true" : "false"}
                >
                  {roleOptions.map((option) => {
                    const isSelected = values.role === option.value;

                    return (
                      <label
                        key={option.value}
                        className={`ih-focus-ring ih-choice-chip inline-flex min-h-[5.5rem] w-full cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 text-left ${
                          isSelected ? option.activeClass : ""
                        }`}
                      >
                        <span className="mt-0.5">
                          <Field
                            type="radio"
                            name="role"
                            value={option.value}
                            className="ih-focus-ring h-4 w-4"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-current">{option.label}</span>
                          <span className="mt-1 block text-xs leading-5 text-current/80">
                            {option.helper}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {touched.role && errors.role ? (
                  <p id="register-role-error" className="ih-error-text" role="alert">
                    {errors.role}
                  </p>
                ) : null}
              </fieldset>

              <div>
                <label className="ih-label" htmlFor="register-name">
                  Name
                </label>
                <Field
                  id="register-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Full name"
                  aria-invalid={touched.name && errors.name ? "true" : "false"}
                  aria-describedby="register-name-help register-name-error"
                  className={`ih-input ih-focus-ring ${
                    touched.name && errors.name ? "ih-input-error" : ""
                  }`}
                />
                <p id="register-name-help" className="ih-helper-text">
                  This is shown on your profile and campaigns.
                </p>
                {touched.name && errors.name ? (
                  <p id="register-name-error" className="ih-error-text" role="alert">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="ih-label" htmlFor="register-email">
                  Email address
                </label>
                <Field
                  id="register-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  aria-invalid={touched.email && errors.email ? "true" : "false"}
                  aria-describedby="register-email-help register-email-error"
                  className={`ih-input ih-focus-ring ${
                    touched.email && errors.email ? "ih-input-error" : ""
                  }`}
                />
                <p id="register-email-help" className="ih-helper-text">
                  We use this for sign-in and campaign updates.
                </p>
                {touched.email && errors.email ? (
                  <p id="register-email-error" className="ih-error-text" role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="ih-label" htmlFor="register-password">
                  Password
                </label>
                <Field
                  id="register-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  aria-invalid={touched.password && errors.password ? "true" : "false"}
                  aria-describedby="register-password-help register-password-error"
                  className={`ih-input ih-focus-ring ${
                    touched.password && errors.password ? "ih-input-error" : ""
                  }`}
                />
                <p id="register-password-help" className="ih-helper-text">
                  At least 6 characters.
                </p>
                {touched.password && errors.password ? (
                  <p id="register-password-error" className="ih-error-text" role="alert">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="ih-label" htmlFor="register-confirm-password">
                  Confirm password
                </label>
                <Field
                  id="register-confirm-password"
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  aria-invalid={touched.confirmPassword && errors.confirmPassword ? "true" : "false"}
                  aria-describedby="register-confirm-password-help register-confirm-password-error"
                  className={`ih-input ih-focus-ring ${
                    touched.confirmPassword && errors.confirmPassword ? "ih-input-error" : ""
                  }`}
                />
                <p id="register-confirm-password-help" className="ih-helper-text">
                  Enter the same password again.
                </p>
                {touched.confirmPassword && errors.confirmPassword ? (
                  <p
                    id="register-confirm-password-error"
                    className="ih-error-text"
                    role="alert"
                  >
                    {errors.confirmPassword}
                  </p>
                ) : null}
              </div>

              <p className="ih-text-subtle text-sm leading-6">
                Admin accounts are managed separately. Brand and influencer access starts here.
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
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="ih-divider-top ih-text-muted mt-6 pt-5 text-center">
          Already have an account?{" "}
          <TransitionLink
            to="/auth/login"
            className="ih-link ih-focus-ring rounded-sm font-medium"
          >
            Login
          </TransitionLink>
        </p>
      </div>
    </div>
  );
};

export default Register;
