import React from 'react';
import { BusStatus, Language } from '../types';

interface ETAIndicatorProps {
  etaMinutes: number;
  etaSecondsRemaining?: number;
  status: BusStatus;
  language?: Language;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtext?: boolean;
  align?: 'right' | 'left';
}

export const ETAIndicator: React.FC<ETAIndicatorProps> = ({
  etaMinutes,
  etaSecondsRemaining = 0,
  status,
  language = 'dual',
  size = 'lg',
  showSubtext = true,
  align = 'right',
}) => {
  const isArrivingNow = status === 'arriving_now' || etaMinutes <= 0;
  const isApproaching = status === 'approaching' || (etaMinutes > 0 && etaMinutes <= 5 && status !== 'delayed');
  const isDelayed = status === 'delayed';

  const showSeconds = etaSecondsRemaining > 0 && etaSecondsRemaining < 180 && !isDelayed;
  const minutesPart = Math.floor(etaSecondsRemaining / 60);
  const secondsPart = etaSecondsRemaining % 60;
  const countdownFormatted = `${minutesPart}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;

  const containerAlign = align === 'left' ? 'items-start' : 'items-end';
  const textAlign = align === 'left' ? 'text-left' : 'text-right';
  const flexJustify = align === 'left' ? 'justify-start' : 'justify-end';

  if (isDelayed) {
    return (
      <div className={`flex flex-col ${containerAlign} max-w-full`}>
        <div
          id="eta-status-delayed"
          className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-rose-950/90 border-2 border-rose-500/80 text-rose-300 font-extrabold tracking-wide shadow-lg shadow-rose-950/50 ${
            size === 'xl'
              ? 'px-3.5 sm:px-5 py-2 text-base sm:text-xl'
              : size === 'lg'
              ? 'px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-base'
              : 'px-2.5 py-1 text-xs sm:text-sm'
          }`}
        >
          <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-rose-500"></span>
          </span>
          <span className="whitespace-nowrap">
            {language === 'ta'
              ? '🔴 தாமதம்'
              : language === 'en'
              ? '🔴 DELAYED'
              : '🔴 DELAYED / தாமதம்'}
          </span>
        </div>
        {showSubtext && (
          <span className={`text-[11px] sm:text-xs text-rose-300/90 font-semibold mt-1 ${textAlign}`}>
            {language === 'ta'
              ? `+${etaMinutes} நிமிடம் தாமதம்`
              : language === 'en'
              ? `Est. +${etaMinutes} min`
              : `Est. +${etaMinutes} min • +${etaMinutes} நிமி`}
          </span>
        )}
      </div>
    );
  }

  if (isArrivingNow) {
    return (
      <div className={`flex flex-col ${containerAlign} max-w-full`}>
        <div
          id="eta-status-arriving"
          className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-950 border-2 border-emerald-400 text-emerald-300 font-black tracking-wider animate-pulse shadow-lg shadow-emerald-950/60 ${
            size === 'xl'
              ? 'px-3.5 sm:px-4 py-1.5 sm:py-2 text-base sm:text-xl'
              : size === 'lg'
              ? 'px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-base'
              : 'px-2.5 py-1 text-xs sm:text-sm'
          }`}
        >
          <span className="relative flex h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-emerald-400"></span>
          </span>
          <span className="whitespace-nowrap">
            {language === 'ta' ? '🟢 இப்போது வருகிறது' : '🟢 ARRIVING NOW'}
          </span>
        </div>
        {showSubtext && (
          <span className={`text-[11px] sm:text-xs font-bold text-emerald-300 mt-1 tracking-wide ${textAlign}`}>
            {language === 'ta'
              ? 'நடைமேடைக்கு வருகிறது'
              : language === 'en'
              ? 'At Platform Bay'
              : 'இப்போது வருகிறது • At Bay'}
          </span>
        )}
      </div>
    );
  }

  if (isApproaching) {
    return (
      <div className={`flex flex-col ${containerAlign} max-w-full`}>
        <div
          id="eta-status-approaching"
          className={`inline-flex items-baseline gap-1 sm:gap-1.5 rounded-xl bg-amber-950/90 border-2 border-amber-400/90 text-amber-300 font-black shadow-lg shadow-amber-950/50 ${
            size === 'xl'
              ? 'px-3.5 sm:px-5 py-1.5 sm:py-2 text-xl sm:text-2xl'
              : size === 'lg'
              ? 'px-3 sm:px-4 py-1 sm:py-1.5 text-lg sm:text-xl'
              : 'px-2.5 py-1 text-sm sm:text-base'
          }`}
        >
          <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 self-center shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-amber-400"></span>
          </span>
          <span className="text-amber-100 font-mono tabular-nums text-[1.15em] tracking-tight">{etaMinutes}</span>
          <span className="text-amber-300 text-[0.72em] font-extrabold uppercase whitespace-nowrap">
            {language === 'ta' ? 'நிமி' : language === 'en' ? 'MIN' : 'MIN / நிமி'}
          </span>
        </div>
        {showSubtext && (
          <div className={`text-[11px] sm:text-xs font-semibold text-amber-300/95 mt-1 flex items-center gap-1.5 flex-wrap ${flexJustify}`}>
            <span>
              🟡{' '}
              {language === 'ta'
                ? 'விரைவில் வருகிறது'
                : language === 'en'
                ? 'APPROACHING'
                : 'APPROACHING / விரைவில்'}
            </span>
            {showSeconds && <span className="font-mono tabular-nums text-slate-300">({countdownFormatted})</span>}
          </div>
        )}
      </div>
    );
  }

  // Normal scheduled / on time
  return (
    <div className={`flex flex-col ${containerAlign} max-w-full`}>
      <div
        id="eta-status-ontime"
        className={`inline-flex items-baseline gap-1 sm:gap-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 font-bold ${
          size === 'xl'
            ? 'px-3.5 sm:px-5 py-1.5 sm:py-2 text-xl sm:text-2xl'
            : size === 'lg'
            ? 'px-3 sm:px-4 py-1 sm:py-1.5 text-lg sm:text-xl'
            : 'px-2.5 sm:px-3 py-1 text-sm sm:text-base'
        }`}
      >
        <span className="font-mono tabular-nums text-[1.25em] font-black text-cyan-400 tracking-tight">{etaMinutes}</span>
        <span className="text-slate-300 text-[0.7em] font-bold uppercase whitespace-nowrap">
          {language === 'ta' ? 'நிமி' : language === 'en' ? 'MIN' : 'MIN / நிமி'}
        </span>
      </div>
      {showSubtext && (
        <span className={`text-[11px] sm:text-xs text-slate-300 mt-1 font-medium ${textAlign}`}>
          {language === 'ta'
            ? 'சரியான நேரம்'
            : language === 'en'
            ? 'ON TIME'
            : 'ON TIME / சரியான நேரம்'}
        </span>
      )}
    </div>
  );
};
