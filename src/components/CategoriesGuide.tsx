import React from 'react';
import { useBus } from '../context/BusContext';
import { CATEGORIES_INFO } from '../data/mockBuses';
import { CategoryBadge } from './CategoryBadge';
import { BusCategory } from '../types';
import { ShieldCheck, Heart, Sparkles, Check, DollarSign, Info } from 'lucide-react';

export const CategoriesGuide: React.FC = () => {
  const { language, buses } = useBus();

  const categoryKeys: BusCategory[] = ['Ordinary', 'Express', 'Deluxe', 'AC', 'Special'];

  return (
    <div id="categories-guide-view" className="w-full flex flex-col gap-6 pb-16">
      {/* Hero Explainer */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
          <Sparkles className="h-4 w-4" />
          <span>Passenger Service Classification</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white mt-1.5">
          {language === 'ta' ? 'மாநகர பேருந்து வகைப்பாடு மற்றும் சேவைகள்' : 'MTC CHENNAI BUS CATEGORIES & FARES'}
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
          {language === 'ta'
            ? 'சென்னை மாநகரப் போக்குவரத்துக் கழகம் (MTC) பயணிகளின் வசதிக்காக பல்வேறு கட்டமைப்பு மற்றும் கட்டணக் கொள்கைகளுடன் கூடிய 5 பிரதான பேருந்து சேவைகளை இயக்குகிறது.'
            : 'Chennai Metropolitan Transport Corporation (MTC) operates 5 distinct passenger service tiers designed for accessibility, speed, and premium comfort across Chennai and suburban corridors.'}
        </p>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categoryKeys.map((catKey) => {
          const info = CATEGORIES_INFO[catKey];
          const activeCount = buses.filter((b) => b.category === catKey).length;

          return (
            <div
              key={catKey}
              id={`cat-guide-card-${catKey.toLowerCase()}`}
              className="flex flex-col justify-between rounded-3xl border-2 border-slate-800 bg-slate-950 p-6 shadow-xl hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <CategoryBadge category={catKey} language={language} size="lg" />
                  <span className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs font-bold text-slate-400 whitespace-nowrap shrink-0">
                    {activeCount} in Fleet
                  </span>
                </div>

                {/* Tagline */}
                <h4 className="text-base font-extrabold text-white mt-2">
                  {language === 'ta' ? info.taglineTa : info.taglineEn}
                </h4>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {language === 'ta' ? info.descriptionTa : info.descriptionEn}
                </p>

                {/* Fare Range Tag */}
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 text-xs font-bold">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-slate-400 uppercase text-[10px]">Fare Bracket:</span>
                  <span className="text-emerald-400 font-extrabold">{info.fareRange}</span>
                </div>

                {/* Features List */}
                <div className="mt-5 space-y-2 border-t border-slate-800/80 pt-4">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                    Key Amenities & Service Rules:
                  </span>
                  {info.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Note for Ordinary (Vidiyal Payanam) */}
              {catKey === 'Ordinary' && (
                <div className="mt-6 rounded-2xl bg-pink-950/70 border border-pink-500/40 p-3.5 flex items-start gap-2.5 text-pink-200">
                  <Heart className="h-4 w-4 text-pink-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-snug">
                    <strong className="text-pink-300">Vidiyal Payanam:</strong> Free passes/tickets
                    issued instantly by conductor with zero fare for female commuters.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
