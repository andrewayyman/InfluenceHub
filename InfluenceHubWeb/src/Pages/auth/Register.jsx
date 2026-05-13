import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Building2, User } from "lucide-react";
import { register as registerRequest } from "../../services/api/authService";
import { TransitionLink } from "../../Components/Motion/TransitionLink";
import { navigateWithOverdrive } from "../../utils/overdrive";
import { motion, AnimatePresence } from "framer-motion";

const roleOptions = [
  {
    label: "Brand",
    value: "Brand",
    icon: Building2,
    helper: "Create campaigns & review.",
    activeClass: "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500/20 dark:bg-brand-500/10 dark:border-brand-500/50",
    iconClass: "bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
  },
  {
    label: "Influencer",
    value: "Influencer",
    icon: User,
    helper: "Apply & submit reports.",
    activeClass: "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:border-emerald-500/50",
    iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        className="relative z-10 w-full max-w-xl"
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
              <p className="font-semibold text-slate-900 dark:text-white">Create Account</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Join The Platform
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h2 className="mb-2 mt-8 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Get started with InfluiX
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Pick your role, add your details, and set up your account in seconds.
            </p>
          </motion.div>

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
            {({ isSubmitting, errors, status, touched, values, setFieldValue }) => (
              <Form className="space-y-6">

                <motion.fieldset variants={fadeInUp}>
                  <legend className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">Choose your role</legend>
                  <div
                    className="grid grid-cols-2 gap-3"
                    role="radiogroup"
                  >
                    {roleOptions.map((option) => {
                      const isSelected = values.role === option.value;
                      const Icon = option.icon;

                      return (
                        <label
                          key={option.value}
                          className={`group relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
                            isSelected 
                              ? option.activeClass 
                              : "border-slate-200 bg-white/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
                          }`}
                        >
                          <Field
                            type="radio"
                            name="role"
                            value={option.value}
                            className="sr-only"
                          />
                          <div className="mb-2 flex items-center justify-between">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                              isSelected ? option.iconClass : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                            }`}>
                              <Icon size={20} />
                            </div>
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                              isSelected ? "border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400" : "border-slate-300 dark:border-slate-600"
                            }`}>
                              {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                          </div>
                          <span className={`block font-semibold transition-colors ${
                            isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                          }`}>
                            {option.label}
                          </span>
                          <span className={`mt-1 block text-[13px] leading-relaxed transition-colors ${
                            isSelected ? "text-slate-600 dark:text-slate-400" : "text-slate-500 dark:text-slate-500"
                          }`}>
                            {option.helper}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <AnimatePresence>
                    {touched.role && errors.role && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="text-[13px] font-medium text-red-500"
                      >
                        {errors.role}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.fieldset>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <motion.div variants={fadeInUp}>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="register-name">
                      Full name
                    </label>
                    <Field
                      id="register-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="John Doe"
                      className={`w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-brand-400 dark:focus:bg-slate-800 ${
                        touched.name && errors.name ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/50" : ""
                      }`}
                    />
                    <AnimatePresence>
                      {touched.name && errors.name && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="text-[13px] font-medium text-red-500"
                        >
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="register-email">
                      Email address
                    </label>
                    <Field
                      id="register-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      className={`w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-brand-400 dark:focus:bg-slate-800 ${
                        touched.email && errors.email ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/50" : ""
                      }`}
                    />
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
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <motion.div variants={fadeInUp}>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="register-password">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="new-password"
                        placeholder="At least 6 chars"
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

                  <motion.div variants={fadeInUp}>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="register-confirm-password">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Field
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        className={`w-full rounded-xl border border-slate-200 bg-white/50 py-3.5 pl-4 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-brand-400 dark:focus:bg-slate-800 ${
                          touched.confirmPassword && errors.confirmPassword ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/50" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="text-[13px] font-medium text-red-500"
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

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

                <motion.div variants={fadeInUp} className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 dark:from-brand-500 dark:to-brand-400"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        Create Account
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
              Already have an account?{" "}
              <TransitionLink
                to="/auth/login"
                className="font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Log in here
              </TransitionLink>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
