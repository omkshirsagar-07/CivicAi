'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Languages, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { SPEECH_LANGUAGES, cn } from '@/utils/client';

/**
 * Voice complaint recorder. Uses the browser Web Speech API for
 * en-IN / hi-IN / mr-IN and hands the editable transcript to the parent.
 */
export default function VoiceRecorder({ onDone }) {
  const { supported, status, transcript, interimText, error, language, start, stop, reset } =
    useSpeechRecognition();
  const [showLang, setShowLang] = useState(false);
  const [mounted, setMounted] = useState(false);
  const langRef = useRef('en-IN');

  // Capability detection only runs after hydration, so SSR HTML and the first
  // client render always agree (no hydration mismatch). Reveal the real UI a
  // tick later.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    langRef.current = language;
  }, [language]);

  const listening = status === 'listening';

  const handleStop = () => {
    stop();
  };

  // Deliver the transcript to the complaint textarea when a session completes.
  useEffect(() => {
    if (status === 'done' && transcript.trim()) {
      onDone?.(transcript.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Stable placeholder rendered identically on the server and first client
  // paint; swapped for the real panel once support is known.
  if (!mounted) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5">
        <Mic size={15} className="text-slate-400" aria-hidden />
        <p className="text-[13px] text-slate-400">Preparing voice input…</p>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-600">
        <span className="font-semibold">Voice input is not supported in this browser.</span>{' '}
        Use Chrome or Microsoft Edge to speak your complaint, or simply type it below.
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-colors',
        listening ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 bg-slate-50/60'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-slate-600">
          <Mic size={15} className="text-civic-blue" aria-hidden />
          Speak your complaint
        </p>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLang((v) => !v)}
              aria-expanded={showLang}
              aria-haspopup="listbox"
              className="btn btn-outline px-3 py-2 text-[12.5px]"
            >
              <Languages size={14} aria-hidden />
              {SPEECH_LANGUAGES.find((l) => l.code === language)?.label || 'Language'}
            </button>
            {showLang && (
              <div role="listbox" aria-label="Speech language" className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-soft">
                {SPEECH_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    role="option"
                    aria-selected={language === l.code}
                    onClick={() => {
                      setShowLang(false);
                      reset();
                      start(l.code);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px]',
                      language === l.code ? 'bg-blue-50 font-semibold text-navy-900' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <span>
                      {l.flag} {l.label}
                    </span>
                    {language === l.code && <CheckCircle2 size={14} className="text-civic-blue" aria-hidden />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => (listening ? handleStop() : start(langRef.current))}
            aria-label={listening ? 'Stop recording' : 'Start recording'}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full text-white shadow-card transition-all',
              listening ? 'bg-red-500 hover:bg-red-600' : 'bg-navy-900 hover:bg-navy-800'
            )}
          >
            {listening ? <Square size={16} fill="currentColor" aria-hidden /> : <Mic size={18} aria-hidden />}
          </button>
        </div>
      </div>

      {/* statuses */}
      <div className="mt-3" aria-live="polite">
        {listening && (
          <div className="flex items-center gap-2 text-[13px] text-blue-700">
            <span className="flex items-end gap-[3px]" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="w-[3px] animate-pulse-soft rounded-full bg-blue-600"
                  style={{ height: `${[10, 16, 12, 8][i]}px`, animationDelay: `${i * 140}ms` }}
                />
              ))}
            </span>
            Listening… speak now ({SPEECH_LANGUAGES.find((l) => l.code === language)?.note})
          </div>
        )}
        {status === 'done' && transcript && (
          <p className="flex items-center gap-2 text-[13px] font-medium text-emerald-700">
            <CheckCircle2 size={14} aria-hidden /> Transcript ready — review and edit it below.
          </p>
        )}
        {error && (
          <p className="flex items-start gap-2 text-[13px] text-red-600">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}
      </div>

      {/* live preview */}
      {(interimText || transcript) && status === 'listening' && (
        <p className="mt-3 rounded-xl border border-blue-100 bg-white px-3.5 py-2.5 text-[14px] italic leading-relaxed text-slate-700">
          {transcript}
          {interimText && <span className="text-slate-400">…</span>}
        </p>
      )}
    </div>
  );
}
