import React, { useState } from 'react';
import { Heart, Server, ShieldCheck, Copy, Check, Sparkles, CreditCard, Landmark, Target, Compass, BookOpen, Users, Award, Handshake } from 'lucide-react';

export function Vision() {
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(2000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedCbu, setCopiedCbu] = useState(false);
  
  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('transfer');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const CBU_EJEMPLO = "0000003100000000123456";
  const ALIAS_EJEMPLO = "oficios.cristianos.arg";

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(ALIAS_EJEMPLO);
    setCopiedAlias(true);
    setTimeout(() => setCopiedAlias(false), 2000);
  };

  const handleCopyCbu = () => {
    navigator.clipboard.writeText(CBU_EJEMPLO);
    setCopiedCbu(true);
    setTimeout(() => setCopiedCbu(false), 2000);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate real transaction processing
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const getFinalAmount = () => {
    if (selectedAmount === 'custom') {
      return customAmount ? parseFloat(customAmount) : 0;
    }
    return selectedAmount;
  };

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
      <div className="bg-[#FAF9F6] rounded-3xl p-8 md:p-12 border border-brand-gold-100 mb-24 shadow-xs">
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


      {/* ─── SECCIÓN OFRENDAR (ESTABLECIDA ABAJO DE TODO) ───────────────────── */}
      <div id="ofrendar" className="pt-12 border-t-2 border-slate-200/60">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-brand-gold-50 border border-brand-gold-100 text-brand-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xs">
            <Heart className="w-8 h-8 fill-brand-gold-500 text-brand-gold-600" />
          </div>
          <span className="text-[10px] font-bold px-3 py-1 bg-brand-gold-50 text-brand-gold-700 border border-brand-gold-100 rounded-full uppercase tracking-widest mb-4 inline-block">
            Economía Solidaria & Transparencia
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-blue-900 mb-6 leading-tight">
            Ofrendas Voluntarias y Gratitud
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Oficios Cristianos es un espacio creado para bendecir de forma directa. No cobramos comisiones de intermediación en los presupuestos.
            La plataforma se sostiene y expande gracias a la generosidad de quienes reciben el bien de un trabajo íntegro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#FAF9F6] rounded-2xl p-6 border border-brand-gold-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] bg-brand-blue-50 text-brand-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Para Profesionales</span>
              <h3 className="text-lg font-bold text-brand-blue-900 mt-2 mb-3">Aportá desde tu trabajo</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Si la plataforma te conectó con nuevos vecinos y bendijo tu labor diaria, te invitamos a dejar una ofrenda. Esto permite que el sistema siga gratuito para quienes están comenzando.
              </p>
            </div>
          </div>

          <div className="bg-[#FAF9F6] rounded-2xl p-6 border border-brand-gold-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] bg-brand-blue-50 text-brand-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Para Vecinos</span>
              <h3 className="text-lg font-bold text-brand-blue-900 mt-2 mb-3">Aportá desde tu hogar</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Si diste con un profesional honesto que cuidó de tu casa y te brindó un trato transparente, considerá sembrar en este canal comunitario para que continúe creciendo.
              </p>
            </div>
          </div>

          <div className="bg-[#FAF9F6] rounded-2xl p-6 border border-brand-gold-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] bg-brand-gold-50 text-brand-gold-700 border border-brand-gold-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Sostenimiento</span>
              <h3 className="text-lg font-bold text-brand-blue-900 mt-2 mb-3">Sustentabilidad y Alianza</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                El 70% se aplica a la infraestructura tecnológica y validación pastoral de los perfiles. El 30% nutre un fondo para acompañar con capacitaciones y cursos de tecnología a la comunidad de profesionales de escasos recursos.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Donation Section */}
        <div className="bg-white rounded-3xl border border-brand-blue-100 shadow-xl overflow-hidden mb-16">
          <div className="bg-brand-blue-950 px-8 py-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-blue-900">
            <div>
              <h3 className="text-2xl font-serif font-bold tracking-tight mb-2 text-[#FAF9F6]">Realizar una Ofrenda de Gratitud</h3>
              <p className="text-brand-blue-100 text-xs max-w-lg">
                Elegí el medio de tu preferencia. Podés realizar una transferencia bancaria directa (CBU / Alias) o simular una contribución con tarjeta de forma inmediata.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer border ${
                  paymentMethod === 'transfer' 
                    ? 'bg-brand-gold-500 border-brand-gold-200 text-brand-blue-950 shadow-xs' 
                    : 'bg-brand-blue-900 border-brand-blue-800 text-brand-blue-100 hover:bg-brand-blue-850'
                }`}
              >
                <Landmark className="w-4 h-4" /> Transferencia
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer border ${
                  paymentMethod === 'card' 
                    ? 'bg-brand-gold-500 border-brand-gold-200 text-brand-blue-950 shadow-xs' 
                    : 'bg-brand-blue-900 border-brand-blue-800 text-brand-blue-100 hover:bg-brand-blue-850'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Tarjeta
              </button>
            </div>
          </div>

          <div className="p-8">
            {paymentMethod === 'transfer' ? (
              <div className="space-y-6">
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                  <h4 className="font-bold text-blue-950 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-blue-600" />
                    Datos de Transferencia Bancaria (Argentina)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Alias de Cuentas</span>
                        <span className="font-mono text-sm font-bold text-slate-800">{ALIAS_EJEMPLO}</span>
                      </div>
                      <button
                        onClick={handleCopyAlias}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                        title="Copiar Alias"
                      >
                        {copiedAlias ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">CBU Bancario</span>
                        <span className="font-mono text-sm font-bold text-slate-800">{CBU_EJEMPLO}</span>
                      </div>
                      <button
                        onClick={handleCopyCbu}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                        title="Copiar CBU"
                      >
                        {copiedCbu ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-slate-500 leading-relaxed">
                    * Una vez realizada la transferencia, no es necesario enviar comprobante. Tu aporte ingresa directamente a la cuenta del fondo comunitario y se procesa en los balances mensuales de transparencia.
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {isSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 font-bold" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">¡Muchísimas gracias por tu ofrenda!</h4>
                    <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed mb-6">
                      Tu contribución simulada de **${getFinalAmount()} ARS** ingresó correctamente. Este aporte es vital para que sigamos bendiciendo más hogares en toda la Argentina.
                    </p>
                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        setCardName('');
                        setCardNumber('');
                        setCardExpiry('');
                        setCardCvv('');
                      }}
                      className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Realizar otro aporte
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    {/* Amount Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">Monto de la Ofrenda (ARS)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {[1000, 2000, 5000, 10000].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setSelectedAmount(amt)}
                            className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                              selectedAmount === amt 
                                ? 'bg-brand-blue-900 border-brand-blue-900 text-[#FAF9F6] shadow-xs' 
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            ${amt}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSelectedAmount('custom')}
                          className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                            selectedAmount === 'custom' 
                              ? 'bg-brand-blue-900 border-brand-blue-900 text-[#FAF9F6] shadow-xs' 
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          Otro monto
                        </button>
                      </div>

                      {selectedAmount === 'custom' && (
                        <div className="mt-3 max-w-xs relative rounded-lg shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            required
                            min="100"
                            className="block w-full pl-7 pr-12 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-brand-blue-600 focus:border-brand-blue-600"
                            placeholder="Monto personalizado"
                            value={customAmount}
                            onChange={e => setCustomAmount(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 text-sm">ARS</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Nombre del Titular</label>
                          <input
                            type="text"
                            required
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-brand-blue-600 focus:border-brand-blue-600"
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                            placeholder="Como figura en la tarjeta"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Número de Tarjeta</label>
                          <input
                            type="text"
                            required
                            maxLength={19}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-mono focus:ring-brand-blue-600 focus:border-brand-blue-600"
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                            placeholder="4500 1234 5678 9012"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="self-end">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Vencimiento</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-mono focus:ring-brand-blue-600 focus:border-brand-blue-600"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                            placeholder="MM/AA"
                          />
                        </div>
                        <div className="self-end">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">Código (CVV)</label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-mono focus:ring-brand-blue-600 focus:border-brand-blue-600"
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || getFinalAmount() <= 0}
                      className="w-full bg-brand-blue-900 hover:bg-brand-blue-950 text-[#FAF9F6] font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-widest border border-brand-blue-700"
                    >
                      <Sparkles className="w-4 h-4 fill-brand-gold-500 text-brand-gold-200" />
                      <span>{isSubmitting ? 'Procesando...' : `Ofrendar $${getFinalAmount()} ARS`}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#FAF9F6] rounded-2xl p-8 border border-brand-gold-100 text-center">
          <h3 className="text-lg font-bold text-brand-blue-900 mb-6 flex items-center justify-center gap-2 font-serif">
            <ShieldCheck className="w-5 h-5 text-brand-gold-600" />
            Transparencia y Destino de Fondos
          </h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-slate-600 max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xs border border-brand-gold-100 mb-3">
                <Server className="w-6 h-6 text-brand-blue-900" />
              </div>
              <span className="font-bold text-brand-blue-900 text-sm">Mantenimiento Digital</span>
              <span className="text-xs text-slate-500 mt-0.5">70% de los recursos</span>
            </div>
            
            <div className="w-full md:w-[1px] h-[1px] md:h-16 bg-brand-gold-200"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xs border border-brand-gold-100 mb-3">
                <Heart className="w-6 h-6 text-brand-gold-600 fill-brand-gold-500" />
              </div>
              <span className="font-bold text-brand-blue-900 text-sm">Fondo de Capacitación & Tecnología</span>
              <span className="text-xs text-slate-500 mt-0.5">30% de los recursos</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
