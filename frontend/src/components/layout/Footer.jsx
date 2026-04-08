import { ShieldCheck, Mail, MapPin, Phone, Github, Twitter, Linkedin, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-20 border-t border-white/5">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          <div className="lg:col-span-2 space-y-8">
            <Link to="/" className="text-3xl font-black font-display text-white flex items-center gap-3 group">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <span className="uppercase tracking-tighter">RAPIDSERVICE</span>
            </Link>
            <p className="text-background/40 font-medium text-lg leading-relaxed max-w-sm italic">
               "Engineered for the high-performance local economy. Connecting elite professionals with project excellence."
            </p>
            <div className="flex gap-4">
               {[Github, Twitter, Linkedin].map((Icon, i) => (
                 <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-white/5">
                   <Icon className="w-5 h-5" />
                 </a>
               ))}
            </div>
          </div>

          {[
            {
              title: "Specialties",
              links: ["Precision Cleaning", "Electrical Systems", "Network Painting", "Plumbing Logic"],
            },
            {
              title: "Ecosystem",
              links: ["Provider Network", "Career Portal", "Strategic Blog", "Press Releases"],
            },
            {
              title: "Legal & Support",
              links: ["Operational Terms", "Privacy Vault", "Contact HQ", "System Status"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs font-black uppercase tracking-widest text-background/60 hover:text-white hover:pl-2 transition-all"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
             © 2026 RAPIDSERVICE ANALYTICS. ALL PROTOCOLS RESERVED.
           </p>
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                 <div className="w-2 h-2 bg-[#10b981] rounded-full"></div> SYSTEMS OPERATIONAL
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                 <Globe className="w-3 h-3" /> GLOBAL CLOUD HUB
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

