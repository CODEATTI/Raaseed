import React, { useState } from 'react';
import { useBus } from '../context/BusContext';
import { MTC_BUS_STANDS } from '../data/mockBuses';
import { BusCategory, BusStatus, MTCBus } from '../types';
import { CategoryBadge } from './CategoryBadge';
import { NextBusesBoard } from './NextBusesBoard';
import {
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Eye,
  Megaphone,
  Radio,
  Sliders,
  Settings,
  Shield,
  ArrowRight,
  Volume2,
  VolumeX,
  Volume1,
  Mic,
  BellRing,
  ShieldAlert,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    buses,
    currentBusStand,
    setCurrentBusStand,
    language,
    setLanguage,
    addBus,
    removeBus,
    updateBusEta,
    setBusEtaDirect,
    updateBusStatus,
    updateBusDetails,
    announcements,
    addAnnouncement,
    removeAnnouncement,
    toggleAnnouncement,
    resetToDefaultData,
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
    announceBus,
    announceNextBusEnabled,
    setAnnounceNextBusEnabled,
    safetyAnnouncementsEnabled,
    setSafetyAnnouncementsEnabled,
    currentSafetyRule,
    currentSafetyRuleIndex,
    announceNextBus,
    announceSafetyRule,
    cycleNextSafetyRule,
  } = useBus();

  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);

  // New bus form state
  const [newBusNo, setNewBusNo] = useState('');
  const [newOriginEn, setNewOriginEn] = useState(currentBusStand.nameEn);
  const [newOriginTa, setNewOriginTa] = useState(currentBusStand.nameTa);
  const [newDestEn, setNewDestEn] = useState('Tambaram');
  const [newDestTa, setNewDestTa] = useState('தாம்பரம்');
  const [newCategory, setNewCategory] = useState<BusCategory>('Ordinary');
  const [newEta, setNewEta] = useState(6);
  const [newPlatform, setNewPlatform] = useState(currentBusStand.platforms[0] || 'Bay 1');

  // New announcement form state
  const [newAnnTextEn, setNewAnnTextEn] = useState('');
  const [newAnnTextTa, setNewAnnTextTa] = useState('');
  const [newAnnType, setNewAnnType] = useState<'info' | 'alert' | 'delay' | 'safety'>('info');

  const handleCreateBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusNo.trim()) return;

    addBus({
      busNo: newBusNo.toUpperCase().trim(),
      routeNameEn: `${newOriginEn} → ${newDestEn}`,
      routeNameTa: `${newOriginTa} → ${newDestTa}`,
      originEn: newOriginEn,
      originTa: newOriginTa,
      destinationEn: newDestEn,
      destinationTa: newDestTa,
      category: newCategory,
      etaMinutes: Number(newEta),
      platform: newPlatform,
      status: Number(newEta) <= 1 ? 'arriving_now' : Number(newEta) <= 5 ? 'approaching' : 'on_time',
      viaStopsEn: ['Guindy', 'Saidapet'],
      viaStopsTa: ['கிண்டி', 'சைதாப்பேட்டை'],
    });

    setNewBusNo('');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTextEn.trim()) return;

    addAnnouncement({
      type: newAnnType,
      textEn: newAnnTextEn.trim(),
      textTa: newAnnTextTa.trim() || newAnnTextEn.trim(),
      active: true,
    });

    setNewAnnTextEn('');
    setNewAnnTextTa('');
  };

  return (
    <div id="admin-panel" className="w-full flex flex-col gap-6 pb-20">
      {/* Admin Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                MTC Terminal Operations Control
              </span>
              <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                LIVE CONTROLLER
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              Operator & Terminal Admin Panel
            </h2>
          </div>
        </div>

        {/* Live Preview Toggle & Reset */}
        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          <button
            id="btn-toggle-live-preview"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              showLivePreview
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>{showLivePreview ? 'Hide Preview' : 'Live TV Preview'}</span>
          </button>

          <button
            id="btn-reset-demo-data"
            onClick={resetToDefaultData}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 border border-slate-700 text-slate-300 text-xs font-bold transition-colors"
            title="Reset to default mock buses & announcements"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Embedded Live Display Preview (if toggled) */}
      {showLivePreview && (
        <div className="rounded-3xl border-2 border-cyan-500/60 bg-slate-950 p-3.5 sm:p-5 shadow-2xl animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800 text-cyan-400 text-xs font-black uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4 shrink-0" /> LIVE PASSENGER TV DISPLAY PREVIEW
            </span>
            <span className="text-slate-400 font-normal">
              Sync: {currentBusStand.nameEn}
            </span>
          </div>
          <NextBusesBoard maxDisplay={5} />
        </div>
      )}

      {/* Terminal Settings & Simulation Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Active Bus Stand Controller */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <label className="text-xs font-black uppercase text-amber-400 tracking-wider block mb-2">
            1. Current Bus Terminal / Stand
          </label>
          <select
            id="admin-bus-stand-select"
            aria-label="Select Bus Terminal for Operator"
            value={currentBusStand.id}
            onChange={(e) => {
              const stand = MTC_BUS_STANDS.find((s) => s.id === e.target.value);
              if (stand) {
                setCurrentBusStand(stand);
                setNewOriginEn(stand.nameEn);
                setNewOriginTa(stand.nameTa);
                setNewPlatform(stand.platforms[0] || 'Bay 1');
              }
            }}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
          >
            {MTC_BUS_STANDS.map((stand) => (
              <option key={stand.id} value={stand.id} className="bg-slate-900 text-white">
                {stand.nameEn} ({stand.nameTa})
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Zone: {currentBusStand.zone} • {currentBusStand.platforms.length} Boarding Bays
          </span>
        </div>

        {/* Display Language Override */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <label className="text-xs font-black uppercase text-amber-400 tracking-wider block mb-2">
            2. Public Display Language
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['dual', 'en', 'ta'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`py-2 px-2 text-xs font-black rounded-xl border transition-all ${
                  language === lang
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {lang === 'dual' ? 'Dual' : lang === 'en' ? 'English' : 'தமிழ்'}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Changes headers, routes, categories and ETA labels instantly
          </span>
        </div>

        {/* Simulation Speed Control */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <label className="text-xs font-black uppercase text-amber-400 tracking-wider block mb-2">
            3. ETA Simulation Speed
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSimulationSpeed(0)}
              className={`py-2 px-1.5 text-xs font-bold rounded-xl border transition-all ${
                simulationSpeed === 0
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-slate-950 text-slate-300 border-slate-800'
              }`}
            >
              Paused
            </button>
            <button
              onClick={() => setSimulationSpeed(1)}
              className={`py-2 px-1.5 text-xs font-bold rounded-xl border transition-all ${
                simulationSpeed === 1
                  ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400'
                  : 'bg-slate-950 text-slate-300 border-slate-800'
              }`}
            >
              1x Real
            </button>
            <button
              onClick={() => setSimulationSpeed(3)}
              className={`py-2 px-1.5 text-xs font-bold rounded-xl border transition-all ${
                simulationSpeed === 3
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-400'
                  : 'bg-slate-950 text-slate-300 border-slate-800'
              }`}
            >
              3x Turbo
            </button>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Simulates dynamic countdown every few seconds
          </span>
        </div>

        {/* Terminal PA Audio & Speech Control */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase text-amber-400 tracking-wider block">
                4. Terminal PA Sound
              </label>
              {isAudioPlaying && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-black animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Broadcasting
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2.5">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                  soundEnabled
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                <span>{soundEnabled ? 'PA ON' : 'PA OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                  voiceEnabled
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle automated speech synthesis"
              >
                <Mic className="h-3.5 w-3.5" />
                <span>{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
              </button>
            </div>

            {/* Next Bus & Safety Rule Auto Toggles */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setAnnounceNextBusEnabled(!announceNextBusEnabled)}
                className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                  announceNextBusEnabled
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
                title="Automatically announce next scheduled bus alongside arrivals"
              >
                <BellRing className="h-3 w-3" />
                <span>Next Bus: {announceNextBusEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSafetyAnnouncementsEnabled(!safetyAnnouncementsEnabled)}
                className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                  safetyAnnouncementsEnabled
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
                title="Broadcast passenger safety rules during gaps between bus arrivals"
              >
                <ShieldAlert className="h-3 w-3" />
                <span>Gap Safety: {safetyAnnouncementsEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              <button
                type="button"
                onClick={() => {
                  const nextB = buses.find((b) => b.etaMinutes > 0) || buses[0];
                  if (nextB) announceNextBus(nextB);
                }}
                className="py-1 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1"
                title="Call next upcoming bus on display"
              >
                <BellRing className="h-3 w-3" />
                <span>Call Next Bus</span>
              </button>
              <button
                type="button"
                onClick={() => announceSafetyRule(currentSafetyRuleIndex)}
                className="py-1 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1"
                title="Broadcast active safety rule immediately"
              >
                <ShieldAlert className="h-3 w-3" />
                <span>Call Safety Rule</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={testArrivalChime}
                className="flex-1 py-1 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold"
                title="Play 4-tone station chime"
              >
                Chime
              </button>
              <button
                type="button"
                onClick={testVoiceAnnouncement}
                className="flex-1 py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold"
                title={`Play chime & announcement in declared language (${language.toUpperCase()})`}
              >
                Test Call ({language.toUpperCase()})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Bus Form */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
        <h3 className="text-base font-black uppercase text-amber-400 tracking-wider flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4" /> Add New Scheduled Bus to Display
        </h3>

        <form onSubmit={handleCreateBus} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
              Bus Number *
            </label>
            <input
              id="input-new-bus-no"
              type="text"
              placeholder="e.g. 70A, 21G"
              value={newBusNo}
              onChange={(e) => setNewBusNo(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
              Category
            </label>
            <select
              id="select-new-category"
              aria-label="New Bus Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as BusCategory)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="Ordinary">Ordinary (Free for Women)</option>
              <option value="Express">Express (Limited Stops)</option>
              <option value="Deluxe">Deluxe (Cushioned)</option>
              <option value="AC">AC Electric / Volvo</option>
              <option value="Special">Special / Night</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
              Destination (English)
            </label>
            <input
              type="text"
              value={newDestEn}
              onChange={(e) => setNewDestEn(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
              Destination (Tamil)
            </label>
            <input
              type="text"
              value={newDestTa}
              onChange={(e) => setNewDestTa(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
              ETA (Minutes)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={newEta}
              onChange={(e) => setNewEta(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              id="btn-submit-new-bus"
              type="submit"
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 text-sm shadow-md transition-all"
            >
              + Dispatch Bus
            </button>
          </div>
        </form>
      </div>

      {/* Bus Fleet Table & Quick ETA / Status Modifiers */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-sm sm:text-base font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
            <Sliders className="h-4 w-4 shrink-0" /> Real-Time Fleet Controller ({buses.length} Active Buses)
          </h3>
          <span className="text-xs text-slate-400">
            Quickly advance ETA, mark delayed or arriving now
          </span>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[760px] text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Bus No</th>
                <th className="py-3 px-3">Route & Destination</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Bay</th>
                <th className="py-3 px-3">ETA</th>
                <th className="py-3 px-3">Quick Adjust ETA</th>
                <th className="py-3 px-3">Change Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-950/40">
                  {/* Bus No */}
                  <td className="py-3 px-3 font-mono font-black text-amber-400 text-base">
                    {bus.busNo}
                  </td>

                  {/* Route & Destination */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-white text-sm">{bus.destinationEn}</div>
                    <div className="text-[10px] text-slate-400">{bus.routeNameEn}</div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3">
                    <CategoryBadge category={bus.category} language="en" size="sm" />
                  </td>

                  {/* Platform */}
                  <td className="py-3 px-3 font-bold text-cyan-300">{bus.platform}</td>

                  {/* ETA */}
                  <td className="py-3 px-3">
                    <span
                      className={`font-mono font-black text-sm px-2 py-0.5 rounded-lg ${
                        bus.status === 'arriving_now'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : bus.status === 'delayed'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-800 text-cyan-300'
                      }`}
                    >
                      {bus.etaMinutes} min
                    </span>
                  </td>

                  {/* Quick Adjust Buttons */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateBusEta(bus.id, -1)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
                        title="-1 min"
                      >
                        -1m
                      </button>
                      <button
                        onClick={() => updateBusEta(bus.id, 1)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
                        title="+1 min"
                      >
                        +1m
                      </button>
                      <button
                        onClick={() => updateBusEta(bus.id, 5)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
                        title="+5 min"
                      >
                        +5m
                      </button>
                    </div>
                  </td>

                  {/* Change Status */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateBusStatus(bus.id, 'arriving_now')}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          bus.status === 'arriving_now'
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-emerald-300 hover:bg-emerald-950'
                        }`}
                      >
                        Arriving
                      </button>
                      <button
                        onClick={() => updateBusStatus(bus.id, 'delayed')}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          bus.status === 'delayed'
                            ? 'bg-rose-600 text-white font-black'
                            : 'bg-slate-800 text-rose-400 hover:bg-rose-950'
                        }`}
                      >
                        Delayed
                      </button>
                      <button
                        onClick={() => updateBusStatus(bus.id, 'on_time')}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          bus.status === 'on_time'
                            ? 'bg-cyan-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-cyan-300 hover:bg-cyan-950'
                        }`}
                      >
                        On Time
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => announceBus(bus)}
                        className="p-1.5 rounded-lg text-amber-400 hover:text-white hover:bg-amber-500/20 border border-transparent hover:border-amber-500/40 transition-colors"
                        title={`Broadcast ${bus.busNo} arrival call in declared language (${language.toUpperCase()})`}
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeBus(bus.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                        title="Remove bus from board"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Announcement Manager */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
        <h3 className="text-base font-black uppercase text-amber-400 tracking-wider flex items-center gap-2 mb-4">
          <Megaphone className="h-4 w-4" /> Public Scrolling Announcement Manager
        </h3>

        {/* Create new announcement */}
        <form onSubmit={handleCreateAnnouncement} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5">
          <div className="sm:col-span-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
              Alert Type
            </label>
            <select
              aria-label="Alert Type"
              value={newAnnType}
              onChange={(e) => setNewAnnType(e.target.value as 'info' | 'alert' | 'delay' | 'safety')}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-bold text-white focus:outline-none"
            >
              <option value="info">General Info</option>
              <option value="alert">Arriving Alert</option>
              <option value="delay">Route Delay</option>
              <option value="safety">Passenger Safety</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
              English Text *
            </label>
            <input
              type="text"
              placeholder="e.g. Bus 21G arriving at Bay 3"
              value={newAnnTextEn}
              onChange={(e) => setNewAnnTextEn(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none"
              required
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
              Tamil Text
            </label>
            <input
              type="text"
              placeholder="எ.கா. பேருந்து 21G பே 3-ல் வந்து கொண்டிருக்கிறது"
              value={newAnnTextTa}
              onChange={(e) => setNewAnnTextTa(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-2 text-xs shadow-md transition-all"
            >
              + Broadcast Alert
            </button>
          </div>
        </form>

        {/* Existing Announcements List */}
        <div className="space-y-2">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 text-xs transition-colors ${
                ann.active
                  ? 'bg-slate-950 border-slate-700 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-300 shrink-0">
                  {ann.type}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold break-words">{ann.textEn}</div>
                  <div className="text-[11px] text-slate-400 break-words">{ann.textTa}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => toggleAnnouncement(ann.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                    ann.active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ann.active ? 'Active' : 'Muted'}
                </button>
                <button
                  onClick={() => removeAnnouncement(ann.id)}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
