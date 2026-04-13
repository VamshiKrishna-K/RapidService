import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { QrCode, ShieldCheck, Loader2, IndianRupee, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!location.state || !location.state.bookingData) {
    return <Navigate to="/" replace />;
  }

  const { bookingData, providerName, price } = location.state;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      // Update the existing pending booking to 'paid' status
      await api.post("/bookings/verify", {
        is_mock_payment: true,
        bookingId: bookingData._id
      });
      
      toast.success("Transaction Successful!", {
        description: `Payment of ₹${price} deposited to secure your booking.`,
        duration: 4000
      });

      // Navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Payment sync failed:", error);
      toast.error(error.response?.data?.message || "Payment synchronization failed");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6 pb-20">
        <div className="max-w-md w-full animate-fade-up">
          <div className="text-center mb-10">
             <div className="w-16 h-16 bg-[#10b981]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#10b981]/10">
                <ShieldCheck className="w-8 h-8 text-[#10b981]" />
             </div>
             <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-2">Secure Checkout</h1>
             <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">RapidService Escrow Protection</p>
          </div>

          <div className="bg-card border-4 border-border/50 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden mb-8">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 rounded-full -mr-16 -mt-16"></div>
             
             <div className="text-center mb-10 relative z-10">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4">Total Authorized Amount</p>
                <div className="flex items-center justify-center text-6xl font-black text-[#10b981]">
                   <IndianRupee className="w-10 h-10 -mt-2 mr-1" />
                   {price}
                </div>
                <p className="text-xs font-bold text-foreground mt-4 uppercase tracking-widest bg-muted/50 inline-block px-4 py-2 rounded-xl">To: {providerName}</p>
             </div>

             <div className="bg-white p-6 rounded-3xl border-2 border-border/30 mx-auto w-48 h-48 flex items-center justify-center shadow-inner relative z-10">
                <QrCode className="w-32 h-32 text-slate-800" />
             </div>
             
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center mt-6">Scan with any UPI App</p>
          </div>

          <button 
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full bg-[#10b981] hover:bg-[#0ea5e9] text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-[#10b981]/20 uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Transfer...</>
            ) : (
              <><ShieldCheck className="w-5 h-5" /> Simulate Success Transfer</>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Payment;
