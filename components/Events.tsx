
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { discoverEvents } from '../services/gemini';
import { GroundingSource, EventItem } from '../types';
import { 
  Search, 
  Loader2, 
  Calendar as CalIcon, 
  MapPin, 
  X, 
  Info, 
  Sparkles, 
  Navigation, 
  Heart, 
  Clock, 
  Share2, 
  Check, 
  Instagram, 
  Globe, 
  Share, 
  RefreshCcw, 
  CalendarDays, 
  ShieldAlert, 
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
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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
      const effectiveQuery = searchQuery || "exhaustive list of Erasmus parties, international student mixers, niche French soirées, and free art openings in Paris and suburbs";
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchEvents(query, true);
    }, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchEvents, query]);

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
    const timeInfo = event.startTime ? ` at ${event.startTime}` : '';
    const shareText = `🇫🇷 *${event.title}* in Paris!\n📅 ${event.date}${timeInfo}\n📍 ${event.location}\n\nL'Escale Paris:`;
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
    return eventDate.getTime() < (now.getTime() - (6 * 60 * 60 * 1000));
  };

  const displayedEvents = useMemo(() => {
    let list = showFavoritesOnly ? favorites : events;
    
    if (startDate) {
      const start = new Date(startDate).getTime();
      list = list.filter(e => new Date(e.isoDate).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      list = list.filter(e => new Date(e.isoDate).getTime() <= end);
    }

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
  }, [showFavoritesOnly, favorites, events, hideOutdated, showAccessibleOnly, selectedCategory, startDate, endDate]);

  const clearDates = () => { setStartDate(''); setEndDate(''); };

  return (
    <div className="p-6 space-y-6 relative min-h-screen pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Le Pulse</h2>
            {refreshing && <RefreshCcw className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          <p className="text-slate-500 text-sm font-medium">Deciphering the secret side of Paris for international students.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setShowAccessibleOnly(!showAccessibleOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${
              showAccessibleOnly 
              ? 'bg-emerald-500 text-white border-emerald-600' 
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

      <div className="space-y-4">
        {!showFavoritesOnly && (
          <div className="flex flex-col gap-4">
            <form onSubmit={handleSearch} className="relative group">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find Erasmus parties, mixers, art openings, hidden techno..."
                className="w-full bg-white border border-stone-200 rounded-3xl py-5 pl-14 pr-4 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all placeholder:text-stone-300 text-lg font-medium"
              />
              <Zap className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
            </form>

            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border border-stone-100 shadow-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <CalendarDays className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] mr-2">Filter Period</span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none flex-1 min-w-[130px]"
                />
                <span className="text-slate-300 text-xs">—</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none flex-1 min-w-[130px]"
                />
              </div>
              {(startDate || endDate) && (
                <button onClick={clearDates} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest px-2">Reset</button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm border ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 scale-105 shadow-lg'
                  : 'bg-white text-slate-500 border-stone-200 hover:border-slate-300 hover:bg-stone-50'
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
          <p className="text-slate-400 animate-pulse font-bold mt-6 tracking-widest uppercase text-[10px]">Scouting Mainstream & Niche Scenes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedEvents.map((event) => {
            const expired = isPast(event.isoDate);
            return (
              <div 
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`bg-white rounded-[2.5rem] border-2 transition-all cursor-pointer group active:scale-[0.98] relative flex flex-col ${
                  event.isAccessible 
                    ? 'border-emerald-100 shadow-[0_15px_40px_-15px_rgba(16,185,129,0.15)]' 
                    : 'border-indigo-100 shadow-[0_15px_40px_-15px_rgba(79,70,229,0.15)]'
                } hover:shadow-2xl hover:scale-[1.02] ${expired ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="p-7 flex-1 space-y-5">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.15em]">
                        {event.category}
                      </span>
                      {event.isAccessible ? (
                        <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-sm">
                          <ShieldCheck className="w-3 h-3" /> Safe Bet
                        </span>
                      ) : (
                        <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-sm">
                          <Navigation className="w-3 h-3" /> Deep Local
                        </span>
                      )}
                    </div>
                    {isFavorited(event.id) && <Star className="w-5 h-5 text-amber-400 fill-current animate-pulse" />}
                  </div>
                  
                  <h3 className="text-2xl font-serif font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2 min-h-[3.5rem]">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-4 text-slate-600">
                      <div className={`p-2.5 rounded-2xl ${event.isAccessible ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        <CalIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Date</span>
                        <span className="font-bold text-slate-800">{event.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <div className={`p-2.5 rounded-2xl ${event.isAccessible ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Location</span>
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-3xl ${event.isAccessible ? 'bg-emerald-50/30' : 'bg-indigo-50/30'} border border-stone-100/50`}>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <Sparkles className={`w-3 h-3 ${event.isAccessible ? 'text-emerald-500' : 'text-indigo-500'}`} /> Atmosphere
                    </p>
                    <p className="text-xs text-slate-700 italic font-medium leading-relaxed line-clamp-2">{event.vibe}</p>
                  </div>
                </div>

                <div className="px-7 py-5 border-t border-stone-50 flex justify-between items-center bg-stone-50/30 rounded-b-[2.5rem]">
                   <div className="flex gap-2">
                      <button onClick={(e) => handleShare(e, event)} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-blue-600 border border-transparent hover:border-stone-100 shadow-sm">
                        {copiedId === event.id ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                      </button>
                      <button onClick={(e) => toggleFavorite(e, event)} className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-stone-100 shadow-sm">
                        <Heart className={`w-5 h-5 transition-all ${isFavorited(event.id) ? 'text-pink-500 fill-current' : 'text-slate-300'}`} />
                      </button>
                   </div>
                   <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                     View Intelligence <ChevronRight className="w-4 h-4 text-blue-600" />
                   </div>
                </div>
              </div>
            );
          })}
          {displayedEvents.length === 0 && (
            <div className="col-span-full text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-stone-100">
              {/* Fix: Line 331 - replacing undefined 'SearchIcon' with imported 'Search' */}
              <Search className="w-16 h-16 text-stone-100 mx-auto mb-6" />
              <h4 className="text-3xl font-serif font-bold text-slate-800 mb-4">No Events Found</h4>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8 font-medium">Lili is checking more sources. Try adjusting your timeframe or searching for 'Erasmus'.</p>
              <button onClick={() => { clearDates(); fetchEvents(""); }} className="bg-slate-900 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:shadow-2xl transition-all">Reset Search</button>
            </div>
          )}
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 duration-500 flex flex-col max-h-[95vh]">
            <button onClick={() => setSelectedEvent(null)} className="absolute top-8 right-8 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/20"><X className="w-6 h-6" /></button>
            <div className="h-64 relative shrink-0">
              <img src={`https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=Paris+${encodeURIComponent(selectedEvent.location)}`} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${selectedEvent.isAccessible ? 'from-emerald-950/40' : 'from-indigo-950/40'} to-transparent`} />
              <div className="absolute bottom-6 left-8 flex gap-3">
                <span className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">{selectedEvent.category}</span>
                {selectedEvent.isAccessible ? (
                  <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Safe Bet</span>
                ) : (
                  <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Deep Local</span>
                )}
              </div>
            </div>
            
            <div className="p-10 space-y-8 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <h2 className="text-4xl font-serif font-bold text-slate-900 leading-[1.1]">{selectedEvent.title}</h2>
                <div className={`p-6 rounded-[2rem] flex gap-5 border ${selectedEvent.isAccessible ? 'bg-emerald-50/50 border-emerald-100' : 'bg-indigo-50/50 border-indigo-100'}`}>
                  <div className={`p-3 h-fit rounded-2xl shadow-sm ${selectedEvent.isAccessible ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}`}>
                    <Navigation className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${selectedEvent.isAccessible ? 'text-emerald-700' : 'text-indigo-700'}`}>Local Student Intelligence</p>
                    <p className={`text-sm leading-relaxed font-bold ${selectedEvent.isAccessible ? 'text-emerald-900' : 'text-indigo-900'}`}>
                      {selectedEvent.accessibilityReason}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 border-y border-stone-100 py-8">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">When</p>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-black text-slate-900 flex items-center gap-3">
                      <CalIcon className="w-5 h-5 text-blue-600" /> {selectedEvent.date}
                    </p>
                    {selectedEvent.startTime && (
                      <p className="text-xs font-black text-blue-600 flex items-center gap-3 ml-8">
                        <Clock className="w-4 h-4" /> {selectedEvent.startTime}{selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Where</p>
                  <p className="text-sm font-black text-slate-900 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-600" /> {selectedEvent.location}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">The Vibe & Details</p>
                <p className="text-slate-600 text-sm leading-relaxed font-medium bg-stone-50 p-6 rounded-3xl border border-stone-100 italic">"{selectedEvent.vibe}"</p>
                <p className="text-slate-500 text-sm leading-relaxed">{selectedEvent.description}</p>
              </div>

              <div className="space-y-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Verification</p>
                <div className="flex flex-wrap gap-3">
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(selectedEvent.title + " Paris")}`} target="_blank" className="flex items-center gap-2.5 px-6 py-3 bg-stone-100 hover:bg-stone-200 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                    <Globe className="w-4 h-4" /> Google Search
                  </a>
                  <a href={`https://www.instagram.com/explore/tags/${selectedEvent.title.replace(/\s+/g, '').toLowerCase()}/`} target="_blank" className="flex items-center gap-2.5 px-6 py-3 bg-stone-100 hover:bg-stone-200 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                    <Instagram className="w-4 h-4" /> Social Proof
                  </a>
                </div>
              </div>

              <div className="pt-6 flex gap-4 pb-6">
                <button onClick={(e) => handleShare(e, selectedEvent)} className="bg-stone-100 text-slate-900 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex-1 flex items-center justify-center gap-3 shadow-sm hover:bg-stone-200 transition-all border border-stone-200">
                  {copiedId === selectedEvent.id ? <Check className="w-5 h-5 text-green-600" /> : <Share className="w-5 h-5" />}
                  {copiedId === selectedEvent.id ? "Link Saved" : "Share"}
                </button>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location + " Paris")}`} target="_blank" className="flex-[1.5] bg-slate-900 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all">
                  <MapPin className="w-5 h-5" /> Navigation
                </a>
                <button onClick={(e) => toggleFavorite(e, selectedEvent)} className={`p-5 rounded-[2rem] border-2 transition-all shadow-lg ${isFavorited(selectedEvent.id) ? 'bg-pink-50 border-pink-100 text-pink-500' : 'bg-stone-50 border-stone-100 text-slate-400'}`}>
                  <Heart className={`w-7 h-7 ${isFavorited(selectedEvent.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
