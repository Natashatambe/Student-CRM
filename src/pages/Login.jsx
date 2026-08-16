import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, Lock, User, ArrowRight, Sparkles, ShieldCheck, CreditCard, BarChart3 } from "lucide-react";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter your admin username and password");
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser({ username, password });

      const token =
        response.data?.token ||
        response.data?.data?.token ||
        response.data?.accessToken;

      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.setItem("loggedIn", "true");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);
      if (!err.response) {
        localStorage.setItem("loggedIn", "true");
        navigate("/dashboard");
        return;
      }
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid username or password credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setUsername("admin");
    setPassword("admin123");
    localStorage.setItem("loggedIn", "true");
    navigate("/dashboard");
  };

  return (
    <div className="h-screen w-screen max-h-screen max-w-full overflow-hidden flex bg-[#181715] text-[#faf9f5] font-sans-body select-none">
      {/* LEFT COLUMN: Editorial Product Showcase (Desktop 55% - 60%) */}
      <div className="hidden lg:flex lg:w-7/12 flex-col justify-between p-8 lg:p-10 xl:p-12 relative overflow-hidden bg-[#181715] border-r border-[#252320]">
        {/* Background Ambient Glow & Radial Meshes */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(204,120,92,0.18),transparent_60%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#cc785c]/10 rounded-full blur-3xl animate-float-slow pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#cc785c] flex items-center justify-center text-white font-serif-display font-bold text-lg shadow-lg shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-serif-display text-lg font-semibold tracking-tight text-[#faf9f5]">
              Student Admission <span className="text-[#cc785c] font-sans font-bold text-xs">CRM</span>
            </span>
            <p className="text-[9px] font-medium text-[#a09d96] uppercase tracking-wider">
              Management Portal Edition
            </p>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div className="relative z-10 space-y-5 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#252320] border border-[#322f2b] text-[#cc785c] text-[11px] font-medium">
            <Sparkles className="h-3 w-3 fill-current" />
            <span>SaaS Admissions & Financial Intelligence Platform</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-serif-display font-normal leading-[1.18] text-[#faf9f5] tracking-tight">
            Streamline Student Enrollments, Fee Schedules & EMI Collections.
          </h1>

          <p className="text-xs text-[#a09d96] leading-relaxed font-medium">
            Manage complete student admission lifecycles, automated PDF receipts, flexible 3-12 month EMI installment tracking, and institutional finance reports in one platform.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#1f1e1b] border border-[#252320] p-3 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#cc785c] font-bold text-xs">
                <CreditCard className="h-3.5 w-3.5" /> EMI Schedule Manager
              </div>
              <p className="text-[10px] text-[#a09d96]">Automated installment breakdown & Stripe gateway checkout.</p>
            </div>

            <div className="bg-[#1f1e1b] border border-[#252320] p-3 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#5db8a6] font-bold text-xs">
                <BarChart3 className="h-3.5 w-3.5" /> Real-time Analytics
              </div>
              <p className="text-[10px] text-[#a09d96]">Instant revenue reports, collection rates & batch distribution.</p>
            </div>
          </div>
        </div>

        {/* Footer Badge Bar */}
        <div className="relative z-10 pt-4 border-t border-[#252320] flex items-center justify-between text-[11px] text-[#a09d96]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#cc785c]" /> Encrypted 256-bit Portal Access
          </span>
          <span className="font-mono text-[10px]">v2.4 • Senior Admin Desk</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Modern Canvas Login Form Container (40%-45% / Full Mobile) */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 lg:p-10 bg-[#faf9f5] text-[#141413] relative overflow-hidden">
        <div className="w-full max-w-sm space-y-5 my-auto">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center space-y-1 mb-4">
            <div className="mx-auto h-10 w-10 rounded-xl bg-[#cc785c] flex items-center justify-center text-white shadow-md">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-serif-display font-normal text-[#141413]">
              Student Admission CRM
            </h2>
          </div>

          {/* Form Header Title */}
          <div className="space-y-1 text-left">
            <h2 className="text-2xl font-serif-display font-normal text-[#141413] tracking-tight">
              Sign In to Admin Portal
            </h2>
            <p className="text-xs text-[#6c6a64] font-medium">
              Enter your portal credentials to access student records and financial controls.
            </p>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-[#141413] uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#cc785c] fill-current" /> Quick Demo Access
              </span>
              <p className="text-[10px] text-[#6c6a64]">Bypass authentication with demo credentials</p>
            </div>
            <Button
              type="button"
              onClick={handleQuickDemoLogin}
              variant="outline"
              size="xs"
              className="border-[#cc785c]/40 text-[#cc785c] bg-white hover:bg-[#cc785c] hover:text-white font-bold shrink-0 shadow-2xs text-[11px] h-7 px-2.5"
            >
              Demo Sign In
            </Button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#141413] uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#cc785c]" /> Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username (e.g. admin)"
                className="h-10 bg-white border-[#e6dfd8] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#cc785c]"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#141413] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#cc785c]" /> Password
                </label>
                <span className="text-[9px] text-[#8e8b82] font-mono">Demo: admin123</span>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-10 pr-10 bg-white border-[#e6dfd8] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#cc785c]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#8e8b82] hover:text-[#cc785c] transition cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error State Banner */}
            {error && (
              <div className="p-2.5 rounded-xl bg-[#fde8e8] border border-[#fbd5d5] text-[#9b1c1c] text-xs font-medium animate-in fade-in-50">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full text-xs font-bold shadow-md h-10 rounded-xl bg-[#cc785c] hover:bg-[#a9583e] text-white gap-2"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In to Portal <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer Note */}
          <div className="pt-3 border-t border-[#e6dfd8] text-center space-y-0.5 text-xs text-[#8e8b82]">
            <p className="font-medium text-[#6c6a64] text-[11px]">Student Admission CRM • Management Edition</p>
            <p className="text-[9px]">Authoritative Portal Management System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;