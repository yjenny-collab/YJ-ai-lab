
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { discoverEvents } from '../services/gemini';
import { GroundingSource, EventItem } from '../types';
import { 
  Search, 
  Loader2, 
  Calendar as CalIcon, 
  MapPin, 
  X, 
  Sparkles, 
  Navigation, 
  Heart, 
  Clock, 
  Share2, 
  Check, 
  Instagram, 
  Globe, 
  RefreshCcw, 
  Zap,
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';

export const Events: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [favorites, setFavorites] = useState<EventItem[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hideOutdated, setHideOutdated] = useState(true);
  const [showAccessibleOnly, setShowAccessibleOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Erasmus', 'Party', 'Mixer', 'Art', 'Free', 'Underground', 'Suburbs'];

  useEffect(() => {
    const savedFavorites = localStorage.getItem('escale_favorites');
    if (savedFavorites) {
      try { setFavorites(JSON.parse(savedFavorites)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('escale_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchEvents = useCallback(async (searchQuery: string, isAutoRefresh = false) => {
    if (isAutoRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const effectiveQuery = searchQuery || "Erasmus parties, international student mixers, niche French soirées, and hidden gems in Paris";
      const data = await discoverEvents(effectiveQuery);
      setEvents(data.events);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (showFavoritesOnly) setShowFavoritesOnly(false);
    fetchEvents(query);
  };

  useEffect(() => {
    fetchEvents("");
  }, [fetchEvents]);

  const isFavorited = (id: string) => favorites.some(fav => fav.id === id);

  const toggleFavorite = (e: React.MouseEvent, event: EventItem) => {
    e.stopPropagation();
    if (isFavorited(event.id)) {
      setFavorites(prev => prev.filter(fav => fav.id !== event.id));
    } else {
      setFavorites(prev => [...prev, event]);
    }
  };

  const handleShare = async (e: React.MouseEvent, event: EventItem) => {
    e.stopPropagation();
    const shareText = `🇫🇷 *${event.title}* in Paris! ${event.date}\nL'Escale Paris:`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try { await navigator.share({ title: event.title, text: shareText, url: shareUrl }); } catch (err) { console.error(err); }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopiedId(event.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) { console.error(err); }
    }
  };

  const isPast = (isoDate: string) => {
    const eventDate = new Date(isoDate);
    const now = new Date();
    return eventDate.getTime() < (now.getTime() - (12 * 60 * 60 * 1000));
  };

  const displayedEvents = useMemo(() => {
    let list = showFavoritesOnly ? favorites : events;

    if (hideOutdated) list = list.filter(e => !isPast(e.isoDate));
    if (showAccessibleOnly) list = list.filter(e => e.isAccessible);
    if (selectedCategory !== 'All') {
      const cat = selectedCategory.toLowerCase();
      list = list.filter(e => 
        e.category.toLowerCase().includes(cat) || 
        e.description.toLowerCase().includes(cat) ||
        (cat === 'suburbs' && (e.location.match(/\d{5}/)?.[0].startsWith('9') || e.location.toLowerCase().includes('suburb')))
      );
    }

    return [...list].sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime());
  }, [showFavoritesOnly, favorites, events, hideOutdated, showAccessibleOnly, selectedCategory]);

  return (
    <div className="p-4 md:p-8 space-y-8 relative min-h-screen pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-stone-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Le Pulse</h2>
            {refreshing && <RefreshCcw className="w-5 h-5 text-blue-500 animate-spin" />}
          </div>
          <p className="text-slate-500 text-sm font-medium">Curating the exhaustive student scene in Paris.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAccessibleOnly(!showAccessibleOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${
              showAccessibleOnly 
              ? 'bg-amber-400 text-slate-900 border-amber-500' 
              : 'bg-white text-slate-500 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${showAccessibleOnly ? 'fill-current' : ''}`} />
            Safe Bets
          </button>
          <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${showFavoritesOnly ? 'bg-pink-500 text-white border-pink-600' : 'bg-white text-slate-500 border-stone-200 hover:bg-stone-50'}`}>
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Saved
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {!showFavoritesOnly && (
          <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Erasmus, techno, vernissages..."
              className="w-full bg-white border-2 border-stone-100 rounded-full py-4 pl-14 pr-6 shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all placeholder:text-stone-300 text-lg"
            />
            <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
          </form>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm border ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-500 border-stone-100 hover:border-slate-300 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-400 font-black mt-6 tracking-widest uppercase text-[10px] animate-pulse">Scouting Paris...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.map((event) => {
            const expired = isPast(event.isoDate);
            return (
              <div 
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`bg-white rounded-3xl border transition-all cursor-pointer group flex flex-col h-full hover:shadow-xl hover:-translate-y-1 border-stone-100 ${expired ? 'opacity-40 grayscale' : ''}`}
              >
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                        {event.category}
                      </span>
                      {event.isAccessible ? (
                        <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" /> Safe Bet
                        </span>
                      ) : (
                        <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                          <Navigation className="w-2.5 h-2.5" /> Deep Local
                        </span>
                      )}
                    </div>
                    {isFavorited(event.id) && <Star className="w-4 h-4 text-amber-400 fill-current" />}
                  </div>
                  
                  <h3 className="text-lg font-serif font-bold text-slate-900 leading-tight line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                      <CalIcon className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{event.date}</span>
                      {event.startTime && <span className="text-slate-400 font-black text-[9px]">{event.startTime}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 italic leading-relaxed pt-1">
                    "{event.vibe}"
                  </p>
                </div>

                <div className="px-5 py-4 bg-stone-50/50 flex justify-between items-center rounded-b-3xl border-t border-stone-50">
                   <div className="flex gap-1">
                      <button onClick={(e) => handleShare(e, event)} className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-blue-600">
                        {copiedId === event.id ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                      </button>
                      <button onClick={(e) => toggleFavorite(e, event)} className="p-2 hover:bg-white rounded-lg transition-all text-slate-400">
                        <Heart className={`w-4 h-4 transition-all ${isFavorited(event.id) ? 'text-pink-500 fill-current' : ''}`} />
                      </button>
                   </div>
                   <div className="text-[9px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                     Intel <ChevronRight className="w-3 h-3 text-blue-600" />
                   </div>
                </div>
              </div>
            );
          })}
          {displayedEvents.length === 0 && !loading && (
            <div className="col-span-full text-center py-20">
              <Search className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No matching events found</p>
              <button onClick={() => fetchEvents("")} className="mt-4 text-blue-600 font-black text-[10px] uppercase tracking-widest underline">Reset Pulse</button>
            </div>
          )}
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 z-20 bg-black/20 hover:bg-black/40 text-white p-2.5 rounded-full transition-all"><X className="w-5 h-5" /></button>
            <div className="h-48 relative shrink-0">
              <img src={`https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=Paris+${encodeURIComponent(selectedEvent.location)}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{selectedEvent.category}</span>
                  {selectedEvent.isAccessible ? (
                    <span className="bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Safe Bet</span>
                  ) : (
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Deep Local</span>
                  )}
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 leading-tight">{selectedEvent.title}</h2>
              </div>
              
              <div className={`p-5 rounded-2xl border ${selectedEvent.isAccessible ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl shrink-0 ${selectedEvent.isAccessible ? 'bg-amber-400 text-slate-900' : 'bg-indigo-600 text-white'}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Student Intel</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{selectedEvent.accessibilityReason}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 py-4 border-y border-stone-100">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" /> {selectedEvent.startTime || 'Check desc.'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Venue</p>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" /> {selectedEvent.location}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">About</p>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedEvent.description}</p>
              </div>

              <div className="pt-4 flex gap-3">
                <a href={`https://www.google.com/search?q=${encodeURIComponent(selectedEvent.title + " Paris")}`} target="_blank" className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 hover:bg-stone-200 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex-1">
                  <Globe className="w-4 h-4" /> Verify
                </a>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location + " Paris")}`} target="_blank" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" /> Go Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
