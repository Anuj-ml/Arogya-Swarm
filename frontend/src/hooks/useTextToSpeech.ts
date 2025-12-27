/**
 * Custom hook for text-to-speech using Web Speech API
 * Supports multiple languages and voice selection
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTextToSpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setVoice: (voice: SpeechSynthesisVoice) => void;
}

export const useTextToSpeech = (
  options: UseTextToSpeechOptions = {}
): UseTextToSpeechReturn => {
  const {
    lang = 'hi-IN',
    rate = 1.0,
    pitch = 1.0,
    volume = 1.0,
    onEnd,
    onError,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const isSupported = 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Try to find a voice matching the language
      const matchingVoice = availableVoices.find(voice => 
        voice.lang.startsWith(lang.split('-')[0])
      );
      
      if (matchingVoice) {
        setSelectedVoice(matchingVoice);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    // Load voices immediately
    loadVoices();

    // Also load when voices change (some browsers need this)
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported, lang]);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      const errorMessage = 'Text-to-speech is not supported in this browser';
      if (onError) onError(errorMessage);
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      const errorMessage = `Text-to-speech error: ${event.error}`;
      setIsSpeaking(false);
      setIsPaused(false);
      if (onError) onError(errorMessage);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, lang, rate, pitch, volume, selectedVoice, onEnd, onError]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    selectedVoice,
    setVoice,
  };
};

export default useTextToSpeech;
