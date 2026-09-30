import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContent } from './ContentProvider';
import { SearchOverlay, OPEN_SEARCH_EVENT } from './SearchOverlay';
import { Menu, Search, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';

// Mock Weather Data for 20 Main Cities (Ex-Yu Region)
const CITIES = [
  { name: 'Sarajevo', temp: 18, condition: 'cloudy' },
  { name: 'Zagreb', temp: 20, condition: 'sunny' },
  { name: 'Beograd', temp: 22, condition: 'sunny' },
  { name: 'Ljubljana', temp: 17, condition: 'rainy' },
  { name: 'Skopje', temp: 24, condition: 'sunny' },
  { name: 'Podgorica', temp: 25, condition: 'sunny' },
  { name: 'Split', temp: 23, condition: 'sunny' },
  { name: 'Novi Sad', temp: 21, condition: 'partly-cloudy' },
  { name: 'Banja Luka', temp: 19, condition: 'cloudy' },
  { name: 'Priština', temp: 20, condition: 'sunny' },
  { name: 'Rijeka', temp: 19, condition: 'rainy' },
  { name: 'Mostar', temp: 26, condition: 'sunny' },
  { name: 'Niš', temp: 22, condition: 'partly-cloudy' },
  { name: 'Osijek', temp: 20, condition: 'cloudy' },
  { name: 'Maribor', temp: 16, condition: 'rainy' },
  { name: 'Tuzla', temp: 18, condition: 'cloudy' },
  { name: 'Kragujevac', temp: 21, condition: 'sunny' },
  { name: 'Zadar', temp: 22, condition: 'sunny' },
  { name: 'Nikšić', temp: 18, condition: 'rainy' },
  { name: 'Pula', temp: 21, condition: 'sunny' },
];

const WeatherIcon = ({ condition, className }: { condition: string, className?: string }) => {
  switch (condition) {
    case 'sunny': return <Sun className={className} />;
    case 'partly-cloudy': return <Cloud className={className} />;
    case 'cloudy': return <Cloud className={className} />;
    case 'rainy': return <CloudRain className={className} />;
    case 'snowy': return <CloudSnow className={className} />;
    case 'stormy': return <CloudLightning className={className} />;
    case 'windy': return <Wind className={className} />;
    default: return <Sun className={className} />;
  }
};

export const Header: React.FC = () => {
  const { categories: allCategories } = useContent();
  const location = useLocation();
  const [weatherIndex, setWeatherIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  // Ctrl/Cmd+K or "/" (outside text fields) opens search
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    const onOpen = () => setSearchOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, []);

  // Close search when the route changes
  useEffect(() => setSearchOpen(false), [location.pathname]);

  // Weather auto-change animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Start fade out
      setTimeout(() => {
        setWeatherIndex((prev) => (prev + 1) % CITIES.length);
        setFade(true); // Start fade in
      }, 500); // Wait for fade out to complete (matches duration-500)
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const currentWeather = CITIES[weatherIndex];

  return (
    <header className="sticky top-0 z-50 bg-stone-950 text-white border-b-4 border-geo-green shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Mobile Left: Weather (Replaces Menu) */}
          <div className="flex items-center md:hidden w-24">
             <div className={`flex items-center gap-2 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                <WeatherIcon condition={currentWeather.condition} className="text-geo-green w-4 h-4" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold uppercase text-stone-400 leading-none mb-0.5">{currentWeather.name}</span>
                   <span className="text-xs font-bold leading-none">{currentWeather.temp}°C</span>
                </div>
             </div>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-6 h-10 md:w-8 md:h-12 border-4 border-geo-green bg-transparent group-hover:bg-geo-green/20 transition-colors"></div>
              <span className="font-geographica text-xl md:text-2xl font-black tracking-tighter uppercase text-white group-hover:text-geo-green transition-colors mt-[2px]">
                Geovizija
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8 items-center justify-center flex-1 px-8">
            {allCategories.slice(0, 6).map((cat) => {
              const isActive = location.pathname === `/category/${cat.id}`;
              return (
                <Link 
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className={`
                    text-xs lg:text-sm font-bold uppercase tracking-widest transition-all py-5 border-b-2
                    ${isActive ? 'text-white border-geo-green' : 'text-stone-400 border-transparent hover:text-geo-green hover:border-geo-green/50'}
                  `}
                >
                  {cat.name}
                </Link>
              );
            })}
             <Link 
                to="/categories"
                className={`
                  text-xs lg:text-sm font-bold uppercase tracking-widest transition-all py-5 border-b-2
                  ${location.pathname === '/categories' ? 'text-white border-geo-green' : 'text-stone-400 border-transparent hover:text-geo-green hover:border-geo-green/50'}
                `}
              >
                Više
              </Link>
          </nav>

          {/* Desktop Right Actions: Search & Weather */}
          <div className="hidden md:flex items-center gap-6">
             
             <button onClick={() => setSearchOpen(true)} className="p-2 text-stone-300 hover:text-white transition-colors" aria-label="Pretraga (Ctrl+K)" title="Pretraga (Ctrl+K)">
               <Search size={20} />
             </button>

             {/* Weather Widget */}
             <div className="flex items-center gap-3 bg-stone-900/50 px-3 py-1.5 rounded-md border border-stone-800 min-w-[140px] justify-between cursor-default group hover:border-geo-green/30 transition-colors">
                <div className={`flex items-center gap-3 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                   <WeatherIcon condition={currentWeather.condition} className="text-geo-green w-5 h-5 group-hover:text-white transition-colors" />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 leading-none mb-1 group-hover:text-geo-green transition-colors">{currentWeather.name}</span>
                      <span className="text-sm font-bold leading-none">{currentWeather.temp}°C</span>
                   </div>
                </div>
             </div>
             
          </div>

          {/* Mobile Right: Search */}
          <div className="flex items-center justify-end md:hidden w-24">
             <button onClick={() => setSearchOpen(true)} className="p-2 -mr-2 text-stone-300 hover:text-white" aria-label="Pretraga">
               <Search size={24} />
             </button>
          </div>
        </div>
      </div>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};