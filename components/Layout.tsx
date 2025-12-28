
import React from 'react';
import { AppTab } from '../types';
import { 
  Home as HomeIcon, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  UserCircle,
  Globe,
  Instagram,
  Twitter,
  Mail
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const tabs = [
    { id: AppTab.HOME, label: 'Home', icon: HomeIcon },
    { id: AppTab.EVENTS, label: 'Events', icon: Calendar },
    { id: AppTab.EXPLORER, label: 'Explore', icon: MapPin },
    { id: AppTab.ASSISTANT, label: 'Lili AI', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf7] text-slate-900 overflow-x-hidden">
      {/* Top Professional Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-stone-200/60 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange(AppTab.HOME)}>
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-serif italic text-xl shadow-lg">
            E
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-serif tracking-tight font-bold">L'Escale Paris</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Student Hub</p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`text-sm font-semibold transition-all hover:text-blue-600 ${
                activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-xs font-bold transition-all">
            <Globe className="w-3 h-3" />
            EN
          </button>
          <button className="p-2 hover:bg-stone-100 rounded-full transition-colors relative group">
            <UserCircle className="w-7 h-7 text-slate-600" />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50 rounded-xl">My Journey</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50 rounded-xl text-red-500">Log Out</button>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-12 max-w-6xl mx-auto w-full">
        {children}
      </main>

      {/* Website Footer (Visible on desktop) */}
      <footer className="hidden md:block bg-slate-900 text-white py-16 px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-12">
          <div className="col-span-1 space-y-4">
            <h3 className="font-serif text-2xl font-bold italic">L'Escale</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering international students to navigate Paris with confidence, style, and joy.
            </p>
            <div className="flex gap-4">
              <Instagram className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
              <Twitter className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
              <Mail className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="hover:text-white cursor-pointer" onClick={() => onTabChange(AppTab.EVENTS)}>Events Feed</li>
              <li className="hover:text-white cursor-pointer" onClick={() => onTabChange(AppTab.EXPLORER)}>Spot Finder</li>
              <li className="hover:text-white cursor-pointer" onClick={() => onTabChange(AppTab.ASSISTANT)}>Lili AI Assistant</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="hover:text-white cursor-pointer">Student Visa Guide</li>
              <li className="hover:text-white cursor-pointer">Finding Housing</li>
              <li className="hover:text-white cursor-pointer">CAF Application Tips</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="hover:text-white cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer">Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
          © 2025 L'Escale Paris. Created for the global student community.
        </div>
      </footer>

      {/* Mobile Navigation (Floating Pill style) */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] glass-effect border border-stone-200/60 rounded-[2rem] px-6 py-4 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'scale-100'}`} />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
