import React from "react";
import { Formik, Form, Field } from "formik"; // Formik for form handling
import * as Yup from "yup"; // Yup for validation
import { useNavigate, Link } from "react-router-dom";

// ===== Validation Schema =====
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password too short").required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();

  // ===== Handle form submit =====
  const handleSubmit = (values, { setSubmitting }) => {
    console.log("Login Values:", values);

    // Simulate async login
    setTimeout(() => {
      setSubmitting(false);
      navigate("/dashboard/admin"); // redirect after "login"
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] relative overflow-hidden">

      {/* ===== Glow Background ===== */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600 opacity-20 blur-3xl rounded-full"></div>

      {/* ===== Login Card ===== */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-white/60 mb-8">
          Login to your InfluenceHub account
        </p>

        {/* ===== Formik Form ===== */}
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">

              {/* Email Field */}
              <Field
                type="email"
                name="email"
                placeholder="Email address"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              {/* Password Field */}
              <Field
                type="password"
                name="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-emerald-500 hover:scale-[1.02] transition text-white"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>

            </Form>
          )}
        </Formik>

        {/* Register Link */}
        <p className="text-center text-white/60 mt-6">
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;