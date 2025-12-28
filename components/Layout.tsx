
import React from 'react';
import { AppTab } from '../types';
import { 
  Home as HomeIcon, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  UserCircle 
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
    <div className="min-h-screen flex flex-col bg-stone-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-stone-200 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            E
          </div>
          <h1 className="text-xl font-serif tracking-tight font-bold">L'Escale Paris</h1>
        </div>
        <button className="p-2 hover:bg-stone-100 rounded-full transition-colors">
          <UserCircle className="w-6 h-6 text-slate-600" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-stone-200 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'scale-100'}`} />
                <span className="text-[10px] font-medium uppercase tracking-wider">
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
