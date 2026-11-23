// Web Audio API & Speech Synthesis Transit Chime & Announcement Engine
// Provides authentic Chennai MTC / Transit terminal PA bell chimes and bilingual announcements
// Designed for zero-error browser playback with strict user-gesture & sequence cancellation guards.

import { SafetyRule } from '../data/safetyRules';
import { BusCategory } from '../types';

type PlayingStateListener = (isPlaying: boolean) => void;

export interface AudioSystemStatus {
  hasTamilVoice: boolean;
  tamilVoiceName: string | null;
  englishVoiceName: string | null;
}

class TransitAudioChime {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public soundEnabled: boolean = true;
  public voiceEnabled: boolean = true;
  public volume: number = 0.8; // 0.0 to 1.0

  private hasUserGesture: boolean = false;
  private isUnlocked: boolean = false;
  private chimePlaying: boolean = false;
  private speechPlaying: boolean = false;
  private chimeTimer: ReturnType<typeof setTimeout> | null = null;
  private announcementSeq: number = 0;
  private pendingTimers: Set<ReturnType<typeof setTimeout>> = new Set();
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();
  private activeResolvers: Set<() => void> = new Set();
  private listeners: Set<PlayingStateListener> = new Set();
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const handleFirstGesture = () => {
        this.hasUserGesture = true;
        this.unlockContext();
        this.refreshVoices();
        window.removeEventListener('pointerdown', handleFirstGesture, true);
        window.removeEventListener('keydown', handleFirstGesture, true);
        window.removeEventListener('touchstart', handleFirstGesture, true);
        window.removeEventListener('click', handleFirstGesture, true);
      };

      window.addEventListener('pointerdown', handleFirstGesture, { capture: true, passive: true });
      window.addEventListener('keydown', handleFirstGesture, { capture: true, passive: true });
      window.addEventListener('touchstart', handleFirstGesture, { capture: true, passive: true });
      window.addEventListener('click', handleFirstGesture, { capture: true, passive: true });

      if ('speechSynthesis' in window) {
        this.refreshVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          this.refreshVoices();
        };
      }
    }
  }

  private refreshVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const fresh = window.speechSynthesis.getVoices();
      if (fresh && fresh.length > 0) {
        this.cachedVoices = fresh;
      }
    } catch {
      // Ignore browser voice enumeration errors
    }
  }

  public subscribe(listener: PlayingStateListener): () => void {
    this.listeners.add(listener);
    listener(this.chimePlaying || this.speechPlaying);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitPlayingState() {
    const active = this.chimePlaying || this.speechPlaying;
    this.listeners.forEach((fn) => {
      try {
        fn(active);
      } catch {
        // Ignore subscriber error
      }
    });
  }

  public setVolume(val: number) {
    const safe = Number.isFinite(val) ? val : 0.8;
    this.volume = Math.max(0, Math.min(1, safe));
    if (this.masterGain && this.audioCtx) {
      try {
        this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      } catch {
        // Ignore gain update errors
      }
    }
  }

  /**
   * Unlocks Web Audio API safely ONLY after a user gesture so browsers never emit autoplay errors.
   */
  private async unlockContext(fromUserAction: boolean = false): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;

    if (fromUserAction) {
      this.hasUserGesture = true;
    }

    // Never create or resume AudioContext before a user gesture
    if (!this.hasUserGesture) {
      return null;
    }

    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return null;

        this.audioCtx = new AudioContextClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      if (this.audioCtx.state !== 'running') {
        return null;
      }

      if (!this.isUnlocked) {
        const buffer = this.audioCtx.createBuffer(1, 1, 22050);
        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioCtx.destination);
        source.start(0);
        this.isUnlocked = true;
      }

      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Cancels all active chimes, pending delays, and ongoing speech synthesis cleanly.
   */
  public stopAll() {
    this.announcementSeq++;

    if (this.chimeTimer) {
      clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }

    this.pendingTimers.forEach((t) => clearTimeout(t));
    this.pendingTimers.clear();

    this.activeResolvers.forEach((resolve) => {
      try {
        resolve();
      } catch {
        // Ignore
      }
    });
    this.activeResolvers.clear();
    this.activeUtterances.clear();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // Ignore speech cancel errors
      }
    }

    this.chimePlaying = false;
    this.speechPlaying = false;
    this.emitPlayingState();
  }

  private wait(ms: number, seq: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (seq !== this.announcementSeq) {
        resolve(false);
        return;
      }

      const timer = setTimeout(() => {
        this.pendingTimers.delete(timer);
        this.activeResolvers.delete(finish);
        resolve(seq === this.announcementSeq);
      }, ms);

      const finish = () => {
        clearTimeout(timer);
        this.pendingTimers.delete(timer);
        this.activeResolvers.delete(finish);
        resolve(false);
      };

      this.pendingTimers.add(timer);
      this.activeResolvers.add(finish);
    });
  }

  /**
   * Generates an acoustic bell chime harmonic with exponential decay
   */
  private playBellNote(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    gainLevel: number,
  ) {
    if (!this.masterGain || ctx.state !== 'running') return;

    try {
      const safeStart = Math.max(ctx.currentTime + 0.005, startTime);
      const decayEnd = safeStart + duration;

      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(frequency, safeStart);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency * 2.002, safeStart);

      const noteGain1 = ctx.createGain();
      noteGain1.gain.setValueAtTime(0.0001, safeStart);
      noteGain1.gain.exponentialRampToValueAtTime(Math.max(0.001, gainLevel), safeStart + 0.02);
      noteGain1.gain.exponentialRampToValueAtTime(0.0001, decayEnd);

      const noteGain2 = ctx.createGain();
      noteGain2.gain.setValueAtTime(0.0001, safeStart);
      noteGain2.gain.exponentialRampToValueAtTime(Math.max(0.001, gainLevel * 0.28), safeStart + 0.015);
      noteGain2.gain.exponentialRampToValueAtTime(0.0001, safeStart + duration * 0.6);

      osc1.connect(noteGain1);
      noteGain1.connect(this.masterGain);

      osc2.connect(noteGain2);
      noteGain2.connect(this.masterGain);

      osc1.start(safeStart);
      osc2.start(safeStart);

      osc1.stop(decayEnd + 0.05);
      osc2.stop(decayEnd + 0.05);
    } catch {
      // Ignore oscillator scheduling errors
    }
  }

  /**
   * 4-Tone Melodic Transit Arrival Chime (C5 -> E5 -> G5 -> C6)
   */
  public async playArrivalChime(force: boolean = false): Promise<void> {
    if (!force && !this.soundEnabled) return;

    try {
      const ctx = await this.unlockContext(force);
      if (!ctx) return;

      if (this.chimeTimer) {
        clearTimeout(this.chimeTimer);
        this.chimeTimer = null;
      }

      this.chimePlaying = true;
      this.emitPlayingState();

      const baseTime = ctx.currentTime + 0.03;
      this.playBellNote(ctx, 523.25, baseTime, 0.45, 0.4);
      this.playBellNote(ctx, 659.25, baseTime + 0.22, 0.45, 0.42);
      this.playBellNote(ctx, 783.99, baseTime + 0.44, 0.55, 0.44);
      this.playBellNote(ctx, 1046.5, baseTime + 0.68, 0.95, 0.46);

      this.chimeTimer = setTimeout(() => {
        this.chimePlaying = false;
        this.chimeTimer = null;
        this.emitPlayingState();
      }, 1600);
    } catch {
      this.chimePlaying = false;
      this.emitPlayingState();
    }
  }

  /**
   * 2-Tone Melodic Announcement / Alert Chime (E5 -> A5)
   */
  public async playAnnouncementChime(force: boolean = false): Promise<void> {
    if (!force && !this.soundEnabled) return;

    try {
      const ctx = await this.unlockContext(force);
      if (!ctx) return;

      if (this.chimeTimer) {
        clearTimeout(this.chimeTimer);
        this.chimeTimer = null;
      }

      this.chimePlaying = true;
      this.emitPlayingState();

      const baseTime = ctx.currentTime + 0.03;
      this.playBellNote(ctx, 659.25, baseTime, 0.4, 0.38);
      this.playBellNote(ctx, 880.0, baseTime + 0.2, 0.75, 0.42);

      this.chimeTimer = setTimeout(() => {
        this.chimePlaying = false;
        this.chimeTimer = null;
        this.emitPlayingState();
      }, 1000);
    } catch {
      this.chimePlaying = false;
      this.emitPlayingState();
    }
  }

  /**
   * Formats a bus number for clear speech synthesis articulation
   */
  public formatBusNoForSpeech(busNo: string): string {
    if (!busNo) return '';
    return busNo.replace(/([0-9]+)([a-zA-Z]+)/g, '$1 $2').replace(/([a-zA-Z]+)([0-9]+)/g, '$1 $2');
  }

  /**
   * Returns spoken service-type prefixes for Deluxe, AC, Express, and Special buses
   */
  private getCategorySpeechLabels(category?: BusCategory): {
    ta: string;
    phoneticTa: string;
    en: string;
  } {
    switch (category) {
      case 'Deluxe':
        return {
          ta: 'டீலக்ஸ் ',
          phoneticTa: 'Deluxe ',
          en: 'Deluxe ',
        };
      case 'AC':
        return {
          ta: 'குளிரூட்டப்பட்ட ஏசி ',
          phoneticTa: 'AC ',
          en: 'Air Conditioned AC ',
        };
      case 'Express':
        return {
          ta: 'விரைவு ',
          phoneticTa: 'Express ',
          en: 'Express ',
        };
      case 'Special':
        return {
          ta: 'சிறப்பு ',
          phoneticTa: 'Special ',
          en: 'Special ',
        };
      case 'Ordinary':
      default:
        return {
          ta: 'சாதாரண ',
          phoneticTa: 'Ordinary ',
          en: 'Ordinary ',
        };
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    try {
      const fresh = window.speechSynthesis.getVoices();
      if (fresh && fresh.length > 0) {
        this.cachedVoices = fresh;
        return fresh;
      }
    } catch {
      // Ignore
    }
    return this.cachedVoices;
  }

  public getTamilVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    return (
      voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('ta') ||
          v.name.toLowerCase().includes('tamil') ||
          v.name.toLowerCase().includes('valluvar'),
      ) || null
    );
  }

  public getEnglishVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    return (
      voices.find(
        (v) =>
          v.lang.toLowerCase() === 'en-in' ||
          v.lang.toLowerCase().replace('_', '-') === 'en-in',
      ) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
      null
    );
  }

  public getVoiceStatus(): AudioSystemStatus {
    const ta = this.getTamilVoice();
    const en = this.getEnglishVoice();
    return {
      hasTamilVoice: !!ta,
      tamilVoiceName: ta ? ta.name : null,
      englishVoiceName: en ? en.name : null,
    };
  }

  /**
   * Speaks a single utterance via Web Speech API safely without console errors or GC cutoffs
   */
  public speakUtterance(
    text: string,
    lang: 'en' | 'ta',
    seq?: number,
    force: boolean = false,
  ): Promise<void> {
    return new Promise((resolve) => {
      if (seq !== undefined && seq !== this.announcementSeq) {
        resolve();
        return;
      }

      if (!force && (!this.soundEnabled || !this.voiceEnabled)) {
        resolve();
        return;
      }

      if (force && !this.voiceEnabled) {
        // Respect explicit Voice OFF setting unless it's the direct Test Sound button
        resolve();
        return;
      }

      if (!this.hasUserGesture && !force) {
        // Avoid browser 'not-allowed' speech error before first user interaction
        resolve();
        return;
      }

      if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
        resolve();
        return;
      }

      let finished = false;
      let safetyTimeout: ReturnType<typeof setTimeout> | null = null;
      let resumeKeepAlive: ReturnType<typeof setInterval> | null = null;

      const complete = () => {
        if (finished) return;
        finished = true;
        if (safetyTimeout) clearTimeout(safetyTimeout);
        if (resumeKeepAlive) clearInterval(resumeKeepAlive);
        this.activeResolvers.delete(complete);
        this.activeUtterances.delete(utterance);
        this.speechPlaying = false;
        this.emitPlayingState();
        resolve();
      };

      const utterance = new SpeechSynthesisUtterance(text);
      try {
        utterance.volume = this.volume;
        utterance.rate = 0.92;
        utterance.pitch = 1.0;

        if (lang === 'ta') {
          const tamilVoice = this.getTamilVoice();
          if (tamilVoice) {
            utterance.voice = tamilVoice;
            utterance.lang = tamilVoice.lang;
          } else {
            const enInVoice = this.getEnglishVoice();
            if (enInVoice) {
              utterance.voice = enInVoice;
              utterance.lang = enInVoice.lang;
            } else {
              utterance.lang = 'en-IN';
            }
          }
        } else {
          const enVoice = this.getEnglishVoice();
          if (enVoice) {
            utterance.voice = enVoice;
            utterance.lang = enVoice.lang;
          } else {
            utterance.lang = 'en-US';
          }
        }

        // Keep strong reference to avoid Chromium mid-speech garbage collection
        this.activeUtterances.add(utterance);
        this.activeResolvers.add(complete);

        utterance.onend = complete;
        utterance.onerror = complete;

        const maxDurationMs = Math.min(30000, Math.max(12000, text.length * 160));
        safetyTimeout = setTimeout(complete, maxDurationMs);

        // Workaround for Chromium pausing long utterances after ~14 seconds
        resumeKeepAlive = setInterval(() => {
          try {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          } catch {
            // Ignore
          }
        }, 4000);

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        this.speechPlaying = true;
        this.emitPlayingState();
        window.speechSynthesis.speak(utterance);
      } catch {
        complete();
      }
    });
  }

  private async prepareNewAnnouncement(force: boolean): Promise<number | null> {
    if (force) {
      this.hasUserGesture = true;
    } else if (!this.soundEnabled || !this.hasUserGesture) {
      return null;
    }

    const hadActiveSpeech =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      (window.speechSynthesis.speaking || window.speechSynthesis.pending);

    this.stopAll();
    const seq = this.announcementSeq;

    // Brief yield after speechSynthesis.cancel() so Chromium doesn't raise 'interrupted' on the next speak()
    if (hadActiveSpeech) {
      const ok = await this.wait(60, seq);
      if (!ok) return null;
    }

    return seq;
  }

  private canContinue(seq: number, force: boolean): boolean {
    if (seq !== this.announcementSeq) return false;
    if (!this.voiceEnabled) return false;
    if (!force && !this.soundEnabled) return false;
    return true;
  }

  public async speakTamilArrival(
    busNo: string,
    destinationTa: string,
    destinationEn: string,
    platform: string,
    category?: BusCategory,
    seq?: number,
    force: boolean = false,
  ): Promise<void> {
    const formattedBus = this.formatBusNoForSpeech(busNo);
    const hasTaVoice = !!this.getTamilVoice();
    const cat = this.getCategorySpeechLabels(category);

    if (hasTaVoice) {
      const cleanBay = platform.replace(/Bay\s*/i, '').replace(/Platform\s*/i, '');
      const text = `பயணிகள் கவனத்திற்கு. தடம் எண் ${formattedBus}, ${destinationTa} நோக்கிச் செல்லும் ${cat.ta}பேருந்து, நடைமேடை ${cleanBay}-இல் வந்து கொண்டிருக்கிறது.`;
      await this.speakUtterance(text, 'ta', seq, force);
    } else {
      const cleanBay = platform.replace(/Bay\s*/i, 'Bay ').replace(/Platform\s*/i, 'Platform ');
      const text = `Payanigal kavanathirku: Thadam en ${formattedBus}, ${destinationEn} nokki sellum ${cat.phoneticTa}perundhu, ${cleanBay}il vandhu kondu irukkiradhu.`;
      await this.speakUtterance(text, 'ta', seq, force);
    }
  }

  public async speakEnglishArrival(
    busNo: string,
    destinationEn: string,
    platform: string,
    category?: BusCategory,
    seq?: number,
    force: boolean = false,
  ): Promise<void> {
    const formattedBus = this.formatBusNoForSpeech(busNo);
    const cleanBay = platform.startsWith('Bay') || platform.startsWith('Platform') ? platform : `Platform ${platform}`;
    const cat = this.getCategorySpeechLabels(category);
    const text = `Attention passengers. Bus number ${formattedBus}, ${cat.en}bus bound for ${destinationEn}, is arriving at ${cleanBay}.`;
    await this.speakUtterance(text, 'en', seq, force);
  }

  public async announceArrival(
    busNo: string,
    destinationEn: string,
    destinationTa: string,
    platform: string,
    language: 'en' | 'ta' | 'dual' = 'dual',
    category?: BusCategory,
    force: boolean = false,
  ): Promise<void> {
    const seq = await this.prepareNewAnnouncement(force);
    if (seq === null) return;

    await this.playArrivalChime(force);
    if (!this.canContinue(seq, force)) return;

    if (!(await this.wait(1100, seq))) return;
    if (!this.canContinue(seq, force)) return;

    if (language === 'ta') {
      await this.speakTamilArrival(busNo, destinationTa, destinationEn, platform, category, seq, force);
    } else if (language === 'en') {
      await this.speakEnglishArrival(busNo, destinationEn, platform, category, seq, force);
    } else {
      await this.speakTamilArrival(busNo, destinationTa, destinationEn, platform, category, seq, force);
      if (!(await this.wait(450, seq))) return;
      if (!this.canContinue(seq, force)) return;
      await this.speakEnglishArrival(busNo, destinationEn, platform, category, seq, force);
    }
  }

  public isBusy(): boolean {
    if (this.chimePlaying || this.speechPlaying) return true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        return window.speechSynthesis.speaking || window.speechSynthesis.pending;
      } catch {
        return false;
      }
    }
    return false;
  }

  public async speakTamilNextBus(
    busNo: string,
    destinationTa: string,
    destinationEn: string,
    platform: string,
    etaMinutes: number,
    category?: BusCategory,
    seq?: number,
    force: boolean = false,
  ): Promise<void> {
    const formattedBus = this.formatBusNoForSpeech(busNo);
    const hasTaVoice = !!this.getTamilVoice();
    const cleanBay = platform.replace(/Bay\s*/i, '').replace(/Platform\s*/i, '');
    const timeText = etaMinutes <= 1 ? 'விரைவில்' : `இன்னும் ${etaMinutes} நிமிடங்களில்`;
    const cat = this.getCategorySpeechLabels(category);

    if (hasTaVoice) {
      const text = `அடுத்ததாக வருகை தரும் பேருந்து: தடம் எண் ${formattedBus}, ${destinationTa} நோக்கிச் செல்லும் ${cat.ta}பேருந்து, ${timeText} நடைமேடை ${cleanBay}-இல் வரும்.`;
      await this.speakUtterance(text, 'ta', seq, force);
    } else {
      const timeTextPhonetic = etaMinutes <= 1 ? 'viraivil' : `innum ${etaMinutes} nimidangalil`;
      const text = `Adutha perundhu: Thadam en ${formattedBus}, ${destinationEn} nokki sellum ${cat.phoneticTa}perundhu, ${timeTextPhonetic} Bay ${cleanBay}il varum.`;
      await this.speakUtterance(text, 'ta', seq, force);
    }
  }

  public async speakEnglishNextBus(
    busNo: string,
    destinationEn: string,
    platform: string,
    etaMinutes: number,
    category?: BusCategory,
    seq?: number,
    force: boolean = false,
  ): Promise<void> {
    const formattedBus = this.formatBusNoForSpeech(busNo);
    const cleanBay = platform.startsWith('Bay') || platform.startsWith('Platform') ? platform : `Platform ${platform}`;
    const timeText = etaMinutes <= 1 ? 'shortly' : `in ${etaMinutes} minutes`;
    const cat = this.getCategorySpeechLabels(category);
    const text = `Next bus on display: Bus number ${formattedBus}, ${cat.en}bus bound for ${destinationEn}, arriving ${timeText} at ${cleanBay}.`;
    await this.speakUtterance(text, 'en', seq, force);
  }

  public async announceNextBus(
    busNo: string,
    destinationEn: string,
    destinationTa: string,
    platform: string,
    etaMinutes: number,
    language: 'en' | 'ta' | 'dual' = 'dual',
    category?: BusCategory,
    force: boolean = false,
  ): Promise<void> {
    const seq = await this.prepareNewAnnouncement(force);
    if (seq === null) return;

    await this.playAnnouncementChime(force);
    if (!this.canContinue(seq, force)) return;

    if (!(await this.wait(800, seq))) return;
    if (!this.canContinue(seq, force)) return;

    if (language === 'ta') {
      await this.speakTamilNextBus(busNo, destinationTa, destinationEn, platform, etaMinutes, category, seq, force);
    } else if (language === 'en') {
      await this.speakEnglishNextBus(busNo, destinationEn, platform, etaMinutes, category, seq, force);
    } else {
      await this.speakTamilNextBus(busNo, destinationTa, destinationEn, platform, etaMinutes, category, seq, force);
      if (!(await this.wait(450, seq))) return;
      if (!this.canContinue(seq, force)) return;
      await this.speakEnglishNextBus(busNo, destinationEn, platform, etaMinutes, category, seq, force);
    }
  }

  public async announceArrivalWithNext(
    currentBus: {
      busNo: string;
      destinationEn: string;
      destinationTa: string;
      platform: string;
      category?: BusCategory;
    },
    nextBus?: {
      busNo: string;
      destinationEn: string;
      destinationTa: string;
      platform: string;
      etaMinutes: number;
      category?: BusCategory;
    },
    language: 'en' | 'ta' | 'dual' = 'dual',
    force: boolean = false,
  ): Promise<void> {
    const seq = await this.prepareNewAnnouncement(force);
    if (seq === null) return;

    await this.playArrivalChime(force);
    if (!this.canContinue(seq, force)) return;

    if (!(await this.wait(1100, seq))) return;
    if (!this.canContinue(seq, force)) return;

    if (language === 'ta') {
      await this.speakTamilArrival(currentBus.busNo, currentBus.destinationTa, currentBus.destinationEn, currentBus.platform, currentBus.category, seq, force);
      if (nextBus) {
        if (!(await this.wait(550, seq))) return;
        if (!this.canContinue(seq, force)) return;
        await this.speakTamilNextBus(nextBus.busNo, nextBus.destinationTa, nextBus.destinationEn, nextBus.platform, nextBus.etaMinutes, nextBus.category, seq, force);
      }
    } else if (language === 'en') {
      await this.speakEnglishArrival(currentBus.busNo, currentBus.destinationEn, currentBus.platform, currentBus.category, seq, force);
      if (nextBus) {
        if (!(await this.wait(550, seq))) return;
        if (!this.canContinue(seq, force)) return;
        await this.speakEnglishNextBus(nextBus.busNo, nextBus.destinationEn, nextBus.platform, nextBus.etaMinutes, nextBus.category, seq, force);
      }
    } else {
      await this.speakTamilArrival(currentBus.busNo, currentBus.destinationTa, currentBus.destinationEn, currentBus.platform, currentBus.category, seq, force);
      if (!(await this.wait(450, seq))) return;
      if (!this.canContinue(seq, force)) return;
      await this.speakEnglishArrival(currentBus.busNo, currentBus.destinationEn, currentBus.platform, currentBus.category, seq, force);

      if (nextBus) {
        if (!(await this.wait(650, seq))) return;
        if (!this.canContinue(seq, force)) return;
        await this.speakTamilNextBus(nextBus.busNo, nextBus.destinationTa, nextBus.destinationEn, nextBus.platform, nextBus.etaMinutes, nextBus.category, seq, force);
        if (!(await this.wait(450, seq))) return;
        if (!this.canContinue(seq, force)) return;
        await this.speakEnglishNextBus(nextBus.busNo, nextBus.destinationEn, nextBus.platform, nextBus.etaMinutes, nextBus.category, seq, force);
      }
    }
  }

  public async speakTamilSafetyRule(rule: SafetyRule, seq?: number, force: boolean = false): Promise<void> {
    const hasTaVoice = !!this.getTamilVoice();
    if (hasTaVoice) {
      await this.speakUtterance(rule.speechTextTa, 'ta', seq, force);
    } else {
      await this.speakUtterance(rule.phoneticTa, 'ta', seq, force);
    }
  }

  public async speakEnglishSafetyRule(rule: SafetyRule, seq?: number, force: boolean = false): Promise<void> {
    await this.speakUtterance(rule.speechTextEn, 'en', seq, force);
  }

  public async announceSafetyRule(
    rule: SafetyRule,
    language: 'en' | 'ta' | 'dual' = 'dual',
    force: boolean = false,
  ): Promise<void> {
    const seq = await this.prepareNewAnnouncement(force);
    if (seq === null) return;

    await this.playAnnouncementChime(force);
    if (!this.canContinue(seq, force)) return;

    if (!(await this.wait(850, seq))) return;
    if (!this.canContinue(seq, force)) return;

    if (language === 'ta') {
      await this.speakTamilSafetyRule(rule, seq, force);
    } else if (language === 'en') {
      await this.speakEnglishSafetyRule(rule, seq, force);
    } else {
      await this.speakTamilSafetyRule(rule, seq, force);
      if (!(await this.wait(450, seq))) return;
      if (!this.canContinue(seq, force)) return;
      await this.speakEnglishSafetyRule(rule, seq, force);
    }
  }

  /**
   * Complete test routine to verify audio chime and speech synthesis according to declared language
   */
  public async testSound(language: 'en' | 'ta' | 'dual' = 'dual') {
    const seq = await this.prepareNewAnnouncement(true);
    if (seq === null) return;

    await this.playArrivalChime(true);
    if (!this.voiceEnabled || seq !== this.announcementSeq) return;

    if (!(await this.wait(1100, seq))) return;
    if (!this.voiceEnabled || seq !== this.announcementSeq) return;

    if (language === 'ta') {
      const hasTa = !!this.getTamilVoice();
      const msg = hasTa
        ? 'மாநகர போக்குவரத்துக் கழகம் சென்னை. தடம் எண் 21 G, பிராட்வே டீலக்ஸ் பேருந்து வருகை அறிவிப்பு சோதனை சரிபார்க்கப்பட்டது.'
        : 'MTC Chennai. Thadam en 21 G, Broadway Deluxe perundhu varugai arivippu sodhanai sariparkkappattadhu.';
      await this.speakUtterance(msg, 'ta', seq, true);
    } else if (language === 'en') {
      const msg = 'Attention passengers. Metropolitan Transport Corporation Chennai. Bus arrival announcement test verified.';
      await this.speakUtterance(msg, 'en', seq, true);
    } else {
      const hasTa = !!this.getTamilVoice();
      const msgTa = hasTa
        ? 'மாநகர போக்குவரத்துக் கழகம் சென்னை. பேருந்து வருகை ஒலி அறிவிப்பு சோதனை.'
        : 'MTC Chennai. Perundhu varugai arivippu sodhanai.';
      await this.speakUtterance(msgTa, 'ta', seq, true);
      if (!(await this.wait(450, seq))) return;
      if (!this.voiceEnabled || seq !== this.announcementSeq) return;
      const msgEn = 'MTC Chennai. Bus arrival public address announcement test verified.';
      await this.speakUtterance(msgEn, 'en', seq, true);
    }
  }
}

export const transitChime = new TransitAudioChime();
