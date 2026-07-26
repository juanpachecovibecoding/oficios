import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { UserProfile, Review } from '../types';
import { ShieldCheck, MapPin, Clock, Truck, Home, Phone, Star, CheckCircle } from 'lucide-react';
import ReactBeforeSliderComponent from 'react-before-after-slider-component';
import 'react-before-after-slider-component/dist/build.css';

export function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const [pro, setPro] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [techScore, setTechScore] = useState(5);
  const [punctScore, setPunctScore] = useState(5);
  const [respectScore, setRespectScore] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
        <div className="h-32 md:h-48 bg-gradient-to-r from-blue-700 to-blue-900"></div>
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
            
            <a 
              href={`https://wa.me/${pro.phone?.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all md:mb-2 w-full md:w-auto"
            >
              <Phone className="w-5 h-5" />
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

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
                {pro.modality === 'Taller propio' ? <Home className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" /> : <Truck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />}
                <div>
                  <span className="block font-bold text-slate-900 text-xs uppercase tracking-wider">Modalidad</span>
                  <span className="text-slate-700 font-medium">{pro.modality}</span>
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
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-sans text-xl font-bold text-slate-900 mb-6">Trabajos Destacados</h3>
            
            {/* Mock images for the portfolio slider */}
            <div className="rounded-xl overflow-hidden shadow-inner bg-slate-50 border border-slate-200">
              <ReactBeforeSliderComponent
                firstImage={{
                  imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800", // "Before" plumbing/mess
                  alt: "Antes"
                }}
                secondImage={{
                  imageUrl: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=800", // "After" clean plumbing
                  alt: "Después"
                }}
              />
            </div>
            <p className="text-center text-xs text-slate-500 mt-3 italic">Deslizá para ver la transformación del trabajo</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-sans text-xl font-bold text-slate-900">Reseñas de la Comunidad</h3>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                <Star className="w-5 h-5 fill-blue-600 text-blue-600" />
                <span className="text-xl font-bold text-blue-700">{pro.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-xs text-blue-600 font-bold">({pro.reviewCount || 0})</span>
              </div>
            </div>

            {/* Review List */}
            <div className="space-y-6 mb-8">
              {reviews.length === 0 ? (
                <p className="text-slate-500 italic text-sm">Aún no hay reseñas para este profesional.</p>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-900 text-sm">{rev.reviewerName}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-700 text-sm">{rev.overallScore.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{rev.comment}</p>
                    
                    <div className="mt-3 flex gap-4 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                      <span>Técnica: {rev.technicalScore}/5</span>
                      <span>Puntualidad: {rev.punctualityScore}/5</span>
                      <span>Trato: {rev.respectScore}/5</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Leave a review form */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Dejar una calificación de confianza</h4>
              {auth.currentUser ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Excelencia Técnica</label>
                      <select required className="w-full rounded-lg border-slate-300 text-sm bg-white" value={techScore} onChange={e => setTechScore(parseInt(e.target.value))}>
                        {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} {v === 5 ? 'Excelente' : v === 1 ? 'Malo' : ''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Puntualidad / Orden</label>
                      <select required className="w-full rounded-lg border-slate-300 text-sm bg-white" value={punctScore} onChange={e => setPunctScore(parseInt(e.target.value))}>
                        {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} {v === 5 ? 'Excelente' : v === 1 ? 'Malo' : ''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Trato Respetuoso</label>
                      <select required className="w-full rounded-lg border-slate-300 text-sm bg-white" value={respectScore} onChange={e => setRespectScore(parseInt(e.target.value))}>
                        {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} {v === 5 ? 'Excelente' : v === 1 ? 'Malo' : ''}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Comentario de tu experiencia</label>
                    <textarea required className="w-full rounded-lg border-slate-300 text-sm bg-white p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Compartí detalles que ayuden a la comunidad..."></textarea>
                  </div>
                  <button type="submit" disabled={submitting} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer shadow-xs">
                    {submitting ? 'Publicando...' : 'Publicar Reseña'}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-slate-600">Por favor, iniciá sesión para dejar una reseña del servicio.</p>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
