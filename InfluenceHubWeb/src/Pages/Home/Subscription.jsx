import React from "react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { createContactMessage } from "../../services/api/contactService";
import { motion, AnimatePresence } from "framer-motion";
import { prefersReducedMotion } from "../../utils/overdrive";
import { Send, CheckCircle } from "lucide-react";

const BriefingSchema = Yup.object({
  name: Yup.string().trim().min(2, "Please enter your name").max(80, "Keep the name under 80 characters").required("Name is required"),
  email: Yup.string().trim().email("Enter a valid work email").required("Work email is required"),
});

const Subscription = () => {
  const isReducedMotion = prefersReducedMotion();

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

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1
      } 
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="Subscription" className="ih-section-shell px-6 py-24 sm:py-32 bg-slate-50 relative overflow-hidden" aria-labelledby="subscription-heading">
      {/* Decorative gradients */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-amber-200/40 via-orange-100/10 to-transparent blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div 
          className="ih-panel-outline relative overflow-hidden bg-white/80 backdrop-blur-2xl border border-amber-200/50 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.15)] rounded-[2.5rem] p-8 sm:p-12 lg:p-16"
          initial={isReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Inner subtle glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[80px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" aria-hidden="true" />
          
          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20 items-center">
            
            <motion.div variants={childVariants} className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Monthly Briefing</span>
              </div>
              
              <h2 id="subscription-heading" className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] leading-[1.1] mb-6">
                Stay ahead of the <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">curve.</span>
              </h2>
              
              <p className="text-lg leading-relaxed text-slate-600 font-medium mb-8">
                Join our exclusive mailing list to receive curated insights, platform updates, and industry trends straight to your inbox.
              </p>

              <div className="flex flex-wrap gap-3">
                {["Monthly digest", "Platform updates", "Campaign insights"].map((pill, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 shadow-sm text-slate-700">
                    {pill}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div variants={childVariants} className="w-full">
              <Formik
                initialValues={{ email: "", name: "" }}
                validationSchema={BriefingSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, isSubmitting, status, touched }) => (
                  <Form className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="briefing-name" className="block text-sm font-bold text-slate-700 mb-2">
                          Full Name
                        </label>
                        <Field
                          id="briefing-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          placeholder="Jane Doe"
                          aria-invalid={touched.name && errors.name ? "true" : "false"}
                          aria-describedby="briefing-name-error"
                          className={`w-full rounded-xl px-5 py-4 bg-slate-50 border outline-none transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-amber-500/10 ${
                            touched.name && errors.name 
                              ? "border-red-300 focus:border-red-500" 
                              : "border-slate-200 focus:border-amber-400"
                          }`}
                        />
                        <AnimatePresence>
                          {touched.name && errors.name && (
                            <motion.p 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              id="briefing-name-error" 
                              className="text-red-500 text-sm mt-2 font-medium" 
                              role="alert"
                            >
                              {errors.name}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <label htmlFor="subscription-email" className="block text-sm font-bold text-slate-700 mb-2">
                          Work Email
                        </label>
                        <Field
                          id="subscription-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="jane@company.com"
                          aria-invalid={touched.email && errors.email ? "true" : "false"}
                          aria-describedby="subscription-email-error"
                          className={`w-full rounded-xl px-5 py-4 bg-slate-50 border outline-none transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-amber-500/10 ${
                            touched.email && errors.email 
                              ? "border-red-300 focus:border-red-500" 
                              : "border-slate-200 focus:border-amber-400"
                          }`}
                        />
                        <AnimatePresence>
                          {touched.email && errors.email && (
                            <motion.p 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              id="subscription-email-error" 
                              className="text-red-500 text-sm mt-2 font-medium" 
                              role="alert"
                            >
                              {errors.email}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <AnimatePresence>
                      {status && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${
                            status.tone === "success" 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                              : "bg-red-50 border-red-200 text-red-800"
                          }`}
                          role={status.tone === "success" ? "status" : "alert"}
                        >
                          {status.tone === "success" && <CheckCircle className="shrink-0 mt-0.5 text-emerald-600" size={18} />}
                          <p className="text-sm font-medium">{status.message}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-slate-500 text-sm font-medium">
                        Unsubscribe at any time.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                        className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl px-8 py-4 font-bold shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] hover:bg-slate-800 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Sending..." : "Request Briefing"}
                        {!isSubmitting && <Send size={18} className="ml-1" />}
                      </motion.button>
                    </div>
                  </Form>
                )}
              </Formik>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Subscription;
