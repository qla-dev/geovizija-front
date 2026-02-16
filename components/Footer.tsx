import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, Linkedin, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-stone-800 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: LEGAL */}
          <div>
            <h4 className="uppercase text-[10px] font-bold tracking-[0.2em] mb-6 text-stone-100">Pravno</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Uvjeti korištenja</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Politika privatnosti</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">EU prava privatnosti</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Postavke kolačića</Link></li>
            </ul>
          </div>

          {/* Column 2: OUR SITES */}
          <div>
            <h4 className="uppercase text-[10px] font-bold tracking-[0.2em] mb-6 text-stone-100">Naš Portal</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Geovizija Naslovnica</Link></li>
              <li><Link to="/categories" className="text-xs text-stone-400 hover:text-white transition-colors">Kategorije</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Događanja uživo</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Interaktivne karte</Link></li>
              <li><Link to="/category/skolstvo" className="text-xs text-stone-400 hover:text-white transition-colors">Za djecu i škole</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Geovizija TV</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">O nama</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Podrži našu misiju</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Press centar</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Oglašavanje</Link></li>
            </ul>
          </div>

          {/* Column 3: JOIN US */}
          <div>
            <h4 className="uppercase text-[10px] font-bold tracking-[0.2em] mb-6 text-stone-100">Pridruži se</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Pretplati se</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Korisnička podrška</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Obnovi pretplatu</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Upravljanje računom</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Karijere</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Newsletter</Link></li>
              <li><Link to="/" className="text-xs text-stone-400 hover:text-white transition-colors">Donacije za prirodu</Link></li>
            </ul>
          </div>

          {/* Column 4: FOLLOW US */}
          <div>
            <h4 className="uppercase text-[10px] font-bold tracking-[0.2em] mb-6 text-stone-100">Pratite nas</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className="text-stone-400 hover:text-white transition-colors"><Instagram size={18} /></a>
              <a href="#" className="text-stone-400 hover:text-white transition-colors"><Facebook size={18} /></a>
              <a href="#" className="text-stone-400 hover:text-white transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-stone-400 hover:text-white transition-colors"><Youtube size={18} /></a>
              <a href="#" className="text-stone-400 hover:text-white transition-colors"><Linkedin size={18} /></a>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-stone-400 hover:text-white cursor-pointer transition-colors">
              <Globe size={14} />
              <span>Hrvatska (Promijeni)</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 group">
              {/* Logo shape matching Header but sized for footer */}
              <div className="w-8 h-12 border-4 border-geo-green bg-transparent group-hover:bg-geo-green/20 transition-colors"></div>
              <span className="font-geographica text-2xl font-black tracking-tighter uppercase text-stone-300 group-hover:text-geo-green transition-colors mt-[2px]">
                Geovizija
              </span>
          </Link>
          
          <div className="text-[10px] text-stone-500 flex flex-col md:flex-row items-center gap-1 md:gap-4">
             <span>Copyright © 2024 Geovizija Society</span>
             <span className="hidden md:inline">|</span>
             <span>Sva prava pridržana</span>
          </div>
        </div>
      </div>
    </footer>
  );
};