import React from 'react';
import { useBus } from '../context/BusContext';
import { CategoryBadge } from './CategoryBadge';
import { ETAIndicator } from './ETAIndicator';
import { MTCBus } from '../types';
import {
  ArrowRight,
  MapPin,
  Sparkles,
  Users,
  Volume2,
  ShieldAlert,
  BellRing,
  RotateCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface NextBusesBoardProps {
  onSelectBus?: (bus: MTCBus) => void;
  maxDisplay?: number;
}

export const NextBusesBoard: React.FC<NextBusesBoardProps> = ({ onSelectBus, maxDisplay = 7 }) => {
  const {
    buses,
    currentBusStand,
    language,
    setSelectedBus,
    isTvMode,
    announceBus,
    safetyAnnouncementsEnabled,
    setSafetyAnnouncementsEnabled,
    announceNextBusEnabled,
    setAnnounceNextBusEnabled,
    currentSafetyRule,
    currentSafetyRuleIndex,
    announceNextBus,
    announceSafetyRule,
    cycleNextSafetyRule,
  } = useBus();

  const sortedBuses = [...buses]
    .sort((a, b) => a.etaMinutes - b.etaMinutes)
    .slice(0, maxDisplay);

  const upcomingBuses = sortedBuses.filter((b) => b.etaMinutes > 0);
  const nextBusOnDisplay = upcomingBuses[0] || sortedBuses[1] || sortedBuses[0];

  const handleRowClick = (bus: MTCBus) => {
    if (onSelectBus) {
      onSelectBus(bus);
    } else {
      setSelectedBus(bus);
    }
  };

  return (
    <div id="next-buses-board" className="w-full flex flex-col gap-3.5">
      {/* Board Header Title & Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/95 border border-slate-800 px-5 py-3.5 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">
                {language === 'ta'
                  ? 'அடுத்து வரும் பேருந்துகள்'
                  : language === 'en'
                  ? 'NEXT ARRIVING BUSES'
                  : 'NEXT ARRIVING BUSES • அடுத்து வரும் பேருந்துகள்'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              {language === 'ta'
                ? `நிகழ்நேர வருகை பலகை • ${currentBusStand.nameTa}`
                : language === 'en'
                ? `Live Arrival Display Board • ${currentBusStand.nameEn}`
                : `${currentBusStand.nameEn} • ${currentBusStand.nameTa}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            {language === 'ta'
              ? 'நேரடி GPS கண்காணிப்பு'
              : language === 'en'
              ? 'Live GPS Tracking'
              : 'Live GPS • நேரடி கண்காணிப்பு'}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-semibold border border-slate-700">
            {language === 'ta'
              ? `${sortedBuses.length} பேருந்துகள்`
              : language === 'en'
              ? `${sortedBuses.length} Buses Scheduled`
              : `${sortedBuses.length} Buses • ${sortedBuses.length} பேருந்துகள்`}
          </span>
        </div>
      </div>

      {/* DUAL SPOTLIGHT: Next Bus On Display & In-Between Gap Safety Rules Announcement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Spotlight Card 1: Next Bus Scheduled on Display */}
        <div
          id="next-bus-display-card"
          className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/20 p-4 shadow-xl"
        >
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black text-xs shadow-md shrink-0">
                <BellRing className="h-4 w-4" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                    {language === 'ta'
                      ? 'அடுத்ததாக வரும் பேருந்து'
                      : language === 'en'
                      ? 'NEXT BUS ON DISPLAY'
                      : 'NEXT BUS • அடுத்த பேருந்து'}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {language === 'dual' ? 'தமிழ் + EN' : language.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight mt-0.5">
                  {language === 'ta'
                    ? 'காட்சி பலகையில் அடுத்த பேருந்து அழைப்பு'
                    : language === 'en'
                    ? 'Upcoming Bus Queued on Screen'
                    : 'Upcoming Bus • காட்சி பலகையில் அடுத்த பேருந்து'}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAnnounceNextBusEnabled(!announceNextBusEnabled)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors shrink-0 ${
                announceNextBusEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Toggle automatic next-bus announcement along with arrivals"
            >
              Auto-Call: {announceNextBusEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {nextBusOnDisplay ? (
            <div className="flex items-center justify-between gap-3 bg-slate-950/80 border border-slate-800/90 rounded-xl p-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900 border-2 border-amber-400 px-3 py-1.5 shadow-md shrink-0">
                  <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                    {nextBusOnDisplay.busNo}
                  </span>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase">
                    {nextBusOnDisplay.platform}
                  </span>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium flex-wrap">
                    <span>
                      {language === 'ta' ? nextBusOnDisplay.originTa : nextBusOnDisplay.originEn}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-500 shrink-0" />
                    {language === 'dual' && (
                      <span className="text-slate-400 text-[11px]">({nextBusOnDisplay.originTa})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-sm sm:text-base font-black text-white">
                      {language === 'ta'
                        ? nextBusOnDisplay.destinationTa
                        : nextBusOnDisplay.destinationEn}
                    </span>
                    {language === 'dual' && (
                      <span className="text-sm sm:text-base font-bold text-amber-200">
                        ({nextBusOnDisplay.destinationTa})
                      </span>
                    )}
                    <CategoryBadge category={nextBusOnDisplay.category} language={language} size="sm" />
                  </div>

                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mt-1 flex-wrap">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {nextBusOnDisplay.etaMinutes <= 1
                      ? language === 'ta'
                        ? 'விரைவில் (1 நிமிடத்தில்)'
                        : language === 'en'
                        ? 'Arriving Shortly (< 1 min)'
                        : 'Arriving Shortly • விரைவில் (< 1 நிமி)'
                      : language === 'ta'
                      ? `இன்னும் ${nextBusOnDisplay.etaMinutes} நிமிடங்களில் வரும்`
                      : language === 'en'
                      ? `Arriving in ${nextBusOnDisplay.etaMinutes} mins`
                      : `In ${nextBusOnDisplay.etaMinutes} mins • இன்னும் ${nextBusOnDisplay.etaMinutes} நிமிடங்களில்`}
                  </span>
                </div>
              </div>

              <button
                id="btn-announce-next-bus"
                type="button"
                onClick={() => announceNextBus(nextBusOnDisplay)}
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 shrink-0"
                title={`Announce Next Bus ${nextBusOnDisplay.busNo} in ${language.toUpperCase()}`}
              >
                <div className="flex items-center gap-1">
                  <Volume2 className="h-4 w-4" />
                  <span>{language === 'ta' ? 'ஒலிக்க' : 'Call Next'}</span>
                </div>
                {language === 'dual' && <span className="text-[10px] font-bold leading-none">அடுத்தது</span>}
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-2">
              {language === 'ta'
                ? 'அடுத்த பேருந்துகள் எதுவும் இல்லை.'
                : 'No upcoming buses in queue • அடுத்த பேருந்துகள் இல்லை.'}
            </p>
          )}
        </div>

        {/* Spotlight Card 2: Transit Safety Rules in the Gap of Arriving Buses */}
        <div
          id="safety-rules-gap-card"
          className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/20 p-4 shadow-xl"
        >
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black text-xs shadow-md shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                    {language === 'ta'
                      ? 'பாதுகாப்பு விதிகள்'
                      : language === 'en'
                      ? 'PASSENGER SAFETY RULES'
                      : 'SAFETY RULES • பயணிகள் பாதுகாப்பு விதி'}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-emerald-500/30">
                    Rule {currentSafetyRuleIndex + 1}/6
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight mt-0.5">
                  {language === 'ta'
                    ? 'பேருந்து வருகை இடைவேளையில் பாதுகாப்பு ஒலிபரப்பு'
                    : language === 'en'
                    ? 'Broadcasted in Gaps Between Bus Arrivals'
                    : 'Gap Safety Broadcast • வருகை இடைவேளை ஒலிபரப்பு'}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSafetyAnnouncementsEnabled(!safetyAnnouncementsEnabled)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors shrink-0 ${
                safetyAnnouncementsEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Toggle automatic safety rule announcements during arrival gaps"
            >
              Gap Audio: {safetyAnnouncementsEnabled ? 'ON' : 'PAUSED'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 bg-slate-950/80 border border-slate-800/90 rounded-xl p-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-white block">
                  {language === 'ta'
                    ? currentSafetyRule.ruleTitleTa
                    : language === 'en'
                    ? currentSafetyRule.ruleTitleEn
                    : `${currentSafetyRule.ruleTitleEn} • ${currentSafetyRule.ruleTitleTa}`}
                </span>
                {language === 'dual' ? (
                  <div className="mt-1 space-y-0.5">
                    <p className="text-[11px] text-slate-200 font-medium leading-snug">
                      {currentSafetyRule.speechTextEn}
                    </p>
                    <p className="text-[11px] text-emerald-200/95 font-medium leading-snug">
                      {currentSafetyRule.speechTextTa}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-200 mt-1 font-medium leading-snug">
                    {language === 'ta' ? currentSafetyRule.speechTextTa : currentSafetyRule.speechTextEn}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={cycleNextSafetyRule}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs"
                title="Next Safety Rule"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                id="btn-announce-safety-rule"
                type="button"
                onClick={() => announceSafetyRule(currentSafetyRuleIndex)}
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
                title={`Announce safety rule now in ${language.toUpperCase()}`}
              >
                <div className="flex items-center gap-1">
                  <Volume2 className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {language === 'ta' ? 'ஒலிக்க' : 'Announce'}
                  </span>
                </div>
                {language === 'dual' && (
                  <span className="hidden sm:inline text-[10px] font-bold leading-none">ஒலிபரப்பு</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main High-Contrast Bilingual Public Transit Display Board */}
      <div className="overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-950 shadow-2xl">
        {/* Table Column Headers - Bilingual Tamil & English */}
        <div className="grid grid-cols-12 gap-2 bg-slate-900/95 border-b border-slate-800 px-4 py-3 text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-300">
          <div className="col-span-1 text-center text-amber-400">#</div>
          <div className="col-span-2 sm:col-span-2 text-left pl-2">
            {language === 'ta' ? (
              'பேருந்து எண்'
            ) : language === 'en' ? (
              'BUS NO.'
            ) : (
              <div>
                <div>BUS NO.</div>
                <div className="text-[10px] text-amber-300/90 font-bold normal-case">பேருந்து எண்</div>
              </div>
            )}
          </div>
          <div className="col-span-4 sm:col-span-4 text-left">
            {language === 'ta' ? (
              'வழித்தடம் & சேருமிடம்'
            ) : language === 'en' ? (
              'ROUTE & DESTINATION'
            ) : (
              <div>
                <div>ROUTE &amp; DESTINATION</div>
                <div className="text-[10px] text-amber-300/90 font-bold normal-case">வழித்தடம் &amp; சேருமிடம்</div>
              </div>
            )}
          </div>
          <div className="col-span-2 hidden md:block text-left">
            {language === 'ta' ? (
              'பேருந்து வகை'
            ) : language === 'en' ? (
              'BUS TYPE'
            ) : (
              <div>
                <div>BUS TYPE</div>
                <div className="text-[10px] text-amber-300/90 font-bold normal-case">பேருந்து வகை</div>
              </div>
            )}
          </div>
          <div className="col-span-2 sm:col-span-1 text-center">
            {language === 'ta' ? (
              'நடைமேடை'
            ) : language === 'en' ? (
              'BAY'
            ) : (
              <div>
                <div>BAY</div>
                <div className="text-[10px] text-amber-300/90 font-bold normal-case">நடைமேடை</div>
              </div>
            )}
          </div>
          <div className="col-span-3 sm:col-span-2 text-right pr-2">
            {language === 'ta' ? (
              'வருகை நேரம்'
            ) : language === 'en' ? (
              'ARRIVAL ETA'
            ) : (
              <div>
                <div>ARRIVAL ETA</div>
                <div className="text-[10px] text-amber-300/90 font-bold normal-case">வருகை நேரம்</div>
              </div>
            )}
          </div>
        </div>

        {/* Bus Rows */}
        <div className="divide-y divide-slate-800/80">
          {sortedBuses.map((bus, idx) => {
            const isFirst = idx === 0;
            const isArriving = bus.status === 'arriving_now' || bus.etaMinutes <= 0;
            const isNextQueued = nextBusOnDisplay && nextBusOnDisplay.id === bus.id && !isArriving;

            return (
              <div
                key={bus.id}
                id={`bus-row-${bus.busNo.toLowerCase()}`}
                onClick={() => handleRowClick(bus)}
                className={`grid grid-cols-12 gap-2 items-center px-4 py-3.5 sm:py-4 cursor-pointer transition-all duration-150 hover:bg-slate-900/90 group ${
                  isArriving
                    ? 'bg-emerald-950/25 border-l-4 border-l-emerald-400'
                    : isNextQueued
                    ? 'bg-amber-950/20 border-l-4 border-l-amber-400'
                    : isFirst
                    ? 'bg-slate-900/40 border-l-4 border-l-slate-700'
                    : 'border-l-4 border-l-transparent'
                }`}
                title="Click for full route details and stops"
              >
                {/* 1. Priority Rank */}
                <div className="col-span-1 flex flex-col items-center justify-center">
                  <span
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl font-black text-sm sm:text-base border ${
                      isArriving
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                        : isNextQueued
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </span>
                </div>

                {/* 2. Bus Number Badge - Extra Large & High Contrast */}
                <div className="col-span-2 sm:col-span-2 flex flex-col items-start pl-1">
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 border-2 border-slate-700 group-hover:border-amber-400/70 transition-colors shadow-inner">
                    <span className="font-mono text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-amber-400">
                      {bus.busNo}
                    </span>
                  </div>
                  {bus.isWomenFree && (
                    <span className="mt-1 text-[10px] font-bold text-pink-300 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0"></span>
                      {language === 'ta'
                        ? 'மகளிர் இலவசம்'
                        : language === 'en'
                        ? 'Free for Women'
                        : 'Free • மகளிர் இலவசம்'}
                    </span>
                  )}
                  <div className="mt-1 md:hidden">
                    <CategoryBadge category={bus.category} language={language} size="sm" />
                  </div>
                </div>

                {/* 3. Route & Destination - Prominent Bilingual Display */}
                <div className="col-span-4 sm:col-span-4 flex flex-col justify-center pr-2">
                  {/* Origin -> Destination small indicator */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium flex-wrap">
                    <span className="truncate max-w-[140px] sm:max-w-none">
                      {language === 'ta'
                        ? bus.originTa
                        : language === 'en'
                        ? bus.originEn
                        : `${bus.originEn} (${bus.originTa})`}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-500 shrink-0" />
                  </div>

                  {/* Destination Big Text - Always Clear in Both English & Tamil */}
                  <div className="mt-0.5 flex flex-col">
                    <span className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight group-hover:text-amber-300 transition-colors leading-tight">
                      {language === 'ta' ? bus.destinationTa : bus.destinationEn}
                    </span>
                    {language === 'dual' && (
                      <span className="text-sm sm:text-base md:text-lg font-bold text-amber-200/95 leading-snug mt-0.5">
                        {bus.destinationTa}
                      </span>
                    )}
                  </div>

                  {/* Via Major Stops Snippet */}
                  <div className="hidden sm:flex items-start gap-1 text-[11px] text-slate-300 mt-1">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col leading-tight">
                      {language === 'ta' ? (
                        <span className="text-slate-300">
                          வழி: {bus.viaStopsTa.slice(0, 3).join(', ')}
                        </span>
                      ) : language === 'en' ? (
                        <span className="text-slate-300">
                          Via: {bus.viaStopsEn.slice(0, 3).join(', ')}
                        </span>
                      ) : (
                        <>
                          <span className="text-slate-300">
                            Via: {bus.viaStopsEn.slice(0, 3).join(', ')}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            வழி: {bus.viaStopsTa.slice(0, 3).join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Category Badge */}
                <div className="col-span-2 hidden md:flex flex-col items-start justify-center">
                  <CategoryBadge category={bus.category} language={language} size="md" />
                  <span className="text-[11px] text-slate-300 mt-1.5 flex items-center gap-1">
                    <Users className="h-3 w-3 text-slate-400" />
                    <span className="capitalize">
                      {language === 'ta'
                        ? bus.occupancy === 'low'
                          ? 'குறைந்த கூட்டம்'
                          : bus.occupancy === 'medium'
                          ? 'நடுத்தர கூட்டம்'
                          : 'அதிக கூட்டம்'
                        : language === 'en'
                        ? `${bus.occupancy} Crowd`
                        : `${bus.occupancy} • ${
                            bus.occupancy === 'low'
                              ? 'குறைவு'
                              : bus.occupancy === 'medium'
                              ? 'மிதம்'
                              : 'நெரிசல்'
                          }`}
                    </span>
                  </span>
                </div>

                {/* 5. Platform / Bay */}
                <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center">
                  <span className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs sm:text-sm font-black text-cyan-300 whitespace-nowrap shadow-sm">
                    {bus.platform}
                  </span>
                  <span className="text-[10px] text-slate-300 font-semibold mt-0.5 text-center">
                    {language === 'ta'
                      ? 'நடைமேடை'
                      : language === 'en'
                      ? 'Platform'
                      : 'Bay / மேடை'}
                  </span>
                </div>

                {/* 6. ETA - Prominent Public Display Element & Call Controls */}
                <div className="col-span-3 sm:col-span-2 flex flex-col items-end justify-center pr-2">
                  <ETAIndicator
                    etaMinutes={bus.etaMinutes}
                    etaSecondsRemaining={bus.etaSecondsRemaining}
                    status={bus.status}
                    language={language}
                    size={isTvMode ? 'xl' : 'lg'}
                    showSubtext={true}
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        announceBus(bus);
                      }}
                      className="px-2 py-1 rounded-md bg-slate-800/95 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 hover:border-emerald-400 border border-slate-700 transition-all flex items-center gap-1 text-[10px] font-bold"
                      title={
                        language === 'ta'
                          ? `பேருந்து ${bus.busNo} வருகை அறிவிப்பை ஒலிக்கவும்`
                          : `Announce Bus ${bus.busNo} arrival in ${language.toUpperCase()}`
                      }
                    >
                      <Volume2 className="h-3 w-3 shrink-0" />
                      <span>
                        {language === 'ta'
                          ? 'வருகை'
                          : language === 'en'
                          ? 'Arrival'
                          : 'Arrival / வருகை'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        announceNextBus(bus);
                      }}
                      className="px-2 py-1 rounded-md bg-slate-800/95 hover:bg-amber-500 hover:text-slate-950 text-amber-300 hover:border-amber-400 border border-slate-700 transition-all flex items-center gap-1 text-[10px] font-bold"
                      title={
                        language === 'ta'
                          ? `பேருந்து ${bus.busNo} அடுத்ததாக வரும் என ஒலிக்கவும்`
                          : `Announce Bus ${bus.busNo} as next on display`
                      }
                    >
                      <BellRing className="h-3 w-3 shrink-0" />
                      <span>
                        {language === 'ta'
                          ? 'அடுத்தது'
                          : language === 'en'
                          ? 'Next'
                          : 'Next / அடுத்தது'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {sortedBuses.length === 0 && (
            <div className="p-12 text-center text-slate-300">
              <p className="text-lg font-bold">
                {language === 'ta'
                  ? 'இந்த நிலையத்திற்கு பேருந்துகள் எதுவும் இல்லை.'
                  : 'No upcoming buses found • பேருந்துகள் எதுவும் இல்லை.'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {language === 'ta'
                  ? 'வேறு பேருந்து நிலையத்தைத் தேர்ந்தெடுக்கவும்.'
                  : 'Please select another bus stand or check the Admin panel.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer info legend - Clear Bilingual Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/95 border-t border-slate-800 px-5 py-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              <span>
                {language === 'ta'
                  ? 'இப்போது வருகிறது (< 1 நிமி)'
                  : language === 'en'
                  ? 'Arriving Now (< 1 min)'
                  : 'Arriving Now / இப்போது வருகிறது'}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
              <span>
                {language === 'ta'
                  ? 'அடுத்த பேருந்து'
                  : language === 'en'
                  ? 'Next Upcoming on Display'
                  : 'Next Bus / அடுத்த பேருந்து'}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
              <span>
                {language === 'ta'
                  ? 'சரியான நேரம்'
                  : language === 'en'
                  ? 'Scheduled On Time'
                  : 'On Time / சரியான நேரம்'}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400"></span>
              <span>
                {language === 'ta'
                  ? 'தாமதம்'
                  : language === 'en'
                  ? 'Delayed'
                  : 'Delayed / தாமதம்'}
              </span>
            </span>
          </div>

          <div className="text-[11px] text-slate-300 font-medium">
            {language === 'ta'
              ? '*வழித்தடம் & நிறுத்தங்களைக் காண பேருந்தை அழுத்தவும்'
              : language === 'en'
              ? '*Click any bus row for full route & stops'
              : '*Click any bus for stops • முழு விவரங்களுக்கு பேருந்தை அழுத்தவும்'}
          </div>
        </div>
      </div>
    </div>
  );
};
