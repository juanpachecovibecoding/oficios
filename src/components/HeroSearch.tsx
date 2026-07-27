import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';
import { PlaceResult } from '../types';

const OFICIOS = [
  'Electricidad', 'Plomería', 'Gasista Matriculado', 'Carpintería',
  'Pintura', 'Refrigeración', 'Costura', 'Jardinería', 'Albañilería',
  'Herrería', 'Limpieza', 'Cuidado de Ancianos', 'Niñera', 'Informática'
];

export function HeroSearch() {
  const [jobQuery, setJobQuery] = useState('');
  const [zoneQuery, setZoneQuery] = useState('');
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const navigate = useNavigate();
  
  const filteredJobs = OFICIOS.filter(o => o.toLowerCase().includes(jobQuery.toLowerCase()));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobQuery && zoneQuery) {
      let lat = '';
      let lng = '';
      if (selectedPlace) {
        lat = selectedPlace.lat.toString();
        lng = selectedPlace.lng.toString();
      }
      navigate(`/map?job=${encodeURIComponent(jobQuery)}&zone=${encodeURIComponent(zoneQuery)}&lat=${lat}&lng=${lng}`);
    }
  };

  return (
    <div className="bg-[#FAF9F6] py-20 md:py-32 border-b border-brand-blue-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(184,156,109,0.06),transparent_40%)]" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <span className="inline-block text-[11px] font-bold px-3 py-1 bg-brand-gold-50 text-brand-gold-700 border border-brand-gold-100 rounded-full mb-5 uppercase tracking-widest">
          Alianza de Trabajo • Confianza & Logos
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-brand-blue-900 mb-6 leading-tight">
          La dignidad del trabajo hecha comunidad
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          En Oficios Cristianos conectamos de forma directa a profesionales honestos con hogares en toda la Argentina, bajo un pacto relacional de excelencia, honra y valores compartidos.
        </p>

        <form onSubmit={handleSearch} className="bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200 flex flex-col md:flex-row gap-2.5 relative max-w-3xl mx-auto">
          
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-3 py-3.5 border-0 bg-transparent text-slate-900 focus:ring-0 focus:outline-hidden text-base placeholder:text-slate-400"
              placeholder="¿Qué oficio buscás? (Ej: Plomero, Electricista...)"
              value={jobQuery}
              onChange={(e) => {
                setJobQuery(e.target.value);
                setShowJobSuggestions(true);
              }}
              onFocus={() => setShowJobSuggestions(true)}
              onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
            />
            {showJobSuggestions && jobQuery && (
              <div className="absolute z-10 mt-2 w-full bg-white shadow-2xl rounded-xl border border-slate-200 max-h-60 overflow-auto">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map(job => (
                    <div
                      key={job}
                      className="px-4 py-3 hover:bg-brand-blue-50 cursor-pointer text-left text-slate-700 font-medium text-sm transition-colors"
                      onMouseDown={() => {
                        setJobQuery(job);
                        setShowJobSuggestions(false);
                      }}
                    >
                      {job}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-slate-400 text-left text-sm">No se encontraron oficios...</div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:block w-[1px] bg-slate-200 my-2"></div>

          <AutocompleteInput 
            value={zoneQuery} 
            onChange={setZoneQuery}
            onPlaceSelect={setSelectedPlace}
            className="block w-full pl-11 pr-3 py-3.5 border-0 bg-transparent text-slate-900 focus:ring-0 focus:outline-hidden text-base placeholder:text-slate-400"
            placeholder="Zona geográfica (Ej: Santa Fe, Rosario...)"
          />

          <button
            type="submit"
            className="md:w-auto w-full px-8 py-3.5 bg-brand-blue-900 hover:bg-brand-blue-950 text-white text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer border border-brand-blue-700"
          >
            Buscar Profesional
          </button>
        </form>
      </div>
    </div>
  );
}
