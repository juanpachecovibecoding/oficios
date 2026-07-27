import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  Smartphone, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Laptop, 
  Rocket, 
  MessageSquare, 
  Calendar, 
  BadgeCheck, 
  CheckCircle2,
  Building2,
  ChevronRight,
  X,
  MapPin
} from 'lucide-react';

export function Trainings() {
  const [modalType, setModalType] = useState<'student' | 'church' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    churchOrTrade: '',
    city: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setModalType(null);
      setFormData({ name: '', phone: '', email: '', churchOrTrade: '', city: '', notes: '' });
    }, 2500);
  };

  const courses = [
    {
      id: 'ai-trades',
      tag: 'Taller Estrella',
      tagBg: 'bg-amber-100 text-amber-800 border-amber-200',
      title: 'IA Aplicada a Oficios & Presupuestos',
      icon: Bot,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      description: 'Aprende a usar asistentes de Inteligencia Artificial para redactar presupuestos profesionales en segundos, armar textos para tus redes sociales y comunicarte mejor con tus clientes.',
      topics: [
        'Cotizaciones automáticas y detalladas con IA',
        'Respuestas cordiales y rápidas por WhatsApp',
        'Generación de imágenes e historias para promocionar tus trabajos',
        'Buenas prácticas y uso ético de la tecnología'
      ],
      duration: '4 clases (Presencial u Online)',
      target: 'Electricistas, Plomeros, Carpinteros, Pintores y Oficios varios'
    },
    {
      id: 'digital-biz',
      tag: 'Inclusión Digital',
      tagBg: 'bg-brand-blue-100 text-brand-blue-800 border-brand-blue-200',
      title: 'Alfabetización Digital & Herramientas de Trabajo',
      icon: Smartphone,
      iconBg: 'bg-brand-blue-50 text-brand-blue-700 border-brand-blue-200',
      description: 'Capacitación práctica en el uso de herramientas indispensables: cobros digitales, almacenamiento en la nube, archivos PDF e identificación en mapas locales.',
      topics: [
        'Manejo seguro de Mercado Pago y transferencias',
        'Creación y envío de presupuestos en PDF',
        'Cómo figurar en Google Maps y redes comunitarias',
        'Seguridad digital y prevención de estafas'
      ],
      duration: '3 clases intensivas',
      target: 'Hermanos que se inician en la tecnología laboral'
    },
    {
      id: 'ethics-mgmt',
      tag: 'Gestión & Valores',
      tagBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: 'Gestión Financiera & Trato Justo',
      icon: BadgeCheck,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Formación en administración financiera básica del hogar/taller, fijación de precios justos y principios de honra en la atención comunitaria.',
      topics: [
        'Cálculo de costos reales de mano de obra y materiales',
        'Ahorro, reinversión en herramientas y fondos de reserva',
        'Código de Ética y Recomendación Pastoral',
        'Resolución de conflictos y excelencia en el servicio'
      ],
      duration: '2 jornadas de taller',
      target: 'Profesionales, emprendedores y líderes comunitarios'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 bg-[#FCFDFE]">
      
      {/* ─── HERO CAPACITACIONES ────────────────────────────────────────────── */}
      <div className="text-center mb-20">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-blue-900 via-brand-blue-950 to-slate-900 border border-brand-gold-300/70 text-brand-gold-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
          <GraduationCap className="w-8 h-8 text-brand-gold-200" />
        </div>
        <span className="text-[10px] font-extrabold px-3.5 py-1.5 bg-brand-gold-50 text-brand-gold-800 border border-brand-gold-200 rounded-full uppercase tracking-widest mb-4 inline-block shadow-2xs">
          Academia Digital Comunitarias
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-blue-900 mb-6 leading-tight">
          Capacitación & Tecnología para la Comunidad
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
          Acompañamos a iglesias locales y profesionales de oficios para que aprendan a utilizar herramientas tecnológicas de vanguardia e Inteligencia Artificial aplicada a su trabajo diario.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setModalType('student')}
            className="px-6 py-3.5 bg-brand-blue-900 hover:bg-brand-blue-950 text-brand-gold-100 font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 border border-brand-blue-800"
          >
            <Sparkles className="w-4 h-4 text-brand-gold-300" />
            Quiero Capacitarme
          </button>
          <button
            onClick={() => setModalType('church')}
            className="px-6 py-3.5 bg-white hover:bg-slate-50 text-brand-blue-900 font-bold rounded-xl text-xs uppercase tracking-wider border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-slate-600" />
            Llevar Talleres a mi Iglesia
          </button>
        </div>
      </div>

      {/* ─── BANNER DE ALIANZA CON IGLESIAS ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-brand-blue-950 via-brand-blue-900 to-slate-900 text-white rounded-3xl p-8 md:p-12 mb-20 shadow-xl border border-brand-blue-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-gold-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
          <div className="lg:col-span-2 space-y-4">
            <span className="text-[10px] font-extrabold px-3 py-1 bg-brand-gold-500/20 text-brand-gold-300 border border-brand-gold-500/30 rounded-full uppercase tracking-wider inline-block">
              Trabajo Conjunto con Pastores & Líderes
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#FAF9F6] leading-snug">
              Acompañamos a tu congregación en la inclusión tecnológica
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Coordinamos jornadas presenciales y talleres prácticos en iglesias locales. Brindamos a los hermanos las herramientas para potenciar sus emprendimientos, generar presupuestos profesionales y dominar la IA como una ventaja para su trabajo.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center">
            <div className="w-12 h-12 bg-brand-gold-400/20 text-brand-gold-300 rounded-xl flex items-center justify-center mx-auto mb-3 border border-brand-gold-400/30">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Fondo de Becas 100%</h3>
            <p className="text-xs text-slate-300 mb-4">Financiado por el 30% del fondo comunitario para trabajadores de escasos recursos.</p>
            <button
              onClick={() => setModalType('church')}
              className="w-full py-2.5 bg-brand-blue-900 hover:bg-brand-blue-950 text-white border border-brand-gold-300/40 font-bold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            >
              Coordinar Taller
            </button>
          </div>
        </div>
      </div>

      {/* ─── OFERTA DE CURSOS / TALLERES ───────────────────────────────────── */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-brand-blue-900 mb-3">Talleres & Cursos Disponibles</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Programas de formación práctica diseñados a la medida de la comunidad</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map(course => {
            const Icon = course.icon;
            return (
              <div key={course.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${course.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${course.tagBg}`}>
                      {course.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-brand-blue-900 mb-3 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-6">
                    {course.description}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Lo que vas a aprender:</span>
                    {course.topics.map((t, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Duración: {course.duration}</span>
                  </div>
                  <button
                    onClick={() => setModalType('student')}
                    className="w-full py-2.5 bg-brand-blue-900 hover:bg-brand-blue-950 text-brand-gold-100 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Solicitar Información</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── MODAL DE INSCRIPCIÓN / CONSULTA ────────────────────────────────── */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-blue-950/60 backdrop-blur-xs transition-all">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-8 relative animate-in zoom-in duration-150">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">¡Solicitud Enviada!</h3>
                <p className="text-slate-600 text-xs leading-relaxed max-w-xs mx-auto">
                  Gracias por comunicarte. Nos pondremos en contacto a la brevedad para coordinar la participación o el taller comunitario.
                </p>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-brand-gold-50 border border-brand-gold-200 text-brand-gold-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                    {modalType === 'church' ? <Building2 className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-brand-blue-900">
                    {modalType === 'church' ? 'Talleres para mi Iglesia' : 'Inscripción a Capacitaciones'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {modalType === 'church' 
                      ? 'Dejanos tus datos para coordinar un taller en tu congregación'
                      : 'Completá tus datos para sumarte a los próximos cursos'}
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre y apellido"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-brand-blue-600 focus:outline-none"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">WhatsApp / Teléfono</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej: 11 2345 6789"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-brand-blue-600 focus:outline-none"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Ciudad / Localidad</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Rosario, Santa Fe"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-brand-blue-600 focus:outline-none"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {modalType === 'church' ? 'Nombre de la Iglesia / Comunidad' : 'Oficio o Profesión'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={modalType === 'church' ? 'Ej: Iglesia Buenas Nuevas' : 'Ej: Electricista / Pintor'}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-brand-blue-600 focus:outline-none"
                      value={formData.churchOrTrade}
                      onChange={e => setFormData({ ...formData, churchOrTrade: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Comentario / Consulta</label>
                    <textarea
                      rows={2}
                      placeholder="Contanos brevemente qué te gustaría aprender o coordinar..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-brand-blue-600 focus:outline-none resize-none"
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-blue-900 hover:bg-brand-blue-950 text-brand-gold-100 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md mt-2"
                  >
                    Enviar Solicitud
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
