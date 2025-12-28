
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Events } from './components/Events';
import { Explorer } from './components/Explorer';
import { Assistant } from './components/Assistant';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.HOME:
        return <Home onNavigate={setActiveTab} />;
      case AppTab.EVENTS:
        return <Events />;
      case AppTab.EXPLORER:
        return <Explorer />;
      case AppTab.ASSISTANT:
        return <Assistant />;
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
