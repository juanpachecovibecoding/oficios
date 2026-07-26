import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

export function AdminPanel() {
  const { currentUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    const q = query(collection(db, 'users'), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => doc.data() as UserProfile);
    setPendingUsers(users);
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser?.email === 'juanpacheco@playcode.com.ar') {
      fetchPending();
    }
  }, [currentUser]);

  if (currentUser?.email !== 'juanpacheco@playcode.com.ar') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 rounded-2xl p-8 border border-red-100 max-w-md mx-auto">
          <h2 className="text-2xl font-sans font-extrabold text-red-950 mb-2">Acceso denegado</h2>
          <p className="text-slate-600 text-sm">Este panel está reservado únicamente para administradores autorizados.</p>
        </div>
      </div>
    );
  }

  const handleApprove = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'active' });
      setPendingUsers(prev => prev.filter(u => u.uid !== uid));
    } catch (e) {
      console.error(e);
      alert("Error al aprobar");
    }
  };

  const handleReject = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'rejected' });
      setPendingUsers(prev => prev.filter(u => u.uid !== uid));
    } catch (e) {
      console.error(e);
      alert("Error al rechazar");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full uppercase tracking-wider mb-2 inline-block">Consola de Control</span>
      <h2 className="text-3xl font-sans font-extrabold text-slate-900 mb-6">Panel de Administración</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-[#F8F9FA]">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Solicitudes Pendientes ({pendingUsers.length})</h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm font-medium">Cargando solicitudes...</div>
        ) : pendingUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No hay nuevas solicitudes de registro pendientes de aprobación.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pendingUsers.map(user => (
              <li key={user.uid} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex items-start space-x-4">
                    <img src={user.photoURL} alt={user.displayName} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0" />
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">{user.displayName}</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{user.specialty}</span>
                        <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{user.modality}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-600 mt-2">
                        <div><strong className="text-slate-800">Email:</strong> {user.email}</div>
                        <div><strong className="text-slate-800">Teléfono:</strong> {user.phone}</div>
                        <div><strong className="text-slate-800">Iglesia:</strong> {user.church} ({user.yearsLinked} años)</div>
                        <div><strong className="text-slate-800">Dirección:</strong> {user.address}</div>
                        <div className="sm:col-span-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50 mt-1">
                          <strong className="text-blue-900">Referencia Espiritual:</strong> {user.referenceName} ({user.referencePhone})
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3 shrink-0 self-end md:self-start">
                    <button
                      onClick={() => handleApprove(user.uid)}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Aprobar</span>
                    </button>
                    <button
                      onClick={() => handleReject(user.uid)}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-sm font-bold transition-all cursor-pointer border border-red-200"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
