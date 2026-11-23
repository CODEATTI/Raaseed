import React, { useState, useEffect } from 'react';
import { useBus } from '../context/BusContext';
import { MTC_BUS_STANDS } from '../data/mockBuses';
import {
  Bus,
  Clock,
  Calendar,
  MapPin,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Volume1,
  Mic,
  Radio,
  Sliders,
  Play,
  Pause,
  FastForward,
  Layers,
  Settings,
  BookOpen,
  Monitor,
  RefreshCw,
  ShieldAlert,
  BellRing,
} from 'lucide-react';
import { ViewTab } from '../types';

export const Header: React.FC = () => {
  const {
    buses,
    currentBusStand,
    setCurrentBusStand,
    language,
    setLanguage,
    activeTab,
    setActiveTab,
    isTvMode,
    setIsTvMode,
    simulationSpeed,
    setSimulationSpeed,
    soundEnabled,
    setSoundEnabled,
    voiceEnabled,
    setVoiceEnabled,
    soundVolume,
    setSoundVolume,
    isAudioPlaying,
    testArrivalChime,
    testAnnouncementChime,
    testVoiceAnnouncement,
    lastUpdatedTime,
    announceNextBusEnabled,
    setAnnounceNextBusEnabled,
    safetyAnnouncementsEnabled,
    setSafetyAnnouncementsEnabled,
    announceSafetyRule,
    announceNextBus,
  } = useBus();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showAudioMenu, setShowAudioMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      );
      setCurrentDate(
        now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTvMode = () => {
    const nextMode = !isTvMode;
    setIsTvMode(nextMode);
    if (nextMode) {
      setActiveTab('tv');
      // Request native browser fullscreen if supported
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <header className="relative md:sticky md:top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-xl transition-all">
      {/* Top Bar: Official Government & Transit Brand */}
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-6 border-b border-slate-800/80">
        {/* Row 1 on Mobile: Logo + Compact TV Button */}
        <div className="flex items-center justify-between gap-2.5 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40">
              <Bus className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-lg font-black tracking-tight text-white uppercase truncate">
                  MTC CHENNAI
                </span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-amber-300 border border-amber-500/40 shrink-0">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-300 truncate">
                {language === 'ta'
                  ? 'மாநகர போக்குவரத்துக் கழகம் (சென்னை) • நிகழ்நேர தகவல்'
                  : language === 'en'
                  ? 'Metropolitan Transport Corporation • Smart Arrival System'
                  : 'MTC Chennai • மாநகர போக்குவரத்துக் கழகம்'}
              </p>
            </div>
          </div>

          {/* Mobile TV Mode Button (inline on top row for mobile alignment) */}
          <button
            id="btn-tv-mode-toggle-mobile"
            type="button"
            onClick={toggleTvMode}
            className={`lg:hidden shrink-0 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-extrabold shadow-md transition-all min-h-[40px] ${
              isTvMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
            title="Toggle TV Display Mode (16:9 Fullscreen Kiosk Layout)"
          >
            {isTvMode ? <Minimize2 className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
            <span>{isTvMode ? 'Exit TV' : 'TV Mode'}</span>
          </button>
        </div>

        {/* Bus Stand Selector, Live Digital Clock & Desktop TV Mode CTA */}
        <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto min-w-0">
          {/* Terminal / Stand Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-inner flex-1 lg:flex-initial min-w-0 max-w-full">
            <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
            <select
              id="header-bus-stand-select"
              aria-label="Select Bus Terminal"
              value={currentBusStand.id}
              onChange={(e) => {
                const stand = MTC_BUS_STANDS.find((s) => s.id === e.target.value);
                if (stand) setCurrentBusStand(stand);
              }}
              className="w-full min-w-0 bg-transparent text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer truncate pr-1"
            >
              {MTC_BUS_STANDS.map((stand) => (
                <option key={stand.id} value={stand.id} className="bg-slate-900 text-white">
                  {stand.code} -{' '}
                  {language === 'ta'
                    ? stand.nameTa
                    : language === 'en'
                    ? stand.nameEn
                    : `${stand.nameEn} (${stand.nameTa})`}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Clock */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 sm:px-3.5 py-1.5 shadow-inner font-mono shrink-0">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400 shrink-0" />
            <div className="flex flex-col text-right sm:text-left">
              <span className="text-xs sm:text-sm font-black text-cyan-300 tracking-wider tabular-nums whitespace-nowrap">
                {currentTime || '09:42:00 AM'}
              </span>
              <span className="hidden sm:flex text-[10px] text-slate-400 font-sans font-medium items-center gap-1 whitespace-nowrap">
                <Calendar className="h-2.5 w-2.5 text-slate-500" />
                {currentDate || '11 September 2026'}
              </span>
            </div>
          </div>

          {/* Desktop TV Mode Big CTA */}
          <button
            id="btn-tv-mode-toggle"
            type="button"
            onClick={toggleTvMode}
            className={`hidden lg:inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-extrabold shadow-md transition-all whitespace-nowrap ${
              isTvMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
            title="Toggle TV Display Mode (16:9 Fullscreen Kiosk Layout)"
          >
            {isTvMode ? (
              <>
                <Minimize2 className="h-4 w-4" />
                <span>EXIT TV MODE</span>
              </>
            ) : (
              <>
                <Monitor className="h-4 w-4" />
                <span>ENTER TV DISPLAY MODE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Second Bar: Navigation Tabs & Control Toggles (Hidden in pure TV mode if needed) */}
      {!isTvMode && (
        <div className="mx-auto flex max-w-7xl flex-col xl:flex-row xl:items-center xl:justify-between gap-2 px-3 py-2 sm:px-6">
          {/* Navigation Views */}
          <nav className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-xs font-bold no-scrollbar w-full xl:w-auto">
            <button
              id="tab-tv"
              onClick={() => setActiveTab('tv')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'tv'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>{language === 'ta' ? 'வருகை பலகை' : 'Live Board'}</span>
            </button>

            <button
              id="tab-all-buses"
              onClick={() => setActiveTab('all-buses')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'all-buses'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{language === 'ta' ? 'அனைத்து பேருந்துகள்' : 'All Buses'}</span>
            </button>

            <button
              id="tab-categories"
              onClick={() => setActiveTab('categories')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'categories'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Bus className="h-3.5 w-3.5" />
              <span>{language === 'ta' ? 'பேருந்து வகைகள்' : 'Bus Types'}</span>
            </button>

            <button
              id="tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>{language === 'ta' ? 'நிர்வாகம்' : 'Admin'}</span>
            </button>

            <button
              id="tab-docs"
              onClick={() => setActiveTab('docs')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'docs'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Docs</span>
            </button>
          </nav>

          {/* Quick Controls: Simulation speed, Sound, Language */}
          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap w-full xl:w-auto pt-1 xl:pt-0 border-t border-slate-800/70 xl:border-t-0">
            {/* Simulation speed toggle */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs shrink-0">
              <span className="text-[10px] text-slate-400 font-bold px-1 uppercase">Sim:</span>
              <button
                id="btn-sim-pause"
                onClick={() => setSimulationSpeed(0)}
                className={`px-2 py-1 sm:py-0.5 rounded text-[11px] font-bold ${
                  simulationSpeed === 0 ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Pause Simulation"
              >
                <Pause className="h-3 w-3 inline" />
              </button>
              <button
                id="btn-sim-1x"
                onClick={() => setSimulationSpeed(1)}
                className={`px-2 py-1 sm:py-0.5 rounded text-[11px] font-bold ${
                  simulationSpeed === 1 ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
                title="Real-time 1s = 1s"
              >
                1x
              </button>
              <button
                id="btn-sim-fast"
                onClick={() => setSimulationSpeed(3)}
                className={`px-2 py-1 sm:py-0.5 rounded text-[11px] font-bold ${
                  simulationSpeed === 3 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
                title="Demo Turbo Speed"
              >
                Turbo
              </button>
            </div>

            {/* Terminal PA Audio Suite */}
            <div className="relative flex items-center gap-1.5 shrink-0">
              {/* Audio Master Toggle button */}
              <button
                id="btn-sound-toggle"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                  soundEnabled
                    ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-500/40'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={soundEnabled ? 'Transit PA audio chime & voice active' : 'Enable transit sound announcements'}
              >
                {soundEnabled ? (
                  isAudioPlaying ? (
                    <div className="flex items-end gap-0.5 h-3.5 w-3.5 py-0.5">
                      <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite]" />
                      <span className="w-1 bg-emerald-300 rounded-full animate-[bounce_0.8s_infinite]" />
                      <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.5s_infinite]" />
                    </div>
                  ) : (
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                  )
                ) : (
                  <VolumeX className="h-4 w-4 text-slate-400" />
                )}
                <span className="whitespace-nowrap">
                  {soundEnabled
                    ? isAudioPlaying
                      ? 'Speaking'
                      : 'PA ON'
                    : 'PA OFF'}
                </span>
              </button>

              {/* Instant Test Sound Button */}
              <button
                id="btn-test-sound-quick"
                type="button"
                onClick={testVoiceAnnouncement}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all active:scale-95"
                title="Play test chime & announcement right now"
              >
                <Play className="h-3 w-3 fill-amber-300" />
                <span className="hidden sm:inline">Test Sound</span>
              </button>

              {/* Audio Settings Popover Toggle */}
              <button
                id="btn-sound-settings-toggle"
                type="button"
                onClick={() => setShowAudioMenu(!showAudioMenu)}
                className={`p-1.5 sm:p-2 rounded-xl border text-xs transition-colors ${
                  showAudioMenu
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
                title="Configure audio volume, speech synthesis & chimes"
              >
                <Sliders className="h-3.5 w-3.5" />
              </button>

              {/* Audio Settings Floating Menu */}
              {showAudioMenu && (
                <div
                  id="audio-settings-popover"
                  className="fixed inset-x-3 top-24 sm:inset-x-auto sm:absolute sm:top-full sm:right-0 sm:mt-2 sm:w-80 rounded-2xl bg-slate-950 border-2 border-slate-800 p-4 shadow-2xl z-50 animate-fadeIn max-h-[80vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                      <Radio className="h-4 w-4" />
                      <span>PA Sound Settings</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      Web Audio API
                    </span>
                  </div>

                  {/* Volume Slider */}
                  <div className="mb-3.5">
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Volume1 className="h-3.5 w-3.5 text-cyan-400" /> Master Volume
                      </span>
                      <span className="text-cyan-400 font-mono">{Math.round(soundVolume * 100)}%</span>
                    </div>
                    <input
                      id="input-audio-volume-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Voice Announcement TTS Toggle */}
                  <div className="flex items-center justify-between py-2 border-t border-slate-900">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Mic className="h-3.5 w-3.5 text-emerald-400" /> Voice Announcements
                      </span>
                      <span className="text-[10px] text-slate-400">Automated passenger speech (TTS)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVoiceEnabled(!voiceEnabled)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                        voiceEnabled
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {voiceEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Announce Next Bus on Display Toggle */}
                  <div className="flex items-center justify-between py-2 border-t border-slate-900">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <BellRing className="h-3.5 w-3.5 text-amber-400" /> Announce Next Bus
                      </span>
                      <span className="text-[10px] text-slate-400">Call upcoming bus along with arrival</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAnnounceNextBusEnabled(!announceNextBusEnabled)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                        announceNextBusEnabled
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {announceNextBusEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Safety Rules In Arrival Gaps Toggle */}
                  <div className="flex items-center justify-between py-2 border-t border-slate-900">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" /> Gap Safety Rules
                      </span>
                      <span className="text-[10px] text-slate-400">Broadcast safety tips while buses arrive</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSafetyAnnouncementsEnabled(!safetyAnnouncementsEnabled)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                        safetyAnnouncementsEnabled
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {safetyAnnouncementsEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Declared Broadcast Language Info */}
                  <div className="flex items-center justify-between py-2 border-t border-slate-900 text-xs">
                    <span className="text-slate-400">Declared Language:</span>
                    <span className="font-black text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {language === 'ta'
                        ? 'தமிழ் (Tamil Only)'
                        : language === 'en'
                        ? 'English (English Only)'
                        : 'Dual (தமிழ் + English)'}
                    </span>
                  </div>

                  {/* Test Action Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nextB = buses.find((b) => b.etaMinutes > 0) || buses[0];
                        if (nextB) announceNextBus(nextB);
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all active:scale-95"
                    >
                      <BellRing className="h-3.5 w-3.5 text-amber-400" />
                      <span>Test Next Bus</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => announceSafetyRule()}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all active:scale-95"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Test Safety Rule</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-2.5 text-center leading-tight">
                    * Bus arrivals are called strictly according to your declared language ({language.toUpperCase()}).
                  </p>
                </div>
              )}
            </div>

            {/* Language Toggle: English | தமிழ் | Dual */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-bold">
              <button
                id="lang-dual"
                onClick={() => setLanguage('dual')}
                className={`px-2 py-1 rounded ${
                  language === 'dual' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dual
              </button>
              <button
                id="lang-en"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded ${
                  language === 'en' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                id="lang-ta"
                onClick={() => setLanguage('ta')}
                className={`px-2 py-1 rounded ${
                  language === 'ta' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
