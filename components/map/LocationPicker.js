'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  Crosshair,
  Loader2,
  LocateFixed,
  MapPin,
  MapPinOff,
  Navigation,
  RotateCcw,
  Search,
} from 'lucide-react';
import { cn, displayCoordinates } from '@/utils/client';
import { DEFAULT_MAP_CENTER } from './map-config';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      <Loader2 size={18} className="mr-2 animate-spin" aria-hidden />
      Loading map…
    </div>
  ),
});

function isValidLocation(lat, lng) {
  let safeLat = Number(lat);
  let safeLng = Number(lng);
  return Number.isFinite(safeLat) && Number.isFinite(safeLng) && safeLat >= -90 && safeLat <= 90 && safeLng >= -180 && safeLng <= 180;
}

function roundCoord(value) {
  let safeValue = Number(value);
  if (!Number.isFinite(safeValue)) return safeValue;
  return Math.round(safeValue * 1e6) / 1e6;
}

function locErrorMessage(code) {
  switch (code) {
    case 1:
      return 'Location access was denied. Select your location manually instead.';
    case 2:
      return 'Location is unavailable right now. Please try again or select manually.';
    case 3:
      return 'Location request timed out. Please try again or select manually.';
    default:
      return 'Could not detect your location. Please select it manually.';
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject({ code: 99, message: 'Geolocation is not supported by this browser.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 20000,
    });
  });
}

async function reverseGeocode(lat, lng) {
  let url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('zoom', '18');
  url.searchParams.set('addressdetails', '1');

  try {
    let response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) return null;
    let payload = await response.json();
    if (!payload || typeof payload !== 'object') return null;
    let address = payload.display_name || payload.address?.formatted || 'Address unavailable';
    let city = payload.address?.city || payload.address?.town || payload.address?.village || payload.address?.municipality || payload.address?.county || '';
    return {
      address: address || 'Address unavailable',
      city: city || '',
    };
  } catch {
    return null;
  }
}

async function searchLocations(query) {
  let trimmed = query.trim();
  if (!trimmed) return [];

  let url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', trimmed);
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');

  try {
    let response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) return [];
    let payload = await response.json();
    if (!Array.isArray(payload)) return [];
    return payload.filter((item) => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lon)));
  } catch {
    return [];
  }
}

export default function LocationPicker({ value, onChange, onConfirm, confirmLabel = 'Confirm location' }) {
  let [detecting, setDetecting] = useState(false);
  let [geoError, setGeoError] = useState('');
  let [searchInput, setSearchInput] = useState('');
  let [searchBusy, setSearchBusy] = useState(false);
  let [addressInput, setAddressInput] = useState(value?.address || '');
  let [cityInput, setCityInput] = useState(value?.city || '');
  let [latInput, setLatInput] = useState(value && Number.isFinite(value.latitude) ? String(value.latitude) : '');
  let [lngInput, setLngInput] = useState(value && Number.isFinite(value.longitude) ? String(value.longitude) : '');
  let addressDirtyRef = useRef(false);
  let mapReadyRef = useRef(false);

  let hasCoords = Boolean(value && isValidLocation(value.latitude, value.longitude));
  let selectedPosition = value && isValidLocation(value.latitude, value.longitude)
    ? [Number(value.latitude), Number(value.longitude)]
    : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];

  let push = useCallback(
    (patch) => {
      if (!value) return;
      onChange({ ...value, ...patch });
    },
    [value, onChange]
  );

  let finalizeSelection = useCallback(
    (lat, lng, extra = {}) => {
      let safeLat = roundCoord(lat);
      let safeLng = roundCoord(lng);
      if (!isValidLocation(safeLat, safeLng)) return;

      let nextLocation = {
        ...value,
        latitude: safeLat,
        longitude: safeLng,
        accuracy: extra.accuracy ?? value?.accuracy ?? null,
        address: extra.address ?? value?.address ?? 'Address unavailable',
        city: extra.city ?? value?.city ?? '',
        source: extra.source ?? value?.source ?? 'map',
      };
      onChange(nextLocation);
    },
    [value, onChange]
  );

  let resolveSelectionAddress = useCallback(async (lat, lng, fallbackSource = 'map') => {
    let info = await reverseGeocode(lat, lng);
    let finalAddress = info?.address || 'Address unavailable';
    let finalCity = info?.city || '';
    finalizeSelection(lat, lng, {
      source: fallbackSource,
      address: finalAddress,
      city: finalCity,
    });
  }, [finalizeSelection]);

  let onMapSelect = useCallback(
    (lat, lng, extra = {}) => {
      addressDirtyRef.current = false;
      let resolvedSource = extra.source || 'map';
      if (!extra.address && !extra.city) {
        resolveSelectionAddress(lat, lng, resolvedSource);
        return;
      }
      finalizeSelection(lat, lng, { ...extra, source: resolvedSource });
    },
    [finalizeSelection, resolveSelectionAddress]
  );

  let detectCurrentLocation = useCallback(async () => {
    setDetecting(true);
    setGeoError('');
    try {
      let pos = await getCurrentPosition();
      let lat = Number(pos.coords.latitude);
      let lng = Number(pos.coords.longitude);
      addressDirtyRef.current = false;
      let info = await reverseGeocode(lat, lng);
      let nextLocation = {
        ...value,
        latitude: roundCoord(lat),
        longitude: roundCoord(lng),
        accuracy: pos.coords.accuracy ?? null,
        address: info?.address || 'Address unavailable',
        city: info?.city || value?.city || '',
        source: 'gps',
      };
      onChange(nextLocation);
    } catch (err) {
      setGeoError(locErrorMessage(err && err.code));
    } finally {
      setDetecting(false);
    }
  }, [value, onChange]);

  let commitManual = () => {
    let lat = parseFloat(latInput);
    let lng = parseFloat(lngInput);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      setGeoError('Please enter valid coordinates (latitude −90…90, longitude −180…180).');
      return;
    }
    setGeoError('');
    onChange({
      ...value,
      latitude: roundCoord(lat),
      longitude: roundCoord(lng),
      accuracy: null,
      address: addressInput.trim().slice(0, 500) || 'Address unavailable',
      city: cityInput.trim().slice(0, 120),
      source: 'manual',
    });
  };

  let clearLocation = () => {
    addressDirtyRef.current = false;
    onChange({ latitude: null, longitude: null, address: '', city: '', accuracy: null, source: null });
    setGeoError('');
  };

  let applySearchResult = useCallback(async (query) => {
    let trimmed = query.trim();
    if (!trimmed) return;
    setSearchBusy(true);
    try {
      let results = await searchLocations(trimmed);
      if (!results.length) {
        setGeoError('No matching locations were found. Try a broader search term.');
        return;
      }
      let result = results[0];
      let latitude = roundCoord(result.lat);
      let longitude = roundCoord(result.lon);
      let address = result.display_name || 'Address unavailable';
      let city = result.address?.city || result.address?.town || result.address?.village || result.address?.municipality || '';
      setSearchInput(address);
      onChange({
        ...value,
        latitude,
        longitude,
        address,
        city,
        accuracy: null,
        source: 'map',
      });
    } catch {
      setGeoError('The location search could not be completed. Please try again.');
    } finally {
      setSearchBusy(false);
    }
  }, [value, onChange]);

  useEffect(() => {
    if (value) {
      if (!addressDirtyRef.current) setAddressInput(value.address || '');
      setCityInput(value.city || '');
      setLatInput(Number.isFinite(value.latitude) ? String(value.latitude) : '');
      setLngInput(Number.isFinite(value.longitude) ? String(value.longitude) : '');
    } else {
      setAddressInput('');
      setCityInput('');
      setLatInput('');
      setLngInput('');
    }
  }, [value]);

  useEffect(() => {
    mapReadyRef.current = true;
  }, []);

  let sourceLabel =
    value?.source === 'gps'
      ? 'Current location detected'
      : value?.source === 'map'
        ? 'Location selected on map'
        : value?.source === 'manual'
          ? 'Location entered manually'
          : 'No location confirmed yet';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {hasCoords ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12.5px] font-semibold text-emerald-700">
              <LocateFixed size={14} aria-hidden />
              {sourceLabel}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12.5px] font-medium text-slate-500">
              <MapPinOff size={14} aria-hidden />
              No location yet
            </span>
          )}
          {value?.accuracy ? <span className="text-[12px] text-slate-400">±{Math.round(value.accuracy)} m</span> : null}
        </div>
        <div className="flex items-center gap-2">
          {hasCoords && (
            <button type="button" onClick={clearLocation} className="btn btn-ghost px-2.5 py-1.5 text-[12.5px]">
              <RotateCcw size={13} aria-hidden /> Clear
            </button>
          )}
          <button type="button" onClick={detectCurrentLocation} disabled={detecting} className="btn btn-blue px-3.5 py-2 text-[13px]">
            {detecting ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Crosshair size={15} aria-hidden />}
            {detecting ? 'Detecting…' : 'Use My Location'}
          </button>
        </div>
      </div>

      {geoError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-[13.5px] text-amber-800">
          {geoError}
          <button
            type="button"
            onClick={() => {
              setGeoError('');
              document.getElementById('manual-loc')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="ml-1 font-bold text-amber-900 underline"
          >
            Select Location Manually
          </button>
        </div>
      )}

      <div className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <label className="absolute left-3 right-3 top-3 z-[500] flex items-center gap-2 rounded-lg bg-white/95 p-2 shadow-lg backdrop-blur-sm">
          <Search size={16} className="ml-1 shrink-0 text-slate-400" aria-hidden />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applySearchResult(searchInput);
              }
            }}
            className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Search CIDCO, Waluj, Kranti Chowk, Railway Station..."
          />
          <button
            type="button"
            onClick={() => applySearchResult(searchInput)}
            disabled={searchBusy}
            className="rounded-md bg-slate-900 px-2.5 py-1.5 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {searchBusy ? '…' : 'Search'}
          </button>
        </label>

        <div className="h-full w-full pt-16">
          <LeafletMap value={value} onSelect={onMapSelect} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <p className="text-[12.5px] font-bold uppercase tracking-wide text-slate-500">Selected Location</p>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-slate-500" aria-hidden />
            <span>{value?.address || 'Address unavailable'}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-800">Latitude:</span> {hasCoords ? value.latitude.toFixed(6) : '—'}
            </p>
            <p>
              <span className="font-semibold text-slate-800">Longitude:</span> {hasCoords ? value.longitude.toFixed(6) : '—'}
            </p>
          </div>
          {hasCoords && (
            <p className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-[13px] font-medium text-blue-800">
              <MapPin size={15} className="text-blue-700" aria-hidden />
              {displayCoordinates(value.latitude, value.longitude)}
            </p>
          )}
        </div>
      </div>

      <div id="manual-loc" className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
        <p className="text-[12.5px] font-bold uppercase tracking-wide text-slate-500">
          Location details &amp; manual entry
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="label-base">Address / nearest landmark</span>
            <input
              className="input-base"
              placeholder="e.g. Near the bus stand, MG Road"
              value={addressInput}
              onChange={(event) => {
                addressDirtyRef.current = true;
                setAddressInput(event.target.value);
              }}
              onBlur={() => hasCoords && push({ address: addressInput.trim().slice(0, 500) || 'Address unavailable' })}
            />
          </label>
          <label>
            <span className="label-base">City</span>
            <input
              className="input-base"
              placeholder="City / district"
              value={cityInput}
              onChange={(event) => setCityInput(event.target.value)}
              onBlur={() => hasCoords && push({ city: cityInput.trim().slice(0, 120) })}
            />
          </label>
          <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
            <label>
              <span className="label-base">Latitude</span>
              <input className="input-base" inputMode="decimal" placeholder="19.8762" value={latInput} onChange={(event) => setLatInput(event.target.value)} />
            </label>
            <label>
              <span className="label-base">Longitude</span>
              <input className="input-base" inputMode="decimal" placeholder="75.3433" value={lngInput} onChange={(event) => setLngInput(event.target.value)} />
            </label>
            <button type="button" onClick={commitManual} className="btn btn-outline px-3 py-2.5 text-[13px]">
              <Navigation size={14} aria-hidden /> Apply
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!hasCoords) {
            setGeoError('Please select a location on the map.');
            return;
          }
          onConfirm?.();
        }}
        disabled={!hasCoords}
        className={cn('btn w-full !rounded-xl py-3.5 text-[15px]', hasCoords ? 'btn-blue' : 'btn-outline opacity-70')}
      >
        <Check size={17} aria-hidden />
        {confirmLabel}
      </button>
    </div>
  );
}
