import React, { useState } from 'react';
import { Home, HardDrive, Cpu, LogOut } from 'lucide-react';
import HomePage from './HomePage';
import GPUListPage from './GPUListPage';
import DashboardPage from './DashboardPage';

export default function MainLayout({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'gpu', label: 'GPU Lists', icon: HardDrive },
    { id: 'agent', label: 'Agents', icon: Cpu }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'gpu':
        return <GPUListPage />;
      case 'agent':
        return <DashboardPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="relative z-10">
      {/* Navbar */}
      <nav className="fixed z-20 top-0 w-full bg-black/50 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-[#76B900] flex items-center justify-center shadow-lg shadow-[#76B900]/50">
                <Cpu className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-xl font-bold text-[#76B900]">
                GPU Cluster
              </h1>
            </div>

            {/* Nav Tabs */}
            <div className="flex gap-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#76B900] text-black border border-[#76B900] shadow-lg shadow-[#76B900]/50'
                        : 'text-gray-300 hover:bg-gray-900/50 border border-transparent hover:border-[#76B900]/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                Welcome, <span className="font-semibold text-white">{currentUser}</span>
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 bg-[#76B900] text-black hover:bg-[#5a8a00] rounded-lg transition-colors text-sm font-medium shadow-lg shadow-[#76B900]/50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 p-6">
        {renderContent()}
      </div>
      </div>
    </div>
  );
}
