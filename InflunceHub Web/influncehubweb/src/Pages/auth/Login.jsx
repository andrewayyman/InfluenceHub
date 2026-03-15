import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password too short").required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (values, { setSubmitting }) => {
    console.log("Login Values:", values);

    setTimeout(() => {
      setSubmitting(false);
      navigate("/dashboard/admin");
    }, 1000);
  };
return (
  <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] relative overflow-hidden">

    {/* Glow background */}
    <div className="absolute w-[500px] h-[500px] bg-purple-600 opacity-20 blur-3xl rounded-full"></div>

    {/* Login Card */}
    <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">

      <h2 className="text-3xl font-bold text-center text-white mb-2">
        Welcome Back
      </h2>

      <p className="text-center text-white/60 mb-8">
        Login to your InfluenceHub account
      </p>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">

            <Field
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <Field
              type="password"
              name="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

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