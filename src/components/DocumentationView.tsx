import React from 'react';
import { BookOpen, Cpu, Database, Globe, Layers, ShieldCheck, Terminal, Zap } from 'lucide-react';

export const DocumentationView: React.FC = () => {
  return (
    <div id="docs-view" className="w-full flex flex-col gap-6 pb-20 text-slate-200 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
          <BookOpen className="h-4 w-4" />
          <span>System Specification & Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
          MTC Smart Bus Arrival & Category Display System
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Technical specifications, simulation mechanics, and architectural roadmap for Chennai Metropolitan Transport Corporation (MTC) public bus terminal displays.
        </p>
      </div>

      {/* Grid of Docs Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. What the Project Does */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-md">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
            <Globe className="h-4 w-4" />
            <span>1. Functional Scope & Objective</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Public Passenger Display System</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Engineered specifically for large 16:9 television screens and kiosk monitors at Chennai MTC bus stands (such as CMBT Koyambedu, Broadway, Guindy, Tambaram, T. Nagar). It provides instant visual clarity on:
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li>Next upcoming bus arrival sequence with prominent countdown ETAs</li>
            <li>Bus Category Identification (Ordinary, Express, Deluxe, AC Electric, Special)</li>
            <li>Route, Starting Point, and Destination Station details</li>
            <li>Live status indicators: 🟢 Arriving Now, 🟡 Approaching, 🔴 Delayed</li>
            <li>Designated platform bay and women's free travel scheme highlights</li>
            <li>Bilingual dual support in Tamil (தமிழ்) and English</li>
          </ul>
        </div>

        {/* 2. How the Prototype Works */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-md">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
            <Cpu className="h-4 w-4" />
            <span>2. Real-Time ETA Simulation Engine</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Autonomous Dynamic Countdown</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The application contains a built-in state engine in <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded">BusContext.tsx</code>:
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li>ETAs count down continuously every tick (configurable via 1x normal, 3x turbo, or paused).</li>
            <li>When a bus's ETA reaches 0, its status changes to <strong className="text-emerald-400">🟢 ARRIVING NOW</strong>.</li>
            <li>Arriving buses trigger a two-tone transit chime and are smoothly rotated out.</li>
            <li>A replacement scheduled bus is automatically dispatched from the route queue to maintain continuous terminal board flow.</li>
          </ul>
        </div>

        {/* 3. Real-Time MTC API Integration Path */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-md">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider mb-2">
            <Database className="h-4 w-4" />
            <span>3. Future Live MTC API Integration</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Standard GTFS-RT & GPS Ingestion</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The data layer is decoupled from visual display components. Connecting real MTC hardware requires substituting the mock updater with an external polling/WebSocket hook:
          </p>
          <div className="mt-3 rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-cyan-300 overflow-x-auto break-words">
            MTC Vehicle GPS Units → AIS-140 Gateway → GTFS-Realtime Feed / WebSocket → Backend API Gateway → Smart TV Display
          </div>
        </div>

        {/* 4. Component Architecture */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-md">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-wider mb-2">
            <Layers className="h-4 w-4" />
            <span>4. Modular Component Structure</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Clean, Modular Design</h3>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
            <li><strong className="text-white">Header:</strong> Terminal branding, clock, language switch, TV mode trigger</li>
            <li><strong className="text-white">NextBusesBoard:</strong> 16:9 high-contrast transit display table</li>
            <li><strong className="text-white">CategoryBadge:</strong> Accessible text + icon + badge pill</li>
            <li><strong className="text-white">ETAIndicator:</strong> Dynamic countdown badge with color-coded status</li>
            <li><strong className="text-white">BusDetailsModal:</strong> Metro-style station progression line & specs</li>
            <li><strong className="text-white">AllBusesView:</strong> Searchable, sortable catalog of all buses</li>
            <li><strong className="text-white">AdminPanel:</strong> Operator controls for ETA, announcements & fleet</li>
            <li><strong className="text-white">AnnouncementBar:</strong> Persistent scrolling ticker at bottom</li>
          </ul>
        </div>
      </div>

      {/* 5. Passenger Friendly Design Notes */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h4 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4" /> Accessibility & Distance-Viewing Mandates
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Public transport displays are viewed by children, senior citizens, tourists, and daily commuters from distances of 10–25 meters. The interface avoids complex menus and small fonts, employing high-contrast color coding (WCAG AA compliant), bold numbers, distinct shape cues for color-blind commuters, and bilingual Tamil/English labeling.
        </p>
      </div>
    </div>
  );
};
