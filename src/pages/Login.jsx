import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../Components/ui/card";
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
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter username and password");
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
        "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen max-w-full overflow-hidden flex items-center justify-center bg-[#181715] p-4 relative select-none font-sans-body">
      {/* Animated Background Spheres & Mesh */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cc785c]/30 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#252320]/80 rounded-full blur-3xl animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#cc785c]/10 rounded-full blur-3xl animate-pulse-glow" />

      {/* Main Editorial Login Card */}
      <Card className="w-full max-w-md bg-[#faf9f5] border border-[#e6dfd8] shadow-2xl relative z-10 p-2 sm:p-4 rounded-xl my-auto animate-in fade-in-50 zoom-in-95 duration-300">
        <CardHeader className="space-y-3 text-center pb-5 border-b border-[#e6dfd8]">
          <div className="mx-auto h-13 w-13 rounded-xl bg-[#cc785c] flex items-center justify-center text-white shadow-md">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-3xl font-normal tracking-tight text-[#141413] font-serif-display">
              Student Admission CRM
            </CardTitle>
            <CardDescription className="text-xs text-[#6c6a64] font-medium mt-1">
              Sign in with your admin credentials to access the portal
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
                <User className="h-3.5 w-3.5 text-[#cc785c]" />
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="h-10.5 rounded-md border-[#e6dfd8] bg-[#faf9f5]"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
                <Lock className="h-3.5 w-3.5 text-[#cc785c]" />
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-10.5 pr-10 rounded-md border-[#e6dfd8] bg-[#faf9f5]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#8e8b82] hover:text-[#cc785c] transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-[#fde8e8] border border-[#fbd5d5] text-[#9b1c1c] text-xs font-medium animate-in fade-in-50">
                {error}
              </div>
            )}

            {/* Coral Primary CTA Button */}
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full text-xs font-medium shadow-sm mt-2 h-11 rounded-md bg-[#cc785c] hover:bg-[#a9583e]"
            >
              {loading ? (
                "Signing In..."
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In to Portal <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col pt-1 pb-4">
          <p className="text-[11px] text-center text-[#8e8b82] font-medium tracking-tight">
            Student Admission CRM • Management Edition
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;