import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, MapPin, Star, Calendar, Clock, DollarSign, TrendingUp, Settings, Plus, Trash2, X, BarChart3, Loader2, User, Check, LogOut, Sparkles, Search } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker, Circle, Autocomplete } from '@react-google-maps/api';
import axios from "axios";
import { toast } from "sonner";

const PREDEFINED_SERVICES = [
  { name: "Full Home Cleaning", price: "25", duration: "4h+", category: "Cleaning" },
  { name: "Deep Kitchen Cleaning", price: "40", duration: "2h", category: "Cleaning" },
  { name: "Bathroom Sanitization", price: "20", duration: "1h", category: "Cleaning" },
  { name: "Emergency Plumbing", price: "80", duration: "1h", category: "Repair" },
  { name: "Pipe Leakage Fix", price: "45", duration: "1h", category: "Repair" },
  { name: "Tap & Shower Install", price: "30", duration: "1h", category: "Repair" },
  { name: "AC Deep Servicing", price: "60", duration: "2h", category: "Appliance" },
  { name: "Refrigerator Repair", price: "55", duration: "2h", category: "Appliance" },
  { name: "Washing Machine Fix", price: "50", duration: "1h", category: "Appliance" },
  { name: "Fan & Light Fitting", price: "30", duration: "1h", category: "Repair" },
  { name: "Switchboard Repair", price: "35", duration: "1h", category: "Repair" },
  { name: "Haircut for Men", price: "15", duration: "1h", category: "Beauty" },
  { name: "Salon Face Cleanup", price: "25", duration: "1h", category: "Beauty" },
  { name: "Full Room Painting", price: "100", duration: "4h+", category: "Home" },
  { name: "Furniture Assembly", price: "40", duration: "2h", category: "Repair" },
  { name: "Door Lock Repair", price: "35", duration: "1h", category: "Repair" },
];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 17.3850,
  lng: 78.4867
};

const libraries = ["places"];

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentPhone, setCurrentPhone] = useState("");
  const [serviceRadius, setServiceRadius] = useState(5); 
  const [tempAddress, setTempAddress] = useState("");
  const [tempRadius, setTempRadius] = useState(5);
  const [markerPos, setMarkerPos] = useState(defaultCenter);
  const [autocomplete, setAutocomplete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("1h");
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
    libraries: libraries
  });

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
        setTempAddress(`${nextPos.lat.toFixed(4)}, ${nextPos.lng.toFixed(4)}`);
      }
    }
  };

  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    completedJobs: 0,
    pendingBookings: 0,
    rating: 0,
    responseRate: 0,
  });
  
  const [services, setServices] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setCurrentLocation(parsed.address || "");
      setCurrentPhone(parsed.phone || "");
      if (parsed.serviceRadius) setServiceRadius(parsed.serviceRadius);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { longitude, latitude } = position.coords;
        const nextPos = { lat: latitude, lng: longitude };
        setMarkerPos(nextPos);
        setTempAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }, (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to retrieve your location.");
      });
    }
  };

  const onMarkerDragEnd = (e) => {
    if (e.latLng) {
      const nextPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(nextPos);
      setTempAddress(`${nextPos.lat.toFixed(4)}, ${nextPos.lng.toFixed(4)}`);
    }
  };

  const onMapClick = (e) => {
    if (e.latLng) {
      const nextPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(nextPos);
      setTempAddress(`${nextPos.lat.toFixed(4)}, ${nextPos.lng.toFixed(4)}`);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      if (!user?.token) return;
      try {
        const { data } = await axios.get("http://localhost:5000/api/services", {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const myServices = data
          .filter((s) => s.provider?._id === user._id || s.provider === user._id)
          .map((s) => ({
            _id: s._id,
            name: s.title,
            price: s.basePrice,
            duration: s.description,
          }));
        setServices(myServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    if (user) fetchServices();
  }, [user]);

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice || !user?.token) return;

    try {
      const predefined = PREDEFINED_SERVICES.find(ps => ps.name === newServiceName);
      const category = predefined ? predefined.category : "General";

      const serviceData = {
        title: newServiceName,
        basePrice: Number(newServicePrice),
        description: newServiceDuration,
        category: category,
        priceUnit: 'hourly'
      };

      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      const { data } = await axios.post("http://localhost:5000/api/services", serviceData, config);

      const newService = {
        _id: data._id,
        name: data.title,
        price: data.basePrice,
        duration: data.description,
      };

      setServices((prev) => [...prev, newService]);
      setNewServiceName("");
      setNewServicePrice("");
      setNewServiceDuration("1h");
      setIsAddModalOpen(false);
      toast.success("Service activated on network!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding service");
    }
  };

  const removeService = async (id) => {
    if (!user?.token) return;
    try {
       await axios.delete(`http://localhost:5000/api/services/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
       });
       setServices((prev) => prev.filter((s) => s._id !== id));
       toast.success("Service removed from network");
    } catch (error) {
       toast.error(error.response?.data?.message || "Error removing service");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent/20 opacity-30" />
        <div className="container relative z-10 py-10 md:py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center text-4xl font-black border-2 border-white/20 shadow-2xl backdrop-blur-md">
                 {user.name.charAt(0)}
               </div>
               <div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">{user.name}</h1>
                  <p className="text-primary-foreground/60 text-sm font-bold tracking-widest uppercase">Certified Professional Partner</p>
               </div>
            </div>
            <Link to="/" className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all backdrop-blur-md border border-white/10">
               Live View
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-10 max-w-5xl mx-auto">
        {tab === "overview" && (
          <div className="space-y-10 animate-fade-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Earnings", value: `$${stats.monthlyEarnings}`, icon: DollarSign, color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
                { label: "Jobs", value: stats.completedJobs, icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" },
                { label: "Rating", value: stats.rating || "New", icon: Star, color: "text-accent", bg: "bg-accent/10" },
                { label: "Response", value: `${stats.responseRate}%`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
              ].map((s) => (
                <div key={s.label} className="bg-card border-2 border-border/50 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all hover:translate-y-[-4px]">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                        <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</span>
                  </div>
                  <div className="text-2xl font-black text-foreground tracking-tight">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "profile" && (
           <div className="animate-fade-up">
              <h2 className="text-2xl font-black text-foreground mb-8 uppercase tracking-widest">Business Identity</h2>
              <div className="bg-card border-2 border-border rounded-[2.5rem] p-10 shadow-xl space-y-10">
                  <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Operational Area (Map Hub)</label>
                              <input type="text" value={currentLocation} readOnly className="w-full pl-6 pr-6 py-4 bg-muted/10 border-2 border-border border-dashed rounded-2xl font-bold text-foreground outline-none mb-2" />
                              <button type="button" onClick={() => { setTempRadius(serviceRadius); setIsMapOpen(true); }} className="w-full py-5 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border border-primary/20 active:scale-95">
                                 <MapPin className="w-5 h-5" /> SET HUB ON INTERACTIVE MAP
                              </button>
                          </div>
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Service Radius (km)</label>
                              <div className="flex items-center gap-4 w-full pl-6 pr-6 py-4 bg-background border-2 border-border rounded-2xl focus-within:border-primary transition-all">
                                <input type="range" min="1" max="50" value={serviceRadius} onChange={(e) => setServiceRadius(Number(e.target.value))} className="w-full accent-primary" />
                                <span className="font-black text-foreground min-w-[3rem] text-right">{serviceRadius} km</span>
                              </div>
                          </div>
                      </div>
                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Contact Phone Number</label>
                          <input type="tel" placeholder="+91 00000 00000" value={currentPhone} onChange={(e) => setCurrentPhone(e.target.value)} className="w-full pl-6 pr-6 py-4 bg-background border-2 border-border rounded-2xl font-bold text-foreground outline-none focus:border-primary transition-all" />
                      </div>
                       <button type="button" disabled={isSaving} onClick={async () => {
                           setIsSaving(true);
                           try {
                             let lat = 0, lng = 0;
                             if (currentLocation.includes(",")) {
                               const parts = currentLocation.split(",");
                               lat = parseFloat(parts[0].trim()) || 0;
                               lng = parseFloat(parts[1].trim()) || 0;
                             }
                             const config = { headers: { Authorization: `Bearer ${user.token}` } };
                             const { data } = await axios.put("http://localhost:5000/api/auth/profile", { name: user.name, phone: currentPhone, address: currentLocation, serviceRadius: serviceRadius, lat, lng }, config);
                             const updatedUser = { ...user, ...data };
                             setUser(updatedUser);
                             localStorage.setItem("userInfo", JSON.stringify(updatedUser));
                             setShowSuccessPopup(true);
                           } catch (error) {
                             toast.error(error.response?.data?.message || "Error syncing profile");
                           } finally {
                             setIsSaving(false);
                           }
                         }}
                         className="bg-primary text-primary-foreground font-black px-12 py-5 rounded-2xl shadow-2xl shadow-primary/30 uppercase tracking-widest text-sm hover:translate-y-[-2px] transition-all active:scale-95 flex items-center justify-center gap-2"
                       >
                          {isSaving ? <> <Loader2 className="w-5 h-5 animate-spin" /> Synchronizing... </> : "SAVE"}
                       </button>
                  </form>
              </div>
           </div>
        )}

        {showSuccessPopup && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="bg-card border-2 border-border p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                   <CheckCircle className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-4">Profile Synchronized!</h3>
                <button onClick={() => setShowSuccessPopup(false)} className="w-full bg-primary text-primary-foreground font-black py-4 rounded-2xl shadow-xl shadow-primary/20 uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all">
                   Continue
                </button>
             </div>
          </div>
        )}

        {tab === "services" && (
          <div className="space-y-8 animate-fade-up">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-black text-foreground uppercase tracking-widest">Service Portfolio</h2>
               <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                 <Plus className="w-4 h-4" /> Add Service
               </button>
            </div>
            {services.length === 0 ? (
              <div className="bg-card border-2 border-dashed border-border rounded-[3rem] p-16 text-center">
                 <Settings className="w-10 h-10 text-muted-foreground/30 mx-auto mb-6" />
                 <h3 className="text-xl font-bold text-foreground">No services added yet</h3>
                 <button onClick={() => setIsAddModalOpen(true)} className="text-primary font-black uppercase tracking-widest text-xs mt-4">Create your first service →</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {services.map((s) => (
                  <div key={s._id} className="bg-card border-2 border-border/50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <h4 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">{s.name}</h4>
                        <div className="flex items-center gap-4">
                           <span className="text-xs font-black tracking-widest bg-muted/50 px-3 py-1 rounded-lg">₹{s.price}/hr</span>
                           <span className="text-xs font-black tracking-widest bg-muted/50 px-3 py-1 rounded-lg">{s.duration}</span>
                        </div>
                      </div>
                      <button onClick={() => removeService(s._id)} className="p-3 text-muted-foreground hover:text-white hover:bg-destructive rounded-2xl transition-all bg-muted/30 border border-border">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isMapOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
          <div className="bg-card border-2 border-border w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl h-[85vh] flex flex-col animate-fade-up">
             <div className="p-8 border-b border-border flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/30">
                {isLoaded && (
                  <div className="flex-1 max-w-sm w-full">
                     <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input type="text" placeholder="Search for a location..." className="block w-full pl-11 pr-4 py-4 bg-white/50 border-2 border-white/20 rounded-2xl text-sm font-bold outline-none" />
                        </div>
                     </Autocomplete>
                  </div>
                )}
                <button onClick={() => setIsMapOpen(false)} className="p-4 hover:bg-muted rounded-3xl transition-all"> <X className="w-8 h-8" /> </button>
             </div>
             <div className="flex-1 relative bg-muted">
                {isLoaded ? (
                  <>
                    <GoogleMap mapContainerStyle={mapContainerStyle} center={markerPos} zoom={14} onClick={onMapClick} options={{ disableDefaultUI: true }}>
                      <Marker position={markerPos} draggable={true} onDragEnd={onMarkerDragEnd} />
                      <Circle center={markerPos} radius={serviceRadius * 1000} options={{ fillColor: '#10b981', fillOpacity: 0.15, strokeColor: '#10b981', strokeWeight: 1, clickable: false }} />
                    </GoogleMap>
                    <div className="absolute bottom-6 right-6 flex gap-3">
                      <button onClick={handleLocateMe} className="w-12 h-12 bg-white text-primary rounded-2xl shadow-xl flex items-center justify-center border-2 border-border"><MapPin className="w-6 h-6" /></button>
                      <button onClick={() => { setCurrentLocation(tempAddress || currentLocation); setIsMapOpen(false); }} className="bg-[#10b981] text-white px-6 py-4 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] shadow-xl">CONFIRM HUB</button>
                    </div>
                  </>
                ) : <div className="flex items-center justify-center h-full"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}
             </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-4">
           <div className="bg-card border-2 border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-up">
              <div className="p-8 border-b border-border flex items-center justify-between">
                 <h3 className="text-xl font-black uppercase">Expand Portfolio</h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all"> <X className="w-6 h-6" /> </button>
              </div>
              <div className="p-8 space-y-6">
                  <form onSubmit={handleAddService} className="space-y-6">
                    <div className="relative">
                        <input type="text" placeholder="Service Name" value={newServiceName} onFocus={() => setShowServiceDropdown(true)} onChange={(e) => setNewServiceName(e.target.value)} onBlur={() => setTimeout(() => setShowServiceDropdown(false), 200)} className="w-full px-6 py-4 bg-muted/30 border-2 border-border rounded-2xl font-bold outline-none" />
                        {showServiceDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-3xl shadow-2xl z-[160] max-h-48 overflow-y-auto">
                             {PREDEFINED_SERVICES.filter(s => s.name.toLowerCase().includes(newServiceName.toLowerCase())).map((s) => (
                                <button key={s.name} type="button" onClick={() => { setNewServiceName(s.name); setNewServicePrice(s.price); setNewServiceDuration(s.duration); setShowServiceDropdown(false); }} className="w-full text-left px-6 py-4 hover:bg-muted font-bold">{s.name}</button>
                             ))}
                          </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <input type="number" placeholder="Price / hr" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} className="w-full px-6 py-4 bg-muted/30 border-2 border-border rounded-2xl font-bold outline-none" />
                       <select value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} className="w-full px-6 py-4 bg-muted/30 border-2 border-border rounded-2xl font-bold outline-none appearance-none">
                          <option value="1h">1 Hour</option>
                          <option value="2h">2 Hours</option>
                          <option value="3h">3 Hours</option>
                          <option value="4h+">4+ Hours</option>
                       </select>
                    </div>
                    <button type="submit" className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs">Activate</button>
                  </form>
              </div>
           </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-background/60 backdrop-blur-xl border-t border-border/50 z-30 px-4 py-4 pb-8 md:pb-4">
        <div className="container max-w-2xl mx-auto">
          <div className="grid grid-cols-5 p-1.5 bg-card/50 rounded-2xl border border-border/40 shadow-lg backdrop-blur-md">
            {[ { key: "overview", icon: BarChart3 }, { key: "bookings", icon: Calendar }, { key: "services", icon: Settings }, { key: "profile", icon: User } ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center justify-center h-12 rounded-xl transition-all ${tab === t.key ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-muted/50"}`}><t.icon className="w-5 h-5" /></button>
            ))}
            <button onClick={handleLogout} className="flex items-center justify-center h-12 rounded-xl text-destructive"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;

