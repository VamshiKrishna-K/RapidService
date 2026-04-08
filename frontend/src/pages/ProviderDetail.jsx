import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, MapPin, Shield, Star, MessageCircle, Calendar, Clock, Globe, User, Phone, X } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { mockProviders } from "@/lib/mock-data";

const containerStyle = {
  width: '100%',
  height: '100%'
};

const ProviderDetail = () => {
  const { id } = useParams();
  const provider = mockProviders.find((p) => p.id === id);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [tab, setTab] = useState("services");

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY"
  });

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
             <User className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Provider not found</h2>
          <Link to="/" className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Back to Explorer</Link>
        </div>
      </div>
    );
  }

  const center = {
    lat: provider.latitude || 17.3850,
    lng: provider.longitude || 78.4867
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent/20 opacity-50" />
        <div className="container relative z-10 py-10 md:py-20">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-white mb-10 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Search
          </Link>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-[3rem] blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden border-4 border-primary shadow-2xl">
                   <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
                </div>
                {provider.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-[#10b981] text-white p-2.5 rounded-2xl shadow-xl border-4 border-primary">
                    <CheckCircle className="w-6 h-6 fill-current" />
                  </div>
                )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">{provider.name}</h1>
                <span className="bg-accent/20 text-accent text-[10px] font-black px-4 py-2 rounded-xl border border-accent/30 uppercase tracking-[0.2em] shadow-sm">
                  Top Rated Professional
                </span>
              </div>
              <p className="text-lg text-primary-foreground/70 mb-8 max-w-2xl font-medium leading-relaxed italic">"{provider.bio}"</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground/90">
                <span className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10 shadow-sm"><Star className="w-4 h-4 fill-accent text-accent" /> {provider.rating} ({provider.reviewCount} Reviews)</span>
                <span className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10 shadow-sm"><MapPin className="w-4 h-4 text-accent" /> {provider.location}</span>
                <span className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10 shadow-sm"><Shield className="w-4 h-4 text-accent" /> {provider.completedJobs} Jobs Done</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex border-b border-border mb-12 overflow-x-auto scrollbar-hide gap-8">
              {(["services", "reviews", "location"]).map((t) => (
                <button 
                  key={t} 
                  onClick={() => setTab(t)} 
                  className={`pb-4 text-xs font-black uppercase tracking-[0.3em] border-b-4 transition-all whitespace-nowrap ${
                    tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "services" ? "Portfolio" : t === "reviews" ? `Reviews` : "Region Hub"}
                </button>
              ))}
            </div>

            {tab === "services" && (
              <div className="space-y-6 animate-fade-up">
                {provider.services.map((s, i) => (
                  <button 
                    key={s.name} 
                    onClick={() => setSelectedService(i)} 
                    className={`w-full group text-left p-8 rounded-[2.5rem] border-2 transition-all shadow-sm ${
                      selectedService === i 
                        ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" 
                        : "border-border hover:border-primary/40 bg-card hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${selectedService === i ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                          <Star className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="font-black text-xl text-foreground uppercase tracking-tight mb-1">{s.name}</h3>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.duration} duration</p>
                        </div>
                      </div>
                      <div className="text-3xl font-black text-foreground">₹{s.price}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {tab === "location" && (
              <div className="animate-fade-up">
                 <div className="bg-card border-2 border-border rounded-[3rem] overflow-hidden shadow-2xl h-[500px] relative group">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={15}
                        options={{ disableDefaultUI: true }}
                      >
                         <Marker position={center} />
                      </GoogleMap>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                         <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      </div>
                    )}
                 </div>
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-8 animate-fade-up">
                {provider.reviews.map((r) => (
                  <div key={r.user} className="bg-card border-2 border-border/50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg">{r.user.charAt(0)}</div>
                         <div>
                            <span className="font-black text-foreground uppercase tracking-tight block text-sm">{r.user}</span>
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{r.date}</span>
                         </div>
                      </div>
                      <div className="flex gap-1 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-current" : "text-muted/30"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-base font-medium leading-relaxed italic">"{r.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border-2 border-border rounded-[3rem] p-10 shadow-2xl sticky top-24 animate-fade-up">
               <div className="bg-primary/5 rounded-[2rem] p-6 mb-10 flex items-center gap-5 border border-primary/10">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                     <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                     <h3 className="font-black text-foreground uppercase tracking-tighter">Reserve Pro</h3>
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Instant Activation</p>
                  </div>
               </div>

               {selectedService !== null ? (
                 <div className="space-y-8">
                   <div className="bg-muted px-8 py-6 rounded-[2.5rem] border-2 border-border/50 shadow-inner">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Selected Work</p>
                     <p className="text-2xl font-black text-foreground uppercase tracking-tight line-clamp-1">{provider.services[selectedService].name}</p>
                     <p className="text-lg font-black text-primary mt-2">₹{provider.services[selectedService].price} <span className="text-xs text-muted-foreground uppercase">est. total</span></p>
                   </div>
                   
                   <div className="space-y-4">
                     <label className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] ml-2 block">Set Date</label>
                     <input type="date" className="w-full px-6 py-4 border-2 border-border rounded-2xl bg-background text-foreground font-bold outline-none focus:border-primary transition-all shadow-sm" />
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] ml-2 block">Available Windows</label>
                     <div className="grid grid-cols-2 gap-3">
                       {provider.availability?.map((slot) => (
                         <button 
                           key={slot} 
                           onClick={() => setSelectedSlot(slot)} 
                           className={`py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all shadow-sm ${selectedSlot === slot ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105" : "bg-background border-border hover:border-primary/30"}`}
                         >
                           {slot}
                         </button>
                       ))}
                     </div>
                   </div>

                   <Link 
                     to={`/booking/${provider.id}?service=${selectedService}&slot=${selectedSlot}`} 
                     className={`block w-full text-center py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl ${selectedSlot ? "bg-[#10b981] text-white shadow-green-500/20 hover:scale-105 active:scale-95" : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"}`}
                   >
                     Complete Booking
                   </Link>
                 </div>
               ) : (
                <div className="text-center py-12 space-y-6">
                  <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center mx-auto opacity-50">
                     <Clock className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed px-6 uppercase tracking-widest text-[9px]">Select a task from the portfolio to view real-time availability.</p>
                </div>
               )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderDetail;

