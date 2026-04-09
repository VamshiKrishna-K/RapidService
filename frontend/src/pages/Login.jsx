import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const { data } = await api.post("/auth/google-login", {
        email: user.email,
        name: user.displayName,
        uid: user.uid,
        photoURL: user.photoURL
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      toast.success("Welcome back! Signed in with Google.");
      navigate(data.role === "provider" ? "/provider-dashboard" : "/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Google authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");
    
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("userInfo", JSON.stringify(data));
      toast.success("Login successful!");
      navigate(data.role === "provider" ? "/provider-dashboard" : "/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left decorative panel (Rich Design) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent/30 opacity-60" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 text-primary-foreground max-w-lg space-y-10">
          <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center backdrop-blur-3xl border border-white/20 shadow-2xl">
             <Sparkles className="w-10 h-10 text-accent" />
          </div>
          <div>
            <h1 className="text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-6">Experience <br/><span className="text-accent underline decoration-4 underline-offset-8">Excellence</span></h1>
            <p className="text-xl font-medium text-primary-foreground/70 leading-relaxed max-w-sm">
              Connect with high-tier professionals and manage your tasks with surgical precision.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/10">
            <div>
              <p className="text-3xl font-black text-white">5k+</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/40">Verified Pros</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">4.9/5</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/40">User Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-12">
            <Link to="/" className="text-2xl font-black font-display text-primary tracking-tighter mb-4 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8" /> RAPIDSERVICE
            </Link>
            <h2 className="text-4xl font-black text-foreground uppercase tracking-tight mb-2">Sign In</h2>
            <p className="text-muted-foreground font-medium">Verify your credentials to continue your journey.</p>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-4 bg-card border-2 border-border rounded-2xl px-6 py-4 text-foreground font-black uppercase tracking-widest text-[10px] hover:border-primary/50 hover:bg-muted/30 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-6 my-10">
            <div className="flex-1 h-[2px] bg-border opacity-50" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">or specify details</span>
            <div className="flex-1 h-[2px] bg-border opacity-50" />
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-foreground uppercase tracking-widest ml-1">E-Mail Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@domain.com" 
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-border bg-muted/20 text-foreground font-bold outline-none focus:border-primary transition-all placeholder:font-medium" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-foreground uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-14 py-4 rounded-2xl border-2 border-border bg-muted/20 text-foreground font-bold outline-none focus:border-primary transition-all" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button 
              disabled={isLoading} 
              type="submit" 
              className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl shadow-2xl shadow-primary/20 uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-12 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
             New to the platform? <Link to="/register" className="text-primary hover:underline ml-1">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

