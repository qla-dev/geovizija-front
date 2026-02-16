import React from 'react';
import { CATEGORIES } from '../constants';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 mb-12 text-center md:text-left">
        Kategorije
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CATEGORIES.map((category) => (
          <Link 
            key={category.id} 
            to={`/category/${category.id}`}
            className="group relative h-72 overflow-hidden block bg-stone-900 rounded-sm shadow-md hover:shadow-xl transition-all duration-500"
          >
            {/* Background Image */}
            <img 
              src={category.imageUrl} 
              alt={category.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
            />
            
            {/* Color Overlay */}
            <div className={`absolute inset-0 ${category.color} opacity-85 transition-opacity duration-500 group-hover:opacity-75`} />
            
            {/* Texture (Optional for magazine feel) */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
               <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                 <h2 className="text-3xl font-serif font-bold text-white mb-2 drop-shadow-md">{category.name}</h2>
                 <p className="text-white/90 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center translate-y-4 group-hover:translate-y-0">
                   Istraži temu <ArrowRight size={14} className="ml-2" />
                 </p>
               </div>
            </div>
            
            {/* Decorative Icon or Number */}
            <div className="absolute top-0 right-0 p-6 text-white/10 font-serif text-7xl font-black leading-none group-hover:text-white/20 transition-colors">
              {category.name.charAt(0)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};