
import React from 'react';
import { AppTab } from '../types';
import { ArrowRight, Sparkles, Map, Music } from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: AppTab) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      {/* Hero Section */}
      <section className="relative h-64 rounded-3xl overflow-hidden shadow-2xl flex items-end">
        <img 
          src="https://picsum.photos/seed/paris/800/600" 
          alt="Paris" 
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="relative p-6 text-white space-y-2">
          <h2 className="text-3xl font-serif font-bold leading-tight">Bienvenue à Paris, Student!</h2>
          <p className="text-white/80 text-sm">Your all-access pass to the City of Light.</p>
        </div>
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate(AppTab.EVENTS)}
          className="p-6 bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow group text-left"
        >
          <div className="p-3 bg-red-50 rounded-xl text-red-600">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold">Find Parties</h3>
            <p className="text-xs text-slate-500">Clubbing, socials & mixers</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={() => onNavigate(AppTab.EXPLORER)}
          className="p-6 bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow group text-left"
        >
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold">Explore Spots</h3>
            <p className="text-xs text-slate-500">Student cafes & bars</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Lili AI Promo */}
      <section 
        onClick={() => onNavigate(AppTab.ASSISTANT)}
        className="paris-gradient p-6 rounded-3xl text-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-lg font-bold">Ask Lili Anything</h3>
        </div>
        <p className="text-white/90 text-sm leading-relaxed mb-4">
          "Where can I find the best Happy Hour in Le Marais tonight?" 
          or "How do I renew my residency permit?"
        </p>
        <div className="bg-white/20 backdrop-blur-md rounded-full py-2 px-4 inline-block text-xs font-semibold">
          Chat with Lili AI →
        </div>
      </section>

      {/* Tips Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-serif font-bold">Local Tips</h3>
        <div className="space-y-3">
          {[
            { title: "Navigo Pass", text: "Buy it before the 1st of the month to save big on transport." },
            { title: "Boulangerie Etiquette", text: "Always say 'Bonjour' before ordering. It's mandatory!" },
            { title: "Student Discounts", text: "Your ISIC card works at most museums for free entry." }
          ].map((tip, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-stone-100 flex gap-4">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-bold text-sm">{tip.title}</h4>
                <p className="text-sm text-slate-600">{tip.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
