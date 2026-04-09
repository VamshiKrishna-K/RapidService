import { Menu, X, LogOut, User, Home, Info, HelpCircle, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/login");
  };

  const navLinks = [
    { label: "Explore", path: "/", icon: Home },

    { label: "About", path: "/about", icon: Info },
  ];

  const isHome = location.pathname === "/";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border py-4 shadow-lg" : "bg-transparent py-6"}`}>
      <div className="container flex items-center justify-between">
        <Link to="/" className={`text-2xl font-black font-display flex items-center gap-2 group transition-colors ${scrolled || !isHome ? "text-primary" : "text-white"}`}>
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <span className="uppercase tracking-tighter">RAPIDSERVICE</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group ${scrolled || !isHome ? "text-foreground" : "text-white/80 hover:text-white"}`}
            >
              {item.label}
              <span className={`absolute -bottom-2 left-0 w-0 h-1 bg-primary rounded-full group-hover:w-full transition-all ${location.pathname === item.path ? "w-full" : ""}`} />
            </Link>
          ))}
          
          {user ? (
            <div className="flex items-center gap-6 pl-10 border-l border-border/50">
              <Link
                to={user.role === "provider" ? "/provider-dashboard" : "/dashboard"}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border-2 ${scrolled || !isHome ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-white/10 text-white border-white/20 backdrop-blur-md"}`}
              >
                <User className="w-3.5 h-3.5" />
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className={`transition-colors p-2 rounded-lg hover:bg-muted ${scrolled || !isHome ? "text-muted-foreground" : "text-white/50 hover:text-white"}`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6 pl-10 border-l border-border/50">
              <Link
                to="/login"
                className={`text-[10px] font-black uppercase tracking-widest hover:underline ${scrolled || !isHome ? "text-foreground" : "text-white"}`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 ${scrolled || !isHome ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-accent text-accent-foreground shadow-accent/20"}`}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button
          className={`md:hidden p-3 rounded-xl transition-all ${scrolled || !isHome ? "text-foreground bg-muted" : "text-white bg-white/10"}`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl animate-fade-down backdrop-blur-2xl">
          <div className="space-y-4">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl transition-all ${
                  location.pathname === item.path ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="mt-8 pt-8 border-t border-border space-y-4">
            {user ? (
              <>
                <Link
                  to={user.role === "provider" ? "/provider-dashboard" : "/dashboard"}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px] py-4 px-6 rounded-2xl"
                >
                  <User className="w-5 h-5" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-4 text-destructive font-black uppercase tracking-widest text-[10px] py-4 px-6 rounded-2xl hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center bg-muted text-foreground font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center bg-accent text-accent-foreground font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

