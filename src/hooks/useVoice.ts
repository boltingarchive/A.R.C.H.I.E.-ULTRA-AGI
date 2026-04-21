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

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = !!SpeechRecognitionClass;

  useEffect(() => {
    if (!supported || !settings.listeningEnabled) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const current = e.results[e.results.length - 1];
      const text = current[0].transcript;
      setTranscript(text);
      if (current.isFinal && text.trim()) {
        onTranscript(text.trim());
        setTranscript('');
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      if (settings.listeningEnabled) {
        try { recognition.start(); } catch { /* already started */ }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch { /* ignore */ }

    return () => {
      recognition.abort();
      setIsListening(false);
    };
  }, [settings.listeningEnabled, supported]);

  const speak = useCallback((text: string) => {
    if (!settings.voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.voiceSpeed;
    utterance.pitch = settings.voicePitch;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [settings.voiceEnabled, settings.voiceSpeed, settings.voicePitch]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isListening, transcript, isSpeaking, speak, stopSpeaking, supported };
}
