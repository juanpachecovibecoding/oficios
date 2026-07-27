import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { AutocompleteInput } from '../components/AutocompleteInput';
import { PlaceResult } from '../types';
import { Link } from 'react-router-dom';
import { 
  Edit3, 
  Save, 
  X, 
  Phone, 
  MapPin, 
  Briefcase, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  Building, 
  Compass, 
  Award,
  ArrowLeft,
  User,
  Users,
  Search,
  CheckSquare,
  Camera,
  Upload,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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

const OFICIOS = [
  'Electricidad', 'Plomería', 'Gasista Matriculado', 'Carpintería',
  'Pintura', 'Refrigeración', 'Costura', 'Jardinería', 'Albañilería',
  'Herrería', 'Limpieza', 'Cuidado de Ancianos', 'Niñera', 'Informática'
];

export function Dashboard() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [registrationRole, setRegistrationRole] = useState<'client' | 'professional' | null>(null);

  // Form states for NEW registration (both roles share very similar trust metrics)
  const [form, setForm] = useState({
    phone: '',
    specialty: OFICIOS[0],
    address: '',
    church: '',
    yearsLinked: 1,
    referenceName: '',
    referencePhone: '',
    agreedToEthics: false,
    hours: 'Lun a Vie 9 a 18hs',
    modality: 'A domicilio',
    coverageRadius: 5
  });
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '',
    specialty: OFICIOS[0],
    address: '',
    church: '',
    yearsLinked: 1,
    referenceName: '',
    referencePhone: '',
    hours: '',
    modality: 'A domicilio',
    coverageRadius: 5,
    photoURL: '',
    bannerURL: ''
  });
  const [editPlace, setEditPlace] = useState<PlaceResult | null>(null);

  // Antes y Después States
  const [baTitle, setBaTitle] = useState('');
  const [baBeforeURL, setBaBeforeURL] = useState('');
  const [baAfterURL, setBaAfterURL] = useState('');

  const handleAddBeforeAfter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baTitle.trim()) {
      alert("Por favor, ingresá el espacio o título (ej. Espacio: Patio).");
      return;
    }
    if (!baBeforeURL) {
      alert("Por favor, subí o ingresá la URL para la foto del Antes.");
      return;
    }
    if (!baAfterURL) {
      alert("Por favor, subí o ingresá la URL para la foto del Después.");
      return;
    }

    setLoading(true);
    try {
      const newProject = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        title: baTitle.trim(),
        beforeURL: baBeforeURL,
        afterURL: baAfterURL,
        createdAt: new Date().toISOString()
      };

      const currentProjects = userProfile?.beforeAfterProjects || [];
      await updateDoc(doc(db, 'users', currentUser.uid), {
        beforeAfterProjects: [...currentProjects, newProject]
      });

      setBaTitle('');
      setBaBeforeURL('');
      setBaAfterURL('');
      await refreshProfile();
      alert("¡Trabajo de Antes y Después añadido con éxito!");
    } catch (err) {
      console.error(err);
      alert("Error al guardar el trabajo de Antes y Después.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBeforeAfter = async (projectId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este trabajo de Antes y Después?")) return;
    setLoading(true);
    try {
      const currentProjects = userProfile?.beforeAfterProjects || [];
      const updatedProjects = currentProjects.filter((p: any) => p.id !== projectId);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        beforeAfterProjects: updatedProjects
      });
      await refreshProfile();
      alert("Proyecto de Antes y Después eliminado.");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el proyecto.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    if (userProfile) {
      setEditForm({
        phone: userProfile.phone || '',
        specialty: userProfile.specialty || OFICIOS[0],
        address: userProfile.address || '',
        church: userProfile.church || '',
        yearsLinked: userProfile.yearsLinked || 1,
        referenceName: userProfile.referenceName || '',
        referencePhone: userProfile.referencePhone || '',
        hours: userProfile.hours || '',
        modality: userProfile.modality || 'A domicilio',
        coverageRadius: userProfile.coverageRadius || 5,
        photoURL: userProfile.photoURL || currentUser.photoURL || '',
        bannerURL: userProfile.bannerURL || ''
      });
      setEditPlace(userProfile.lat && userProfile.lng ? {
        lat: userProfile.lat,
        lng: userProfile.lng,
        address: userProfile.address || ''
      } : null);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let lat = userProfile?.lat || 0;
      let lng = userProfile?.lng || 0;
      if (editPlace) {
        lat = editPlace.lat;
        lng = editPlace.lng;
      }

      await setDoc(doc(db, 'users', currentUser.uid), {
        ...userProfile,
        ...editForm,
        lat,
        lng,
        status: 'active'
      }, { merge: true });

      await refreshProfile();
      setIsEditing(false);
      alert("¡Perfil actualizado con éxito!");
    } catch (error) {
      console.error(error);
      alert("Error al guardar los cambios en el perfil.");
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent, role: 'client' | 'professional') => {
    e.preventDefault();
    if (!form.agreedToEthics) {
      alert("Debes aceptar el Código de Ética Laboral.");
      return;
    }
    setLoading(true);
    try {
      let lat = 0;
      let lng = 0;
      if (selectedPlace) {
        lat = selectedPlace.lat;
        lng = selectedPlace.lng;
      }

      const submissionData = role === 'professional' ? {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        role: 'professional',
        status: 'pending',
        ...form,
        lat,
        lng,
        rating: 0,
        reviewCount: 0,
        portfolio: []
      } : {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        role: 'client',
        status: 'pending',
        phone: form.phone,
        address: form.address,
        church: form.church,
        yearsLinked: form.yearsLinked,
        referenceName: form.referenceName,
        referencePhone: form.referencePhone,
        agreedToEthics: form.agreedToEthics,
        lat,
        lng
      };

      await setDoc(doc(db, 'users', currentUser.uid), submissionData);
      await refreshProfile();
    } catch (error) {
      console.error(error);
      alert("Error al enviar el formulario.");
    }
    setLoading(false);
  };

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-sans font-bold text-slate-800 mb-4">Iniciá sesión para acceder a tu panel</h2>
        <p className="text-slate-600">Por favor, utilizá el botón de la barra superior para ingresar con tu cuenta de Google.</p>
      </div>
    );
  }

  // PENDING STATUS VIEW
  if (userProfile?.status === 'pending') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-blue-600 font-bold text-xl">⏳</span>
          </div>
          <h2 className="text-2xl font-sans font-extrabold text-blue-950">Solicitud en revisión</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Gracias por registrarte como <strong>{userProfile.role === 'professional' ? 'Profesional' : 'Cliente'}</strong>.
            Tu cuenta está siendo validada por un administrador para garantizar la máxima confianza en la comunidad de Oficios Cristianos Argentina. 
          </p>
          <p className="text-xs text-slate-400 italic">
            Pacto relacional basado en el Logos y la honestidad mutua.
          </p>
        </div>
      </div>
    );
  }

  // ACTIVE REJECTED STATUS VIEW
  if (userProfile?.status === 'rejected') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 rounded-2xl p-8 border border-red-100 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-red-600 font-bold text-xl">❌</span>
          </div>
          <h2 className="text-2xl font-sans font-extrabold text-red-950">Solicitud rechazada o desactivada</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Lo sentimos, tu solicitud de ingreso no pudo ser validada o ha sido desactivada por la administración. Para consultas, contacta a soporte.
          </p>
        </div>
      </div>
    );
  }

  // ACTIVE DASHBOARD VIEW (both Professional and Client)
  if (userProfile?.status === 'active') {
    const isProfessional = userProfile.role === 'professional';

    if (isEditing) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-12 bg-[#FCFDFE]">
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 text-slate-600 hover:text-brand-blue-900 font-bold text-sm cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Panel</span>
            </button>
            <span className="text-[10px] font-bold px-3 py-1 bg-brand-gold-50 text-brand-gold-700 border border-brand-gold-100 rounded-full uppercase tracking-widest">
              Modo Edición
            </span>
          </div>

          <h2 className="text-3xl font-serif font-bold text-brand-blue-900 mb-2">
            Editar mi Perfil {isProfessional ? 'Profesional' : 'Cliente'}
          </h2>
          <p className="text-slate-500 mb-8 text-sm">Actualice sus datos personales y de validación pastoral para mantener su perfil activo en la comunidad.</p>

          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
            {/* Foto de Perfil Editor */}
            <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-brand-gold-100/60 space-y-4 shadow-xs">
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Configuración de Foto de Perfil</span>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <img 
                    src={editForm.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=60&w=150'} 
                    alt="Previsualización" 
                    className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-sm bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-grow space-y-3.5 w-full">
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer bg-brand-blue-900 hover:bg-brand-blue-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir foto desde dispositivo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setLoading(true);
                              const base64 = await compressAndResizeImage(file, 300, 300, 0.7);
                              setEditForm({ ...editForm, photoURL: base64 });
                            } catch (err) {
                              alert("Error al comprimir la imagen.");
                            } finally {
                              setLoading(false);
                            }
                          }
                        }} 
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">O ingresar enlace de imagen externa:</label>
                    <input 
                      type="text" 
                      className="w-full rounded-xl border-slate-300 text-xs py-2 px-3 bg-white focus:border-brand-blue-600 focus:ring-brand-blue-600" 
                      value={editForm.photoURL.startsWith('data:') ? '' : editForm.photoURL}
                      onChange={(e) => setEditForm({ ...editForm, photoURL: e.target.value })}
                      placeholder="https://ejemplo.com/mi-foto-profesional.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Predefined Avatars Based on Trades / Genders */}
              <div className="space-y-2 pt-3 border-t border-slate-200/60">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">O elegí un avatar temático de confianza:</span>
                <div className="flex gap-2.5 overflow-x-auto py-1.5 scrollbar-none">
                  {[
                    { name: 'Electricidad', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=60&w=150' },
                    { name: 'Plomería / Gas', url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=60&w=150' },
                    { name: 'Carpintería', url: 'https://images.unsplash.com/photo-1452830978618-d6feae7d0ffa?auto=format&fit=crop&q=60&w=150' },
                    { name: 'Costura', url: 'https://images.unsplash.com/photo-1528570188406-29a016344615?auto=format&fit=crop&q=60&w=150' },
                    { name: 'Pintura / Albañil', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=60&w=150' },
                    { name: 'Soporte Técnico', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=60&w=150' },
                    { name: 'Profesional M', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=60&w=150' },
                    { name: 'Profesional F', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=60&w=150' },
                  ].map((av, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setEditForm({ ...editForm, photoURL: av.url })}
                      className={`shrink-0 flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-white border transition-all cursor-pointer ${
                        editForm.photoURL === av.url ? 'border-brand-gold-500 bg-white shadow-xs' : 'border-transparent bg-transparent'
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-11 h-11 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <span className="text-[8px] font-bold text-slate-500 whitespace-nowrap">{av.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Banner de Perfil Editor */}
            <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-brand-gold-100/60 space-y-4 shadow-xs">
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Configuración de Banner de Perfil</span>
              
              {/* Preview of current banner */}
              <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-gradient-to-r from-brand-blue-800 to-brand-blue-950 flex items-center justify-center">
                {editForm.bannerURL ? (
                  <img 
                    src={editForm.bannerURL} 
                    alt="Previsualización de Banner" 
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-white/40 font-semibold text-xs tracking-wide">Banner por defecto (Degradé azul)</span>
                )}
                {editForm.bannerURL && (
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, bannerURL: '' })}
                    className="absolute bottom-2.5 right-2.5 bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-md cursor-pointer"
                    title="Restablecer a degradé por defecto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Quitar Banner</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                <div className="flex-grow space-y-3.5 w-full">
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer bg-brand-blue-900 hover:bg-brand-blue-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir banner desde dispositivo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setLoading(true);
                              const base64 = await compressAndResizeImage(file, 1200, 400, 0.7);
                              setEditForm({ ...editForm, bannerURL: base64 });
                            } catch (err) {
                              alert("Error al comprimir el banner.");
                            } finally {
                              setLoading(false);
                            }
                          }
                        }} 
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">O ingresar enlace de imagen externa:</label>
                    <input 
                      type="text" 
                      className="w-full rounded-xl border-slate-300 text-xs py-2 px-3 bg-white focus:border-brand-blue-600 focus:ring-brand-blue-600" 
                      value={editForm.bannerURL.startsWith('data:') ? '' : editForm.bannerURL}
                      onChange={(e) => setEditForm({ ...editForm, bannerURL: e.target.value })}
                      placeholder="https://ejemplo.com/mi-banner-profesional.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Predefined Banner Presets */}
              <div className="space-y-2 pt-3 border-t border-slate-200/60">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">O elegí un banner temático de nuestra colección:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 py-1.5">
                  {[
                    { name: 'Carpintería', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=60&w=600' },
                    { name: 'Herramientas', url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=60&w=600' },
                    { name: 'Plomería', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=60&w=600' },
                    { name: 'Electricidad', url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=60&w=600' },
                    { name: 'Jardinería', url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=60&w=600' },
                    { name: 'Costura', url: 'https://images.unsplash.com/photo-1517524006037-e89721430781?auto=format&fit=crop&q=60&w=600' },
                    { name: 'Pintura', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=60&w=600' },
                    { name: 'Fe / Cruz', url: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&q=60&w=600' },
                    { name: 'Geométrico Azul', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=600' },
                  ].map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setEditForm({ ...editForm, bannerURL: preset.url })}
                      className={`group flex flex-col gap-1 p-1 rounded-xl hover:bg-white border transition-all cursor-pointer text-left ${
                        editForm.bannerURL === preset.url ? 'border-brand-gold-500 bg-white shadow-xs' : 'border-transparent bg-transparent'
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isProfessional && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Especialidad principal</label>
                  <select
                    className="w-full rounded-lg border-slate-300 shadow-xs focus:border-brand-blue-600 focus:ring-brand-blue-600 text-sm bg-white py-2 px-3"
                    value={editForm.specialty}
                    onChange={e => setEditForm({...editForm, specialty: e.target.value})}
                  >
                    {OFICIOS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Teléfono (WhatsApp)</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-brand-blue-600 focus:ring-brand-blue-600 text-sm py-2 px-3"
                  value={editForm.phone}
                  onChange={e => setEditForm({...editForm, phone: e.target.value})}
                  placeholder="Ej: +5491123456789"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Dirección o zona de residencia</label>
                <AutocompleteInput
                  value={editForm.address}
                  onChange={(val) => setEditForm({...editForm, address: val})}
                  onPlaceSelect={setEditPlace}
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-brand-blue-600 focus:ring-brand-blue-600 text-sm py-2 px-3 bg-white"
                  placeholder="Ingresa tu dirección o zona (Ej: Palermo, Buenos Aires)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Iglesia / Comunidad de pertenencia</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-brand-blue-600 focus:ring-brand-blue-600 text-sm py-2 px-3"
                  value={editForm.church}
                  onChange={e => setEditForm({...editForm, church: e.target.value})}
                  placeholder="Nombre de la iglesia o comunidad"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Años de vinculación a la misma</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-brand-blue-600 focus:ring-brand-blue-600 text-sm py-2 px-3"
                  value={editForm.yearsLinked}
                  onChange={e => setEditForm({...editForm, yearsLinked: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Nombre del Pastor / Referente</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-brand-blue-600 focus:ring-brand-blue-600 text-sm py-2 px-3"
                  value={editForm.referenceName}
                  onChange={e => setEditForm({...editForm, referenceName: e.target.value})}
                  placeholder="Nombre de tu referente espiritual"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Teléfono del Referente</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-brand-blue-600 focus:ring-brand-blue-600 text-sm py-2 px-3"
                  value={editForm.referencePhone}
                  onChange={e => setEditForm({...editForm, referencePhone: e.target.value})}
                  placeholder="Teléfono para validación de confianza"
                />
              </div>
              {isProfessional && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Horarios de atención</label>
                    <input
                      type="text"
                      placeholder="Ej: Lun a Vie 9 a 18hs"
                      required
                      className="w-full rounded-lg border-slate-300 shadow-xs focus:border-brand-blue-600 focus:ring-brand-blue-600 text-sm py-2 px-3"
                      value={editForm.hours}
                      onChange={e => setEditForm({...editForm, hours: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Modalidad de Servicio</label>
                    <select
                      className="w-full rounded-lg border-slate-300 shadow-xs focus:border-brand-blue-600 focus:ring-brand-blue-600 text-sm bg-white py-2 px-3"
                      value={editForm.modality}
                      onChange={e => setEditForm({...editForm, modality: e.target.value})}
                    >
                      <option value="A domicilio">A domicilio</option>
                      <option value="Taller propio">Taller propio</option>
                      <option value="Ambos">Ambos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Radio de cobertura (km)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full rounded-lg border-slate-300 shadow-xs focus:border-brand-blue-600 focus:ring-brand-blue-600 text-sm py-2 px-3"
                      value={editForm.coverageRadius}
                      onChange={e => setEditForm({...editForm, coverageRadius: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-brand-blue-900 hover:bg-brand-blue-950 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-brand-blue-700"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-12 bg-[#FCFDFE]">
        {/* Upper Header info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-brand-blue-50 text-brand-blue-700 border border-brand-blue-100 rounded-full uppercase tracking-wider inline-block mb-3">
              Área de Miembro
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-blue-900">
              Mi Panel de {isProfessional ? 'Profesional' : 'Cliente'}
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              {isProfessional 
                ? 'Gestione su visibilidad, datos de contacto y pertenencia pastoral.'
                : 'Gestione su información de contacto y explore profesionales de confianza.'}
            </p>
          </div>
          <div>
            <button
              onClick={startEditing}
              className="px-5 py-3 bg-brand-blue-900 hover:bg-brand-blue-950 text-white hover:text-[#FAF9F6] border border-brand-blue-800 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer uppercase tracking-wider flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4 text-brand-gold-200" />
              Editar Perfil
            </button>
          </div>
        </div>

        {/* Dashboard overview grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main profile card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-blue-900 via-brand-gold-500 to-brand-blue-900" />
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-100">
                <img 
                  src={userProfile.photoURL || currentUser.photoURL || ''} 
                  alt="Perfil" 
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm" 
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-2xl font-serif font-bold text-brand-blue-900">{userProfile.displayName}</h3>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 fill-emerald-50" /> ✓ Activo
                    </span>
                  </div>
                  <p className="text-brand-gold-600 font-bold text-sm uppercase tracking-widest flex items-center gap-1.5 mt-1">
                    <User className="w-4 h-4 text-brand-gold-500" />
                    {isProfessional ? `Oficio: ${userProfile.specialty}` : 'Rol: Cliente Contratante'}
                  </p>
                </div>
              </div>

              {/* Attributes grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-sm">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Teléfono (WhatsApp)</span>
                    <span className="font-medium text-slate-800">{userProfile.phone || 'No especificado'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-brand-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Iglesia de pertenencia</span>
                    <span className="font-medium text-slate-800">{userProfile.church}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">Vínculo: {userProfile.yearsLinked} años</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Ubicación principal</span>
                    <span className="font-medium text-slate-800">{userProfile.address}</span>
                  </div>
                </div>

                {isProfessional ? (
                  <div className="flex items-start gap-3">
                    <Compass className="w-5 h-5 text-brand-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Modalidad y Cobertura</span>
                      <span className="font-medium text-slate-800">{userProfile.modality || 'A domicilio'}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">Radio de servicio: {userProfile.coverageRadius} km</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-brand-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Referencia de Confianza</span>
                      <span className="font-medium text-slate-800">{userProfile.referenceName}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">Pastor / Líder</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Spiritual Validation / Trust reference */}
            <div className="bg-brand-gold-50/50 rounded-2xl border border-brand-gold-100 p-6">
              <div className="flex gap-4">
                <Award className="w-8 h-8 text-brand-gold-600 shrink-0" />
                <div>
                  <h4 className="font-serif font-bold text-brand-blue-900 text-base mb-1">Referente Espiritual Validado</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Su perfil cuenta con la validación comunitaria activa a través de su referente o pastor, asegurando un trato ético y de mutuo respeto.
                  </p>
                  <div className="text-xs font-semibold text-brand-gold-800 bg-brand-gold-100/60 px-3 py-2 rounded-lg border border-brand-gold-200/50 inline-block">
                    Pastor / Líder: <span className="font-bold text-brand-blue-900">{userProfile.referenceName}</span> • Cel: <span className="text-brand-blue-900">{userProfile.referencePhone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Gallery Manager (For Professionals only) */}
            {isProfessional && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-xl text-brand-blue-900 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-brand-blue-900" />
                    Mi Galería de Trabajos
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Añadí imágenes reales de tus reparaciones, obras o servicios para inspirar confianza y profesionalismo en la comunidad.
                  </p>
                </div>

                {/* Grid of existing portfolio images */}
                {userProfile.portfolio && userProfile.portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {userProfile.portfolio.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="group relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
                        <img 
                          src={imgUrl} 
                          alt={`Trabajo ${idx + 1}`} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {/* Delete overlay */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm("¿Estás seguro de que deseas eliminar esta imagen de tu galería?")) {
                                try {
                                  const updatedPortfolio = userProfile.portfolio.filter((url: string, i: number) => i !== idx);
                                  await updateDoc(doc(db, 'users', currentUser.uid), {
                                    portfolio: updatedPortfolio
                                  });
                                  await refreshProfile();
                                } catch (err) {
                                  alert("Error al eliminar la imagen.");
                                }
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md hover:scale-110 transition-all cursor-pointer"
                            title="Eliminar imagen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-500 text-xs italic">Aún no tenés imágenes en tu galería. ¡Comenzá subiendo fotos de tus mejores trabajos!</p>
                  </div>
                )}

                {/* Upload or Add image form */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-auto">
                    <label className="cursor-pointer bg-brand-blue-900 hover:bg-brand-blue-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir foto de trabajo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setLoading(true);
                              const base64 = await compressAndResizeImage(file, 800, 600, 0.7);
                              const currentPortfolio = userProfile.portfolio || [];
                              await updateDoc(doc(db, 'users', currentUser.uid), {
                                portfolio: [...currentPortfolio, base64]
                              });
                              await refreshProfile();
                              alert("¡Imagen subida con éxito!");
                            } catch (err) {
                              console.error(err);
                              alert("Error al procesar o subir la imagen.");
                            } finally {
                              setLoading(false);
                            }
                          }
                        }} 
                      />
                    </label>
                  </div>
                  
                  <div className="flex-grow w-full">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="O pegá una URL de imagen externa..." 
                        className="w-full rounded-xl border-slate-300 text-xs py-2 px-3 pr-24 bg-white focus:border-brand-blue-600 focus:ring-brand-blue-600"
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              try {
                                setLoading(true);
                                const currentPortfolio = userProfile.portfolio || [];
                                await updateDoc(doc(db, 'users', currentUser.uid), {
                                  portfolio: [...currentPortfolio, val]
                                });
                                (e.target as HTMLInputElement).value = '';
                                await refreshProfile();
                                alert("¡Imagen añadida con éxito!");
                              } catch (err) {
                                alert("Error al guardar la URL.");
                              } finally {
                                setLoading(false);
                              }
                            }
                          }
                        }}
                      />
                      <span className="absolute right-3 top-2.5 text-[8px] font-bold text-slate-400 uppercase">ENTER para añadir</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Antes y Después Project Manager (For Professionals only) */}
            {isProfessional && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-xl text-brand-blue-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-blue-900" />
                    Mis Trabajos de "Antes y Después"
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Mostrá el impacto real de tu trabajo subiendo fotos comparativas de tus renovaciones y reparaciones.
                  </p>
                </div>

                {/* List of existing Before & After projects */}
                {userProfile.beforeAfterProjects && userProfile.beforeAfterProjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {userProfile.beforeAfterProjects.map((project: any) => (
                      <div key={project.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() => handleDeleteBeforeAfter(project.id)}
                          className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl text-xs transition-all shadow-md z-10 cursor-pointer"
                          title="Eliminar este proyecto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center justify-between pr-8">
                          <h4 className="font-sans font-bold text-sm text-brand-blue-950 truncate">{project.title}</h4>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString('es-AR') : ''}
                          </span>
                        </div>

                        {/* Side by side preview */}
                        <div className="grid grid-cols-2 gap-2 relative">
                          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={project.beforeURL} alt="Antes" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md tracking-wider">Antes</span>
                          </div>
                          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={project.afterURL} alt="Después" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <span className="absolute bottom-1.5 left-1.5 bg-brand-gold-600 text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md tracking-wider">Después</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-500 text-xs italic">Aún no tenés proyectos de "Antes y Después". ¡Cargá el primero abajo!</p>
                  </div>
                )}

                {/* Form to add a new project */}
                <form onSubmit={handleAddBeforeAfter} className="p-6 bg-[#FAF9F6] rounded-2xl border border-brand-gold-100/60 space-y-5">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Nuevo Proyecto "Antes y Después"</span>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Espacio o Título del Trabajo:</label>
                    <input 
                      type="text" 
                      value={baTitle}
                      onChange={(e) => setBaTitle(e.target.value)}
                      placeholder="Ej: Espacio: Patio Trasero, Renovación de Baño, Pulido de Madera" 
                      className="w-full rounded-xl border-slate-300 text-xs py-2.5 px-4 bg-white focus:border-brand-blue-600 focus:ring-brand-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before Image Box */}
                    <div className="space-y-3">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Foto del ANTES</span>
                      
                      {/* Before Preview */}
                      <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                        {baBeforeURL ? (
                          <>
                            <img src={baBeforeURL} alt="Antes" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => setBaBeforeURL('')}
                              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg transition-all shadow-md cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">Sin foto del Antes</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-3 rounded-xl text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5 transition-all w-full justify-center">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir foto de Antes</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  setLoading(true);
                                  const base64 = await compressAndResizeImage(file, 800, 600, 0.7);
                                  setBaBeforeURL(base64);
                                } catch (err) {
                                  alert("Error al comprimir la imagen.");
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }} 
                          />
                        </label>
                        <input 
                          type="text" 
                          placeholder="O pegá URL de imagen..." 
                          value={baBeforeURL.startsWith('data:') ? '' : baBeforeURL}
                          onChange={(e) => setBaBeforeURL(e.target.value)}
                          className="w-full rounded-xl border-slate-300 text-[11px] py-1.5 px-3 bg-white focus:border-brand-blue-600 focus:ring-brand-blue-600"
                        />
                      </div>
                    </div>

                    {/* After Image Box */}
                    <div className="space-y-3">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Foto del DESPUÉS</span>
                      
                      {/* After Preview */}
                      <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                        {baAfterURL ? (
                          <>
                            <img src={baAfterURL} alt="Después" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => setBaAfterURL('')}
                              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg transition-all shadow-md cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">Sin foto del Después</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-3 rounded-xl text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5 transition-all w-full justify-center">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir foto de Después</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  setLoading(true);
                                  const base64 = await compressAndResizeImage(file, 800, 600, 0.7);
                                  setBaAfterURL(base64);
                                } catch (err) {
                                  alert("Error al comprimir la imagen.");
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }} 
                          />
                        </label>
                        <input 
                          type="text" 
                          placeholder="O pegá URL de imagen..." 
                          value={baAfterURL.startsWith('data:') ? '' : baAfterURL}
                          onChange={(e) => setBaAfterURL(e.target.value)}
                          className="w-full rounded-xl border-slate-300 text-[11px] py-1.5 px-3 bg-white focus:border-brand-blue-600 focus:ring-brand-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-brand-blue-900 hover:bg-brand-blue-950 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer border border-brand-blue-800"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Guardar Proyecto de Antes y Después</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Visibility sidebar information */}
          <div className="space-y-6">
            <div className="bg-brand-blue-950 rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(184,156,109,0.12),transparent_40%)]" />
              
              <div className="relative z-10">
                <div className="w-10 h-10 bg-brand-gold-500 rounded-lg flex items-center justify-center mb-4 border border-brand-gold-200">
                  <Sparkles className="w-5 h-5 text-brand-blue-950 fill-brand-gold-100" />
                </div>
                {isProfessional ? (
                  <>
                    <h4 className="font-serif font-bold text-lg text-[#FAF9F6] mb-2">Visibilidad en el Mapa</h4>
                    <p className="text-xs text-brand-blue-100 leading-relaxed mb-4">
                      Su cuenta está actualmente **activa y visible** en el mapa de cercanía para todos los vecinos de la zona.
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Cualquier consulta o solicitud de presupuesto le llegará directamente a su número de WhatsApp sin intermediarios ni costos de comisión.
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="font-serif font-bold text-lg text-[#FAF9F6] mb-2">Buscar Oficios Cristianos</h4>
                    <p className="text-xs text-brand-blue-100 leading-relaxed mb-4">
                      Ya puedes navegar por el mapa e interactuar con total seguridad, sabiendo que cada prestador cuenta con respaldo ético e iglesia vinculada.
                    </p>
                    <Link
                      to="/map"
                      className="inline-flex w-full items-center justify-center gap-1.5 bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-blue-950 font-bold px-4 py-3 rounded-xl text-xs transition-all uppercase tracking-wider"
                    >
                      <Search className="w-4 h-4" />
                      <span>Ir al Mapa de Cercanía</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {isProfessional && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Puntuación de Confianza</span>
                <div className="text-4xl font-serif font-bold text-brand-blue-900 mb-1">
                  {userProfile.rating ? `${userProfile.rating.toFixed(1)}` : '5.0'}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Basado en la ética, puntualidad y honestidad.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // PROFILE NOT COMPLETED YET -> ROLE SELECTION LAYOUT
  if (registrationRole === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full uppercase tracking-wider mb-2 inline-block border border-blue-100">
          Registro de Miembro
        </span>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-blue-900 mb-2">
          Bienvenido a Oficios Cristianos Argentina
        </h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto mb-12">
          Para comenzar a interactuar en la comunidad, por favor completa tu perfil seleccionando tu rol principal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* OPTION A: CLIENT */}
          <button
            onClick={() => setRegistrationRole('client')}
            className="group flex flex-col items-center bg-white border border-slate-200 rounded-2xl p-8 hover:border-brand-gold-400 hover:shadow-xl transition-all duration-300 text-center cursor-pointer relative"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600 rounded-t-2xl opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 group-hover:scale-105 transition-transform duration-300 shadow-xs">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-blue-900 mb-2 font-serif">Quiero ser Cliente</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Busca plomeros, electricistas, pintores, gasistas y más con total confianza. Visualiza perfiles validados con respaldo de pastores comunitarios.
            </p>
            <span className="mt-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider group-hover:shadow-md transition-all">
              Completar Perfil de Cliente
            </span>
          </button>

          {/* OPTION B: PROFESSIONAL */}
          <button
            onClick={() => setRegistrationRole('professional')}
            className="group flex flex-col items-center bg-white border border-slate-200 rounded-2xl p-8 hover:border-brand-gold-400 hover:shadow-xl transition-all duration-300 text-center cursor-pointer relative"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600 rounded-t-2xl opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 group-hover:scale-105 transition-transform duration-300 shadow-xs">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-blue-900 mb-2 font-serif">Quiero ser Profesional</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Publica tu oficio, sé visible en el mapa de cercanía para los vecinos y recibe solicitudes directas de trabajo sin pagar ninguna comisión.
            </p>
            <span className="mt-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider group-hover:shadow-md transition-all">
              Completar Perfil de Profesional
            </span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 italic mt-12 max-w-xs mx-auto">
          Cada cuenta ingresada requiere validación de confianza mediante contacto con su referente espiritual.
        </p>
      </div>
    );
  }

  // ACTIVE REGISTRATION FORM (renders Client or Professional form depending on selection)
  const isProfessionalForm = registrationRole === 'professional';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={() => setRegistrationRole(null)}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-blue-900 font-bold text-xs cursor-pointer mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Elegir otro rol de ingreso</span>
      </button>

      <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full uppercase tracking-wider mb-2 inline-block border border-blue-100">
        Comunidad Oficios Cristianos
      </span>
      <h2 className="text-3xl font-serif font-bold text-brand-blue-900 mb-1">
        Únete como {isProfessionalForm ? 'Profesional de Servicio' : 'Cliente Registrado'}
      </h2>
      <p className="text-slate-500 mb-8 text-sm">
        {isProfessionalForm 
          ? 'Complete sus datos profesionales y de pertenencia comunitaria para aparecer en el mapa.'
          : 'Complete sus datos de contacto y de pertenencia para interactuar y contratar de manera confiable.'}
      </p>

      <form 
        onSubmit={(e) => handleRegisterSubmit(e, registrationRole)} 
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isProfessionalForm && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Especialidad principal</label>
              <select
                className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                value={form.specialty}
                onChange={e => setForm({...form, specialty: e.target.value})}
              >
                {OFICIOS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Teléfono (WhatsApp)</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})}
              placeholder="Ej: +5491123456789"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              {isProfessionalForm ? 'Ubicación de cobertura o dirección aproximada' : 'Dirección o zona aproximada de residencia'}
            </label>
            <AutocompleteInput
              value={form.address}
              onChange={(val) => setForm({...form, address: val})}
              onPlaceSelect={setSelectedPlace}
              className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white"
              placeholder="Ingresa tu dirección o zona (Ej: Palermo, Buenos Aires)"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Iglesia / Comunidad de pertenencia</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={form.church}
              onChange={e => setForm({...form, church: e.target.value})}
              placeholder="Nombre de la iglesia o comunidad"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Años de vinculación a la misma</label>
            <input
              type="number"
              min="0"
              required
              className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={form.yearsLinked}
              onChange={e => setForm({...form, yearsLinked: parseInt(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nombre del Pastor / Referente</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={form.referenceName}
              onChange={e => setForm({...form, referenceName: e.target.value})}
              placeholder="Nombre de tu referente espiritual"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Teléfono del Referente</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={form.referencePhone}
              onChange={e => setForm({...form, referencePhone: e.target.value})}
              placeholder="Teléfono para validación de confianza"
            />
          </div>
          {isProfessionalForm && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Horarios de atención</label>
                <input
                  type="text"
                  placeholder="Ej: Lun a Vie 9 a 18hs"
                  required
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm"
                  value={form.hours}
                  onChange={e => setForm({...form, hours: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Modalidad de Servicio</label>
                <select
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                  value={form.modality}
                  onChange={e => setForm({...form, modality: e.target.value})}
                >
                  <option value="A domicilio">A domicilio</option>
                  <option value="Taller propio">Taller propio</option>
                  <option value="Ambos">Ambos</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Radio de cobertura (km)</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm"
                  value={form.coverageRadius}
                  onChange={e => setForm({...form, coverageRadius: parseInt(e.target.value) || 0})}
                />
              </div>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={form.agreedToEthics}
              onChange={e => setForm({...form, agreedToEthics: e.target.checked})}
            />
            <span className="text-sm text-slate-600 leading-relaxed">
              Declaro que conozco y acepto el <strong>Código de Ética Laboral y Trato Justo</strong> de Oficios Cristianos, comprometiéndome a brindar un servicio excelente, honesto y respetuoso conforme a los valores del Logos y el amor comunitario.
            </span>
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue-900 hover:bg-brand-blue-950 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer text-xs uppercase tracking-widest border border-brand-blue-700"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud de Registro'}
          </button>
        </div>
      </form>
    </div>
  );
}
