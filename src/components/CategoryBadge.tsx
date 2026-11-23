import React from 'react';
import { BusCategory, Language } from '../types';
import { CATEGORIES_INFO } from '../data/mockBuses';

interface CategoryBadgeProps {
  category: BusCategory;
  language?: Language;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  language = 'dual',
  size = 'md',
  showTagline = false,
}) => {
  const info = CATEGORIES_INFO[category] || CATEGORIES_INFO['Ordinary'];

  const sizeClasses = {
    sm: 'text-[11px] sm:text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm sm:text-base px-3 sm:px-3.5 py-1 sm:py-1.5 gap-1.5 sm:gap-2 font-bold',
    xl: 'text-base sm:text-lg px-3.5 sm:px-4 py-1.5 sm:py-2 gap-2 sm:gap-2.5 font-extrabold',
  };

  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm sm:text-base',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
  };

  const renderLabel = () => {
    if (language === 'en') return info.nameEn;
    if (language === 'ta') return info.nameTa;
    return (
      <span className="inline-flex flex-wrap items-center gap-x-1">
        <span>{info.nameEn}</span>
        <span className="text-[0.82em] font-normal opacity-90 tracking-normal">({info.nameTa})</span>
      </span>
    );
  };

  return (
    <div className="inline-flex flex-col items-start gap-1 max-w-full">
      <span
        id={`category-badge-${category.toLowerCase()}`}
        className={`inline-flex flex-wrap items-center max-w-full rounded-lg border shadow-sm ${info.badgeBg} ${info.badgeText} ${info.badgeBorder} ${sizeClasses[size]} transition-all duration-200`}
        title={`${info.nameEn} - ${info.taglineEn}`}
      >
        <span className={`${iconSizes[size]} shrink-0`} aria-hidden="true">
          {info.icon}
        </span>
        <span className="tracking-wide uppercase leading-tight">{renderLabel()}</span>

        {category === 'Ordinary' && (
          <span className="rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/40 text-[10px] px-1.5 py-0.2 font-medium tracking-tight whitespace-nowrap">
            {language === 'ta' ? 'மகளிர் இலவசம்' : 'Women Free'}
          </span>
        )}
        {category === 'AC' && (
          <span className="rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/40 text-[10px] px-1.5 py-0.2 font-medium tracking-tight whitespace-nowrap">
            EV / AC
          </span>
        )}
      </span>

      {showTagline && (
        <span className="text-xs text-slate-400 font-normal">
          {language === 'ta' ? info.taglineTa : info.taglineEn}
        </span>
      )}
    </div>
  );
};
