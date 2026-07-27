import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { UserProfile, Review } from '../types';
import { ShieldCheck, MapPin, Clock, Truck, Home, Phone, Star, CheckCircle, Trash2, Camera, Upload, X, ArrowLeft, ChevronLeft, ChevronRight, Award, Sliders, Calendar, Sparkles } from 'lucide-react';
import ReactBeforeSliderComponent from 'react-before-after-slider-component';
import 'react-before-after-slider-component/dist/build.css';
import { useAuth } from '../contexts/AuthContext';

// Client-side Canvas-based image resizer and compressor to keep Firestore documents lightweight
function compressAndResizeImage(file: File, maxWidth: number, maxHeight: number, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return '';
}

const PRESET_BANNERS = [
  { name: 'Carpintería', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=60&w=600' },
  { name: 'Herramientas', url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=60&w=600' },
  { name: 'Plomería', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=60&w=600' },
  { name: 'Electricidad', url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=60&w=600' },
  { name: 'Jardinería', url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=60&w=600' },
  { name: 'Costura', url: 'https://images.unsplash.com/photo-1517524006037-e89721430781?auto=format&fit=crop&q=60&w=600' },
  { name: 'Pintura', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=60&w=600' },
  { name: 'Fe / Cruz', url: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&q=60&w=600' },
  { name: 'Geométrico Azul', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=600' },
];

export function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, userProfile, setIsLoginModalOpen } = useAuth();
  const [pro, setPro] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Banner editing states
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [tempBannerURL, setTempBannerURL] = useState('');

  const openBannerModal = () => {
    setTempBannerURL(pro?.bannerURL || '');
    setShowBannerModal(true);
  };

  const handleSaveBanner = async () => {
    if (!pro) return;
    setSavingBanner(true);
    try {
      await updateDoc(doc(db, 'users', pro.uid), {
        bannerURL: tempBannerURL
      });
      setPro({ ...pro, bannerURL: tempBannerURL });
      setShowBannerModal(false);
      alert("¡Banner de perfil actualizado!");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el banner de perfil.");
    } finally {
      setSavingBanner(false);
    }
  };

  const isSuperAdmin = currentUser?.email === 'juanpacheco@playcode.com.ar';
  const isAdmin = userProfile?.role === 'admin' || isSuperAdmin;
  const hasCompletedProfile = !!userProfile || isAdmin;
  const isActiveUser = userProfile?.status === 'active' || isAdmin;

  // Review Form state
  const [techScore, setTechScore] = useState(5);
  const [punctScore, setPunctScore] = useState(5);
  const [respectScore, setRespectScore] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Custom interactive states
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  // Interactive Star Selector helper
  const RatingStarsInput = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 tracking-wide">{label}</span>
          <span className="text-[11px] text-slate-400 font-medium">Calificá este aspecto del servicio</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 justify-start">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = hoverValue !== null ? star <= hoverValue : star <= value;
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => onChange(star)}
                  onMouseEnter={() => setHoverValue(star)}
                  onMouseLeave={() => setHoverValue(null)}
                  className="p-1 hover:scale-125 transition-transform duration-100 focus:outline-none shrink-0"
                >
                  <Star
                    className={`w-6 h-6 transition-colors duration-100 ${
                      isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-xs font-semibold text-slate-500 w-24 text-left">
            {value === 5 ? 'Excelente' : value === 4 ? 'Muy bueno' : value === 3 ? 'Bueno' : value === 2 ? 'Regular' : 'Malo'}
          </span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPro(docSnap.data() as UserProfile);
      }

      const q = query(collection(db, 'reviews'), where('professionalId', '==', id));
      const revSnap = await getDocs(q);
      const revData = revSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
      // sort by date desc locally
      revData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setReviews(revData);
      
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen pt-20 text-center text-slate-500">Cargando perfil...</div>;
  }

  if (!pro) {
    return <div className="min-h-screen pt-20 text-center text-slate-500">Profesional no encontrado.</div>;
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Debes iniciar sesión para dejar una reseña.");
      return;
    }
    setSubmitting(true);
    try {
      const overall = (techScore + punctScore + respectScore) / 3;
      const newReview = {
        professionalId: pro.uid,
        reviewerId: auth.currentUser.uid,
        reviewerName: auth.currentUser.displayName || 'Usuario',
        technicalScore: techScore,
        punctualityScore: punctScore,
        respectScore,
        overallScore: overall,
        comment,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'reviews'), newReview);
      
      // Update pro rating average (simplified approach)
      const newCount = (pro.reviewCount || 0) + 1;
      const newTotal = ((pro.rating || 0) * (pro.reviewCount || 0)) + overall;
      const newAvg = newTotal / newCount;
      
      await updateDoc(doc(db, 'users', pro.uid), {
        rating: newAvg,
        reviewCount: newCount
      });
      
      alert("¡Reseña publicada con éxito!");
      // Reload page to reflect changes
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error al enviar la reseña.");
    }
    setSubmitting(false);
  };

  const whatsappMessage = encodeURIComponent(`Hola ${pro.displayName}, te encontré en Oficios Cristianos y me gustaría consultarte por un trabajo de ${pro.specialty}.`);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      
      {/* Header Profile */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="h-32 md:h-48 bg-gradient-to-r from-blue-700 to-blue-900 relative overflow-hidden group">
          {pro.bannerURL && (
            <img 
              src={pro.bannerURL} 
              alt="Banner de perfil" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          {currentUser?.uid === pro.uid && (
            <button
              onClick={openBannerModal}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white text-xs font-bold py-2 px-3.5 rounded-full flex items-center gap-1.5 transition-all shadow-md cursor-pointer z-10 hover:scale-105"
              title="Personalizar banner"
            >
              <Camera className="w-4 h-4" />
              <span>Personalizar Banner</span>
            </button>
          )}
        </div>
        <div className="px-6 pb-8 md:px-10 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative">
              <img 
                src={pro.photoURL} 
                alt={pro.displayName} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-xl border-4 border-white object-cover shadow-lg bg-white" 
              />
              <div className="text-center md:text-left mb-2">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-3xl font-sans font-extrabold tracking-tight text-slate-900">{pro.displayName}</h1>
                  {pro.status === 'active' && (
                    <div className="flex items-center bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                      <ShieldCheck className="w-4 h-4 mr-1 text-emerald-500" />
                      Verificado
                    </div>
                  )}
                </div>
                <p className="text-lg text-blue-700 font-bold">{pro.specialty}</p>
              </div>
            </div>
            
            {!hasCompletedProfile ? (
              <button
                disabled
                className="flex items-center justify-center gap-2 bg-slate-100 text-slate-400 border border-slate-200 px-8 py-3.5 rounded-xl font-bold md:mb-2 w-full md:w-auto cursor-not-allowed text-sm"
              >
                <Phone className="w-5 h-5" />
                <span>Contacto Reservado</span>
              </button>
            ) : !isActiveUser ? (
              <button
                disabled
                className="flex items-center justify-center gap-2 bg-slate-100 text-slate-500 border border-slate-200 px-8 py-3.5 rounded-xl font-bold md:mb-2 w-full md:w-auto cursor-not-allowed text-sm"
                title="Debe estar activo para contactar"
              >
                <Phone className="w-5 h-5 text-slate-400" />
                <span>Contacto Bloqueado (Pendiente)</span>
              </button>
            ) : (
              <a 
                href={`https://wa.me/${pro.phone?.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all md:mb-2 w-full md:w-auto text-sm"
              >
                <Phone className="w-5 h-5" />
                <span>Contactar por WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {!hasCompletedProfile ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6 mt-8">
          <div className="w-16 h-16 bg-brand-blue-50 text-brand-blue-600 rounded-full flex items-center justify-center mx-auto border border-brand-blue-100">
            <span className="text-3xl">🔒</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-brand-blue-900">Datos de Contacto Reservados</h3>
          <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
            Para proteger la seguridad de los trabajadores y mantener la integridad del pacto relacional en la comunidad, los datos de contacto, ubicación, testimonios y portafolio están reservados exclusivamente para miembros que hayan completado su perfil.
          </p>
          
          {!currentUser ? (
            <div className="pt-4 space-y-4">
               <p className="text-xs text-slate-500 font-medium">Por favor, inicia sesión con tu cuenta de Google y completa tu perfil:</p>
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-brand-blue-900 hover:bg-brand-blue-950 text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
              >
                <span>Ingresar y Completar Perfil</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 space-y-4">
              <p className="text-xs text-slate-500 font-medium">Has iniciado sesión como <strong>{currentUser.displayName}</strong>, pero aún no has completado tus datos:</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-brand-blue-900 hover:bg-brand-blue-950 text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm"
              >
                <span>Completar mi Perfil (Cliente / Profesional)</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Friendly warning for pending active users who can see details but can't hire yet */}
          {!isActiveUser && (
            <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
              <span className="text-lg">⏳</span>
              <div>
                <strong className="font-bold">Perfil en Proceso de Activación</strong>
                <p className="text-xs text-amber-800 mt-0.5">
                  Tu perfil ha sido completado con éxito, pero tu cuenta aún está en revisión por parte de la administración. Una vez aprobado, podrás contactar a los prestadores directamente y dejar calificaciones.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Info & Trust */}
        <div className="space-y-8 md:col-span-1">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-sans text-base font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Comunidad y Confianza
            </h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li>
                <span className="block font-bold text-slate-900 text-xs uppercase tracking-wider mb-0.5">Iglesia / Comunidad</span>
                <span className="text-slate-700 font-medium">{pro.church}</span>
              </li>
              <li>
                <span className="block font-bold text-slate-900 text-xs uppercase tracking-wider mb-0.5">Años de vinculación</span>
                <span className="text-slate-700 font-medium">{pro.yearsLinked} años</span>
              </li>
              <li>
                <span className="block font-bold text-slate-900 text-xs uppercase tracking-wider mb-0.5">Referencia validada</span>
                <span className="text-slate-700 font-medium">{pro.referenceName}</span>
              </li>
              {pro.agreedToEthics && (
                <li className="flex items-start gap-2 pt-3 border-t border-slate-100">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">Código de Ética firmado</span>
                </li>
              )}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-sans text-base font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-5 h-5 text-blue-600" />
              Información Práctica
            </h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-900 text-xs uppercase tracking-wider">Ubicación</span>
                  <span className="text-slate-700 font-medium">{pro.address}</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-900 text-xs uppercase tracking-wider">Horarios</span>
                  <span className="text-slate-700 font-medium">{pro.hours}</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                {pro.modality === 'Ambos' ? (
                  <div className="flex gap-1 shrink-0 mt-1">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <Home className="w-4 h-4 text-slate-400" />
                  </div>
                ) : pro.modality === 'Taller propio' ? (
                  <Home className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                ) : (
                  <Truck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="block font-bold text-slate-900 text-xs uppercase tracking-wider">Modalidad</span>
                  <span className="text-slate-700 font-medium">
                    {pro.modality === 'Ambos' ? 'A domicilio y Taller propio' : pro.modality}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-900 text-xs uppercase tracking-wider">Radio de Cobertura</span>
                  <span className="text-slate-700 font-medium">{pro.coverageRadius} km</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Right Column: Portfolio & Reviews */}
        <div className="space-y-8 md:col-span-2">
          
          {/* Portfolio / Trabajos Destacados */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-sans text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Trabajos Destacados
            </h3>
            
            {pro.portfolio && pro.portfolio.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {pro.portfolio.map((imgUrl, index) => (
                    <div 
                      key={index} 
                      onClick={() => setActiveImageIndex(index)}
                      className="group aspect-4/3 rounded-xl overflow-hidden border border-slate-100 shadow-xs cursor-pointer relative bg-slate-50"
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Trabajo ${index + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-200" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3 text-center italic">Presioná cualquier imagen para expandir en pantalla completa</p>
              </div>
            ) : (
              <div>
                {/* Fallback to Before/After Slider if no portfolio but illustrative */}
                <div className="rounded-xl overflow-hidden shadow-inner bg-slate-50 border border-slate-200">
                  <ReactBeforeSliderComponent
                    firstImage={{
                      imageUrl: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=800",
                      alt: "Después"
                    }}
                    secondImage={{
                      imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
                      alt: "Antes"
                    }}
                  />
                </div>
                <p className="text-center text-xs text-slate-500 mt-3 italic">Deslizá para ver un ejemplo de antes y después</p>
              </div>
            )}
          </div>

          {/* Video de Presentación Personal */}
          {pro.videoURL && getYouTubeEmbedUrl(pro.videoURL) && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-sans text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                Video de Presentación
              </h3>
              <p className="text-xs text-slate-500 -mt-2">
                Conocé personalmente a {pro.displayName} en este breve video de presentación.
              </p>
              
              <div className="aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-50">
                <iframe
                  className="w-full h-full"
                  src={getYouTubeEmbedUrl(pro.videoURL)}
                  title={`Video de presentación de ${pro.displayName}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* Antes y Después de Trabajos */}
          {pro.beforeAfterProjects && pro.beforeAfterProjects.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <h3 className="font-sans text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Proyectos de "Antes y Después"
              </h3>
              <p className="text-xs text-slate-500 -mt-2">
                Deslizá el control en el medio de cada imagen para comparar el antes y después de cada trabajo realizado.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {pro.beforeAfterProjects.map((project: any) => (
                  <div key={project.id} className="space-y-2.5 bg-[#FAF9F6] p-4 rounded-2xl border border-slate-100/80 shadow-xs">
                    <h4 className="font-sans font-bold text-sm text-slate-800 px-1">{project.title}</h4>
                    <div className="rounded-xl overflow-hidden shadow-xs border border-slate-200">
                      <ReactBeforeSliderComponent
                        firstImage={{
                          imageUrl: project.afterURL,
                          alt: "Después"
                        }}
                        secondImage={{
                          imageUrl: project.beforeURL,
                          alt: "Antes"
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center px-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>← Antes (Izquierda)</span>
                      <span>Después (Derecha) →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lightbox Modal */}
          {activeImageIndex !== null && pro.portfolio && pro.portfolio.length > 0 && (
            <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
              <button 
                onClick={() => setActiveImageIndex(null)}
                className="absolute top-6 right-6 text-white hover:text-slate-300 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
                title="Cerrar galería"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="relative max-w-4xl max-h-[75vh] flex items-center justify-center w-full">
                {pro.portfolio.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev! === 0 ? pro.portfolio!.length - 1 : prev! - 1));
                    }}
                    className="absolute left-4 md:left-[-60px] text-white hover:text-[#FAF9F6] p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer focus:outline-none"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                )}
                
                <img 
                  src={pro.portfolio[activeImageIndex]} 
                  alt={`Trabajo de ${pro.displayName}`} 
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-white/5 bg-slate-900" 
                  referrerPolicy="no-referrer"
                />
                
                {pro.portfolio.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev! === pro.portfolio!.length - 1 ? 0 : prev! + 1));
                    }}
                    className="absolute right-4 md:right-[-60px] text-white hover:text-[#FAF9F6] p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer focus:outline-none"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                )}
              </div>

              {/* Thumbnails list inside Lightbox */}
              <div className="mt-8 flex gap-3 overflow-x-auto max-w-full px-4 py-2 scrollbar-none">
                {pro.portfolio.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-12 rounded-lg object-cover cursor-pointer transition-all ${
                      idx === activeImageIndex ? 'border-2 border-brand-gold-500 scale-105 shadow-md' : 'opacity-40 hover:opacity-100'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Google Business Style Review Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-sans text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Calificación de Confianza
            </h3>

            {/* Google Business Summary Panel */}
            {(() => {
              const totalReviews = reviews.length;
              const starCounts = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5 stars
              let techSum = 0;
              let punctSum = 0;
              let respectSum = 0;

              reviews.forEach((r) => {
                const rounded = Math.min(5, Math.max(1, Math.round(r.overallScore)));
                starCounts[rounded - 1]++;
                techSum += r.technicalScore || 0;
                punctSum += r.punctualityScore || 0;
                respectSum += r.respectScore || 0;
              });

              const avgTech = totalReviews > 0 ? techSum / totalReviews : 5.0;
              const avgPunct = totalReviews > 0 ? punctSum / totalReviews : 5.0;
              const avgRespect = totalReviews > 0 ? respectSum / totalReviews : 5.0;

              const sortedReviews = [...reviews].sort((a, b) => {
                if (sortBy === 'highest') return b.overallScore - a.overallScore;
                if (sortBy === 'lowest') return a.overallScore - b.overallScore;
                // 'recent' sorting (default)
                const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return timeB - timeA;
              });

              return (
                <>
                  <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-brand-gold-100/60 mb-8 flex flex-col md:flex-row items-center gap-8 justify-between">
                    {/* Display average score */}
                    <div className="text-center shrink-0 w-full md:w-auto">
                      <div className="text-5xl font-serif font-black text-brand-blue-900 mb-1 leading-none">
                        {pro.rating?.toFixed(1) || '0.0'}
                      </div>
                      <div className="flex justify-center gap-0.5 mb-1.5 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const filled = star <= Math.round(pro.rating || 0);
                          return (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${filled ? 'fill-brand-gold-500 text-brand-gold-500' : 'text-slate-200'}`}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        {totalReviews} {totalReviews === 1 ? 'opinión' : 'opiniones'}
                      </p>
                    </div>

                    {/* Star progress bars */}
                    <div className="flex-grow space-y-2 w-full max-w-xs md:max-w-sm">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = starCounts[stars - 1];
                        const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                        return (
                          <div key={stars} className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                            <span className="w-2.5 text-right font-bold text-slate-700">{stars}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                            <div className="flex-grow h-2 bg-slate-200/80 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-gold-500 rounded-full transition-all duration-500" 
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-slate-400 text-[10px] font-bold">{pct.toFixed(0)}%</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Aspects list */}
                    <div className="shrink-0 space-y-3.5 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-200/60 pt-6 md:pt-0 md:pl-8 text-sm">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-1">Puntuación de ética</span>
                      <div className="space-y-2.5">
                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                            <span>Calidad Técnica</span>
                            <span>{avgTech.toFixed(1)} / 5</span>
                          </div>
                          <div className="w-36 h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-blue-900" style={{ width: `${(avgTech / 5) * 100}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                            <span>Puntualidad y Orden</span>
                            <span>{avgPunct.toFixed(1)} / 5</span>
                          </div>
                          <div className="w-36 h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600" style={{ width: `${(avgPunct / 5) * 100}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                            <span>Trato Respetuoso</span>
                            <span>{avgRespect.toFixed(1)} / 5</span>
                          </div>
                          <div className="w-36 h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-gold-500" style={{ width: `${(avgRespect / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Sorting & Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Comentarios de Vecinos ({totalReviews})</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">Ordenar por:</span>
                      <select 
                        className="rounded-lg border-slate-200 bg-white text-slate-700 font-bold text-xs py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                      >
                        <option value="recent">Más recientes</option>
                        <option value="highest">Mayor puntuación</option>
                        <option value="lowest">Menor puntuación</option>
                      </select>
                    </div>
                  </div>

                  {/* Review List */}
                  <div className="space-y-6 mb-10">
                    {sortedReviews.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-slate-500 italic text-sm">Aún no hay reseñas para este profesional. Sé el primero en dejar tu testimonio.</p>
                      </div>
                    ) : (
                      sortedReviews.map(rev => {
                        const firstLetter = rev.reviewerName ? rev.reviewerName.charAt(0).toUpperCase() : 'U';
                        // Map first letter to beautiful bg colors
                        const bgColors = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-indigo-600', 'bg-teal-600', 'bg-rose-600', 'bg-slate-700'];
                        const charCode = firstLetter.charCodeAt(0) || 0;
                        const colorClass = bgColors[charCode % bgColors.length];

                        return (
                          <div key={rev.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                            <div className="flex items-start gap-3.5 mb-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black shadow-xs ${colorClass}`}>
                                {firstLetter}
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-slate-900 text-sm">{rev.reviewerName}</span>
                                      <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                                        Vecino Verificado
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                                      {rev.createdAt?.seconds 
                                        ? new Date(rev.createdAt.seconds * 1000).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : 'Reciente'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg">
                                    <Star className="w-3.5 h-3.5 fill-brand-gold-500 text-brand-gold-500" />
                                    <span className="font-bold text-brand-gold-800 text-xs">{rev.overallScore.toFixed(1)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-slate-600 text-sm leading-relaxed pl-13">{rev.comment}</p>
                            
                            <div className="mt-3.5 ml-13 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <span className="bg-slate-100 px-2.5 py-1 rounded-full">Calidad Técnica: {rev.technicalScore}/5</span>
                              <span className="bg-slate-100 px-2.5 py-1 rounded-full">Puntualidad: {rev.punctualityScore}/5</span>
                              <span className="bg-slate-100 px-2.5 py-1 rounded-full">Trato: {rev.respectScore}/5</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              );
            })()}

            {/* Leave a review form */}
            <div className="bg-[#FCFDFE] p-6 rounded-2xl border border-slate-200">
              <h4 className="font-sans text-base font-bold text-slate-900 mb-1">Dejar una calificación de confianza</h4>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Su comentario certifica la ética laboral del miembro, sirviendo de respaldo relacional conforme al testimonio del Evangelio.
              </p>

              {!isActiveUser ? (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs leading-relaxed">
                  <span className="font-bold block mb-1">⏳ Validación en Proceso</span>
                  Tu cuenta se encuentra bajo revisión de la administración. Una vez activada, podrás dejar valoraciones y calificar los trabajos realizados.
                </div>
              ) : auth.currentUser ? (
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div className="flex flex-col divide-y divide-slate-100 border-t border-b border-slate-100">
                    <RatingStarsInput 
                      value={techScore} 
                      onChange={setTechScore} 
                      label="Excelencia Técnica" 
                    />
                    <RatingStarsInput 
                      value={punctScore} 
                      onChange={setPunctScore} 
                      label="Puntualidad / Orden" 
                    />
                    <RatingStarsInput 
                      value={respectScore} 
                      onChange={setRespectScore} 
                      label="Trato Respetuoso" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">Comentario de tu experiencia</label>
                    <textarea 
                      required 
                      className="w-full rounded-xl border-slate-300 text-sm bg-white p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner" 
                      rows={4} 
                      value={comment} 
                      onChange={e => setComment(e.target.value)} 
                      placeholder="Contá cómo fue la calidad del trabajo, la honestidad del presupuesto y el trato respetuoso recibido..."
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="px-8 py-3.5 bg-brand-blue-900 hover:bg-brand-blue-950 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg inline-flex items-center gap-2 border border-brand-blue-800"
                  >
                    <span>{submitting ? 'Publicando...' : 'Publicar Reseña'}</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-center">
                  <p className="text-sm text-slate-600 font-medium">Por favor, iniciá sesión para dejar una reseña del servicio.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Banner Customization Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-brand-blue-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-brand-blue-900" />
                Personalizar mi Banner de Perfil
              </h3>
              <button 
                onClick={() => setShowBannerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Banner Preview */}
            <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-r from-blue-700 to-blue-900 flex items-center justify-center">
              {tempBannerURL ? (
                <img 
                  src={tempBannerURL} 
                  alt="Previsualización" 
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-white/40 font-semibold text-xs tracking-wide">Banner por defecto (Degradé azul)</span>
              )}
              {tempBannerURL && (
                <button
                  type="button"
                  onClick={() => setTempBannerURL('')}
                  className="absolute bottom-2.5 right-2.5 bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-md cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Quitar Banner</span>
                </button>
              )}
            </div>

            {/* Edit Banner Fields */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="cursor-pointer bg-brand-blue-900 hover:bg-brand-blue-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs transition-all w-full sm:w-auto justify-center">
                  <Upload className="w-4 h-4" />
                  <span>Subir de dispositivo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          setSavingBanner(true);
                          const base64 = await compressAndResizeImage(file, 1200, 400, 0.7);
                          setTempBannerURL(base64);
                        } catch (err) {
                          alert("Error al comprimir la imagen.");
                        } finally {
                          setSavingBanner(false);
                        }
                      }
                    }} 
                  />
                </label>

                <div className="flex-grow w-full">
                  <input 
                    type="text" 
                    placeholder="O ingresá una URL de imagen externa..." 
                    className="w-full rounded-xl border-slate-300 text-xs py-2.5 px-4 bg-white focus:border-brand-blue-600 focus:ring-brand-blue-600"
                    value={tempBannerURL.startsWith('data:') ? '' : tempBannerURL}
                    onChange={(e) => setTempBannerURL(e.target.value)}
                  />
                </div>
              </div>

              {/* Preset collection */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">O elegí un banner temático de nuestra colección:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {PRESET_BANNERS.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setTempBannerURL(preset.url)}
                      className={`group flex flex-col gap-1 p-1 rounded-xl hover:bg-slate-50 border transition-all cursor-pointer text-left ${
                        tempBannerURL === preset.url ? 'border-brand-gold-500 bg-amber-50/10' : 'border-transparent bg-transparent'
                      }`}
                    >
                      <div className="h-10 w-full rounded-lg overflow-hidden relative bg-slate-100">
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[8px] font-bold text-slate-500 truncate px-0.5">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={savingBanner}
                onClick={handleSaveBanner}
                className="px-5 py-2.5 bg-brand-blue-900 hover:bg-brand-blue-950 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md border border-brand-blue-800"
              >
                {savingBanner ? 'Guardando...' : 'Guardar Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )}
</div>
);
}
