import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import { useContent } from './ContentProvider';

// First year of the copyright range; the end year is always the current one.
const COPYRIGHT_START = 2018;

export const Footer: React.FC = () => {
  const { categories } = useContent();
  return (
    <footer className="bg-black text-white pt-8 md:pt-12 pb-footer border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Links Grid (desktop only; mobile shows just the bottom bar). Only links that lead somewhere. */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 mb-8">

          <div>
            <h4 className="uppercase text-[10px] font-bold tracking-[0.2em] mb-6 text-stone-100">Kategorije</h4>
            <ul className="space-y-3">
              {categories.map(category => (
                <li key={category.id}><Link to={`/category/${category.id}`} className="text-xs text-stone-400 hover:text-white transition-colors">{category.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="uppercase text-[10px] font-bold tracking-[0.2em] mb-6 text-stone-100">Naš portal</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Naslovna</Link></li>
              <li><Link to="/categories" className="text-xs text-stone-400 hover:text-white transition-colors">Sve kategorije</Link></li>
              <li><Link to="/quiz" className="text-xs text-stone-400 hover:text-white transition-colors">Kviz dana</Link></li>
              <li><Link to="/category/skolstvo" className="text-xs text-stone-400 hover:text-white transition-colors">Za djecu i škole</Link></li>
              <li><a href="/#newsletter" className="text-xs text-stone-400 hover:text-white transition-colors">Newsletter</a></li>
              <li><Link to="/privatnost" className="text-xs text-stone-400 hover:text-white transition-colors">Politika privatnosti</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="uppercase text-[10px] font-bold tracking-[0.2em] mb-6 text-stone-100">Pratite nas</h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/geovizija/" target="_blank" rel="noopener" aria-label="Instagram" className="text-stone-400 hover:text-white transition-colors"><Instagram size={18} /></a>
              <a href="https://www.facebook.com/profile.php?id=61594932783634" target="_blank" rel="noopener" aria-label="Facebook" className="text-stone-400 hover:text-white transition-colors"><Facebook size={18} /></a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="md:border-t md:border-stone-800 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 group">
              {/* Logo shape matching Header but sized for footer */}
              <div className="w-8 h-12 border-4 border-geo-green bg-transparent group-hover:bg-geo-green/20 transition-colors"></div>
              <span className="font-geographica text-2xl font-black tracking-tighter uppercase text-stone-300 group-hover:text-geo-green transition-colors mt-[2px]">
                Geovizija
              </span>
          </Link>
          
          <div className="text-[10px] text-stone-500 flex flex-col md:flex-row items-center gap-1 md:gap-4">
             <span>Copyright © {COPYRIGHT_START}–{new Date().getFullYear()} Geovizija</span>
             <span className="hidden md:inline">|</span>
             <span>Sva prava pridržana</span>
             <span className="hidden md:inline">|</span>
             <Link to="/privatnost" className="hover:text-white transition-colors">Politika privatnosti</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};