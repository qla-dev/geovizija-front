import React from 'react';
import { CategoryId } from '../types';
import { useContent } from './ContentProvider';

interface CategoryPillProps {
  id: CategoryId;
  className?: string;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({ id, className = '' }) => {
  const { categories: allCategories } = useContent();
  const category = allCategories.find(c => c.id === id);
  if (!category) return null;

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white ${category.color} ${className}`}>
      {category.name}
    </span>
  );
};