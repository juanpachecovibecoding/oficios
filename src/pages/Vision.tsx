import React from 'react';
import { Target, Compass, Award, Handshake, ShieldCheck, BookOpen } from 'lucide-react';

export function Vision() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 bg-[#FCFDFE]">
      
      {/* ─── SECCIÓN VISIÓN & MISIÓN ───────────────────────────────────────── */}
      <div className="text-center mb-20">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-blue-900 via-brand-blue-950 to-slate-900 border border-brand-gold-300/60 text-brand-gold-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
          <Target className="w-8 h-8 text-brand-gold-200" />
        </div>
        <span className="text-[10px] font-extrabold px-3 py-1 bg-brand-gold-50 text-brand-gold-700 border border-brand-gold-200 rounded-full uppercase tracking-widest mb-4 inline-block shadow-2xs">
          Propósito & Valores Comunitarios
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-blue-900 mb-6 leading-tight">
          Nuestra Visión y Misión
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Oficios Cristianos nace como un canal de respuesta y bendición para la Argentina. 
          Buscamos restaurar la confianza y la honra en las relaciones laborales mediante una plataforma transparente y basada en principios éticos.
        </p>
      </div>

      {/* Grid Misión y Visión */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {/* Misión Card */}
        <div className="bg-white rounded-3xl p-8 border border-brand-blue-100 shadow-md flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div>
            <div className="w-12 h-12 bg-brand-blue-50 text-brand-blue-900 rounded-xl flex items-center justify-center mb-6 border border-brand-blue-100">
              <Compass className="w-6 h-6 text-brand-blue-900" />
            </div>
            <span className="text-[10px] font-extrabold bg-brand-blue-50 text-brand-blue-700 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Nuestra Misión
            </span>
            <h2 className="text-2xl font-serif font-bold text-brand-blue-900 mt-3 mb-4">
              Conectar con Honra y Honestidad
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Conectar directamente a trabajadores y profesionales de oficios con familias y hogares en toda la Argentina, promoviendo el trabajo justo y sin comisiones abusivas.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Cada perfil cuenta con respaldo relacional y validación comunitaria, garantizando tranquilidad para quien contrata y dignidad para quien trabaja.
            </p>
          </div>
        </div>

        {/* Visión Card */}
        <div className="bg-white rounded-3xl p-8 border border-brand-gold-200/80 shadow-md flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold-50/60 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div>
            <div className="w-12 h-12 bg-brand-gold-50 text-brand-gold-700 rounded-xl flex items-center justify-center mb-6 border border-brand-gold-200">
              <Award className="w-6 h-6 text-brand-gold-700" />
            </div>
            <span className="text-[10px] font-extrabold bg-brand-gold-50 text-brand-gold-700 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Nuestra Visión
            </span>
            <h2 className="text-2xl font-serif font-bold text-brand-blue-900 mt-3 mb-4">
              Transformar la Cultura Laboral
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Ser la plataforma comunitaria de referencia en el país donde cada hogar encuentre paz al contratar un servicio, y donde cada profesional sea valorado y capacitado.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Acompañamos a los trabajadores con cursos de tecnología y equipamiento, acortando la brecha digital y multiplicando las oportunidades laborales.
            </p>
          </div>
        </div>
      </div>

      {/* Valores Pilares */}
      <div className="bg-[#FAF9F6] rounded-3xl p-8 md:p-12 border border-brand-gold-100 shadow-xs">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-serif font-bold text-brand-blue-900 mb-2">Nuestros Pilares Éticos</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Valores fundamentales que guían cada conexión y trabajo coordinado en la red</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <div className="w-10 h-10 bg-brand-blue-50 text-brand-blue-900 rounded-lg flex items-center justify-center mb-4 font-bold">
              <Handshake className="w-5 h-5 text-brand-blue-900" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Pacto Relacional</h4>
            <p className="text-xs text-slate-600 leading-relaxed">Trato directo, transparente y basado en el respeto mutuo entre el profesional y la familia.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <div className="w-10 h-10 bg-brand-gold-50 text-brand-gold-700 rounded-lg flex items-center justify-center mb-4 font-bold">
              <ShieldCheck className="w-5 h-5 text-brand-gold-700" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Validación Pastoral</h4>
            <p className="text-xs text-slate-600 leading-relaxed">Respaldo comunitario de líderes e iglesias locales para verificar el testimonio de cada integrante.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center mb-4 font-bold">
              <BookOpen className="w-5 h-5 text-emerald-700" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Capacitación Continua</h4>
            <p className="text-xs text-slate-600 leading-relaxed">Inclusión digital y cursos de tecnología para que los trabajadores potencien su oficio.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
