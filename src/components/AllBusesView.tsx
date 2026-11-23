import React, { useState, useMemo } from 'react';
import { useBus } from '../context/BusContext';
import { CategoryBadge } from './CategoryBadge';
import { ETAIndicator } from './ETAIndicator';
import { BusCategory, MTCBus } from '../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  Bus,
  ArrowRight,
  MapPin,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AllBusesView: React.FC = () => {
  const { buses, currentBusStand, language, setSelectedBus } = useBus();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'eta' | 'busNo' | 'destination'>('eta');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const categories = ['All', 'Ordinary', 'Express', 'Deluxe', 'AC', 'Special'];
  const statuses = ['All', 'Arriving', 'Approaching', 'On Time', 'Delayed'];

  const filteredAndSortedBuses = useMemo(() => {
    let result = [...buses];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.busNo.toLowerCase().includes(q) ||
          b.destinationEn.toLowerCase().includes(q) ||
          b.destinationTa.toLowerCase().includes(q) ||
          b.routeNameEn.toLowerCase().includes(q) ||
          b.viaStopsEn.some((s) => s.toLowerCase().includes(q)),
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((b) => b.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'All') {
      if (selectedStatus === 'Arriving') result = result.filter((b) => b.status === 'arriving_now' || b.etaMinutes <= 0);
      else if (selectedStatus === 'Approaching') result = result.filter((b) => b.status === 'approaching');
      else if (selectedStatus === 'On Time') result = result.filter((b) => b.status === 'on_time');
      else if (selectedStatus === 'Delayed') result = result.filter((b) => b.status === 'delayed');
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'eta') {
        comparison = a.etaMinutes - b.etaMinutes;
      } else if (sortBy === 'busNo') {
        comparison = a.busNo.localeCompare(b.busNo, undefined, { numeric: true });
      } else if (sortBy === 'destination') {
        comparison = a.destinationEn.localeCompare(b.destinationEn);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [buses, searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const toggleSort = (newSortBy: 'eta' | 'busNo' | 'destination') => {
    if (sortBy === newSortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return (
    <div id="all-buses-view" className="w-full flex flex-col gap-5 pb-16">
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
            <Layers className="h-4 w-4 shrink-0" />
            <span>MTC Fleet Schedules</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white mt-1">
            {language === 'ta' ? 'அனைத்து பேருந்துகள்' : 'ALL BUSES AT THIS STOP'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {language === 'ta'
              ? `${currentBusStand.nameTa} வழியே இயங்கும் அனைத்து மாநகர பேருந்துகளின் பட்டியல்`
              : `Complete schedule of all expected MTC buses serving ${currentBusStand.nameEn}`}
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-2xl shrink-0">
          <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tabular-nums">
            {filteredAndSortedBuses.length}
          </span>
          <span className="text-xs text-slate-400 uppercase font-semibold">
            Buses Active
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col gap-3.5 bg-slate-900/80 border border-slate-800 p-3.5 sm:p-5 rounded-2xl shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full lg:flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="search-all-buses"
              type="text"
              placeholder={
                language === 'ta'
                  ? 'பேருந்து எண் அல்லது சேருமிடம் தேடுக (எ.கா. 70A, தாம்பரம்)...'
                  : 'Search bus number or destination (e.g., 70A, Tambaram)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Sort Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 bg-slate-950 border border-slate-800 p-1.5 sm:p-1 rounded-xl text-xs font-bold w-full lg:w-auto">
            <span className="text-[11px] text-slate-400 px-1.5 flex items-center gap-1 shrink-0">
              <ArrowUpDown className="h-3 w-3" /> Sort:
            </span>
            <button
              onClick={() => toggleSort('eta')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                sortBy === 'eta' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              ETA {sortBy === 'eta' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('busNo')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                sortBy === 'busNo' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              Bus No {sortBy === 'busNo' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('destination')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                sortBy === 'destination' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              Dest {sortBy === 'destination' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid of All Buses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedBuses.map((bus) => (
          <div
            key={bus.id}
            id={`all-bus-card-${bus.busNo.toLowerCase()}`}
            onClick={() => setSelectedBus(bus)}
            className="group relative flex flex-col justify-between rounded-2xl border-2 border-slate-800 bg-slate-950 p-4 sm:p-5 hover:border-amber-400/80 hover:bg-slate-900/60 transition-all duration-200 cursor-pointer shadow-lg"
          >
            <div>
              {/* Top Row: Bus No + Category */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="rounded-xl bg-slate-900 border-2 border-slate-700 px-3 py-1.5 font-mono text-xl sm:text-2xl font-black text-amber-400 group-hover:border-amber-400 transition-colors shrink-0">
                    {bus.busNo}
                  </div>
                  <div className="min-w-0">
                    <CategoryBadge category={bus.category} language={language} size="sm" />
                    <span className="block text-[10px] text-cyan-300 font-bold mt-1">
                      {bus.platform}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <ETAIndicator
                    etaMinutes={bus.etaMinutes}
                    etaSecondsRemaining={bus.etaSecondsRemaining}
                    status={bus.status}
                    language={language}
                    size="md"
                    showSubtext={false}
                  />
                </div>
              </div>

              {/* Destination & Route */}
              <div className="mt-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
                  <span className="truncate">{language === 'ta' ? bus.originTa : bus.originEn}</span>
                  <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
                  <span className="text-slate-300">{language === 'ta' ? bus.destinationTa : bus.destinationEn}</span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                  {language === 'ta' ? bus.destinationTa : bus.destinationEn}
                </h3>
                {language === 'dual' && (
                  <p className="text-sm font-bold text-amber-200/90 leading-snug">
                    {bus.destinationTa}
                  </p>
                )}
              </div>

              {/* Via Stops snippet */}
              <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
                <MapPin className="h-3 w-3 text-slate-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-snug">
                  {language === 'ta'
                    ? bus.viaStopsTa.slice(0, 3).join(' • ')
                    : language === 'en'
                    ? bus.viaStopsEn.slice(0, 3).join(' • ')
                    : `${bus.viaStopsEn.slice(0, 3).join(' • ')} (${bus.viaStopsTa.slice(0, 2).join(', ')})`}
                </span>
              </div>
            </div>

            {/* Card Footer: Fare & Details prompt */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-emerald-400">
                {language === 'ta' ? bus.fareEstimateTa : bus.fareEstimateEn}
              </span>
              <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                View Stops →
              </span>
            </div>
          </div>
        ))}

        {filteredAndSortedBuses.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
            <Bus className="h-12 w-12 mx-auto text-slate-600 mb-3" />
            <p className="text-lg font-bold text-white">No buses match your filter</p>
            <p className="text-sm mt-1">Try clearing your search query or selecting 'All' categories.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedStatus('All');
              }}
              className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
