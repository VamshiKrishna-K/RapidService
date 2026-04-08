import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Search, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Could not find path", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-lg animate-fade-up">
        <div className="relative mb-12">
           <div className="text-[12rem] font-black leading-none text-primary/5 select-none uppercase tracking-tighter">404</div>
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border-2 border-primary/20 shadow-2xl backdrop-blur-3xl animate-bounce">
                 <Search className="w-10 h-10 text-primary" />
              </div>
           </div>
        </div>
        
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Coordinates Lost</h1>
        <p className="text-muted-foreground font-medium text-lg leading-relaxed mb-10">
          The quadrant <span className="text-foreground font-bold px-2 py-1 bg-muted rounded-lg">{location.pathname}</span> does not exist in our current database.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" /> Return to Base
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-3 border-2 border-border text-foreground px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-muted transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>

        <div className="mt-20 pt-10 border-t border-border/50">
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">System Integrity: Optimal · Path Status: Link Broken</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

