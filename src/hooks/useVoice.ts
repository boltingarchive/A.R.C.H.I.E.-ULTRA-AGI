import { useState, useCallback, useRef, useEffect } from 'react';
import type { ArchieSettings } from '../types';

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useVoice(settings: ArchieSettings, onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = !!SpeechRecognitionClass;

  const restartListening = useCallback(() => {
    if (!recognitionRef.current || !settings.listeningEnabled) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      if ((e as Error).message?.includes('already started')) {
        setIsListening(true);
      }
    }
  }, [settings.listeningEnabled]);

  useEffect(() => {
    if (!supported) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          if (transcript.trim()) {
            onTranscript(transcript.trim());
          }
        } else {
          interim += transcript + ' ';
        }
      }
      setTranscript(interim.trim());
    };

    recognition.onerror = (e: SpeechRecognitionEvent) => {
      if (e.error !== 'no-speech') {
        console.error('Speech recognition error:', e.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (settings.listeningEnabled) {
        restartTimeoutRef.current = setTimeout(() => {
          restartListening();
        }, 300);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    if (settings.listeningEnabled) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        if (!(e as Error).message?.includes('already started')) {
          setIsListening(false);
        }
      }
    }

    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      recognition.abort();
      setIsListening(false);
    };
  }, [settings.listeningEnabled, supported, restartListening]);

  const speak = useCallback((text: string) => {
    if (!settings.voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.5, Math.min(2, settings.voiceSpeed));
    utterance.pitch = Math.max(0.5, Math.min(2, settings.voicePitch));
    utterance.volume = 1;
    utterance.lang = 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [settings.voiceEnabled, settings.voiceSpeed, settings.voicePitch]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { isListening, transcript, isSpeaking, speak, stopSpeaking, supported };
}
