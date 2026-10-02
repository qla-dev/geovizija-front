import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContent } from './ContentProvider';
import { SearchOverlay, OPEN_SEARCH_EVENT, openSearch } from './SearchOverlay';
import { useQuizProgress } from '../services/quizProgress';
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

// Header density steps: all categories stay visible, so when the menu overflows
// the header steps down to smaller text and tighter gaps until it fits.
const DENSITY = [
  { text: 'text-sm', tracking: 'tracking-widest', gap: 'gap-8', pad: 'px-8' },
  { text: 'text-xs', tracking: 'tracking-widest', gap: 'gap-6', pad: 'px-6' },
  { text: 'text-xs', tracking: 'tracking-wider', gap: 'gap-4', pad: 'px-4' },
  { text: 'text-[11px]', tracking: 'tracking-wide', gap: 'gap-3', pad: 'px-4' },
  { text: 'text-[10px]', tracking: 'tracking-normal', gap: 'gap-2.5', pad: 'px-3' },
];
const navItem = 'font-bold uppercase whitespace-nowrap transition-all py-3 xl:py-5 border-b-2';
const navActive = 'text-white border-geo-green';
const navIdle = 'text-stone-400 border-transparent hover:text-geo-green hover:border-geo-green/50';

export const Header: React.FC = () => {
  const { categories: allCategories } = useContent();
  const location = useLocation();
  const navigate = useNavigate();
  const [weatherIndex, setWeatherIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const quizProgress = useQuizProgress();
  const navRef = useRef<HTMLElement>(null);
  const [density, setDensity] = useState(0);
  const d = DENSITY[density];
  const tightest = density === DENSITY.length - 1;

  // Step down one density level while the menu overflows; start over on resize.
  // Watching the links' sizes (not React renders) also catches the moment the
  // Tailwind CDN applies the new text classes.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const check = () => setDensity(level =>
      level < DENSITY.length - 1 && nav.scrollWidth > nav.clientWidth + 1 ? level + 1 : level);
    const observer = new ResizeObserver(check);
    observer.observe(nav);
    nav.querySelectorAll('a').forEach(link => observer.observe(link));
    const onResize = () => setDensity(0);
    window.addEventListener('resize', onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [allCategories]);

  // Ctrl/Cmd+K or "/" (outside text fields) opens search
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
        event.preventDefault();
        openSearch();
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

  // Subscribe opens the newsletter block at the bottom of the home page.
  const goToNewsletter = () => {
    if (location.pathname !== '/') navigate('/');
    let tries = 0;
    const scroll = () => {
      const target = document.getElementById('newsletter');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      else if (tries++ < 20) setTimeout(scroll, 50);
    };
    setTimeout(scroll, 0);
  };

  return (
    <header className={`sticky top-0 z-50 bg-stone-950 text-white shadow-lg ${quizProgress ? '' : 'border-b-4 border-geo-green'}`}>
      {/* Full width: the header uses less side padding than page containers,
          and the subscribe button sits flush against the right edge from lg.
          Below xl the categories get their own row so all of them fit. */}
      <div className="flex md:flex-wrap xl:flex-nowrap justify-between items-stretch h-16 md:h-auto xl:h-16 pl-4 pr-4 md:pl-6 md:pr-6 lg:pr-0">

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
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none md:h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-6 h-10 md:w-8 md:h-12 border-4 border-geo-green bg-transparent group-hover:bg-geo-green/20 transition-colors"></div>
              <span className="font-geographica text-xl md:text-2xl font-black tracking-tighter uppercase text-white group-hover:text-geo-green transition-colors mt-[2px]">
                Geovizija
              </span>
            </Link>
          </div>

          {/* Desktop Navigation: every category; on the tightest level it scrolls if it still does not fit */}
          <nav ref={navRef} className={`hidden md:flex md:order-last md:basis-full md:h-11 md:border-t md:border-stone-800 xl:order-none xl:basis-auto xl:h-auto xl:border-0 ${d.gap} ${d.pad} items-center flex-1 min-w-0 ${tightest ? 'justify-start overflow-x-auto no-scrollbar' : 'justify-center xl:justify-start'}`}>
            {allCategories.map((cat) => {
              const isActive = location.pathname === `/category/${cat.id}`;
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className={`${navItem} ${d.text} ${d.tracking} ${isActive ? navActive : navIdle}`}
                >
                  {cat.name}
                </Link>
              );
            })}
             <Link
                to="/categories"
                className={`${navItem} ${d.text} ${d.tracking} ${location.pathname === '/categories' ? navActive : navIdle}`}
              >
                Više
              </Link>
          </nav>

          {/* Desktop Right Actions: Search, Weather, Login, Subscribe - same gap as the menu items */}
          <div className={`hidden md:flex md:h-16 items-center flex-shrink-0 ${d.gap}`}>

             <button onClick={openSearch} className="p-2 -mx-2 text-stone-300 hover:text-white transition-colors" aria-label="Pretraga (Ctrl+K)" title="Pretraga (Ctrl+K)">
               <Search size={20} />
             </button>

             {/* Weather Widget: fixed width, so changing cities never move the menu */}
             <div className="flex items-center gap-3 bg-stone-900/50 px-3 py-1.5 rounded-md border border-stone-800 w-[148px] flex-shrink-0 justify-between cursor-default group hover:border-geo-green/30 transition-colors">
                <div className={`flex items-center gap-3 min-w-0 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                   <WeatherIcon condition={currentWeather.condition} className="text-geo-green w-5 h-5 group-hover:text-white transition-colors" />
                   <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 leading-none mb-1 group-hover:text-geo-green transition-colors truncate">{currentWeather.name}</span>
                      <span className="text-sm font-bold leading-none">{currentWeather.temp}°C</span>
                   </div>
                </div>
             </div>

             <Link to="/profile" className={`hidden lg:block ${d.text} ${d.tracking} font-bold uppercase text-stone-300 hover:text-white transition-colors whitespace-nowrap`}>
               Prijava
             </Link>

             <button
               onClick={goToNewsletter}
               className={`hidden lg:flex items-center self-stretch ${density < 2 ? 'px-8' : 'px-5'} bg-geo-green text-stone-950 ${d.text} ${d.tracking} font-black uppercase hover:bg-white transition-colors whitespace-nowrap`}
             >
               Pretplati se
             </button>
          </div>

          {/* Mobile Right: Search */}
          <div className="flex items-center justify-end md:hidden w-24">
             <button onClick={openSearch} className="p-2 -mr-2 text-stone-300 hover:text-white" aria-label="Pretraga">
               <Search size={24} />
             </button>
          </div>
      </div>
      {/* During a quiz the 4px bottom border becomes the question stepper */}
      {quizProgress && (
        <div className="flex h-1 gap-0.5 bg-stone-950" role="progressbar" aria-valuemin={1} aria-valuemax={quizProgress.results.length} aria-valuenow={quizProgress.current + 1}>
          {quizProgress.results.map((result, i) => (
            <span
              key={i}
              className={`flex-1 transition-colors duration-300 ${
                result === true ? 'bg-geo-green' : result === false ? 'bg-rose-500'
                  : i === quizProgress.current ? 'bg-white' : 'bg-stone-700'
              }`}
            />
          ))}
        </div>
      )}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};