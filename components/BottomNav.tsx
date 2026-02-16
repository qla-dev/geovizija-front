import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Compass, Bookmark, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Naslovna' },
    { to: '/categories', icon: Grid, label: 'Kategorije' },
    { to: '/explore', icon: Compass, label: 'Istraži' }, // Placeholder route
    { to: '/saved', icon: Bookmark, label: 'Spremljeno' }, // Placeholder
    { to: '/profile', icon: User, label: 'Profil' }, // Placeholder
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-stone-950 border-t border-stone-800 md:hidden z-50 safe-area-bottom">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => (
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
      </nav>
    </div>
  );
};