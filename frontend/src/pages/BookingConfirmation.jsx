import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle, MapPin, Clock, CreditCard, Shield, X, Loader2 } from "lucide-react";
import { mockProviders } from "@/lib/mock-data";

const BookingConfirmation = () => {
  const { providerId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const serviceIndex = parseInt(queryParams.get("service") || "0");
  const slot = queryParams.get("slot") || "Not selected";

  const provider = mockProviders.find((p) => p.id === providerId);
  const [step, setStep] = useState("review");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-up">
           <X className="w-16 h-16 text-destructive mx-auto mb-6" />
           <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Session Expired</h2>
           <p className="text-muted-foreground mb-8">No provider found for this booking session.</p>
           <Link to="/" className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Return Home</Link>
        </div>
      </div>
    );
  }

  const service = provider.services[serviceIndex] || provider.services[0];

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep("confirmed");
    }, 2000);
  };

  if (step === "confirmed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md animate-fade-up">
          <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter mb-4">You're All Set!</h1>
          <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
            Your appointment with <span className="text-foreground font-bold">{provider.name}</span> has been locked in. Prepare for excellence!
          </p>
          <div className="bg-card border-2 border-border rounded-[2.5rem] p-8 text-left mb-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
            <div className="flex items-center gap-5 mb-8 relative z-10">
              <img src={provider.avatar} alt={provider.name} className="w-16 h-16 rounded-2xl border-2 border-border" />
              <div>
                <h3 className="font-black text-foreground uppercase tracking-tight">{provider.name}</h3>
                <p className="text-xs font-black text-primary uppercase tracking-widest">{service.name}</p>
              </div>
            </div>
            <div className="space-y-4 text-xs font-black uppercase tracking-widest relative z-10">
              <div className="flex justify-between border-b border-border pb-4"><span className="text-muted-foreground">Schedule</span><span className="text-foreground">{slot}</span></div>
              <div className="flex justify-between border-b border-border pb-4"><span className="text-muted-foreground">Investment</span><span className="text-foreground">₹{service.price}</span></div>
              <div className="flex justify-between pt-2"><span className="text-muted-foreground">Status</span><span className="text-[#10b981]">Confirmed</span></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/dashboard" className="flex-1 bg-primary text-primary-foreground font-black py-5 rounded-2xl shadow-xl shadow-primary/20 uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all">Go to Dashboard</Link>
            <Link to="/chat" className="flex-1 border-2 border-border text-foreground font-black py-5 rounded-2xl uppercase tracking-widest text-xs hover:bg-muted transition-all">Message Pro</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-xl">
        <div className="container py-10">
          <Link to={`/provider/${provider.id}`} className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tight">{step === "review" ? "Confirm Reservation" : "Secure Payment"}</h1>
        </div>
      </header>

      <main className="container py-12 max-w-3xl">
        {/* Progress Stepper */}
        <div className="flex items-center gap-4 mb-12">
          {["Review", "Payment", "Confirm"].map((s, i) => (
            <div key={s} className="flex flex-col gap-2 flex-1">
              <div className={`h-2 rounded-full transition-all duration-500 ${ (i === 0 && step === "review") || (i <= 1 && step === "payment") ? "bg-[#10b981]" : "bg-muted" }`}></div>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${ (i === 0 && step === "review") || (i <= 1 && step === "payment") ? "text-foreground" : "text-muted-foreground" }`}>{s}</span>
            </div>
          ))}
        </div>

        {step === "review" && (
          <div className="space-y-8 animate-fade-up">
            <div className="bg-card border-2 border-border rounded-[3rem] p-10 shadow-sm">
              <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                 <div className="w-2 h-2 bg-primary rounded-full"></div> Service Summary
              </h3>
              <div className="flex items-center gap-6 mb-10">
                <img src={provider.avatar} alt={provider.name} className="w-20 h-20 rounded-[1.5rem] border-2 border-border" />
                <div>
                  <h4 className="text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                    {provider.name} {provider.verified && <CheckCircle className="w-5 h-5 text-[#10b981]" />}
                  </h4>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{provider.category} Specialist</p>
                </div>
              </div>
              <div className="space-y-6 border-t-2 border-border border-dashed pt-8">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Selected Task</span><span className="text-sm font-black text-foreground uppercase">{service.name}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Duration</span><span className="text-sm font-black text-foreground uppercase">{service.duration}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Service Hub</span><span className="text-sm font-black text-foreground uppercase">{provider.location}</span></div>
              </div>
            </div>

            <div className="bg-card border-2 border-border rounded-[3rem] p-10 shadow-sm transition-all hover:shadow-xl">
              <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-8">Billing Breakdown</h3>
              <div className="space-y-4 text-xs font-black uppercase tracking-widest">
                <div className="flex justify-between"><span className="text-muted-foreground">Base Labor</span><span className="text-foreground">₹{service.price}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Platform Access</span><span className="text-foreground">₹50</span></div>
                <div className="border-t-2 border-border pt-6 mt-4 flex justify-between items-center">
                   <span className="text-foreground text-sm">Total Investment</span>
                   <span className="text-3xl font-black text-primary">₹{parseInt(service.price) + 50}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setStep("payment")} className="w-full bg-primary text-primary-foreground font-black py-6 rounded-2xl shadow-2xl shadow-primary/20 uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all">
              Proceed to Secure Payment
            </button>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-8 animate-fade-up">
            <div className="bg-card border-2 border-border rounded-[3rem] p-10 shadow-xl">
              <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                 <CreditCard className="w-5 h-5 text-primary" /> Credit or Debit Card
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Card Holder Name</label>
                  <input type="text" placeholder="FULL NAME" className="w-full px-6 py-4 bg-muted/50 border-2 border-border rounded-2xl font-black outline-none focus:border-primary transition-all uppercase placeholder:opacity-30" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Card Identification</label>
                  <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full px-6 py-4 bg-muted/50 border-2 border-border rounded-2xl font-black outline-none focus:border-primary transition-all placeholder:opacity-30" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Expiration</label>
                    <input type="text" placeholder="MM/YY" className="w-full px-6 py-4 bg-muted/50 border-2 border-border rounded-2xl font-black outline-none focus:border-primary transition-all placeholder:opacity-30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Security Code</label>
                    <input type="text" placeholder="CVC" className="w-full px-6 py-4 bg-muted/50 border-2 border-border rounded-2xl font-black outline-none focus:border-primary transition-all placeholder:opacity-30" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50/50 border-2 border-green-100 rounded-[2rem] p-8 flex items-start gap-4">
              <Shield className="w-6 h-6 text-[#10b981] shrink-0 mt-0.5" />
              <p className="text-xs text-green-800 font-bold uppercase tracking-widest leading-relaxed">
                Vault Security Active. Your funds are protected. Authorization only today; funds are transferred only upon service completion.
              </p>
            </div>

            <button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="w-full bg-[#10b981] text-white font-black py-6 rounded-2xl shadow-2xl shadow-green-500/20 uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
              {isProcessing ? "Authorizing Vault..." : `Authorize Payment (₹${parseInt(service.price) + 50})`}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingConfirmation;

