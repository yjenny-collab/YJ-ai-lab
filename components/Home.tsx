
import React from 'react';
import { AppTab } from '../types';
import { 
  ArrowRight, 
  Sparkles, 
  Map, 
  Music, 
  ChevronRight, 
  Globe, 
  Users, 
  Zap, 
  Compass,
  Heart
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: AppTab) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80" 
            alt="Paris Sunset" 
            className="w-full h-full object-cover brightness-[0.65] scale-105 transition-transform duration-[10s] hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-slate-900/60" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            The official student portal
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-white leading-[1.1]">
            Your Journey in <br/> <span className="italic text-blue-200">Paris</span> Begins Here.
          </h2>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Discover the secret parties, student-only spots, and navigate bureaucratic hurdles with your AI Parisian best friend, Lili.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => onNavigate(AppTab.EVENTS)}
              className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-stone-100 transition-all shadow-xl hover:-translate-y-1"
            >
              Explore Events
            </button>
            <button 
              onClick={() => onNavigate(AppTab.ASSISTANT)}
              className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Ask Lili AI <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Statistics / Confidence Section */}
      <section className="px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { icon: Users, label: "Student Community", value: "25k+" },
          { icon: Globe, label: "Nationalities", value: "140+" },
          { icon: Zap, label: "Daily Events", value: "50+" },
          { icon: Heart, label: "Curated Spots", value: "500+" }
        ].map((stat, i) => (
          <div key={i} className="text-center space-y-2 group">
            <div className="w-12 h-12 bg-white shadow-sm border border-stone-100 rounded-2xl flex items-center justify-center mx-auto text-blue-600 group-hover:scale-110 transition-transform">
              <stat.icon className="w-6 h-6" />
            </div>
            <h4 className="text-3xl font-serif font-bold">{stat.value}</h4>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="px-6 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h3 className="text-4xl font-serif font-bold">Unlocking the City</h3>
          <p className="text-slate-500">From the bustling Marais to the quiet libraries of the Latin Quarter, we've got you covered.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div 
            onClick={() => onNavigate(AppTab.EVENTS)}
            className="group relative bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[100px] -mr-8 -mt-8 opacity-40 group-hover:scale-125 transition-transform" />
            <Music className="w-10 h-10 text-red-500 mb-6 relative z-10" />
            <h4 className="text-2xl font-serif font-bold mb-4">Nightlife & Socials</h4>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Every Erasmus party, club night, and international mixer verified in real-time. Never spend a Friday alone.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:gap-4 transition-all">
              EXPLORE PARTIES <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate(AppTab.EXPLORER)}
            className="group relative bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -mr-8 -mt-8 opacity-40 group-hover:scale-125 transition-transform" />
            <Compass className="w-10 h-10 text-blue-500 mb-6 relative z-10" />
            <h4 className="text-2xl font-serif font-bold mb-4">Student Guides</h4>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Find the cheapest happy hours, the best study cafes with reliable Wi-Fi, and hidden gems only locals know.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:gap-4 transition-all">
              FIND SPOTS <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate(AppTab.ASSISTANT)}
            className="group relative bg-slate-900 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-bl-[100px] -mr-8 -mt-8 group-hover:scale-125 transition-transform" />
            <Sparkles className="w-10 h-10 text-blue-400 mb-6 relative z-10" />
            <h4 className="text-2xl font-serif font-bold mb-4 text-white">Ask Lili AI</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-8">
              Bureaucracy is hard. Lili makes it easy. Ask about your Navigo, CAF, or residency permit in plain English.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:gap-4 transition-all">
              CHAT WITH LILI <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles / Tips */}
      <section className="px-6 space-y-12 pb-12">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Survival Guide</p>
            <h3 className="text-3xl font-serif font-bold">Parisian Essentials</h3>
          </div>
          <button className="text-sm font-bold text-blue-600 hover:underline">View all guides →</button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              img: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&w=600&q=80",
              tag: "Culture",
              title: "The Bakery Protocol: Ordering like a local",
              desc: "Why 'Bonjour' is the most important word in your vocabulary."
            },
            { 
              img: "https://images.unsplash.com/photo-1550340499-a6c60dc828bb?auto=format&fit=crop&w=600&q=80",
              tag: "Budget",
              title: "The Navigo Hack: Save €40/month",
              desc: "Don't miss the 1st-of-the-month deadline for your student pass."
            },
            { 
              img: "https://images.unsplash.com/photo-1493932484895-752d1471eab5?auto=format&fit=crop&w=600&q=80",
              tag: "Life",
              title: "Finding Housing without the stress",
              desc: "A step-by-step guide to the Parisian rental market for expats."
            }
          ].map((post, i) => (
            <div key={i} className="group bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden hover:-translate-y-2 transition-all cursor-pointer">
              <div className="h-48 overflow-hidden relative">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600">{post.tag}</span>
              </div>
              <div className="p-6 space-y-3">
                <h4 className="font-bold text-lg group-hover:text-blue-600 transition-colors leading-tight">{post.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{post.desc}</p>
                <div className="pt-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Read Article</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Call to Action */}
      <section className="px-6 pb-20">
        <div className="paris-gradient rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="text-4xl font-serif font-bold italic">Join the L'Escale Community</h3>
            <p className="text-white/80 text-lg font-light leading-relaxed">
              Don't miss a single beat of the city. Sign up for our weekly "Weekend Pulse" newsletter curated by international students, for students.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <input 
                type="email" 
                placeholder="Enter your student email..." 
                className="flex-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-8 py-4 outline-none placeholder:text-white/60 focus:bg-white/30 transition-all"
              />
              <button className="px-10 py-4 bg-white text-slate-900 rounded-full font-bold hover:shadow-lg transition-shadow">
                Subscribe
              </button>
            </div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">No spam, just croissants and clubbing.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
