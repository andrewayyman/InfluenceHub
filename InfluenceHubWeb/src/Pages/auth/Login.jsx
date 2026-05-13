import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { navigateWithOverdrive } from "../../utils/overdrive";
import { canReturnToDashboardPath, getRoleDashboardPath } from "../../utils/auth";
import { motion, AnimatePresence } from "framer-motion";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password too short").required("Password is required"),
});

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values, { setStatus, setSubmitting }) => {
    setStatus(null);

    try {
      const session = await login({
        email: values.email.trim(),
        password: values.password,
      });

      const fallbackTarget = getRoleDashboardPath(session.user.role);
      const requestedTarget = location.state?.from;
      const nextTarget = canReturnToDashboardPath(session.user.role, requestedTarget)
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
    <div className="ih-auth-shell relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden px-4 pb-10 pt-24 sm:px-6 dark:bg-slate-950">
      {/* Animated Atmosphere */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        aria-hidden="true" 
        className="ih-auth-atmosphere pointer-events-none absolute inset-0 dark:opacity-20" 
      />
      <div aria-hidden="true" className="ih-auth-grid pointer-events-none absolute inset-0 dark:opacity-10" />

      {/* Decorative Orbs */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-400/20 mix-blend-multiply blur-[80px] dark:bg-brand-600/20"
      />
      <motion.div 
        animate={{ 
          y: [0, 20, 0],
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-emerald-400/20 mix-blend-multiply blur-[80px] dark:bg-emerald-600/20"
      />

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 w-full max-w-md"
      >
        <motion.div 
          variants={fadeInUp}
          className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/70 p-8 shadow-[0_8px_40px_rgb(0,0,0,0.04)] backdrop-blur-2xl dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] sm:p-10"
        >
          {/* Glassmorphism shine effect */}
          <div className="pointer-events-none absolute -inset-[100%] z-[-1] animate-[ih-trace-sheen_8s_linear_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5" />

          <motion.div variants={fadeInUp} className="inline-flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20 dark:shadow-brand-500/10">
              <span className="text-xl font-bold tracking-tight">IH</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Secure Access</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Brands & Influencers
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h2 className="mb-2 mt-8 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Enter your credentials to access your dashboard, manage campaigns, and view reports.
            </p>
          </motion.div>

          {location.state?.registered ? (
            <motion.div 
              variants={fadeInUp}
              className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200"
            >
              Account created for <span className="font-semibold">{location.state.registered}</span>. Sign in to continue.
            </motion.div>
          ) : null}

          <motion.div 
            variants={fadeInUp}
            className="mb-8 flex items-start gap-4 rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-800/50"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400">
              <ShieldCheck size={18} strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Admin access seeded</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Use <span className="font-semibold text-slate-900 dark:text-slate-200">admin@influix.com</span> / <span className="font-semibold text-slate-900 dark:text-slate-200">Admin@123</span>
              </p>
            </div>
          </motion.div>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, status, touched }) => (
              <Form className="space-y-5">
                <motion.div variants={fadeInUp}>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="login-email">
                    Email address
                  </label>
                  <div className="relative">
                    <Field
                      id="login-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      aria-invalid={touched.email && errors.email ? "true" : "false"}
                      className={`w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-brand-400 dark:focus:bg-slate-800 ${
                        touched.email && errors.email ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/50" : ""
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {touched.email && errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="text-[13px] font-medium text-red-500"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="login-password">
                      Password
                    </label>
                    <a href="#" className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Field
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      aria-invalid={touched.password && errors.password ? "true" : "false"}
                      className={`w-full rounded-xl border border-slate-200 bg-white/50 py-3.5 pl-4 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-brand-400 dark:focus:bg-slate-800 ${
                        touched.password && errors.password ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/50" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {touched.password && errors.password && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="text-[13px] font-medium text-red-500"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {status ? (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400" 
                    role="alert"
                  >
                    {status}
                  </motion.div>
                ) : null}

                <motion.div variants={fadeInUp} className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 dark:from-brand-500 dark:to-brand-400"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </motion.div>
              </Form>
            )}
          </Formik>

          <motion.div variants={fadeInUp} className="mt-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <TransitionLink
                to="/auth/register"
                className="font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Create one now
              </TransitionLink>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
