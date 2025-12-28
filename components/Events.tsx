
import React, { useState, useEffect } from 'react';
import { discoverEvents } from '../services/gemini';
import { GroundingSource, EventItem } from '../types';
import { 
  Search, 
  Loader2, 
  ExternalLink, 
  Calendar as CalIcon, 
  MapPin, 
  X, 
  Info, 
  Sparkles, 
  Navigation, 
  Heart, 
  Clock, 
  AlertCircle,
  Share2,
  Check
} from 'lucide-react';

export const Events: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [favorites, setFavorites] = useState<EventItem[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hideOutdated, setHideOutdated] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('escale_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('escale_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (showFavoritesOnly) setShowFavoritesOnly(false);
    setLoading(true);
    try {
      const data = await discoverEvents(query || "best student parties and events in Paris this week");
      setEvents(data.events);
      setSources(data.sources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const data = await discoverEvents("top upcoming international student gatherings, club nights, and parties in Paris this weekend");
      setEvents(data.events);
      setSources(data.sources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

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
    const shareData = {
      title: event.title,
      text: `Check out this student event in Paris: ${event.title}\n📅 ${event.date}\n📍 ${event.location}\n\nJoin via L'Escale Paris!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      const textToCopy = `${shareData.text}\n${shareData.url}`;
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopiedId(event.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const isPast = (isoDate: string) => {
    const eventDate = new Date(isoDate);
    const now = new Date();
    // Consider events in the last 6 hours still "current" for tonight's parties
    return eventDate.getTime() < (now.getTime() - (6 * 60 * 60 * 1000));
  };

  const getEventStatus = (isoDate: string) => {
    const eventDate = new Date(isoDate);
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();
    
    if (diff < 0 && diff > -(6 * 60 * 60 * 1000)) return "Happening Now";
    if (diff > 0 && diff < (24 * 60 * 60 * 1000)) return "Coming Soon";
    if (diff < 0) return "Passed";
    return null;
  };

  const baseEvents = showFavoritesOnly ? favorites : events;
  const displayedEvents = hideOutdated 
    ? baseEvents.filter(e => !isPast(e.isoDate))
    : baseEvents;

  return (
    <div className="p-6 space-y-6 relative min-h-screen pb-32">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 flex-1">
          <h2 className="text-3xl font-serif font-bold">Student Socials</h2>
          <p className="text-slate-500 text-sm">Real-time pulses of the Parisian night.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
           <button 
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-sm ${
              showFavoritesOnly 
              ? 'bg-pink-100 text-pink-600 border border-pink-200' 
              : 'bg-white text-slate-500 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Heart className={`w-3 h-3 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            {showFavoritesOnly ? 'My List' : 'Favorites'}
          </button>
          
          <button 
            onClick={() => setHideOutdated(!hideOutdated)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-sm ${
              hideOutdated 
              ? 'bg-blue-100 text-blue-600 border border-blue-200' 
              : 'bg-stone-100 text-stone-500 border border-stone-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            {hideOutdated ? 'Upcoming Only' : 'Show All'}
          </button>
        </div>
      </div>

      {!showFavoritesOnly && (
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. 'Rooftop party' or 'Erasmus'..."
            className="w-full bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-400 animate-pulse font-medium">Lili is checking live updates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedEvents.length > 0 ? displayedEvents.map((event) => {
            const status = getEventStatus(event.isoDate);
            const expired = isPast(event.isoDate);

            return (
              <div 
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group active:scale-[0.98] relative ${expired ? 'opacity-60' : ''}`}
              >
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        {event.category}
                      </span>
                      {status === "Happening Now" && (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Live
                        </span>
                      )}
                      {status === "Coming Soon" && (
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                          Soon
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => handleShare(e, event)}
                        className="p-2 hover:bg-stone-100 rounded-full transition-colors text-slate-400 hover:text-blue-500"
                        title="Share Event"
                      >
                        {copiedId === event.id ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={(e) => toggleFavorite(e, event)}
                        className="p-2 hover:bg-pink-50 rounded-full transition-colors group/fav"
                      >
                        <Heart className={`w-5 h-5 transition-all ${isFavorited(event.id) ? 'text-pink-500 fill-current' : 'text-slate-300 group-hover/fav:text-pink-300'}`} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                    {event.title}
                  </h3>
                  
                  <div className="flex flex-col gap-1 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <CalIcon className={`w-4 h-4 ${expired ? 'text-slate-300' : 'text-blue-400'}`} />
                      <span className={expired ? 'line-through decoration-slate-300' : ''}>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${expired ? 'text-slate-300' : 'text-red-400'}`} />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-12 text-slate-400">
              <Info className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>
                {showFavoritesOnly 
                  ? "You haven't saved any upcoming events! ✨" 
                  : (hideOutdated ? "No upcoming events found. Check 'Show All' to see past ones." : "No events found.")
                }
              </p>
              {showFavoritesOnly && (
                <button 
                  onClick={() => setShowFavoritesOnly(false)}
                  className="mt-4 text-blue-600 text-sm font-bold"
                >
                  Browse all events →
                </button>
              )}
            </div>
          )}

          {!showFavoritesOnly && sources.length > 0 && !loading && (
            <div className="mt-8 space-y-3">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                Verified Sources
                <div className="flex-1 h-px bg-stone-100"></div>
              </h3>
              <div className="space-y-2">
                {sources.slice(0, 3).map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-white/50 px-4 py-3 rounded-xl border border-stone-100 hover:bg-white transition-all group"
                  >
                    <span className="text-xs font-medium text-slate-500 truncate pr-4">{source.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-300 flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-48 relative shrink-0">
              <img 
                src={`https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800&q=Paris+${encodeURIComponent(selectedEvent.location)}`} 
                alt={selectedEvent.location}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                 <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm flex items-center gap-1">
                   <Navigation className="w-3 h-3" />
                   Google Maps Preview
                 </div>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">{selectedEvent.category} • {selectedEvent.vibe}</span>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight">{selectedEvent.title}</h2>
                  {isPast(selectedEvent.isoDate) && (
                    <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold bg-red-50 px-2 py-0.5 rounded-full w-fit">
                      <AlertCircle className="w-3 h-3" />
                      This event has likely passed
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleShare(e, selectedEvent)}
                    className="p-3 bg-stone-50 text-slate-400 hover:text-blue-500 rounded-2xl transition-all shadow-sm"
                  >
                    {copiedId === selectedEvent.id ? <Check className="w-6 h-6 text-green-500" /> : <Share2 className="w-6 h-6" />}
                  </button>
                  <button 
                    onClick={(e) => toggleFavorite(e, selectedEvent)}
                    className={`p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center ${
                      isFavorited(selectedEvent.id) 
                      ? 'bg-pink-50 text-pink-500' 
                      : 'bg-stone-50 text-slate-300 hover:text-pink-300'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isFavorited(selectedEvent.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">When</p>
                  <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <CalIcon className="w-4 h-4 text-blue-500" />
                    {selectedEvent.date}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Where</p>
                  <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {selectedEvent.location}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">About the Event</p>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="pt-4 flex gap-3 pb-4">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location + " Paris")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-center hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  View on Maps
                </a>
                <button 
                   className="p-4 bg-stone-100 rounded-2xl text-slate-600 hover:bg-stone-200 transition-colors"
                   onClick={() => alert("Added to your journey! ✨")}
                >
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
