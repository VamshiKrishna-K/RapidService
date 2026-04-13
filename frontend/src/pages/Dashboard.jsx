import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Bell, User, MapPin, X, Loader2, LogOut, Search, Phone, CheckCircle, Check, Shield } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import MapPickerModal from '../components/shared/MapPickerModal';

const defaultCenter = [17.3850, 78.4867];

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
  const [markerPos, setMarkerPos] = useState(defaultCenter);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);

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
        setMarkerPos([data.lat, data.lng]);
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await api.put("/auth/profile", {
        name: user.name,
        phone: currentPhone,
        address: currentAddress,
        lat: markerPos[0],
        lng: markerPos[1]
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
              {user?.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-accent-foreground px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-accent/20">
                  <Shield className="w-5 h-5" /> System Management
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold transition-all border border-white/10">
                <LogOut className="w-5 h-5" /> Logout
              </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                    bookings.map(booking => {
                      const isPaid = booking.status === 'completed';
                      return (
                      <div 
                        key={booking._id} 
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsTransactionOpen(true);
                        }}
                        className={`bg-card border-2 ${isPaid ? 'border-[#10b981] bg-[#10b981]/5 shadow-xl shadow-[#10b981]/20 scale-[1.01]' : 'border-border hover:border-primary/30'} rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all cursor-pointer group`}
                      >
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isPaid ? 'bg-[#10b981] text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                             <Calendar className="w-6 h-6" />
                           </div>
                           <div>
                             <h3 className={`font-bold transition-colors ${isPaid ? 'text-[#10b981]' : 'text-foreground group-hover:text-primary'}`}>{booking.service?.title || "Unknown Service"}</h3>
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
                             <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${isPaid ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/30' : booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                               {isPaid ? 'Paid & Confirmed' : booking.status}
                             </span>
                           </div>
                           <div className="hidden md:block">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Price</p>
                             <p className="text-sm font-bold">₹{booking.totalAmount}</p>
                           </div>
                        </div>
                      </div>
                    )})
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
                          onClick={() => setIsMapOpen(true)}
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

      <MapPickerModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={(pos, addr) => {
          setMarkerPos(pos);
          setCurrentAddress(addr);
          setIsMapOpen(false);
          setTab("profile");
        }}
        initialPos={markerPos}
        radius={null}
        title="Set Delivery point"
        subTitle="Pin your exact location"
        confirmText="Confirm Spot"
      />

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

      {/* Transaction Page Modal */}
      {isTransactionOpen && selectedBooking && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-xl z-[300] overflow-y-auto p-4 sm:p-6 flex justify-center animate-in fade-in duration-500">
           <div className="bg-card border-4 border-border/50 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.1)] max-w-2xl w-full relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-20 duration-500 my-auto h-fit">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
              
              <button 
                onClick={() => setIsTransactionOpen(false)}
                className="absolute top-10 right-10 w-12 h-12 bg-muted rounded-full flex items-center justify-center hover:bg-destructive hover:text-white transition-all z-20"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-10 md:p-16">
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b-4 border-border border-dashed pb-12">
                    <div>
                        <div className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] w-fit mb-6">Confirmed Order</div>
                        <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter mb-2">Transaction Detail</h2>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Reference: RS-{selectedBooking._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Booking Date</p>
                        <p className="text-lg font-black text-foreground">{new Date(selectedBooking.scheduleDate).toLocaleDateString()}</p>
                    </div>
                 </div>

                 <div className="space-y-12">
                    <div>
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6">Professional Intelligence</h4>
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center font-black text-primary text-3xl border-2 border-primary/20">
                                {selectedBooking.provider?.name?.charAt(0)}
                            </div>
                            <div>
                                <h5 className="text-2xl font-black text-foreground uppercase tracking-tight">{selectedBooking.provider?.name}</h5>
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                   <MapPin className="w-3 h-3" /> {selectedBooking.provider?.address || "Main Site"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted px-10 py-8 rounded-[3rem] space-y-6">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Billing Ledger</h4>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                              <span className="text-muted-foreground">{selectedBooking.service?.title} Labor</span>
                              <span className="text-foreground">₹{selectedBooking.totalAmount - 50}</span>
                           </div>
                           <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                              <span className="text-muted-foreground">Platform Access Fee</span>
                              <span className="text-foreground">₹50</span>
                           </div>
                           <div className="border-t-2 border-border pt-6 mt-6 flex justify-between items-center">
                              <div>
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Authorized</p>
                                 <p className="text-4xl font-black text-primary uppercase">₹{selectedBooking.totalAmount}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {selectedBooking?.status === 'completed' ? (
                                  <div className="bg-[#10b981] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-[#10b981]/20 animate-pulse">
                                     <Check className="w-4 h-4" /> Payment Verified
                                  </div>
                                ) : selectedBooking?.status === 'accepted' ? (
                                  <button 
                                    onClick={() => navigate('/payment', { state: { bookingData: selectedBooking, providerName: selectedBooking.provider?.name, price: selectedBooking.totalAmount, isPaymentRetry: true } })}
                                    className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                                  >
                                    Pay Now
                                  </button>
                                ) : (
                                  <div className="bg-amber-100 text-amber-700 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px]">
                                     Waiting for Acceptance...
                                  </div>
                                )}
                              </div>
                           </div>
                        </div>
                    </div>
                 </div>

                 <div className="mt-16 flex justify-center">
                    <button onClick={() => setIsTransactionOpen(false)} className="bg-foreground text-background font-black px-12 py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all">Close Record</button>
                 </div>
              </div>
           </div>
        </div>
      )}

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
