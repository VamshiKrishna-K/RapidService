import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, MapPin, Star, Calendar, DollarSign, TrendingUp, Settings, Plus, Trash2, X, BarChart3, Loader2, User, LogOut } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import MapPickerModal from '../components/shared/MapPickerModal';

const PREDEFINED_SERVICES = [
  { name: "Cleaning", price: "200", duration: "1h", category: "Cleaning" },
  { name: "Repair", price: "200", duration: "1h", category: "Repair" },
  { name: "Painting", price: "200", duration: "1h", category: "Painting" },
  { name: "Electrician", price: "200", duration: "1h", category: "Electrician" },
  { name: "Salon", price: "200", duration: "1h", category: "Salon" },
  { name: "Moving", price: "200", duration: "1h", category: "Moving" },
  { name: "Gardening", price: "200", duration: "1h", category: "Gardening" },
  { name: "Security", price: "200", duration: "1h", category: "Security" },
];

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("bookings");
  const [user, setUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentPhone, setCurrentPhone] = useState("");
  const [serviceRadius, setServiceRadius] = useState(5); 
  const [markerPos, setMarkerPos] = useState([17.3850, 78.4867]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("1h");
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    completedJobs: 0,
    pendingBookings: 0,
    rating: 0,
    responseRate: 0,
  });
  
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchFreshProfile = async () => {
      const storedUser = localStorage.getItem("userInfo");
      if (!storedUser) {
        navigate("/login");
        return;
      }

      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      try {
        const { data } = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${parsed.token}` }
        });

        // Sync fresh data from server
        let finalAddress = data.address || "";
        
        // If address looks like coordinates, try to clean it up or fetch again
        if (finalAddress.includes(",") && !isNaN(parseFloat(finalAddress.split(",")[0]))) {
          try {
            const [lat, lng] = finalAddress.split(",");
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.trim()}&lon=${lng.trim()}`);
            const geoData = await geoRes.json();
            if (geoData && geoData.display_name) {
              finalAddress = geoData.display_name;
            }
          } catch (e) {
             console.log("Cleanup geocode failed");
          }
        }

        setCurrentLocation(finalAddress);
        setCurrentPhone(data.phone || "");
        if (data.serviceRadius) setServiceRadius(data.serviceRadius);
        if (data.location?.coordinates) {
          const [lng, lat] = data.location.coordinates;
          setMarkerPos([lat, lng]);
        }
        
        // Update user state and local storage with fresh info
        const updatedUser = { ...parsed, ...data };
        setUser(updatedUser);
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Error fetching fresh profile:", error);
        // Fallback to local storage data if server fetch fails
        setCurrentLocation(parsed.address || "");
        setCurrentPhone(parsed.phone || "");
        if (parsed.serviceRadius) setServiceRadius(parsed.serviceRadius);
        if (parsed.lat && parsed.lng) setMarkerPos([parsed.lat, parsed.lng]);
      }
    };

    fetchFreshProfile();
  }, [navigate]);

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

  useEffect(() => {
    const fetchStatsAndBookings = async () => {
      if (!user?.token) return;
      try {
        const { data: fetchedBookings } = await axios.get("http://localhost:5000/api/bookings", {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        setBookings(fetchedBookings);

        // Calculate Stats
        const completed = fetchedBookings.filter(b => b.status === 'completed');
        const pending = fetchedBookings.filter(b => b.status === 'pending');
        const totalEarnings = completed.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        
        setStats({
          totalEarnings: totalEarnings,
          monthlyEarnings: totalEarnings, // Simplified for now
          completedJobs: completed.length,
          pendingBookings: pending.length,
          rating: 4.8, // Static for now as not in schema
          responseRate: 98, // Static for now
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    if (user) fetchStatsAndBookings();
  }, [user]);

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      toast.success(`Booking ${status}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating booking status");
    }
  };

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
        {tab === "profile" && (
           <div className="animate-fade-up">
              <h2 className="text-2xl font-black text-foreground mb-8 uppercase tracking-widest">Business Identity</h2>
              <div className="bg-card border-2 border-border rounded-[2.5rem] p-10 shadow-xl space-y-10">
                  <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Operational Area (Map Hub)</label>
                              <input type="text" value={currentLocation} readOnly className="w-full pl-6 pr-6 py-4 bg-muted/10 border-2 border-border border-dashed rounded-2xl font-bold text-foreground outline-none mb-2" />
                              <button type="button" onClick={() => setIsMapOpen(true)} className="w-full py-5 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border border-primary/20 active:scale-95">
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
                             let lat = markerPos[0], lng = markerPos[1];
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
             <div className="bg-card border-2 border-border p-10 rounded-[3rem] shadow-2xl max-sm w-full text-center animate-in zoom-in-95 duration-300">
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

        {tab === "bookings" && (
          <div className="space-y-8 animate-fade-up">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-black text-foreground uppercase tracking-widest">Active Requests</h2>
            </div>
            {bookings.length === 0 ? (
              <div className="bg-card border-2 border-dashed border-border rounded-[3rem] p-16 text-center">
                 <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-6" />
                 <h3 className="text-xl font-bold text-foreground">No bookings yet</h3>
                 <p className="text-muted-foreground text-sm mt-2 font-medium">New job requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((b) => {
                  const isPaid = b.status === 'completed';
                  return (
                  <div key={b._id} className={`bg-card border-2 ${isPaid ? 'border-[#10b981] bg-[#10b981]/5 shadow-xl shadow-[#10b981]/20 scale-[1.01]' : 'border-border/50'} rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden`}>
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex items-start gap-6">
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border-2 transition-all ${isPaid ? 'bg-[#10b981] text-white border-[#10b981]/10' : 'bg-primary/10 text-primary border-primary/20'}`}>
                            {b.customer?.name?.charAt(0) || "U"}
                         </div>
                         <div>
                            <h4 className="text-xl font-black text-foreground tracking-tight uppercase">{b.service?.title}</h4>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1 mt-1">Client: {b.customer?.name}</p>
                            <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                               <MapPin className="w-3 h-3 text-accent" /> {b.customer?.address || "Location not provided"}
                            </p>
                            {b.customer?.phone && (
                               <p className="text-xs font-bold text-muted-foreground mt-1 tracking-widest uppercase">Phone: {b.customer.phone}</p>
                            )}
                         </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                         <div className="text-right mb-4">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Date</p>
                            <p className="font-bold text-foreground">{new Date(b.scheduleDate).toLocaleDateString()}</p>
                         </div>
                         <div className="flex items-center gap-3">
                            {b.status === "pending" ? (
                               <>
                                 <button onClick={() => handleUpdateBookingStatus(b._id, 'accepted')} className="bg-[#10b981] hover:bg-[#10b981]/90 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#10b981]/20 transition-all">Accept</button>
                                 <button onClick={() => handleUpdateBookingStatus(b._id, 'rejected')} className="bg-destructive hover:bg-destructive/90 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-destructive/20 transition-all">Reject</button>
                               </>
                            ) : (
                               <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] ${isPaid ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/30' : b.status === 'accepted' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' : b.status === 'completed' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                                 {isPaid ? 'Paid & Confirmed' : b.status}
                               </span>
                            )}
                         </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        )}
      </div>

      <MapPickerModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={(pos, addr) => {
          setMarkerPos(pos);
          setCurrentLocation(addr);
          setIsMapOpen(false);
        }}
        initialPos={markerPos}
        radius={serviceRadius}
        title="Set Service Hub"
        subTitle="Mark your central location"
        confirmText="Confirm Hub"
      />

      <div className="fixed bottom-0 left-0 right-0 bg-background/60 backdrop-blur-xl border-t border-border/50 z-30 px-4 py-4 pb-8 md:pb-4">
        <div className="container max-w-2xl mx-auto">
          <div className="grid grid-cols-4 p-1.5 bg-card/50 rounded-2xl border border-border/40 shadow-lg backdrop-blur-md">
            {[ { key: "bookings", icon: Calendar }, { key: "services", icon: Settings }, { key: "profile", icon: User } ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center justify-center h-12 rounded-xl transition-all ${tab === t.key ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-muted/50"}`}><t.icon className="w-5 h-5" /></button>
            ))}
            <button onClick={handleLogout} className="flex items-center justify-center h-12 rounded-xl text-destructive"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-card border-2 border-border w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-10 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter">Add Service</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-muted rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <p className="text-muted-foreground font-medium">Expand your business portfolio today</p>
            </div>

            <form onSubmit={handleAddService} className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Select Service Type</label>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                    className="w-full pl-6 pr-6 py-4 bg-background border-2 border-border rounded-2xl font-bold text-foreground text-left flex items-center justify-between group focus:border-primary transition-all"
                  >
                    {newServiceName || "Choose a service..."}
                    <Plus className={`w-5 h-5 transition-transform ${showServiceDropdown ? 'rotate-45' : ''}`} />
                  </button>
                  
                  {showServiceDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-card border-2 border-border rounded-2xl shadow-2xl z-[210] max-h-60 overflow-y-auto p-2 scrollbar-none animate-in slide-in-from-top-2">
                      {PREDEFINED_SERVICES.map((ps) => (
                        <button
                          key={ps.name}
                          type="button"
                          onClick={() => {
                            setNewServiceName(ps.name);
                            setNewServicePrice(ps.price);
                            setNewServiceDuration(ps.duration);
                            setShowServiceDropdown(false);
                          }}
                          className="w-full text-left px-5 py-3.5 rounded-xl hover:bg-muted text-sm font-bold transition-colors flex items-center justify-between group"
                        >
                          {ps.name}
                          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest bg-muted group-hover:bg-white px-2 py-1 rounded">₹{ps.price}/hr</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Price (₹ per hour)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-background border-2 border-border rounded-2xl font-bold text-foreground outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Est. Duration</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2h"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="w-full px-6 py-4 bg-background border-2 border-border rounded-2xl font-bold text-foreground outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl shadow-2xl shadow-primary/30 uppercase tracking-[0.2em] text-sm hover:translate-y-[-2px] transition-all active:scale-95 mt-4"
              >
                ACTIVATE SERVICE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
