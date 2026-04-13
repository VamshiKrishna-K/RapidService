import { Search, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import MapPickerModal from '../shared/MapPickerModal';

const defaultCenter = [17.3850, 78.4867];

const Hero = ({ onSearch }) => {
  const [user, setUser] = useState(null);
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [markerPos, setMarkerPos] = useState(defaultCenter);
  const [searchCoords, setSearchCoords] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      <img
        src={heroBg}
        alt="Local service professionals at work"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div
        className="absolute inset-0"
        style={{ background: "var(--hero-overlay)" }}
      />
      <div className="container relative z-10 py-24">
        <div className="max-w-2xl animate-fade-up">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
            Find Trusted Pros
            <br />
            <span className="text-accent">Near You</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 font-sans">
            Connect with top-rated local professionals for any job — from home
            repairs to personal services.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 bg-card rounded-2xl p-3 shadow-2xl mb-8 relative z-50 backdrop-blur-md">
            <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl bg-background">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="What service do you need?"
                className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground font-medium"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl bg-background relative">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your location"
                className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground font-medium pr-10"
              />
              <button 
                onClick={() => setIsMapOpen(true)}
                className="absolute right-3 p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                title="Pick on map"
              >
                <MapPin className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>
            <button 
              onClick={() => {
                if (searchCoords) {
                  onSearch(service, searchCoords[0], searchCoords[1]);
                } else {
                  onSearch(service);
                }
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all shadow-lg shadow-primary/20 shrink-0 hover:scale-105 active:scale-95"
            >
              Explore Services
            </button>
          </div>
          
          {!user ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-30 animate-fade-in">
              <Link 
                to="/login" 
                className="w-full sm:w-auto bg-[#10b981] hover:bg-[#059669] text-white font-extrabold px-10 py-4 rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-green-500/20 hover:scale-105 transition-all transform active:scale-95"
              >
                Sign In Now <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-primary-foreground/80 text-sm font-medium">
                New here? <Link to="/register" className="text-accent underline-offset-4 hover:underline">Create an account</Link>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 animate-fade-in bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 w-fit">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-black border-2 border-white/20">
                {user.name?.charAt(0)}
              </div>
              <p className="text-primary-foreground font-bold">Welcome back, {user.name}!</p>
            </div>
          )}
          
          <p className="text-sm text-primary-foreground/60 mt-6 italic font-medium">
            Trusted by homeowners across the city
          </p>
        </div>
      </div>

      <MapPickerModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={(pos, addr) => {
          setMarkerPos(pos);
          setSearchCoords(pos);
          setLocation(addr);
          setIsMapOpen(false);
        }}
        initialPos={markerPos}
        radius={15}
        title="Set Search Center"
        subTitle="Discover services within 15km"
        confirmText="Confirm Location"
      />
    </section>
  );
};

export default Hero;
