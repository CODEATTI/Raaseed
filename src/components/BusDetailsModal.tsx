import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useBus } from '../context/BusContext';
import { CategoryBadge } from './CategoryBadge';
import { ETAIndicator } from './ETAIndicator';
import {
  X,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Heart,
  Navigation,
  CheckCircle2,
  CircleDot,
  Radio,
  Share2,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Calendar,
  Compass,
  FileCheck,
  ChevronRight,
  Volume2,
  BellRing,
} from 'lucide-react';

export const BusDetailsModal: React.FC = () => {
  const { selectedBus, setSelectedBus, language, announceBus, announceNextBus } = useBus();

  // QR Code state
  const [qrMode, setQrMode] = useState<'tracking' | 'schedule'>('tracking');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showSimulatedMobile, setShowSimulatedMobile] = useState<boolean>(false);

  // Generate dynamic QR Code whenever selectedBus or qrMode changes
  useEffect(() => {
    if (!selectedBus) return;
    let cancelled = false;

    const targetUrl =
      qrMode === 'tracking'
        ? `https://mtcbus.tn.gov.in/live-tracking?busNo=${encodeURIComponent(selectedBus.busNo)}&bay=${encodeURIComponent(selectedBus.platform)}&origin=${encodeURIComponent(selectedBus.originEn)}&dest=${encodeURIComponent(selectedBus.destinationEn)}`
        : `https://mtcbus.tn.gov.in/timetables/route?busNo=${encodeURIComponent(selectedBus.busNo)}&cat=${encodeURIComponent(selectedBus.category)}&terminal=${encodeURIComponent(selectedBus.originEn)}`;

    QRCode.toDataURL(targetUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#090d16',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [selectedBus, qrMode]);

  if (!selectedBus) return null;

  const currentUrl =
    qrMode === 'tracking'
      ? `https://mtcbus.tn.gov.in/live-tracking?busNo=${encodeURIComponent(selectedBus.busNo)}&bay=${encodeURIComponent(selectedBus.platform)}`
      : `https://mtcbus.tn.gov.in/timetables/route?busNo=${encodeURIComponent(selectedBus.busNo)}`;

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div
      id="bus-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={() => setSelectedBus(null)}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-slate-700 bg-slate-900 shadow-2xl p-4 sm:p-7 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-details-modal"
          onClick={() => setSelectedBus(null)}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          title="Close Details"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3.5 sm:gap-4 border-b border-slate-800 pb-4 sm:pb-5 pr-0 sm:pr-10">
          <div className="flex items-start gap-3 pr-10 sm:pr-0 min-w-0">
            <div className="rounded-2xl bg-slate-950 border-2 border-amber-400 px-3 sm:px-4 py-1.5 sm:py-2 text-center shadow-inner shrink-0">
              <span className="font-mono text-2xl sm:text-4xl font-black text-amber-400">
                {selectedBus.busNo}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={selectedBus.category} language={language} size="md" />
                {selectedBus.isElectric && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-950 border border-cyan-500/40 px-2 py-0.5 text-xs font-bold text-cyan-300">
                    <Zap className="h-3 w-3" /> EV
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white mt-1 leading-tight">
                {language === 'ta' ? selectedBus.destinationTa : selectedBus.destinationEn}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ta'
                  ? `${selectedBus.originTa} முதல் ${selectedBus.destinationTa} வரை`
                  : `${selectedBus.originEn} → ${selectedBus.destinationEn}`}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0 shrink-0">
            <span className="text-xs text-slate-400 uppercase font-semibold sm:mb-1">Estimated Arrival</span>
            <ETAIndicator
              etaMinutes={selectedBus.etaMinutes}
              etaSecondsRemaining={selectedBus.etaSecondsRemaining}
              status={selectedBus.status}
              language={language}
              size="lg"
            />
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-5">
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Boarding Bay</span>
            <span className="text-lg font-black text-cyan-300">{selectedBus.platform}</span>
          </div>
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Fare Estimate</span>
            <span className="text-sm sm:text-base font-black text-emerald-400">
              {language === 'ta' ? selectedBus.fareEstimateTa : selectedBus.fareEstimateEn}
            </span>
          </div>
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Passenger Crowd</span>
            <span className="text-sm sm:text-base font-bold capitalize text-amber-300">
              {selectedBus.occupancy} Crowd
            </span>
          </div>
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle Model</span>
            <span className="text-xs font-semibold text-slate-300 truncate block" title={selectedBus.busModel}>
              {selectedBus.busModel}
            </span>
          </div>
        </div>

        {/* Terminal PA Audio Call Buttons */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-slate-950 border border-slate-800 p-3.5 shadow-inner">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Volume2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-white flex items-center gap-2 flex-wrap">
                <span>Terminal PA Audio Calling</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-amber-300 uppercase font-mono">
                  {language === 'ta' ? 'தமிழ்' : language === 'en' ? 'English' : 'Dual (தமிழ் + English)'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Broadcast arrival or next-bus call in your declared language ({language.toUpperCase()})
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              id="btn-modal-announce-bus"
              type="button"
              onClick={() => announceBus(selectedBus)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-2 text-xs font-black transition-all shadow-md active:scale-95"
              title="Broadcast arrival call now"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>{language === 'ta' ? 'வருகை அறிவிப்பு' : 'Call Arrival'}</span>
            </button>
            <button
              id="btn-modal-announce-next"
              type="button"
              onClick={() => announceNextBus(selectedBus)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-2 text-xs font-black transition-all shadow-md active:scale-95"
              title="Broadcast as next bus on display"
            >
              <BellRing className="h-3.5 w-3.5" />
              <span>{language === 'ta' ? 'அடுத்த பேருந்து' : 'Call Next'}</span>
            </button>
          </div>
        </div>

        {/* Women Free Travel Banner if Ordinary */}
        {selectedBus.isWomenFree && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-pink-950/60 border border-pink-500/40 p-3.5 text-pink-200">
            <Heart className="h-5 w-5 text-pink-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">
                {language === 'ta'
                  ? 'தமிழ்நாடு அரசு விடியல் பயணம் திட்டம்'
                  : 'TN Government "Vidiyal Payanam" Scheme'}
                :
              </span>{' '}
              {language === 'ta'
                ? 'அனைத்து பெண்களுக்கும் இந்த சாதாரண பேருந்தில் பயணம் 100% இலவசம்!'
                : '100% Free Travel for all female passengers on this Ordinary class service.'}
            </div>
          </div>
        )}

        {/* Dynamic QR Code for Mobile Tracking & Timetable Verification */}
        <div
          id="qr-mobile-tracking-card"
          className="mb-6 rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 shadow-xl relative overflow-hidden"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Section Header with Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <QrCode className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-white">
                  {language === 'ta' ? 'மொபைல் நேரடி கண்காணிப்பு QR குறியீடு' : 'PASSENGER SMARTPHONE QR RADAR'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {language === 'ta'
                    ? 'உங்கள் மொபைல் கேமராவில் ஸ்கேன் செய்து நேரலையாக கண்காணிக்கவும்'
                    : 'Scan to carry real-time GPS tracking & schedule verification on your phone'}
                </p>
              </div>
            </div>

            {/* Switch QR Target Mode */}
            <div className="grid grid-cols-2 sm:flex items-center gap-1.5 rounded-xl bg-slate-950 p-1 border border-slate-800 w-full sm:w-auto">
              <button
                id="btn-qr-mode-tracking"
                type="button"
                onClick={() => setQrMode('tracking')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  qrMode === 'tracking'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="h-3.5 w-3.5 shrink-0" />
                <span>{language === 'ta' ? 'நேரடி ஜிபிஎஸ்' : 'Live GPS Radar'}</span>
              </button>
              <button
                id="btn-qr-mode-schedule"
                type="button"
                onClick={() => setQrMode('schedule')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  qrMode === 'schedule'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{language === 'ta' ? 'கால அட்டவணை' : 'MTC Timetable'}</span>
              </button>
            </div>
          </div>

          {/* QR Display + Context Details */}
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
            {/* Scannable Dynamic QR Code Card */}
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="relative rounded-2xl bg-white p-3 shadow-2xl border-4 border-slate-800 ring-2 ring-amber-500/50 group">
                {/* Viewfinder corner brackets */}
                <span className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-amber-500"></span>
                <span className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-amber-500"></span>
                <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-amber-500"></span>
                <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-amber-500"></span>

                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`MTC Bus ${selectedBus.busNo} QR Code`}
                    className="h-32 w-32 sm:h-36 sm:w-36 block rounded-lg select-none"
                  />
                ) : (
                  <div className="h-32 w-32 sm:h-36 sm:w-36 flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <span className="mt-2 text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                {language === 'ta' ? 'கேமராவில் ஸ்கேன் செய்க' : 'Scan With Phone Camera'}
              </span>
            </div>

            {/* Target Information, Link & Verification Details */}
            <div className="flex-1 flex flex-col justify-between w-full space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    MTC FLEET ID #{selectedBus.busNo}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5" />
                    {qrMode === 'tracking' ? 'Real-Time Telemetry Feed' : 'Official Timetable Verified'}
                  </span>
                </div>

                <h5 className="text-sm sm:text-base font-extrabold text-white mt-1.5">
                  {qrMode === 'tracking'
                    ? language === 'ta'
                      ? `பேருந்து ${selectedBus.busNo} நேரலை ஜிபிஎஸ் டிராக்கிங் இணைப்பு`
                      : `Live GPS Fleet Telemetry: Bus ${selectedBus.busNo} → ${selectedBus.destinationEn}`
                    : language === 'ta'
                      ? `அரசு அதிகாரப்பூர்வ MTC பேருந்து கட்டண & கால அட்டவணை`
                      : `Official MTC Schedule & Stage Fares: Route ${selectedBus.busNo}`}
                </h5>

                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {qrMode === 'tracking'
                    ? language === 'ta'
                      ? 'இந்த QR குறியீட்டை ஸ்கேன் செய்தால் உங்கள் தொலைபேசியில் நேரடி பேருந்து இருப்பிடம், வேகம் மற்றும் முனையத்தை அடையும் சரியான நேரம் உடனுக்குடன் தெரியும்.'
                      : `Scanning this QR launches a responsive live tracking dashboard on any mobile browser, keeping you updated on stop-by-stop transit as this bus arrives at Bay ${selectedBus.platform}.`
                    : language === 'ta'
                      ? 'சென்னை மாநகர போக்குவரத்துக் கழகத்தின் அதிகாரப்பூர்வ வலைப்பக்கத்தில் இந்த வழித்தடத்தின் அனைத்து நிறுத்தங்கள் மற்றும் கட்டண அட்டவணையை சரிபார்க்கவும்.'
                      : 'Direct gateway to the Metropolitan Transport Corporation (MTC) Chennai portal for route schedule verification, fare matrices, and regular timetables.'}
                </p>
              </div>

              {/* URL Box & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                {/* Link display pill */}
                <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-400 truncate">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  <span className="truncate">{currentUrl}</span>
                </div>

                {/* Copy link button */}
                <button
                  id="btn-copy-qr-link"
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition-colors"
                  title="Copy tracking link to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-300" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                {/* Direct simulated mobile view button */}
                <button
                  id="btn-simulate-mobile-screen"
                  type="button"
                  onClick={() => setShowSimulatedMobile(!showSimulatedMobile)}
                  className={`shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    showSimulatedMobile
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40'
                  }`}
                  title="Preview what commuter sees on mobile phone"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>{showSimulatedMobile ? 'Hide Phone Preview' : 'Test Mobile View'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive In-Modal Mobile Screen Preview (if toggled) */}
          {showSimulatedMobile && (
            <div className="mt-4 border-t border-slate-800/80 pt-4 animate-fadeIn">
              <div className="rounded-2xl border-2 border-amber-500/40 bg-slate-950 p-3.5 shadow-inner">
                {/* Phone Header Bar */}
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800 text-[11px]">
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-black">
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>SMARTPHONE BROWSER SIMULATOR</span>
                  </div>
                  <span className="text-slate-500 font-mono">mtcbus.tn.gov.in</span>
                </div>

                {/* Phone Content Simulation */}
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">
                        {qrMode === 'tracking' ? 'Live GPS Vehicle Telemetry' : 'Schedule Verification Record'}
                      </span>
                      <h6 className="text-sm font-black text-white">
                        MTC #{selectedBus.busNo} • {selectedBus.destinationEn}
                      </h6>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Verified Live
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                      <span className="text-[9px] text-slate-400 uppercase block">Vehicle Reg</span>
                      <span className="font-mono font-bold text-cyan-300">TN-01-N-9421</span>
                    </div>
                    <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                      <span className="text-[9px] text-slate-400 uppercase block">GPS Speed</span>
                      <span className="font-mono font-bold text-emerald-300">32 km/h</span>
                    </div>
                    <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                      <span className="text-[9px] text-slate-400 uppercase block">Terminal ETA</span>
                      <span className="font-mono font-bold text-amber-300">{selectedBus.etaMinutes} min</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>Depot: {selectedBus.originEn} Depot</span>
                    <a
                      href={currentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      Open Official Page <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Metro-style Stop Progression Route Line */}
        <div className="mb-6 rounded-2xl bg-slate-950/90 border border-slate-800 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5" />
              {language === 'ta' ? 'வழித்தட நிறுத்தங்கள்' : 'ROUTE STATIONS PROGRESSION'}
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Total {selectedBus.allStops.length} Stages
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
            {selectedBus.allStops.map((stop, idx) => {
              const isPassed = stop.isPassed;
              const isCurrent = stop.isCurrent;
              const isDest = idx === selectedBus.allStops.length - 1;

              return (
                <div key={stop.id} className="relative flex items-center justify-between gap-3 text-xs sm:text-sm">
                  {/* Node icon */}
                  <div className="absolute -left-6 sm:-left-8 flex items-center justify-center">
                    {isCurrent ? (
                      <span className="relative flex h-5 w-5 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <Radio className="h-4 w-4 text-amber-400 bg-slate-950 rounded-full" />
                      </span>
                    ) : isPassed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 bg-slate-950 rounded-full" />
                    ) : isDest ? (
                      <MapPin className="h-4 w-4 text-rose-400 bg-slate-950 rounded-full" />
                    ) : (
                      <CircleDot className="h-3.5 w-3.5 text-slate-600 bg-slate-950 rounded-full" />
                    )}
                  </div>

                  {/* Stop Name */}
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`font-bold ${
                        isCurrent
                          ? 'text-amber-300 text-sm sm:text-base'
                          : isPassed
                          ? 'text-slate-400 line-through decoration-slate-600'
                          : isDest
                          ? 'text-white font-black'
                          : 'text-slate-300'
                      }`}
                    >
                      {language === 'ta' ? stop.nameTa : stop.nameEn}
                    </span>
                    {language === 'dual' && (
                      <span className="text-[11px] text-slate-400">
                        {stop.nameTa}
                      </span>
                    )}
                  </div>

                  {/* Status label */}
                  <div className="shrink-0 text-right">
                    {isCurrent && (
                      <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] px-2 py-0.5 font-bold uppercase whitespace-nowrap">
                        {language === 'ta' ? 'இங்கு உள்ளது' : 'Current'}
                      </span>
                    )}
                    {isPassed && (
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">Departed</span>
                    )}
                    {isDest && (
                      <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 text-[10px] px-2 py-0.5 font-bold uppercase whitespace-nowrap">
                        Terminal End
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety & Amenities Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> GPS Tracked Fleet
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-cyan-400" /> Sched: {selectedBus.scheduledTime}
            </span>
          </div>

          <button
            onClick={() => setSelectedBus(null)}
            className="w-full sm:w-auto rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 sm:py-2 text-xs font-bold text-white transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
