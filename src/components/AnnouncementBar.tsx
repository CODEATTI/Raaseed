import React, { useState, useEffect } from 'react';
import { useBus } from '../context/BusContext';
import { Megaphone, AlertTriangle, Info, ShieldAlert, ChevronRight, Volume2 } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { announcements, language, soundEnabled } = useBus();
  const activeAnnouncements = announcements.filter((a) => a.active);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (activeAnnouncements.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 7000); // Rotate every 7 seconds

    return () => clearInterval(interval);
  }, [activeAnnouncements.length, isPaused]);

  if (activeAnnouncements.length === 0) {
    return null;
  }

  const current = activeAnnouncements[currentIndex] || activeAnnouncements[0];

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 animate-bounce" />;
      case 'delay':
        return <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />;
      case 'safety':
        return <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-cyan-400 shrink-0" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-amber-500/50';
      case 'delay':
        return 'bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border-rose-500/50';
      default:
        return 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-slate-800';
    }
  };

  return (
    <div
      id="announcement-bar"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed bottom-0 left-0 right-0 z-30 border-t-2 py-2 px-4 backdrop-blur-lg shadow-2xl transition-colors ${getBgColor(
        current.type,
      )}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left Badge: Ticker Announcement Label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30">
            <Megaphone className="h-4 w-4" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              {language === 'ta' ? 'அறிவிப்பு' : 'ANNOUNCEMENT'}
            </span>
            <span className="text-[9px] text-slate-400">
              {current.createdAt} • {currentIndex + 1}/{activeAnnouncements.length}
            </span>
          </div>
        </div>

        {/* Center: Marquee / Rotating Alert Text */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 animate-fadeIn transition-opacity">
            {getIcon(current.type)}
            <p className="text-xs sm:text-sm font-bold text-white tracking-wide truncate sm:whitespace-normal">
              {language === 'ta'
                ? current.textTa
                : language === 'en'
                ? current.textEn
                : `${current.textEn} • ${current.textTa}`}
            </p>
          </div>
        </div>

        {/* Right: Quick Next & Indicator dots */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1">
            {activeAnnouncements.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to announcement ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
          <button
            id="btn-next-announcement"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            title="Next Announcement"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
