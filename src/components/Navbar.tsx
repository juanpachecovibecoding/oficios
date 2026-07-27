import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { Menu, X, HeartHandshake } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const { currentUser, userProfile, isLoginModalOpen, setIsLoginModalOpen } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-brand-blue-900 rounded-lg flex items-center justify-center border border-brand-gold-200 shadow-xs">
                {/* Combined hammer + paintbrush — open source MIT inline SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-brand-gold-200"
                >
                  {/* Hammer */}
                  <path d="M15 4l-8 8" />
                  <path d="M11 4h4v4" />
                  <path d="M6 13l-2.5 2.5a1.5 1.5 0 0 0 2 2L8 15" />
                  {/* Paintbrush */}
                  <path d="M9 3l9.5 9.5" />
                  <path d="M17 8l1.5 1.5" />
                  <path d="M14.5 17c0 1.5-1 3-3 3s-1.5-2.5-1.5-2.5L14.5 17z" />
                  <path d="M18.5 5.5L19 5a1 1 0 0 0-1.5-1.5l-.5.5" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-brand-blue-900 font-sans">Oficios Cristianos</span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold px-2.5 py-0.5 bg-brand-blue-50 text-brand-blue-600 rounded-full uppercase tracking-wider">Argentina</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/map" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Mapa de Cercanía</Link>
            <Link to="/offerings" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Ofrendar</Link>
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Mi Panel</Link>
                {(userProfile?.role === 'admin' || currentUser.email === 'juanpacheco@playcode.com.ar') && (
                  <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Admin</Link>
                )}
                <div className="flex items-center space-x-2">
                  {currentUser.photoURL && (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200" />
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Salir
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2 bg-brand-blue-900 text-brand-gold-100 hover:bg-brand-blue-950 hover:text-white border border-brand-blue-800 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer uppercase tracking-wider"
              >
                Ingresar
              </button>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-blue-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className={cn("md:hidden", isOpen ? "block" : "hidden")}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-slate-100 shadow-inner">
          <Link to="/map" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md">Mapa de Cercanía</Link>
          <Link to="/offerings" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md">Ofrendar</Link>
          {currentUser ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md">Mi Panel</Link>
              {(userProfile?.role === 'admin' || currentUser.email === 'juanpacheco@playcode.com.ar') && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md">Admin</Link>
              )}
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md"
              >
                Salir
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsLoginModalOpen(true);
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-brand-blue-900 hover:text-blue-600 hover:bg-slate-50 rounded-md cursor-pointer"
            >
              Ingresar
            </button>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-blue-950/60 backdrop-blur-xs transition-all duration-200">
          <div className="bg-[#FCFDFE] w-full max-w-md rounded-2xl border border-brand-gold-100 shadow-2xl p-8 relative animate-in zoom-in duration-150">
            {/* Close Button */}
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 rounded-full hover:bg-slate-100 transition-all"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Logo & Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-brand-blue-900 rounded-xl flex items-center justify-center border border-brand-gold-200 mx-auto mb-4 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-7 h-7 text-brand-gold-200"
                >
                  <path d="M15 4l-8 8" />
                  <path d="M11 4h4v4" />
                  <path d="M6 13l-2.5 2.5a1.5 1.5 0 0 0 2 2L8 15" />
                  <path d="M9 3l9.5 9.5" />
                  <path d="M17 8l1.5 1.5" />
                  <path d="M14.5 17c0 1.5-1 3-3 3s-1.5-2.5-1.5-2.5L14.5 17z" />
                  <path d="M18.5 5.5L19 5a1 1 0 0 0-1.5-1.5l-.5.5" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif font-bold text-brand-blue-900 mb-2">Ingresar a la Plataforma</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Inicie sesión en Oficios Cristianos para gestionar su perfil, registrar sus servicios o coordinar trabajos con valores y honra.
              </p>
            </div>

            {/* Google Authentication Button */}
            <div className="space-y-4">
              <button
                onClick={async () => {
                  await handleLogin();
                  setIsLoginModalOpen(false);
                }}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:border-brand-gold-500 hover:bg-brand-gold-50/50 px-5 py-3.5 rounded-xl text-sm font-bold text-brand-blue-900 shadow-xs transition-all duration-200 cursor-pointer"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Conectar con Google
              </button>
            </div>

            {/* Axiological Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 font-medium italic">
                Pacto relacional basado en el Logos y la honestidad mutua.
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
