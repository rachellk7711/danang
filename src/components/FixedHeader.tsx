import React, { useState, useEffect } from 'react';
import { Sun, Moon, MapPin, Landmark, Calendar, ShoppingBag, AlertCircle, Sunrise, Sunset, RefreshCw, Thermometer } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { fetchWeather } from '../services/weatherService';
import type { WeatherData } from '../services/weatherService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-1 py-2 flex-1 transition-all",
      active ? "text-teal scale-110" : "text-text-secondary"
    )}
  >
    <div className={cn(
      "p-1.5 rounded-lg transition-colors",
      active ? "bg-teal/10" : "bg-transparent"
    )}>
      {icon}
    </div>
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export const FixedHeader: React.FC<{ activeTab: string, onTabChange: (id: string) => void }> = ({ activeTab, onTabChange }) => {
  const { theme, toggleTheme } = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const getWeatherData = async () => {
      try {
        const data = await fetchWeather();
        setWeather(data);
      } catch (err) {
        console.error('Failed to fetch weather:', err);
      }
    };

    getWeatherData();
    const interval = setInterval(getWeatherData, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const today = new Date();
  const formattedDate = `${today.getMonth() + 1}월 ${today.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]})`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center">
      <div className="w-full max-w-[375px] bg-navy/90 backdrop-blur-xl border-b border-white/5">
        {/* Status Bar */}
        <div className="px-4 py-2.5 text-[10px] font-bold text-text-secondary border-b border-white/5 space-y-2">
          {/* Row 1: Date, Weather, Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-text-primary">{formattedDate}</span>
              <div className="w-[1px] h-2.5 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-mango" />
                  <span>{weather ? `${weather.temp}° / ${weather.tempMax}°` : '--° / --°'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sunrise className="w-3 h-3 text-mango" />
                  <span>{weather ? formatTime(weather.sunrise) : '--:--'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sunset className="w-3 h-3 text-mango" />
                  <span>{weather ? formatTime(weather.sunset) : '--:--'}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className="p-1 hover:bg-white/5 rounded-full transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
          
          {/* Row 2: Exchange Rates */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="bg-mint/10 text-mint px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0">
              <RefreshCw className="w-2.5 h-2.5" />
              <span>10만동 ≈ 5,450원</span>
            </div>
            <div className="bg-teal/10 text-teal px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0">
              <RefreshCw className="w-2.5 h-2.5" />
              <span>$100 ≈ 254만동</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center justify-around px-2">
          <Tab 
            id="explore" 
            label="주변탐색" 
            icon={<MapPin className="w-5 h-5" />} 
            active={activeTab === 'explore'} 
            onClick={() => onTabChange('explore')} 
          />
          <Tab 
            id="spots" 
            label="관광지" 
            icon={<Landmark className="w-5 h-5" />} 
            active={activeTab === 'spots'} 
            onClick={() => onTabChange('spots')} 
          />
          <Tab 
            id="planner" 
            label="일정·기록" 
            icon={<Calendar className="w-5 h-5" />} 
            active={activeTab === 'planner'} 
            onClick={() => onTabChange('planner')} 
          />
          <Tab 
            id="food" 
            label="음식·쇼핑" 
            icon={<ShoppingBag className="w-5 h-5" />} 
            active={activeTab === 'food'} 
            onClick={() => onTabChange('food')} 
          />
          <Tab 
            id="emergency" 
            label="긴급" 
            icon={<AlertCircle className="w-5 h-5" />} 
            active={activeTab === 'emergency'} 
            onClick={() => onTabChange('emergency')} 
          />
        </nav>
      </div>
    </header>
  );
};
