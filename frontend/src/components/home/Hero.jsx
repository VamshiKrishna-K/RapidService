import { Search, MapPin, ArrowRight, X, Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 17.3850,
  lng: 78.4867
};

const libraries = ["places"];

const Hero = ({ onSearch }) => {
  const [user, setUser] = useState(null);
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState("");
  const [markerPos, setMarkerPos] = useState(defaultCenter);
  const [autocomplete, setAutocomplete] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
    libraries: libraries
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const onMarkerDragEnd = (e) => {
    if (e.latLng) {
      const nextPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(nextPos);
      setTempLocation(`${nextPos.lat.toFixed(4)}, ${nextPos.lng.toFixed(4)}`);
    }
  };

  const onMapClick = (e) => {
    if (e.latLng) {
      const nextPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(nextPos);
      setTempLocation(`${nextPos.lat.toFixed(4)}, ${nextPos.lng.toFixed(4)}`);
    }
  };

  const onLoad = (autoC) => {
    setAutocomplete(autoC);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const nextPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setMarkerPos(nextPos);
        setTempLocation(`${nextPos.lat.toFixed(4)}, ${nextPos.lng.toFixed(4)}`);
      }
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { longitude, latitude } = position.coords;
        const nextPos = { lat: latitude, lng: longitude };
        setMarkerPos(nextPos);
        setTempLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      });
    }
  };

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
                const [lat, lng] = location.split(", ").map(Number);
                onSearch(service, lat, lng);
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

      {/* Hero Map Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border-2 border-border animate-fade-up">
            <div className="p-8 border-b border-border flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                   <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Set Search Center</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Discover services in your neighborhood</p>
                </div>
              </div>

              {isLoaded && (
                <div className="flex-1 max-w-md w-full">
                   <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                     <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                       </div>
                       <input
                         type="text"
                         placeholder="Search for a location..."
                         className="block w-full pl-11 pr-4 py-4 bg-white/50 backdrop-blur-md border-2 border-white/20 rounded-2xl text-sm font-bold shadow-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 hover:bg-white/80"
                       />
                     </div>
                   </Autocomplete>
                </div>
              )}
              <button 
                onClick={() => setIsMapOpen(false)} 
                className="p-3 hover:bg-muted rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 relative bg-muted/50 overflow-hidden">
              {isLoaded ? (
                <>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPos}
                    zoom={13}
                    onClick={onMapClick}
                    options={{
                      disableDefaultUI: true,
                      styles: [
                        {
                          "featureType": "all",
                          "elementType": "labels.text.fill",
                          "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
                        }
                      ]
                    }}
                  >
                    <Marker 
                      position={markerPos} 
                      draggable={true} 
                      onDragEnd={onMarkerDragEnd}
                    />
                  </GoogleMap>
                  
                  <div className="absolute bottom-6 right-6 z-30 flex items-center gap-3">
                    <button 
                      onClick={handleLocateMe}
                      className="w-12 h-12 bg-white text-primary rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-border"
                      title="Find me"
                    >
                      <MapPin className="w-6 h-6" />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setLocation(tempLocation);
                        setIsMapOpen(false);
                      }}
                      className="bg-[#10b981] text-white px-6 py-4 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-white/20 backdrop-blur-md"
                    >
                      <Check className="w-4 h-4" /> CONFIRM LOCATION
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Initializing Explorer Engine...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-muted/20 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl border border-border shadow-sm">
                     <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Pinned Coordinates</p>
                    <p className="text-sm font-black text-foreground mt-1">{tempLocation || "Select a point on map"}</p>
                  </div>
               </div>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest max-w-[200px] text-center md:text-right hidden sm:block">
                 PIN THE CENTER OF THE AREA YOU WANT TO EXPLORE
               </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;

