import React, { useEffect } from 'react';
import { BusProvider, useBus } from './context/BusContext';
import { Header } from './components/Header';
import { NextBusesBoard } from './components/NextBusesBoard';
import { AllBusesView } from './components/AllBusesView';
import { CategoriesGuide } from './components/CategoriesGuide';
import { AdminPanel } from './components/AdminPanel';
import { DocumentationView } from './components/DocumentationView';
import { BusDetailsModal } from './components/BusDetailsModal';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Minimize2, Bus, Sparkles, MapPin, Clock, Calendar, Volume2, VolumeX, Shield, Play } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    isTvMode,
    setIsTvMode,
    currentBusStand,
    language,
    selectedBus,
    setSelectedBus,
    soundEnabled,
    setSoundEnabled,
    isAudioPlaying,
    testVoiceAnnouncement,
  } = useBus();

  // Keyboard shortcut: Escape to exit TV mode or close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedBus) {
          setSelectedBus(null);
        } else if (isTvMode) {
          setIsTvMode(false);
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTvMode, selectedBus, setIsTvMode, setSelectedBus]);

  // Fullscreen TV Display Mode: Maximized, high-contrast, uncluttered 16:9 layout
  if (isTvMode) {
    return (
      <main className="min-h-screen w-full bg-slate-950 text-white flex flex-col justify-between p-3 sm:p-6 lg:p-8 pb-20 sm:pb-24 select-none font-sans">
        {/* TV Header */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 border-b-2 border-amber-500/40 pb-4 mb-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black shadow-xl shadow-amber-500/30 ring-4 ring-amber-400/20">
              <Bus className="h-6 w-6 sm:h-8 sm:w-8 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase leading-tight">
                {language === 'ta'
                  ? 'மாநகரப் போக்குவரத்துக் கழகம் சென்னை — பேருந்து வருகை தகவல்'
                  : language === 'en'
                  ? 'MTC CHENNAI — SMART BUS ARRIVAL INFORMATION'
                  : 'MTC CHENNAI — BUS ARRIVAL DISPLAY • சென்னை மாநகரப் பேருந்து வருகை பலகை'}
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                <span className="text-xs sm:text-xl font-bold text-amber-400 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  {language === 'ta'
                    ? currentBusStand.nameTa
                    : language === 'en'
                    ? currentBusStand.nameEn
                    : `${currentBusStand.nameEn} • ${currentBusStand.nameTa}`}
                </span>
                <span className="hidden sm:inline text-slate-300 font-medium text-sm">
                  ({language === 'ta' ? currentBusStand.locationTa : currentBusStand.locationEn})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-wrap w-full lg:w-auto shrink-0">
            {/* Live Clock for TV */}
            <div className="rounded-xl sm:rounded-2xl bg-slate-900 border-2 border-slate-700 px-3 sm:px-5 py-1.5 sm:py-2 text-left sm:text-right shadow-inner">
              <div className="font-mono tabular-nums text-base sm:text-2xl lg:text-3xl font-black text-cyan-300 whitespace-nowrap">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-400">
                {new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* TV Audio Master Toggle */}
              <button
                id="tv-btn-sound-toggle"
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-black transition-all ${
                  soundEnabled
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={soundEnabled ? 'Terminal audio broadcasting active' : 'Click to enable terminal sound'}
              >
                {soundEnabled ? (
                  isAudioPlaying ? (
                    <div className="flex items-end gap-0.5 h-4 w-4 py-0.5">
                      <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite]" />
                      <span className="w-1 bg-emerald-300 rounded-full animate-[bounce_0.8s_infinite]" />
                      <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.5s_infinite]" />
                    </div>
                  ) : (
                    <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                  )
                ) : (
                  <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                )}
                <span className="hidden sm:inline">
                  {soundEnabled ? (isAudioPlaying ? 'BROADCASTING' : 'AUDIO ON') : 'AUDIO OFF'}
                </span>
              </button>

              {/* Quick Test Audio in TV Mode */}
              <button
                id="tv-btn-test-sound"
                type="button"
                onClick={testVoiceAnnouncement}
                className="flex items-center gap-1.5 rounded-xl sm:rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-500/40 px-3 sm:px-3.5 py-2.5 sm:py-3 text-xs font-black text-amber-300 transition-colors"
                title="Test terminal audio chime and announcement"
              >
                <Play className="h-4 w-4 fill-amber-300" />
                <span className="hidden xl:inline">TEST AUDIO ({language.toUpperCase()})</span>
              </button>

              {/* Exit TV Mode button */}
              <button
                onClick={() => {
                  setIsTvMode(false);
                  if (document.fullscreenElement && document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                  }
                }}
                className="flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-black text-slate-300 hover:text-white transition-colors"
                title="Exit TV Display Mode (Press Escape)"
              >
                <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                <span className="sm:hidden">EXIT</span>
                <span className="hidden lg:inline">EXIT TV MODE (ESC)</span>
              </button>
            </div>
          </div>
        </header>

        {/* TV Main Arrival Board */}
        <section aria-label="Arrivals Board" className="flex-1 w-full flex flex-col justify-start">
          <NextBusesBoard maxDisplay={6} />
        </section>

        {/* TV Footer Announcement */}
        <AnnouncementBar />

        {/* Details Modal */}
        <BusDetailsModal />
      </main>
    );
  }

  // Standard Interactive Prototype Mode with Navigation & Controls
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation & Status Header */}
      <Header />

      {/* Main Content View Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6 pb-20 sm:pb-24">
        {activeTab === 'tv' && (
          <div className="flex flex-col gap-5 sm:gap-6 animate-fadeIn">
            {/* Live Terminal Arrival Board */}
            <NextBusesBoard maxDisplay={8} />

            {/* Quick Terminal Information & Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    {language === 'ta'
                      ? 'நிலைய விவரங்கள்'
                      : language === 'en'
                      ? 'Terminal Details'
                      : 'Terminal Details • நிலைய விவரம்'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {language === 'ta'
                    ? currentBusStand.nameTa
                    : language === 'en'
                    ? currentBusStand.nameEn
                    : `${currentBusStand.nameEn} (${currentBusStand.nameTa})`}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {language === 'ta'
                    ? `${currentBusStand.locationTa} • மண்டலம்: ${currentBusStand.zone}`
                    : language === 'en'
                    ? `${currentBusStand.locationEn} • Zone: ${currentBusStand.zone}`
                    : `${currentBusStand.locationEn} • ${currentBusStand.locationTa}`}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {language === 'ta'
                      ? 'விடியல் பயணம் திட்டம்'
                      : language === 'en'
                      ? 'Vidiyal Payanam Scheme'
                      : 'Vidiyal Payanam • விடியல் பயணம்'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {language === 'ta'
                    ? 'மகளிருக்கு 100% இலவச பயணம்'
                    : language === 'en'
                    ? '100% Free Travel for Women'
                    : '100% Free Travel for Women • மகளிருக்கு இலவசம்'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {language === 'ta'
                    ? 'அனைத்து சாதாரண (பிங்க் போர்டு) மாநகரப் பேருந்துகளிலும் பொருந்தும்.'
                    : language === 'en'
                    ? 'Applicable on all Ordinary class (Pink Board) MTC city buses across Chennai.'
                    : 'All Ordinary (Pink Board) MTC buses • அனைத்து சாதாரண பேருந்துகளிலும் பொருந்தும்.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider mb-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {language === 'ta'
                      ? 'நிகழ்நேர கண்காணிப்பு'
                      : language === 'en'
                      ? 'Real-Time Simulation'
                      : 'Real-Time Live Board • நிகழ்நேர பலகை'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {language === 'ta'
                    ? 'தானியங்கி வருகை நேர எண்ணிக்கை'
                    : language === 'en'
                    ? 'Autonomous ETA Countdown'
                    : 'Live ETA Countdown • நேரடி வருகை நேரம்'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {language === 'ta'
                    ? 'பேருந்துகளின் வருகை, அடுத்த பேருந்து மற்றும் பாதுகாப்பு அறிவிப்புகள் ஒலிக்கும்.'
                    : language === 'en'
                    ? 'Watch buses approach, arrive, and automatically rotate as next buses arrive.'
                    : 'Live Tamil & English display & audio • தமிழ் மற்றும் ஆங்கிலத்தில் தெளிவான காட்சி.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'all-buses' && <AllBusesView />}
        {activeTab === 'categories' && <CategoriesGuide />}
        {activeTab === 'admin' && <AdminPanel />}
        {activeTab === 'docs' && <DocumentationView />}
      </main>

      {/* Persistent Bottom Scrolling Announcement Bar */}
      <AnnouncementBar />

      {/* Interactive Modal for Bus Route & Stop Details */}
      <BusDetailsModal />
    </div>
  );
};

export default function App() {
  return (
    <BusProvider>
      <MainContent />
    </BusProvider>
  );
}
