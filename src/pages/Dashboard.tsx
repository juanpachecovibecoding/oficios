import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { AutocompleteInput } from '../components/AutocompleteInput';
import { PlaceResult } from '../types';

const OFICIOS = [
  'Electricidad', 'Plomería', 'Gasista Matriculado', 'Carpintería',
  'Pintura', 'Refrigeración', 'Costura', 'Jardinería', 'Albañilería',
  'Herrería', 'Limpieza', 'Cuidado de Ancianos', 'Niñera', 'Informática'
];

export function Dashboard() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    specialty: OFICIOS[0],
    address: '',
    church: '',
    yearsLinked: 1,
    referenceName: '',
    referencePhone: '',
    agreedToEthics: false,
    hours: '',
    modality: 'A domicilio',
    coverageRadius: 5
  });
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-sans font-bold text-slate-800 mb-4">Iniciá sesión para acceder a tu panel</h2>
        <p className="text-slate-600">Por favor, utilizá el botón de la barra superior para ingresar con tu cuenta de Google.</p>
      </div>
    );
  }

  if (userProfile?.status === 'pending') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100 shadow-xs max-w-xl mx-auto">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 font-bold text-xl">⏳</span>
          </div>
          <h2 className="text-2xl font-sans font-extrabold text-blue-950 mb-3">Solicitud en revisión</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Gracias por registrarte. Tu cuenta está siendo validada por un administrador para garantizar la máxima confianza en la comunidad de Oficios Cristianos Argentina. 
            Pronto un administrador activará tu cuenta.
          </p>
        </div>
      </div>
    );
  }

  if (userProfile?.status === 'active') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-sans font-extrabold text-slate-900 mb-6">Mi Panel de Profesional</h2>
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-6 mb-8 pb-6 border-b border-slate-100">
            <img src={userProfile.photoURL || currentUser.photoURL || ''} alt="Perfil" className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-xs" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-slate-900">{userProfile.displayName}</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">✓ Perfil Activo</span>
              </div>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">{userProfile.specialty}</p>
              <p className="text-xs text-slate-500 mt-1">{userProfile.church}</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Tu cuenta está actualmente **activa y visible** en el mapa de cercanía para todos los vecinos. Recibirás consultas directamente a tu número de WhatsApp. ¡Dios bendiga tu labor!
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

      await setDoc(doc(db, 'users', currentUser.uid), {
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
      });
      await refreshProfile();
    } catch (error) {
      console.error(error);
      alert("Error al enviar el formulario.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full uppercase tracking-wider mb-2 inline-block">Oficios Cristianos</span>
      <h2 className="text-3xl font-sans font-extrabold text-slate-900 mb-1">Únete como Profesional</h2>
      <p className="text-slate-500 mb-8 text-sm">Completa tus datos de servicio y pertenencia para formar parte de la plataforma.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ubicación de cobertura o dirección aproximada</label>
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
              onChange={e => setForm({...form, yearsLinked: parseInt(e.target.value)})}
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
              onChange={e => setForm({...form, coverageRadius: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={form.agreedToEthics}
              onChange={e => setForm({...form, agreedToEthics: e.target.checked})}
            />
            <span className="text-sm text-slate-700 leading-relaxed">
              Declaro que conozco y acepto el <strong>Código de Ética Laboral y Trato Justo</strong> de Oficios Cristianos, comprometiéndome a brindar un servicio excelente, honesto y respetuoso conforme a los valores comunitarios.
            </span>
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer text-sm uppercase tracking-wider"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud de Registro'}
          </button>
        </div>
      </form>
    </div>
  );
}
