import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Compass, Brain, Mail } from 'lucide-react';
import { openSearch } from './SearchOverlay';

// Scrolls to an element once the (possibly new) page has rendered it.
const scrollToId = (id: string, tries = 0) => {
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: 'smooth' });
  else if (tries < 20) setTimeout(() => scrollToId(id, tries + 1), 50);
};

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Naslovna' },
    { to: '/categories', icon: Grid, label: 'Kategorije' },
    { to: '/quiz', icon: Brain, label: 'Kviz' },
    { to: '/', hash: 'newsletter', icon: Mail, label: 'Newsletter' }, // the subscription box at the end of the home page
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-stone-950 border-t border-stone-800 md:hidden z-50 safe-area-bottom">
      <nav className="flex justify-around items-center h-16">
        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-full h-full space-y-1
              ${isActive ? 'text-geo-green' : 'text-stone-500 hover:text-stone-300'}
            `}
          >
            <item.icon size={20} strokeWidth={2} />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </NavLink>
        ))}
        {/* "Istraži" opens the live search */}
        <button onClick={openSearch} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-stone-500 hover:text-stone-300">
          <Compass size={20} strokeWidth={2} />
          <span className="text-[10px] font-medium tracking-wide">Istraži</span>
        </button>
        {navItems.slice(2).map((item) => (
          <NavLink
            key={item.label}
            to={item.hash ? { pathname: item.to, hash: item.hash } : item.to}
            end={!!item.hash}
            onClick={item.hash ? () => scrollToId(item.hash!) : undefined}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-full h-full space-y-1
              ${isActive && !item.hash ? 'text-geo-green' : 'text-stone-500 hover:text-stone-300'}
            `}
          >
            <item.icon size={20} strokeWidth={2} />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};