
import React, { useState, useEffect } from 'react';
import { explorePlaces } from '../services/gemini';
import { GroundingSource } from '../types';
import { MapPin, Search, Loader2, Navigation, Coffee, Wine, BookOpen } from 'lucide-react';

export const Explorer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ text: string; sources: GroundingSource[] } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Location access denied")
      );
    }
  }, []);

  const handleExplore = async (customQuery?: string) => {
    const q = customQuery || query || "best cheap bars for students";
    setLoading(true);
    try {
      const data = await explorePlaces(q, location);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { label: 'Bars', icon: Wine, query: 'cheapest happy hour bars for students' },
    { label: 'Cafes', icon: Coffee, query: 'study friendly cafes with wifi' },
    { label: 'Studying', icon: BookOpen, query: 'quiet public libraries and study spaces' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold">City Guide</h2>
        <p className="text-slate-500 text-sm">Find the perfect spot to study, drink, or chill.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => handleExplore(cat.query)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-200 text-sm font-medium hover:bg-stone-50 transition-colors whitespace-nowrap"
          >
            <cat.icon className="w-4 h-4 text-blue-600" />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Where do you want to go?"
          className="w-full bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <button 
          onClick={() => handleExplore()}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-xl"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-400">Consulting the maps of Paris...</p>
        </div>
      ) : results ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm prose prose-sm">
             <div dangerouslySetInnerHTML={{ __html: results.text.replace(/\n/g, '<br/>') }} />
          </div>

          <div className="grid grid-cols-1 gap-3">
             {results.sources.map((source, i) => (
               <a 
                 key={i} 
                 href={source.uri} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all group"
               >
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Navigation className="w-5 h-5" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{source.title}</h4>
                    <p className="text-xs text-slate-400">Open in Maps</p>
                 </div>
               </a>
             ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-stone-300" />
          </div>
          <p className="text-stone-400 text-sm italic">"One's destination is never a place, but a new way of seeing things."</p>
        </div>
      )}
    </div>
  );
};
