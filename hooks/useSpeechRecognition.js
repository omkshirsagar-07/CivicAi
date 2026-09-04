'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Browser Web Speech API wrapper (SpeechRecognition / webkitSpeechRecognition).
 * Supports English (en-IN), Hindi (hi-IN) and Marathi (mr-IN).
 */

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  const w = window;
  const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
  return SR || null;
}

export function useSpeechRecognition() {
  // Support detection happens in an effect (not during render) so the SSR
  // output always matches the first client render — avoiding hydration
  // mismatches caused by reading `window` while rendering.
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | listening | done | error
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [interimText, setInterimText] = useState('');

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionCtor()));
  }, []);

  const recognitionRef = useRef(null);
  const finalRef = useRef('');
  const interimRef = useRef('');
  const statusRef = useRef('idle');
  const languageRef = useRef('en-IN');

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const setSafeStatus = (s) => {
    statusRef.current = s;
    setStatus(s);
  };

  const stopAndFinalize = useCallback(({ cancelled = false } = {}) => {
    const rec = recognitionRef.current;
    try {
      rec?.stop();
    } catch {
      /* ignore */
    }
    if (cancelled) {
      finalRef.current = '';
      interimRef.current = '';
      setTranscript('');
      setInterimText('');
      setSafeStatus('idle');
      return;
    }
    const text = `${finalRef.current} ${interimRef.current}`.replace(/\s+/g, ' ').trim();
    if (text) {
      setTranscript(text);
      setSafeStatus('done');
    } else {
      setError(error || 'No speech was detected. Please try again.');
      setSafeStatus('error');
    }
  }, [error]);

  const start = useCallback(
    (langCode) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setError('Voice input is not supported in this browser. Please use Chrome or Edge, or type your complaint.');
        setSafeStatus('error');
        return;
      }
      const lang = langCode || languageRef.current || 'en-IN';
      setLanguage(lang);
      languageRef.current = lang;

      // Clean up any previous session.
      try { recognitionRef.current?.abort(); } catch { /* ignore */ }

      const rec = new Ctor();
      recognitionRef.current = rec;
      rec.lang = lang;
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      finalRef.current = '';
      interimRef.current = '';
      setTranscript('');
      setInterimText('');
      setError('');
      setSafeStatus('listening');

      rec.onstart = () => setSafeStatus('listening');

      rec.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const res = event.results[i];
          const textChunk = res && res[0] && typeof res[0].transcript === 'string' ? res[0].transcript : '';
          if (res.isFinal) finalRef.current += ` ${textChunk}`;
          else interim += textChunk;
        }
        interimRef.current = interim;
        const display = `${finalRef.current} ${interim}`.replace(/\s+/g, ' ').trim();
        if (display) setTranscript(display);
        setInterimText(interim);
      };

      rec.onerror = (event) => {
        const err = event && event.error ? event.error : 'unknown';
        let message = 'Speech recognition failed. Please try again.';
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          message = 'Microphone access was denied. Please allow microphone access and try again.';
        } else if (err === 'no-speech') {
          message = 'No speech was detected. Please try again.';
        } else if (err === 'audio-capture') {
          message = 'No microphone was found on this device.';
        } else if (err === 'network') {
          message = 'Speech service is offline. Please check your connection.';
        }
        setError(message);
        setSafeStatus('error');
      };

      rec.onend = () => {
        // The engine ended by itself (silence / sentence end) → finalize.
        const text = `${finalRef.current} ${interimRef.current}`.replace(/\s+/g, ' ').trim();
        if (text) {
          setTranscript(text);
          setSafeStatus('done');
        } else if (statusRef.current === 'listening') {
          setError('Speech recognition ended without input. Please try again.');
          setSafeStatus('error');
        }
      };

      try {
        rec.start();
      } catch {
        setError('Could not start the microphone. Please try again.');
        setSafeStatus('error');
      }
    },
    []
  );

  const stop = useCallback(() => stopAndFinalize({ cancelled: false }), [stopAndFinalize]);

  const reset = useCallback(() => {
    try { recognitionRef.current?.abort(); } catch { /* ignore */ }
    finalRef.current = '';
    interimRef.current = '';
    setTranscript('');
    setInterimText('');
    setError('');
    setSafeStatus('idle');
  }, []);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.abort(); } catch { /* ignore */ }
    };
  }, []);

  return { supported, status, transcript, interimText, error, language, setLanguage, start, stop, reset };
}
