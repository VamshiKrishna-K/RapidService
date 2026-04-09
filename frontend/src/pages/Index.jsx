import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { Star, MapPin, CheckCircle, ArrowRight, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

const Index = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [searchMetadata, setSearchMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (service, lat, lng) => {
    setIsLoading(true);
    setSearchMetadata({ service, lat, lng });
    
    try {
      const { data } = await api.get("/services", {
        params: {
          category: service,
          lat,
          lng
        }
      });
      
      setSearchResults(data);
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero onSearch={handleSearch} />
      
      {searchResults ? (
        <section id="search-results" className="py-24 bg-muted/30">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-4xl font-black text-foreground uppercase tracking-tight mb-2">Available Professionals</h2>
                <p className="text-muted-foreground font-medium">
                  Showing {searchResults.length} {searchMetadata?.service || "top-rated"} providers near you
                </p>
              </div>
              <button 
                onClick={() => setSearchResults(null)}
                className="text-primary font-black uppercase tracking-widest text-xs hover:underline flex items-center gap-2"
              >
                Clear Results <X className="w-4 h-4" />
              </button>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="bg-card border-2 border-dashed border-border rounded-[3rem] p-20 text-center animate-fade-up">
                 <h3 className="text-2xl font-bold mb-4">No pros found in this area</h3>
                 <p className="text-muted-foreground max-w-md mx-auto mb-8">Try adjusting your search terms or expanding your search area on the map.</p>
                 <button onClick={() => setSearchResults(null)} className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">View All Categories</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((s) => (
                  <Link 
                    to={`/provider/${s.provider?._id}?serviceId=${s._id}`}
                    key={s._id} 
                    className="group bg-card border-2 border-border/50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all animate-fade-up overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg group-hover:scale-105 transition-transform bg-muted flex items-center justify-center font-black text-primary">
                        {s.provider?.name?.charAt(0)}
                      </div>
                      <div className="flex flex-col items-end">
                         <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                            {s.distance ? s.distance.toFixed(1) + " km" : "Local"}
                         </div>
                         <div className="flex items-center gap-1 mt-2 text-yellow-500 font-black">
                            <Star className="w-4 h-4 fill-current" /> {s.provider?.rating || "New"}
                         </div>
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight line-clamp-1">{s.provider?.name}</h3>
                        <CheckCircle className="w-5 h-5 text-[#10b981]" />
                      </div>
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">{s.category} • {s.title}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-foreground/70 font-medium mb-6">
                        <MapPin className="w-4 h-4 text-primary" /> {s.provider?.location?.coordinates ? "Available Nearby" : "Contact for location"}
                      </div>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-border">
                        <div>
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Starting from</p>
                           <p className="text-xl font-black text-foreground">₹{s.basePrice}<span className="text-xs text-muted-foreground font-bold">/{s.priceUnit === 'hourly' ? 'hr' : 'job'}</span></p>
                        </div>
                        <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-all">
                           <ArrowRight className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          <Categories />
          <HowItWorks />
          <Testimonials />
        </>
      )}
      <Footer />
    </div>
  );
};

export default Index;

