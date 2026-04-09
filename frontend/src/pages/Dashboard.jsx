import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Bell, User, MapPin, X, Check, Loader2, LogOut, Search, Phone, CheckCircle } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import api from "@/lib/api";
import { toast } from "sonner";

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 17.3850,
  lng: 78.4867
};

const libraries = ["places"];

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [tab, setTab] = useState("bookings");
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to RapidService! Complete your profile to get started.", time: "Connected", read: false }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [currentPhone, setCurrentPhone] = useState("");
  const [tempAddress, setTempAddress] = useState("");
  const [markerPos, setMarkerPos] = useState(defaultCenter);
  const [autocomplete, setAutocomplete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
    libraries: libraries
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      fetchUserProfile(parsed.token);
      fetchBookings(parsed.token);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserProfile = async (token) => {
    try {
      const { data } = await api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, ...data }));
      setCurrentAddress(data.address || "");
      setCurrentPhone(data.phone || "");
      if (data.lat && data.lng) {
        setMarkerPos({ lat: data.lat, lng: data.lng });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchBookings = async (token) => {
    try {
      const { data } = await api.get("/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onMarkerDragEnd = (e) => {
    if (e.latLng) {
      const nextPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(nextPos);
      setTempAddress(`${nextPos.lat.toFixed(4)}, ${nextPos.lng.toFixed(4)} (Location Pinned)`);
    }
  };

  const onMapClick = (e) => {
    if (e.latLng) {
      const nextPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(nextPos);
      setTempAddress(`${nextPos.lat.toFixed(4)}, ${nextPos.lng.toFixed(4)} (Location Pinned)`);
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
        setTempAddress(`${nextPos.lat.toFixed(4)}, ${nextPos.lng.toFixed(4)} (Location Pinned)`);
      }
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { longitude, latitude } = position.coords;
        const nextPos = { lat: latitude, lng: longitude };
        setMarkerPos(nextPos);
        setTempAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }, (error) => {
        console.error("Error getting location", error);
        toast.error("Unable to retrieve your location. Please check your browser permissions.");
      });
    }
  };

  const handleMapConfirm = () => {
    setCurrentAddress(tempAddress || "Selected Location, Hyderabad");
    setIsMapOpen(false);
    setTab("profile");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await api.put("/auth/profile", {
        name: user.name,
        phone: currentPhone,
        address: currentAddress,
        lat: markerPos.lat,
        lng: markerPos.lng
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setShowSuccessPopup(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
     localStorage.removeItem("userInfo");
     navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container py-8 md:flex md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000"></div>
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-2xl md:text-3xl font-black border-4 border-primary">
                {user.name?.charAt(0)}
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Hello, {user.name.split(' ')[0]}!</h1>
              <p className="text-primary-foreground/60 text-sm md:text-base font-medium">Manage your bookings and profile settings</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold transition-all border border-white/10">
               <LogOut className="w-5 h-5" /> Logout
             </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="hidden lg:block">
            <nav className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm sticky top-24">
              {[
                { key: "bookings", label: "My Bookings", icon: Calendar },
                { key: "notifications", label: "Notifications", icon: Bell, badge: notifications.filter(n => !n.read).length },
                { key: "profile", label: "Profile Settings", icon: User },
              ].map((item) => (
                <button 
                  key={item.key} 
                  onClick={() => setTab(item.key)} 
                  className={`w-full flex items-center gap-3 px-6 py-5 text-sm font-bold transition-all relative ${tab === item.key ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <item.icon className={`w-5 h-5 transition-transform ${tab === item.key ? "scale-110" : ""}`} />
                  {item.label}
                  {item.badge > 0 && <span className="ml-auto bg-accent text-accent-foreground text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-background">{item.badge}</span>}
                  {tab === item.key && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {tab === "bookings" && (
              <div className="animate-fade-up">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-foreground">My Bookings</h2>
                  <Link to="/" className="text-primary text-sm font-bold hover:underline">Find new services</Link>
                </div>
                
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-border animate-fade-in">
                      <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-bold text-foreground mb-2">No bookings yet</p>
                      <Link to="/" className="text-primary font-bold">Start exploring services</Link>
                    </div>
                  ) : (
                    bookings.map(booking => (
                      <div key={booking._id} className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                             <Calendar className="w-6 h-6" />
                           </div>
                           <div>
                             <h3 className="font-bold text-foreground">{booking.service?.title || "Unknown Service"}</h3>
                             <p className="text-sm text-muted-foreground font-medium">with {booking.provider?.name || "Professional"}</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                           <div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Date</p>
                             <p className="text-sm font-bold">{new Date(booking.scheduleDate).toLocaleDateString()}</p>
                           </div>
                           <div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                             <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                               {booking.status}
                             </span>
                           </div>
                           <div className="hidden md:block">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Price</p>
                             <p className="text-sm font-bold">₹{booking.totalAmount}</p>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === "notifications" && (
              <div className="animate-fade-up">
                <h2 className="text-2xl font-bold text-foreground mb-8">Notifications</h2>
                 <div className="space-y-4">
                  {notifications.map((n) => (
                    <div key={n.id} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${n.read ? "border-border bg-card/50 opacity-60" : "border-primary/20 bg-primary/5 shadow-sm"}`}>
                      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-muted-foreground/30" : "bg-primary shadow-sm"}`}></div>
                      <div className="flex-1">
                        <p className={`text-base leading-relaxed ${n.read ? "text-muted-foreground font-medium" : "text-foreground font-bold"}`}>{n.text}</p>
                        <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest block mt-2">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "profile" && (
              <div className="animate-fade-up">
                <h2 className="text-2xl font-bold text-foreground mb-8">Profile Settings</h2>
                <div className="bg-card border border-border rounded-3xl p-8">
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-sm font-black text-foreground uppercase tracking-wider">Full Name</label>
                        <input 
                          type="text" 
                          value={user?.name || ""}
                          onChange={(e) => setUser({ ...user, name: e.target.value })}
                          className="w-full px-5 py-4 border-2 border-border rounded-2xl bg-background text-foreground font-bold outline-none focus:border-primary transition-all" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-black text-foreground uppercase tracking-wider">Email Address</label>
                        <input 
                          type="email" 
                          value={user?.email || ""}
                          disabled
                          className="w-full px-5 py-4 border-2 border-border rounded-2xl bg-muted/30 text-muted-foreground font-bold border-dashed opacity-70 cursor-not-allowed" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-black text-foreground uppercase tracking-wider">Phone Number</label>
                        <div className="relative">
                           <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                           <input 
                             type="tel" 
                             placeholder="Your phone number"
                             value={currentPhone}
                             onChange={(e) => setCurrentPhone(e.target.value)}
                             className="w-full pl-12 pr-5 py-4 border-2 border-border rounded-2xl bg-background text-foreground font-bold outline-none focus:border-primary transition-all" 
                           />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-black text-foreground uppercase tracking-wider">City</label>
                        <input 
                          type="text" 
                          value="Hyderabad"
                          disabled
                          className="w-full px-5 py-4 border-2 border-border rounded-2xl bg-muted/30 text-muted-foreground font-bold border-dashed opacity-70 cursor-not-allowed" 
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-foreground uppercase tracking-wider">Home Address</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input 
                          type="text" 
                          value={currentAddress}
                          readOnly
                          className="flex-1 px-5 py-4 border-2 border-border rounded-2xl bg-muted/30 text-foreground font-semibold outline-none border-dashed" 
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            setTempAddress(currentAddress);
                            setIsMapOpen(true);
                          }}
                          className="flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          <MapPin className="w-4 h-4" /> Pick on Map
                        </button>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full md:w-fit bg-[#10b981] text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-green-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        Save Account Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Map Picker Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] animate-fade-up">
            <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <MapPin className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Set Your Delivery Point</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Pin your exact home for our pros</p>
                </div>
              </div>

              {isLoaded && (
                <div className="flex-1 max-w-sm w-full">
                   <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                     <div className="relative">
                       <input
                         type="text"
                         placeholder="Search your street..."
                         className="w-full pl-11 pr-4 py-4 bg-muted/50 border-2 border-border rounded-2xl text-sm font-bold shadow-sm outline-none focus:border-primary transition-all"
                       />
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     </div>
                   </Autocomplete>
                </div>
              )}
              <button onClick={() => setIsMapOpen(false)} className="p-3 hover:bg-muted rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 relative overflow-hidden bg-muted">
              {isLoaded ? (
                <>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPos}
                    zoom={15}
                    onClick={onMapClick}
                    options={{ disableDefaultUI: true }}
                  >
                    <Marker position={markerPos} draggable={true} onDragEnd={onMarkerDragEnd} />
                  </GoogleMap>
                  
                  <div className="absolute bottom-6 right-6 flex items-center gap-3">
                    <button 
                      onClick={handleLocateMe}
                      className="w-12 h-12 bg-white text-primary rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all border border-border"
                    >
                      <MapPin className="w-6 h-6" />
                    </button>
                    
                    <button 
                      onClick={handleMapConfirm}
                      className="bg-[#10b981] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                    >
                      Confirm This Spot
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-card border-2 border-border p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-4">Updated successfully!</h3>
            <button onClick={() => setShowSuccessPopup(false)} className="w-full bg-primary text-primary-foreground font-black py-4 rounded-2xl shadow-xl shadow-primary/20 uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-50 px-6 py-4">
        <div className="flex items-center justify-between">
          {[
            { key: "bookings", icon: Calendar },
            { key: "notifications", icon: Bell },
            { key: "profile", icon: User },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`p-3 rounded-2xl transition-all ${tab === item.key ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground"}`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
          <button onClick={handleLogout} className="p-3 rounded-2xl text-destructive">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

