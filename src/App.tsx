import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { MapView } from './pages/MapView';
import { ProfileDetail } from './pages/ProfileDetail';
import { Offerings } from './pages/Offerings';
import { Vision } from './pages/Vision';

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSearch />
      
      {/* Trust & Safety highlights */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-brand-blue-100 bg-[#FCFDFE]">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[10px] font-bold text-brand-gold-700 bg-brand-gold-50 border border-brand-gold-100 px-3 py-1 rounded-full uppercase tracking-widest">¿Por qué elegirnos?</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-blue-900 mt-4 mb-4">La diferencia de contratar con confianza</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Oficios Cristianos no es un directorio comercial más. Es un pacto de trabajo justo y confianza mutua sustentado por la validación pastoral o de liderazgo en iglesias locales de la Argentina.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-[#FAF9F6] p-8 rounded-2xl border border-brand-gold-100 relative overflow-hidden group hover:border-brand-blue-100 transition-all">
            <div className="w-12 h-12 bg-brand-blue-900 text-brand-gold-100 rounded-xl flex items-center justify-center font-serif font-bold text-lg mb-6 shadow-sm">
              I
            </div>
            <h4 className="text-lg font-bold text-brand-blue-900 mb-2 font-sans">Validación Pastoral</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Cada profesional registrado debe proveer un referente de su congregación o iglesia para que su identidad y ética de trabajo sean verificadas antes de figurar públicamente.
            </p>
          </div>

          <div className="bg-[#FAF9F6] p-8 rounded-2xl border border-brand-gold-100 relative overflow-hidden group hover:border-brand-blue-100 transition-all">
            <div className="w-12 h-12 bg-brand-blue-900 text-brand-gold-100 rounded-xl flex items-center justify-center font-serif font-bold text-lg mb-6 shadow-sm">
              II
            </div>
            <h4 className="text-lg font-bold text-brand-blue-900 mb-2 font-sans">Código de Ética</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Todos los miembros se comprometen bajo firma a respetar pautas de puntualidad, honestidad en los presupuestos, excelencia técnica y trato íntegro en cada hogar.
            </p>
          </div>

          <div className="bg-[#FAF9F6] p-8 rounded-2xl border border-brand-gold-100 relative overflow-hidden group hover:border-brand-blue-100 transition-all">
            <div className="w-12 h-12 bg-brand-blue-900 text-brand-gold-100 rounded-xl flex items-center justify-center font-serif font-bold text-lg mb-6 shadow-sm">
              III
            </div>
            <h4 className="text-lg font-bold text-brand-blue-900 mb-2 font-sans">Trato Directo y Justo</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Sin comisiones de intermediación. Te contactás directamente por WhatsApp con el profesional de cercanía para acordar presupuesto de forma transparente y sin costos ocultos.
            </p>
          </div>
        </div>
      </section>

      {/* Axiological Commitment Banner */}
      <section className="bg-brand-blue-950 py-24 text-white overflow-hidden relative border-t border-b border-brand-blue-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,156,109,0.1),transparent_50%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-[11px] font-bold text-brand-gold-200 uppercase tracking-widest block mb-4">El Fundamento de Nuestra Alianza</span>
          <p className="text-2xl md:text-3xl font-serif italic font-medium leading-relaxed max-w-3xl mx-auto mb-6 text-[#FAF9F6]">
            "Todo lo que hagáis, hacedlo de buen ánimo, como para el Señor y no para los hombres."
          </p>
          <span className="text-brand-gold-200 text-xs font-bold block uppercase tracking-widest">— Colosenses 3:23</span>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/profile/:id" element={<ProfileDetail />} />
              <Route path="/offerings" element={<Offerings />} />
              <Route path="/vision" element={<Vision />} />
            </Routes>
          </main>
          <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Oficios Cristianos. Plataforma de economía colaborativa.</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
