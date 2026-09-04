'use client';

import { useEffect, useRef, useState } from 'react';

let KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

let loaders = {
  status: 'idle',
  promise: null,
};

function loadMapsApi() {
  if (typeof window === 'undefined' || !KEY) {
    return Promise.resolve('no-key');
  }
  if (window.google?.maps?.Map) return Promise.resolve('ready');
  if (loaders.status === 'loading' && loaders.promise) return loaders.promise;

  loaders.status = 'loading';
  loaders.promise = new Promise((resolve) => {
    let cbName = `__civicaiGmaps${Date.now()}`;
    let settled = false;
    let finish = (status) => {
      if (settled) return;
      settled = true;
      loaders.status = status === 'ready' ? 'ready' : 'error';
      delete window[cbName];
      resolve(status);
    };
    const existing = document.querySelector('script[data-civicai-gmaps]');
    const script = existing || document.createElement('script');
    script.dataset.civicaiGmaps = '1';
    if (!existing) {
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        KEY
      )}&libraries=places&callback=${cbName}`;
    }
    window[cbName] = () => finish('ready');
    script.addEventListener('load', () => {
      finish(window.google?.maps?.Map ? 'ready' : 'error');
    }, { once: true });
    script.addEventListener('error', () => finish('error'), { once: true });
    if (!existing) document.head.appendChild(script);
    else if (window.google?.maps?.Map) finish('ready');
    window.setTimeout(() => finish('error'), 15000);
  });
  return loaders.promise;
}

/**
 * Lazy-loads the Google Maps JavaScript API exactly once per session.
 * @returns {{ status: 'loading'|'ready'|'error'|'no-key', KEY }}
 */
export default function useGoogleMaps() {
  const [status, setStatus] = useState(KEY ? 'loading' : 'no-key');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return undefined;
    started.current = true;
    let mounted = true;
    if (!KEY) {
      setStatus('no-key');
      return undefined;
    }
    loadMapsApi().then((s) => {
      if (mounted) setStatus(s === 'ready' ? 'ready' : 'error');
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { status, hasKey: Boolean(KEY) };
}

export { KEY as GMAPS_KEY };
