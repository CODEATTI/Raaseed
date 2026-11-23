import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MTCBus, BusStand, AnnouncementItem, Language, ViewTab, BusCategory, BusStatus } from '../types';
import { MTC_BUS_STANDS, INITIAL_BUSES, INITIAL_ANNOUNCEMENTS, REPLACEMENT_BUS_TEMPLATES } from '../data/mockBuses';
import { MTC_SAFETY_RULES, SafetyRule } from '../data/safetyRules';
import { transitChime } from '../utils/sound';

interface BusContextType {
  buses: MTCBus[];
  currentBusStand: BusStand;
  setCurrentBusStand: (stand: BusStand) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedBus: MTCBus | null;
  setSelectedBus: (bus: MTCBus | null) => void;
  announcements: AnnouncementItem[];
  isTvMode: boolean;
  setIsTvMode: (val: boolean) => void;
  simulationSpeed: number; // 0 = paused, 1 = normal, 5 = fast demo
  setSimulationSpeed: (speed: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
  isAudioPlaying: boolean;
  safetyAnnouncementsEnabled: boolean;
  setSafetyAnnouncementsEnabled: (enabled: boolean) => void;
  announceNextBusEnabled: boolean;
  setAnnounceNextBusEnabled: (enabled: boolean) => void;
  currentSafetyRule: SafetyRule;
  currentSafetyRuleIndex: number;
  announceNextBus: (targetBus?: MTCBus) => void;
  announceSafetyRule: (ruleIndex?: number) => void;
  cycleNextSafetyRule: () => void;
  testArrivalChime: () => void;
  testAnnouncementChime: () => void;
  testVoiceAnnouncement: () => void;
  announceBus: (bus: MTCBus) => void;
  lastUpdatedTime: string;

  // Admin Actions
  addBus: (newBus: Partial<MTCBus>) => void;
  removeBus: (busId: string) => void;
  updateBusEta: (busId: string, deltaMinutes: number) => void;
  setBusEtaDirect: (busId: string, minutes: number) => void;
  updateBusStatus: (busId: string, status: BusStatus) => void;
  updateBusDetails: (busId: string, updates: Partial<MTCBus>) => void;
  addAnnouncement: (announcement: Omit<AnnouncementItem, 'id' | 'createdAt'>) => void;
  removeAnnouncement: (id: string) => void;
  toggleAnnouncement: (id: string) => void;
  resetToDefaultData: () => void;
}

const BusContext = createContext<BusContextType | undefined>(undefined);

const safeGetStorage = (key: string): string | null => {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
};

const safeSetStorage = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage quota or sandbox SecurityError
  }
};

const safeRemoveStorage = (key: string): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage errors
  }
};

export const BusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<MTCBus[]>(() => {
    const saved = safeGetStorage('mtc_buses_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return INITIAL_BUSES;
      }
    }
    return INITIAL_BUSES;
  });

  const [currentBusStand, setCurrentBusStandState] = useState<BusStand>(() => {
    const savedId = safeGetStorage('mtc_current_stand');
    if (savedId) {
      const found = MTC_BUS_STANDS.find((s) => s.id === savedId);
      if (found) return found;
    }
    return MTC_BUS_STANDS[0]; // CMBT Koyambedu default
  });

  const [language, setLanguage] = useState<Language>('dual');
  const [activeTab, setActiveTab] = useState<ViewTab>('tv');
  const [selectedBus, setSelectedBus] = useState<MTCBus | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    const saved = safeGetStorage('mtc_announcements_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return INITIAL_ANNOUNCEMENTS;
      }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  const [isTvMode, setIsTvMode] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(3); // Demo mode active by default for clear visible countdown
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = safeGetStorage('mtc_sound_enabled');
    return saved !== 'false'; // default true; browser gesture guard prevents autoplay errors
  });
  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(() => {
    const saved = safeGetStorage('mtc_voice_enabled');
    return saved !== 'false'; // default true
  });
  const [soundVolume, setSoundVolumeState] = useState<number>(() => {
    const saved = safeGetStorage('mtc_sound_volume');
    const parsed = saved !== null ? Number(saved) : NaN;
    return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0.8;
  });
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Just now');
  const replacementIndexRef = useRef<number>(0);
  const busesRef = useRef<MTCBus[]>(buses);
  useEffect(() => {
    busesRef.current = buses;
  }, [buses]);

  // Safety Rules & Next Bus Calling State
  const [safetyAnnouncementsEnabled, setSafetyAnnouncementsEnabledState] = useState<boolean>(() => {
    const saved = safeGetStorage('mtc_safety_announcements_enabled');
    return saved !== 'false'; // default true
  });
  const [announceNextBusEnabled, setAnnounceNextBusEnabledState] = useState<boolean>(() => {
    const saved = safeGetStorage('mtc_announce_next_bus_enabled');
    return saved !== 'false'; // default true
  });
  const [currentSafetyRuleIndex, setCurrentSafetyRuleIndex] = useState<number>(0);

  const currentSafetyRule = useMemo(() => {
    return MTC_SAFETY_RULES[currentSafetyRuleIndex % MTC_SAFETY_RULES.length];
  }, [currentSafetyRuleIndex]);

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const safetyAnnouncementsEnabledRef = useRef(safetyAnnouncementsEnabled);
  useEffect(() => {
    safetyAnnouncementsEnabledRef.current = safetyAnnouncementsEnabled;
  }, [safetyAnnouncementsEnabled]);

  const announceNextBusEnabledRef = useRef(announceNextBusEnabled);
  useEffect(() => {
    announceNextBusEnabledRef.current = announceNextBusEnabled;
  }, [announceNextBusEnabled]);

  const currentSafetyRuleIndexRef = useRef(currentSafetyRuleIndex);
  useEffect(() => {
    currentSafetyRuleIndexRef.current = currentSafetyRuleIndex;
  }, [currentSafetyRuleIndex]);

  const lastArrivalOrCallTimeRef = useRef<number>(Date.now());
  const lastSafetyCallTimeRef = useRef<number>(Date.now() - 30000);

  const setCurrentBusStand = useCallback((stand: BusStand) => {
    setCurrentBusStandState(stand);
    safeSetStorage('mtc_current_stand', stand.id);
  }, []);

  // Sync Audio Engine settings
  useEffect(() => {
    transitChime.soundEnabled = soundEnabled;
    transitChime.voiceEnabled = voiceEnabled;
    transitChime.setVolume(soundVolume);
    const unsubscribe = transitChime.subscribe((active) => {
      setIsAudioPlaying(active);
    });
    return unsubscribe;
  }, [soundEnabled, voiceEnabled, soundVolume]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    transitChime.soundEnabled = enabled;
    safeSetStorage('mtc_sound_enabled', String(enabled));
    if (enabled) {
      // Play instant confirmation chime when enabled via user click
      transitChime.playAnnouncementChime(true);
    } else {
      // Stop any ongoing chimes or speech immediately when muted
      transitChime.stopAll();
    }
  }, []);

  const setVoiceEnabled = useCallback((enabled: boolean) => {
    setVoiceEnabledState(enabled);
    transitChime.voiceEnabled = enabled;
    safeSetStorage('mtc_voice_enabled', String(enabled));
    if (!enabled) {
      transitChime.stopAll();
    }
  }, []);

  const setSoundVolume = useCallback((vol: number) => {
    const safeVol = Number.isFinite(vol) ? Math.max(0, Math.min(1, vol)) : 0.8;
    setSoundVolumeState(safeVol);
    transitChime.setVolume(safeVol);
    safeSetStorage('mtc_sound_volume', String(safeVol));
  }, []);

  const setSafetyAnnouncementsEnabled = useCallback((enabled: boolean) => {
    setSafetyAnnouncementsEnabledState(enabled);
    safeSetStorage('mtc_safety_announcements_enabled', String(enabled));
  }, []);

  const setAnnounceNextBusEnabled = useCallback((enabled: boolean) => {
    setAnnounceNextBusEnabledState(enabled);
    safeSetStorage('mtc_announce_next_bus_enabled', String(enabled));
  }, []);

  const cycleNextSafetyRule = useCallback(() => {
    setCurrentSafetyRuleIndex((prev) => (prev + 1) % MTC_SAFETY_RULES.length);
  }, []);

  const announceSafetyRule = useCallback((ruleIndex?: number) => {
    const idx = ruleIndex !== undefined ? ruleIndex % MTC_SAFETY_RULES.length : currentSafetyRuleIndexRef.current;
    setCurrentSafetyRuleIndex(idx);
    currentSafetyRuleIndexRef.current = idx;
    const rule = MTC_SAFETY_RULES[idx];
    lastSafetyCallTimeRef.current = Date.now();
    transitChime.announceSafetyRule(rule, languageRef.current, true);
  }, []);

  const announceNextBus = useCallback((targetBus?: MTCBus) => {
    let next: MTCBus | undefined = targetBus;
    if (!next) {
      const upcoming = [...busesRef.current]
        .filter((b) => b.etaMinutes > 0)
        .sort((a, b) => a.etaSecondsRemaining - b.etaSecondsRemaining);
      next = upcoming[0];
    }

    if (next) {
      lastArrivalOrCallTimeRef.current = Date.now();
      transitChime.announceNextBus(
        next.busNo,
        next.destinationEn,
        next.destinationTa,
        next.platform,
        Math.max(1, next.etaMinutes),
        languageRef.current,
        next.category,
        true,
      );
    }
  }, []);

  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const announceBus = useCallback((bus: MTCBus) => {
    lastArrivalOrCallTimeRef.current = Date.now();
    const upcomingBuses = busesRef.current
      .filter((b) => b.id !== bus.id && b.etaMinutes > 0)
      .sort((a, b) => a.etaSecondsRemaining - b.etaSecondsRemaining);
    const nextUpcoming = upcomingBuses[0];

    if (announceNextBusEnabledRef.current && nextUpcoming) {
      transitChime.announceArrivalWithNext(
        {
          busNo: bus.busNo,
          destinationEn: bus.destinationEn,
          destinationTa: bus.destinationTa,
          platform: bus.platform,
          category: bus.category,
        },
        {
          busNo: nextUpcoming.busNo,
          destinationEn: nextUpcoming.destinationEn,
          destinationTa: nextUpcoming.destinationTa,
          platform: nextUpcoming.platform,
          etaMinutes: Math.max(1, nextUpcoming.etaMinutes),
          category: nextUpcoming.category,
        },
        languageRef.current,
        true,
      );
    } else {
      transitChime.announceArrival(
        bus.busNo,
        bus.destinationEn,
        bus.destinationTa,
        bus.platform,
        languageRef.current,
        bus.category,
        true,
      );
    }
  }, []);

  const testArrivalChime = useCallback(() => {
    transitChime.playArrivalChime(true);
  }, []);

  const testAnnouncementChime = useCallback(() => {
    transitChime.playAnnouncementChime(true);
  }, []);

  const testVoiceAnnouncement = useCallback(() => {
    transitChime.testSound(languageRef.current);
  }, []);

  // Sync to local storage for persistence across reloads
  useEffect(() => {
    safeSetStorage('mtc_buses_data', JSON.stringify(buses));
  }, [buses]);

  useEffect(() => {
    safeSetStorage('mtc_announcements_data', JSON.stringify(announcements));
  }, [announcements]);

  // Real-time ETA Simulation Engine
  useEffect(() => {
    if (simulationSpeed === 0) return;

    const intervalMs = simulationSpeed === 1 ? 1000 : simulationSpeed === 3 ? 1000 : 800;
    const decrementSeconds = simulationSpeed === 1 ? 1 : simulationSpeed === 3 ? 12 : 30;

    const timer = setInterval(() => {
      const prevBuses = busesRef.current;
      let hasDepartures = false;
      let arrivedBusToAnnounce: MTCBus | null = null;

      const updated = prevBuses.map((bus) => {
        if (bus.status === 'delayed') {
          const newSec = Math.max(10, bus.etaSecondsRemaining - Math.floor(decrementSeconds / 3));
          return {
            ...bus,
            etaSecondsRemaining: newSec,
            etaMinutes: Math.max(1, Math.ceil(newSec / 60)),
          };
        }

        const newSeconds = bus.etaSecondsRemaining - decrementSeconds;

        if (newSeconds <= 0) {
          if (!bus.hasAnnouncedArrival && !arrivedBusToAnnounce) {
            arrivedBusToAnnounce = bus;
          }
          return {
            ...bus,
            etaSecondsRemaining: 0,
            etaMinutes: 0,
            status: 'arriving_now' as BusStatus,
            hasAnnouncedArrival: true,
          };
        }

        const newMinutes = Math.max(1, Math.ceil(newSeconds / 60));
        let newStatus: BusStatus = bus.status;
        let hasAnnounced = bus.hasAnnouncedArrival;

        if (newMinutes <= 1) {
          newStatus = 'arriving_now';
          if (!hasAnnounced) {
            hasAnnounced = true;
            if (!arrivedBusToAnnounce) {
              arrivedBusToAnnounce = bus;
            }
          }
        } else if (newMinutes <= 5) {
          newStatus = 'approaching';
        } else {
          newStatus = 'on_time';
        }

        return {
          ...bus,
          etaSecondsRemaining: newSeconds,
          etaMinutes: newMinutes,
          status: newStatus,
          hasAnnouncedArrival: hasAnnounced,
        };
      });

      let finalBuses = updated;

      // If any bus has reached 0 ETA, depart it and introduce a new bus
      const departingBuses = updated.filter((b) => b.etaSecondsRemaining === 0);
      if (departingBuses.length > 0) {
        hasDepartures = true;
        const idx = replacementIndexRef.current;
        replacementIndexRef.current = idx + 1;
        const template = REPLACEMENT_BUS_TEMPLATES[idx % REPLACEMENT_BUS_TEMPLATES.length];

        const randomMins = 18 + Math.floor(Math.random() * 12);
        const newGeneratedBus: MTCBus = {
          id: `bus-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          busNo: template.busNo,
          routeNameEn: template.routeNameEn,
          routeNameTa: template.routeNameTa,
          originEn: template.originEn,
          originTa: template.originTa,
          destinationEn: template.destinationEn,
          destinationTa: template.destinationTa,
          category: template.category,
          etaMinutes: randomMins,
          etaSecondsRemaining: randomMins * 60,
          status: 'on_time',
          platform: currentBusStand.platforms[Math.floor(Math.random() * currentBusStand.platforms.length)],
          viaStopsEn: template.viaStopsEn,
          viaStopsTa: template.viaStopsTa,
          allStops: [
            { id: 's-start', nameEn: template.originEn, nameTa: template.originTa, isPassed: true },
            { id: 's-curr', nameEn: template.viaStopsEn[0] || 'En route', nameTa: template.viaStopsTa[0] || 'வழியில்', isCurrent: true },
            { id: 's-dest', nameEn: template.destinationEn, nameTa: template.destinationTa },
          ],
          busStandId: currentBusStand.id,
          occupancy: (['low', 'medium', 'crowded'] as const)[Math.floor(Math.random() * 3)],
          isElectric: template.category === 'AC',
          isWomenFree: template.isWomenFree,
          fareEstimateEn: template.fareEstimateEn,
          fareEstimateTa: template.fareEstimateTa,
          busModel: template.busModel,
          scheduledTime: new Date(Date.now() + randomMins * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const remaining = updated.filter((b) => b.id !== departingBuses[0].id);
        finalBuses = [...remaining, newGeneratedBus];
      }

      busesRef.current = finalBuses;
      setBuses(finalBuses);

      if (hasDepartures) {
        setLastUpdatedTime(new Date().toLocaleTimeString());
      }

      // Execute audio side effects strictly outside React state updaters
      if (arrivedBusToAnnounce) {
        const bus = arrivedBusToAnnounce as MTCBus;
        const upcomingBuses = finalBuses
          .filter((b) => b.id !== bus.id && b.etaMinutes > 0)
          .sort((a, b) => a.etaSecondsRemaining - b.etaSecondsRemaining);
        const nextUpcoming = upcomingBuses[0];

        lastArrivalOrCallTimeRef.current = Date.now();
        if (announceNextBusEnabledRef.current && nextUpcoming) {
          transitChime.announceArrivalWithNext(
            {
              busNo: bus.busNo,
              destinationEn: bus.destinationEn,
              destinationTa: bus.destinationTa,
              platform: bus.platform,
              category: bus.category,
            },
            {
              busNo: nextUpcoming.busNo,
              destinationEn: nextUpcoming.destinationEn,
              destinationTa: nextUpcoming.destinationTa,
              platform: nextUpcoming.platform,
              etaMinutes: Math.max(1, nextUpcoming.etaMinutes),
              category: nextUpcoming.category,
            },
            languageRef.current,
          );
        } else {
          transitChime.announceArrival(
            bus.busNo,
            bus.destinationEn,
            bus.destinationTa,
            bus.platform,
            languageRef.current,
            bus.category,
          );
        }
      } else {
        const now = Date.now();
        const timeSinceLastArrival = now - lastArrivalOrCallTimeRef.current;
        const timeSinceLastSafety = now - lastSafetyCallTimeRef.current;
        const isAnyBusArrivingNow = finalBuses.some((b) => b.status === 'arriving_now' || b.etaMinutes <= 1);

        if (
          safetyAnnouncementsEnabledRef.current &&
          soundEnabledRef.current &&
          !isAnyBusArrivingNow &&
          !transitChime.isBusy() &&
          timeSinceLastArrival > 35000 &&
          timeSinceLastSafety > 45000
        ) {
          lastSafetyCallTimeRef.current = now;
          const nextIdx = (currentSafetyRuleIndexRef.current + 1) % MTC_SAFETY_RULES.length;
          currentSafetyRuleIndexRef.current = nextIdx;
          setCurrentSafetyRuleIndex(nextIdx);
          const rule = MTC_SAFETY_RULES[nextIdx];
          transitChime.announceSafetyRule(rule, languageRef.current);
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [simulationSpeed, currentBusStand]);

  // Keep last updated string fresh
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setLastUpdatedTime(new Date().toLocaleTimeString());
    }, 5000);
    return () => clearInterval(clockTimer);
  }, []);

  // Admin Actions
  const addBus = useCallback(
    (newBusData: Partial<MTCBus>) => {
      const minutes = newBusData.etaMinutes || 10;
      const bus: MTCBus = {
        id: `bus-custom-${Date.now()}`,
        busNo: newBusData.busNo || '101',
        routeNameEn: newBusData.routeNameEn || `${currentBusStand.code} → Destination`,
        routeNameTa: newBusData.routeNameTa || `${currentBusStand.nameTa} → சேருமிடம்`,
        originEn: newBusData.originEn || currentBusStand.nameEn,
        originTa: newBusData.originTa || currentBusStand.nameTa,
        destinationEn: newBusData.destinationEn || 'Tambaram',
        destinationTa: newBusData.destinationTa || 'தாம்பரம்',
        category: newBusData.category || 'Ordinary',
        etaMinutes: minutes,
        etaSecondsRemaining: minutes * 60,
        status: newBusData.status || (minutes <= 1 ? 'arriving_now' : minutes <= 5 ? 'approaching' : 'on_time'),
        platform: newBusData.platform || currentBusStand.platforms[0] || 'Bay 1',
        viaStopsEn: newBusData.viaStopsEn || ['Guindy', 'Saidapet'],
        viaStopsTa: newBusData.viaStopsTa || ['கிண்டி', 'சைதாப்பேட்டை'],
        allStops: newBusData.allStops || [
          { id: 's1', nameEn: 'Starting Point', nameTa: 'தொடக்க இடம்', isPassed: true },
          { id: 's2', nameEn: 'Mid Point', nameTa: 'நடு நிறுத்தம்', isCurrent: true },
          { id: 's3', nameEn: newBusData.destinationEn || 'Destination', nameTa: newBusData.destinationTa || 'சேருமிடம்' },
        ],
        busStandId: currentBusStand.id,
        occupancy: newBusData.occupancy || 'medium',
        isElectric: newBusData.category === 'AC',
        isWomenFree: newBusData.category === 'Ordinary',
        fareEstimateEn: newBusData.category === 'Ordinary' ? '₹12 (FREE for Women)' : '₹25',
        fareEstimateTa: newBusData.category === 'Ordinary' ? '₹12 (பெண்களுக்கு இலவசம்)' : '₹25',
        busModel: 'MTC Modern Fleet BS-VI',
        scheduledTime: new Date(Date.now() + minutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setBuses((prev) => [bus, ...prev]);
      transitChime.playAnnouncementChime();
    },
    [currentBusStand],
  );

  const removeBus = useCallback((busId: string) => {
    setBuses((prev) => prev.filter((b) => b.id !== busId));
    setSelectedBus((prev) => (prev?.id === busId ? null : prev));
  }, []);

  const updateBusEta = useCallback((busId: string, deltaMinutes: number) => {
    setBuses((prev) =>
      prev.map((b) => {
        if (b.id !== busId) return b;
        const newMins = Math.max(0, b.etaMinutes + deltaMinutes);
        const newSecs = newMins * 60;
        let status: BusStatus = b.status;
        if (newMins <= 0) status = 'arriving_now';
        else if (newMins <= 5 && b.status !== 'delayed') status = 'approaching';
        else if (b.status !== 'delayed') status = 'on_time';

        return {
          ...b,
          etaMinutes: newMins,
          etaSecondsRemaining: newSecs,
          status,
        };
      }),
    );
  }, []);

  const setBusEtaDirect = useCallback(
    (busId: string, minutes: number) => {
      const target = busesRef.current.find((b) => b.id === busId);
      const safeMins = Math.max(0, minutes);
      const isArriving = safeMins <= 0;

      setBuses((prev) =>
        prev.map((b) => {
          if (b.id !== busId) return b;
          return {
            ...b,
            etaMinutes: safeMins,
            etaSecondsRemaining: safeMins * 60,
            status: isArriving ? 'arriving_now' : safeMins <= 5 ? 'approaching' : 'on_time',
            hasAnnouncedArrival: isArriving ? true : b.hasAnnouncedArrival,
          };
        }),
      );

      if (target && isArriving && !target.hasAnnouncedArrival) {
        transitChime.announceArrival(
          target.busNo,
          target.destinationEn,
          target.destinationTa,
          target.platform,
          languageRef.current,
          target.category,
          true,
        );
      }
    },
    [],
  );

  const updateBusStatus = useCallback(
    (busId: string, status: BusStatus) => {
      const target = busesRef.current.find((b) => b.id === busId);

      setBuses((prev) =>
        prev.map((b) => {
          if (b.id !== busId) return b;
          if (status === 'arriving_now') {
            return {
              ...b,
              status,
              etaMinutes: 0,
              etaSecondsRemaining: 0,
              hasAnnouncedArrival: true,
            };
          }
          return { ...b, status };
        }),
      );

      if (target && status === 'arriving_now' && !target.hasAnnouncedArrival) {
        transitChime.announceArrival(
          target.busNo,
          target.destinationEn,
          target.destinationTa,
          target.platform,
          languageRef.current,
          target.category,
          true,
        );
      }
    },
    [],
  );

  const updateBusDetails = useCallback((busId: string, updates: Partial<MTCBus>) => {
    setBuses((prev) =>
      prev.map((b) => {
        if (b.id !== busId) return b;
        return { ...b, ...updates };
      }),
    );
  }, []);

  const addAnnouncement = useCallback((ann: Omit<AnnouncementItem, 'id' | 'createdAt'>) => {
    const newItem: AnnouncementItem = {
      ...ann,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAnnouncements((prev) => [newItem, ...prev]);
    transitChime.playAnnouncementChime();
  }, []);

  const removeAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  }, []);

  const resetToDefaultData = useCallback(() => {
    setBuses(INITIAL_BUSES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    safeRemoveStorage('mtc_buses_data');
    safeRemoveStorage('mtc_announcements_data');
  }, []);

  const value = useMemo(
    () => ({
      buses,
      currentBusStand,
      setCurrentBusStand,
      language,
      setLanguage,
      activeTab,
      setActiveTab,
      selectedBus,
      setSelectedBus,
      announcements,
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
      safetyAnnouncementsEnabled,
      setSafetyAnnouncementsEnabled,
      announceNextBusEnabled,
      setAnnounceNextBusEnabled,
      currentSafetyRule,
      currentSafetyRuleIndex,
      announceNextBus,
      announceSafetyRule,
      cycleNextSafetyRule,
      testArrivalChime,
      testAnnouncementChime,
      testVoiceAnnouncement,
      announceBus,
      lastUpdatedTime,
      addBus,
      removeBus,
      updateBusEta,
      setBusEtaDirect,
      updateBusStatus,
      updateBusDetails,
      addAnnouncement,
      removeAnnouncement,
      toggleAnnouncement,
      resetToDefaultData,
    }),
    [
      buses,
      currentBusStand,
      setCurrentBusStand,
      language,
      setLanguage,
      activeTab,
      setActiveTab,
      selectedBus,
      setSelectedBus,
      announcements,
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
      safetyAnnouncementsEnabled,
      setSafetyAnnouncementsEnabled,
      announceNextBusEnabled,
      setAnnounceNextBusEnabled,
      currentSafetyRule,
      currentSafetyRuleIndex,
      announceNextBus,
      announceSafetyRule,
      cycleNextSafetyRule,
      testArrivalChime,
      testAnnouncementChime,
      testVoiceAnnouncement,
      announceBus,
      lastUpdatedTime,
      addBus,
      removeBus,
      updateBusEta,
      setBusEtaDirect,
      updateBusStatus,
      updateBusDetails,
      addAnnouncement,
      removeAnnouncement,
      toggleAnnouncement,
      resetToDefaultData,
    ],
  );

  return <BusContext.Provider value={value}>{children}</BusContext.Provider>;
};

export const useBus = () => {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error('useBus must be used within a BusProvider');
  }
  return context;
};
