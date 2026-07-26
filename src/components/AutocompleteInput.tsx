import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { PlaceResult } from '../types';

interface AutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  onPlaceSelect?: (place: PlaceResult | null) => void;
  placeholder?: string;
  className?: string;
}

export function AutocompleteInput({ value, onChange, onPlaceSelect, placeholder, className }: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    // Handle clicking outside to close suggestions
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      // Free and open address search via Nominatim (restricted to Argentina for higher relevance)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=ar&limit=5`,
        {
          headers: {
            'Accept-Language': 'es',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setShowDropdown(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 400);
  };

  const handleSelectSuggestion = (item: any) => {
    const displayName = item.display_name;
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    onChange(displayName);
    setSuggestions([]);
    setShowDropdown(false);

    if (onPlaceSelect) {
      onPlaceSelect({
        lat,
        lng,
        address: displayName,
      });
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {loading ? (
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        ) : (
          <MapPin className="h-5 w-5 text-slate-400" />
        )}
      </div>
      <input
        type="text"
        className={
          className ||
          'block w-full pl-10 pr-3 py-4 border-0 bg-slate-50 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg placeholder:text-slate-400'
        }
        placeholder={placeholder || '¿En qué zona?'}
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowDropdown(true);
          }
        }}
        required
      />

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white shadow-2xl rounded-xl border border-slate-200 max-h-60 overflow-y-auto">
          {suggestions.map((item) => (
            <div
              key={item.place_id}
              onClick={() => handleSelectSuggestion(item)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-left text-slate-700 font-medium text-sm transition-colors border-b border-slate-100 last:border-b-0 flex items-start gap-2.5"
            >
              <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{item.display_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
