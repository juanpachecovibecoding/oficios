import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Star, MapPin, Compass, AlertTriangle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Haversine distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

export function MapView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const job = searchParams.get('job');
  const zone = searchParams.get('zone');
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');

  const [radius, setRadius] = useState<number>(5);
  const [professionals, setProfessionals] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const center = useMemo(() => {
    if (lat && lng) return { lat, lng };
    return { lat: -31.6107, lng: -60.6973 }; // Santa Fe default
  }, [lat, lng]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('La geolocalización no está soportada por tu navegador.');
      return;
    }

    setLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setLocating(false);
        
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          next.set('lat', String(userLat));
          next.set('lng', String(userLng));
          next.set('zone', 'Ubicación actual');
          return next;
        });
      },
      (error) => {
        setLocating(false);
        console.error('Error obtaining GPS position:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Permiso denegado. Activa los permisos de ubicación en tu navegador.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('La información de tu ubicación no está disponible actualmente.');
            break;
          case error.TIMEOUT:
            setGpsError('Se agotó el tiempo para obtener tu ubicación.');
            break;
          default:
            setGpsError('Ocurrió un error al intentar obtener tu ubicación.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Clean up map instance on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Fetch professionals
  useEffect(() => {
    async function fetchPros() {
      setLoading(true);
      try {
        let q = query(collection(db, 'users'), where('status', '==', 'active'));
        if (job) {
          q = query(q, where('specialty', '==', job));
        }
        const snapshot = await getDocs(q);
        const allPros = snapshot.docs.map(doc => doc.data() as UserProfile);
        
        // Filter by distance if we have lat/lng
        if (lat && lng) {
          const filtered = allPros.filter(p => {
            if (!p.lat || !p.lng) return false;
            const dist = getDistanceFromLatLonInKm(lat, lng, p.lat, p.lng);
            return dist <= radius;
          });
          setProfessionals(filtered);
        } else {
          setProfessionals(allPros);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
    fetchPros();
  }, [job, lat, lng, radius]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([center.lat, center.lng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current);

      markersGroupRef.current = L.layerGroup().addTo(mapRef.current);
    } else {
      mapRef.current.setView([center.lat, center.lng], 12);
    }
  }, [center]);

  // Intercept popup link clicks to trigger client-side React Router navigation
  // instead of hard page reloads (which can cause 404s on Vercel)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    const handlePopupClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const profileLink = target.closest('a[href^="/profile/"]');
      if (profileLink) {
        e.preventDefault();
        const href = profileLink.getAttribute('href');
        if (href) {
          navigate(href);
        }
      }
    };

    const container = map.getContainer();
    container.addEventListener('click', handlePopupClick);

    return () => {
      container.removeEventListener('click', handlePopupClick);
    };
  }, [navigate]);

    // Update Markers inside Leaflet Map
    useEffect(() => {
      if (!mapRef.current || !markersGroupRef.current) return;
  
      markersGroupRef.current.clearLayers();
  
      const centerIcon = L.divIcon({
        html: `<div class="relative w-8 h-8 flex items-center justify-center">
                 <div class="absolute w-8 h-8 bg-red-400 border border-red-500 rounded-full animate-ping opacity-30"></div>
                 <div class="w-4 h-4 bg-red-600 border-2 border-white rounded-full shadow-md z-10"></div>
               </div>`,
        className: 'custom-center-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
  
      // Add search center pin
      if (lat !== 0 && lng !== 0) {
        L.marker([lat, lng], { icon: centerIcon })
          .addTo(markersGroupRef.current)
          .bindPopup('<div class="font-sans font-bold text-xs p-1 text-slate-800">Tu punto de búsqueda</div>');
      }
  
      // Add professional pins with custom photo markers
      professionals.forEach(pro => {
        if (!pro.lat || !pro.lng) return;
        const isActive = activeMarkerId === pro.uid;
        const photo = pro.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=60';
  
        const customProIcon = L.divIcon({
          html: `
            <div class="relative flex flex-col items-center justify-center" style="transform: translate(0, -4px);">
              <!-- Circular avatar with custom border and shadow -->
              <div class="w-10 h-10 rounded-full border-2 ${isActive ? 'border-blue-600 ring-4 ring-blue-100 scale-110' : 'border-white'} overflow-hidden shadow-md bg-white hover:scale-110 transition-all duration-200 z-10">
                <img src="${photo}" class="w-full h-full object-cover" referrerpolicy="no-referrer" alt="${pro.displayName}" />
              </div>
              <!-- Small pointer arrow at the bottom -->
              <div class="w-3 h-3 bg-white -mt-1.5 rotate-45 border-r border-b ${isActive ? 'border-blue-600' : 'border-transparent'} shadow-xs z-0"></div>
            </div>
          `,
          className: 'custom-photo-marker',
          iconSize: [44, 48],
          iconAnchor: [22, 44],
        });
  
        const marker = L.marker([pro.lat, pro.lng], {
          icon: customProIcon
        });
  
        marker.on('click', () => {
          setActiveMarkerId(pro.uid);
        });
  
        marker.bindPopup(`
          <div class="font-sans flex flex-col p-4 w-[290px] select-none">
            <div class="flex gap-3 items-start mb-3">
              <img src="${photo}" class="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-xs shrink-0 bg-slate-50" referrerpolicy="no-referrer" alt="${pro.displayName}" />
              <div class="min-w-0 flex-grow">
                <h4 class="font-extrabold text-slate-900 text-sm leading-snug mb-0.5 truncate">${pro.displayName}</h4>
                <p class="text-[11px] text-blue-700 font-extrabold tracking-wider uppercase truncate">${pro.specialty || 'Servicios'}</p>
                ${pro.church ? `
                  <div class="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-1">
                    <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span class="truncate">${pro.church}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            ${pro.rating ? `
              <div class="flex items-center gap-1.5 mb-3 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-100/80">
                <div class="flex text-amber-400 gap-0.5">
                  ${Array.from({ length: 5 }).map((_, i) => {
                    const isFilled = i < Math.round(pro.rating || 0);
                    return `
                      <svg class="w-3 h-3 ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    `;
                  }).join('')}
                </div>
                <span class="text-xs font-bold text-slate-700">${pro.rating.toFixed(1)}</span>
                <span class="text-[10px] text-slate-400 font-medium">(${pro.reviewCount || 0} ${pro.reviewCount === 1 ? 'reseña' : 'reseñas'})</span>
              </div>
            ` : `
              <div class="flex items-center gap-1.5 mb-3 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-100/80 text-[10px] text-slate-400 font-semibold justify-center">
                Sin reseñas aún
              </div>
            `}

            <div class="flex items-start gap-1.5 text-xs text-slate-500 mb-4 leading-relaxed">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="truncate max-w-[210px]">${pro.address || 'Sin dirección especificada'}</span>
            </div>

            <a href="/profile/${pro.uid}" class="block text-center text-xs font-extrabold text-white bg-brand-blue-900 hover:bg-brand-blue-950 py-2.5 px-4 rounded-xl shadow-xs hover:shadow-md transition-all duration-150 tracking-wider uppercase no-underline">
              Ir al Perfil
            </a>
          </div>
        `);
  
        marker.addTo(markersGroupRef.current);
      });
    }, [professionals, activeMarkerId, lat, lng]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col gap-3 z-10 shadow-sm">
        {gpsError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="flex-grow">{gpsError}</span>
            <button 
              onClick={() => setGpsError(null)} 
              className="text-red-500 hover:text-red-700 font-bold ml-2 text-sm cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-sans font-extrabold text-slate-950">
              {job ? `Buscando: ${job}` : 'Todos los profesionales'} {zone && `en ${zone}`}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{professionals.length} resultados encontrados</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* GPS locate button */}
            <button
              onClick={handleGetCurrentLocation}
              disabled={locating}
              className={`inline-flex items-center gap-2 bg-brand-blue-900 hover:bg-brand-blue-950 text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-xs cursor-pointer disabled:opacity-70`}
            >
              <Compass className={`w-4 h-4 text-brand-gold-400 ${locating ? 'animate-spin' : ''}`} />
              {locating ? 'Ubicando...' : 'Buscar desde mi ubicación actual'}
            </button>

            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-1">Radio:</span>
              {[1, 3, 5, 10].map(r => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    radius === r 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-transparent text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* List view sidebar */}
        <div className="w-full md:w-[400px] h-[50vh] md:h-full overflow-y-auto bg-slate-50 border-r border-slate-200 p-4 space-y-4 order-2 md:order-1">
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm font-medium">Buscando profesionales de confianza...</div>
          ) : professionals.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No encontramos profesionales en este radio. Prueba ampliando el rango o buscando en otra zona.
            </div>
          ) : (
            professionals.map(pro => (
              <div 
                key={pro.uid} 
                className={`bg-white rounded-2xl shadow-xs border p-4 hover:shadow-md transition-all cursor-pointer ${
                  activeMarkerId === pro.uid ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/10' : 'border-slate-200'
                }`}
                onMouseEnter={() => {
                  setActiveMarkerId(pro.uid);
                  if (mapRef.current && pro.lat && pro.lng) {
                    mapRef.current.setView([pro.lat, pro.lng], 13);
                  }
                }}
                onMouseLeave={() => setActiveMarkerId(null)}
              >
                <div className="flex items-start space-x-4">
                  <div className="relative shrink-0">
                    <img src={pro.photoURL} alt={pro.displayName} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs" />
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold" title="Verificado">✓</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-bold text-slate-900 truncate leading-snug">{pro.displayName}</h3>
                      <span className="text-xs font-bold text-blue-600 shrink-0">{pro.rating ? `${pro.rating.toFixed(1)} ★` : 'Nuevo'}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">{pro.specialty}</p>
                    
                    <div className="flex gap-1 mb-2">
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 italic truncate max-w-full font-medium">
                        {pro.church || 'Iglesia local'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-[11px] text-slate-500 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{pro.address}</span>
                    </div>
                    
                    {lat !== 0 && pro.lat && pro.lng && (
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        A {getDistanceFromLatLonInKm(lat, lng, pro.lat, pro.lng).toFixed(1)} km de tu ubicación
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                  <Link 
                    to={`/profile/${pro.uid}`}
                    className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline"
                  >
                    Ver perfil completo &rarr;
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map Container */}
        <div className="w-full md:flex-1 h-[50vh] md:h-full relative order-1 md:order-2">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating cards for active marker (Mobile view) */}
          {activeMarkerId && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-sm pointer-events-none md:hidden z-20">
              {professionals.filter(p => p.uid === activeMarkerId).map(pro => (
                <div key={pro.uid} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 pointer-events-auto">
                   <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-slate-900">{pro.displayName}</h3>
                     <button onClick={() => setActiveMarkerId(null)} className="text-slate-400 text-lg font-bold p-1">&times;</button>
                   </div>
                   <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-3">{pro.specialty}</p>
                   <Link 
                    to={`/profile/${pro.uid}`}
                    className="block w-full text-center text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    Ver perfil completo
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
