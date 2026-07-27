import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { UserProfile } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  CheckSquare, 
  Sliders,
  Edit,
  Trash2
} from 'lucide-react';

export function AdminPanel() {
  const { currentUser, userProfile } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'users'>('pending');

  // Search and Filters for users list
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const isSuperAdmin = currentUser?.email === 'juanpacheco@playcode.com.ar';
  const isAdmin = userProfile?.role === 'admin' || isSuperAdmin;

  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const q = query(collection(db, 'users'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => doc.data() as UserProfile);
      setPendingUsers(users);
    } catch (e) {
      console.error(e);
    }
    setLoadingPending(false);
  };

  const fetchAllUsers = async () => {
    setLoadingAll(true);
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => doc.data() as UserProfile);
      setAllUsers(users);
    } catch (e) {
      console.error(e);
    }
    setLoadingAll(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPending();
    }
  }, [currentUser, userProfile]);

  useEffect(() => {
    if (isAdmin && activeTab === 'users') {
      fetchAllUsers();
    }
  }, [activeTab]);

  if (!isAdmin) {
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
      setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: 'active' } : u));
    } catch (e) {
      console.error(e);
      alert("Error al aprobar");
    }
  };

  const handleReject = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'rejected' });
      setPendingUsers(prev => prev.filter(u => u.uid !== uid));
      setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: 'rejected' } : u));
    } catch (e) {
      console.error(e);
      alert("Error al rechazar");
    }
  };

  const handleRoleChange = async (uid: string, newRole: 'admin' | 'professional' | 'client') => {
    if (!isSuperAdmin) {
      alert("Solo el Superadministrador puede modificar los roles de los usuarios.");
      return;
    }
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      alert(`Rol actualizado con éxito a ${newRole}.`);
    } catch (e) {
      console.error(e);
      alert("Error al actualizar rol");
    }
  };

  const handleStatusChange = async (uid: string, newStatus: 'pending' | 'active' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: newStatus });
      setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
      if (newStatus !== 'pending') {
        setPendingUsers(prev => prev.filter(u => u.uid !== uid));
      } else {
        // reload pending if set to pending
        fetchPending();
      }
      alert(`Estado de la cuenta actualizado a ${newStatus}.`);
    } catch (e) {
      console.error(e);
      alert("Error al actualizar estado");
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar permanentemente este usuario de la plataforma? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', uid));
      setAllUsers(prev => prev.filter(u => u.uid !== uid));
      setPendingUsers(prev => prev.filter(u => u.uid !== uid));
      alert("Usuario eliminado correctamente.");
    } catch (e) {
      console.error(e);
      alert("Error al eliminar el usuario.");
    }
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      const { uid, ...updateData } = editingUser;
      await updateDoc(doc(db, 'users', uid), updateData);
      
      setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...updateData } : u));
      setPendingUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...updateData } : u));
      
      alert("Usuario actualizado correctamente.");
      setEditingUser(null);
    } catch (e) {
      console.error(e);
      alert("Error al guardar los cambios del usuario.");
    }
  };

  // Filter users based on search and selected options
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.specialty && user.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.church && user.church.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full uppercase tracking-wider mb-2 inline-block border border-blue-100">
            Consola de Control
          </span>
          <h2 className="text-3xl font-sans font-extrabold text-slate-900 mb-1">
            Panel de Administración
          </h2>
          <p className="text-sm text-slate-500">
            {isSuperAdmin 
              ? 'Conectado como Superadministrador (Juan Pacheco)' 
              : 'Conectado como Administrador de Activaciones'}
          </p>
        </div>
        
        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-brand-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Pendientes ({pendingUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white text-brand-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios</span>
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        /* SOLICITUDES PENDIENTES VIEW */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-blue-900" />
              Solicitudes Pendientes ({pendingUsers.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">Requieren validación comunitaria</span>
          </div>
          
          {loadingPending ? (
            <div className="p-16 text-center text-slate-500 text-sm font-medium">
              Cargando solicitudes pendientes...
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-sm">
              No hay solicitudes de registro pendientes de aprobación en este momento.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pendingUsers.map(user => (
                <li key={user.uid} className="p-6 hover:bg-slate-50/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                        alt={user.displayName} 
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0 bg-slate-100" 
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-lg font-bold text-slate-900">{user.displayName}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            user.role === 'professional' 
                              ? 'bg-blue-50 text-blue-700 border-blue-100' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {user.role === 'professional' ? 'Profesional' : 'Cliente'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-500">{user.email}</p>
                        
                        {user.role === 'professional' && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className="bg-brand-blue-50 text-brand-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-md border border-brand-blue-100">
                              {user.specialty}
                            </span>
                            <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-md border border-slate-200">
                              {user.modality}
                            </span>
                            <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-md border border-slate-200">
                              Cobertura: {user.coverageRadius} km
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 pt-3">
                          <div><strong className="text-slate-800 font-bold">Teléfono:</strong> {user.phone}</div>
                          <div><strong className="text-slate-800 font-bold">Dirección:</strong> {user.address}</div>
                          <div className="sm:col-span-2"><strong className="text-slate-800 font-bold">Iglesia de Pertenencia:</strong> {user.church} ({user.yearsLinked} años vinculados)</div>
                        </div>

                        <div className="bg-brand-gold-50/60 p-3 rounded-xl border border-brand-gold-200/50 mt-4 max-w-xl">
                          <div className="flex gap-2 items-start">
                            <ShieldAlert className="w-4 h-4 text-brand-gold-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="block text-[10px] uppercase tracking-wider text-brand-gold-800 font-extrabold">Referente Espiritual Validado</span>
                              <p className="text-slate-800 text-xs font-medium mt-0.5">
                                {user.referenceName} • Tel: <span className="font-bold">{user.referencePhone}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 shrink-0 self-end lg:self-start pt-2">
                      <button
                        onClick={() => handleApprove(user.uid)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer uppercase tracking-wider"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Aprobar</span>
                      </button>
                      <button
                        onClick={() => handleReject(user.uid)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-200 uppercase tracking-wider"
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
      ) : (
        /* GESTIÓN DE USUARIOS VIEW */
        <div className="space-y-6">
          {/* Search and Filters Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo, oficio o iglesia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAF9F6] pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:outline-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-slate-200 px-3 py-1.5 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 mr-1">Rol:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 p-0 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="client">Cliente</option>
                  <option value="professional">Profesional</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-slate-200 px-3 py-1.5 rounded-xl">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 mr-1">Estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 p-0 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activo</option>
                  <option value="pending">Pendiente</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users List Grid/Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loadingAll ? (
              <div className="p-16 text-center text-slate-500 text-sm font-medium">
                Cargando listado de usuarios de la comunidad...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-16 text-center text-slate-500 text-sm">
                No se encontraron usuarios que coincidan con la búsqueda o filtros.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider pl-6">Usuario</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto e Iglesia</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol de Usuario</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado de Cuenta</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Controles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(user => {
                      const isCurrentUserObj = user.uid === currentUser.uid;
                      const isSuperadminAccount = user.email === 'juanpacheco@playcode.com.ar';

                      return (
                        <tr key={user.uid} className="hover:bg-slate-50/40 transition-colors">
                          {/* User Column */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center space-x-3.5">
                              <img 
                                src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                                alt={user.displayName} 
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100" 
                              />
                              <div>
                                <span className="block font-bold text-slate-900 text-sm">{user.displayName}</span>
                                <span className="block text-xs text-slate-400 font-medium">{user.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Details Column */}
                          <td className="p-4 text-xs text-slate-600">
                            <div className="space-y-0.5">
                              {user.phone && <div className="font-semibold text-slate-800">WhatsApp: {user.phone}</div>}
                              {user.church ? (
                                <div className="text-slate-500">Comunidad: <span className="italic">{user.church}</span></div>
                              ) : (
                                <div className="text-slate-400 italic">Perfil sin completar</div>
                              )}
                              {user.specialty && (
                                <div className="inline-block bg-blue-50 text-blue-800 font-bold px-1.5 py-0.5 rounded-sm text-[9px] uppercase mt-1">
                                  {user.specialty}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Role Column */}
                          <td className="p-4">
                            {isSuperAdmin && !isCurrentUserObj && !isSuperadminAccount ? (
                              <select
                                value={user.role || 'client'}
                                onChange={(e) => handleRoleChange(user.uid, e.target.value as any)}
                                className="text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-800"
                              >
                                <option value="client">Cliente</option>
                                <option value="professional">Profesional</option>
                                <option value="admin">Administrador</option>
                              </select>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                {isSuperadminAccount ? (
                                  <span className="flex items-center bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-100 uppercase tracking-wider">
                                    Superadmin
                                  </span>
                                ) : user.role === 'admin' ? (
                                  <span className="flex items-center bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
                                    Admin
                                  </span>
                                ) : user.role === 'professional' ? (
                                  <span className="flex items-center bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                                    Profesional
                                  </span>
                                ) : (
                                  <span className="flex items-center bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                                    Cliente
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Status Column */}
                          <td className="p-4">
                            {isAdmin && !isCurrentUserObj && !isSuperadminAccount ? (
                              <select
                                value={user.status || 'pending'}
                                onChange={(e) => handleStatusChange(user.uid, e.target.value as any)}
                                className="text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-800"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="active">Activo</option>
                                <option value="rejected">Rechazado</option>
                              </select>
                            ) : (
                              <div className="flex items-center">
                                {user.status === 'active' ? (
                                  <span className="flex items-center bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                    Activo
                                  </span>
                                ) : user.status === 'rejected' ? (
                                  <span className="flex items-center bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-100 uppercase tracking-wider">
                                    Rechazado
                                  </span>
                                ) : (
                                  <span className="flex items-center bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-100 uppercase tracking-wider animate-pulse">
                                    Pendiente
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Controls (Shortcut Buttons) */}
                          <td className="p-4 text-right pr-6">
                            {!isCurrentUserObj && !isSuperadminAccount && (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingUser(user)}
                                  title="Editar perfil"
                                  className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-all cursor-pointer border border-blue-100 animate-fade-in"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.uid)}
                                  title="Eliminar usuario permanentemente"
                                  className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-all cursor-pointer border border-red-100 animate-fade-in"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                {user.status !== 'active' && (
                                  <button
                                    onClick={() => handleApprove(user.uid)}
                                    title="Activar cuenta"
                                    className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all cursor-pointer border border-emerald-100 animate-fade-in"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                {user.status !== 'rejected' && (
                                  <button
                                    onClick={() => handleReject(user.uid)}
                                    title="Desactivar o rechazar cuenta"
                                    className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-all cursor-pointer border border-amber-100 animate-fade-in"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                            {isCurrentUserObj && (
                              <span className="text-[10px] text-slate-400 italic">Eres tú</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-sans font-extrabold text-slate-900 text-lg">Editar Perfil de la Comunidad</h3>
                <p className="text-xs text-slate-500">Modifica los datos del usuario: {editingUser.displayName}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-2xl p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-300 shadow-xs focus:ring-brand-blue-600 focus:border-brand-blue-600 text-sm py-2.5 px-3 bg-white"
                    value={editingUser.displayName || ''}
                    onChange={e => setEditingUser({ ...editingUser, displayName: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Correo Electrónico (Leído de Google)</label>
                  <input
                    type="email"
                    disabled
                    className="w-full rounded-xl border border-slate-200 shadow-xs text-sm py-2.5 px-3 bg-slate-100 text-slate-500 cursor-not-allowed"
                    value={editingUser.email || ''}
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">WhatsApp / Celular</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 shadow-xs focus:ring-brand-blue-600 focus:border-brand-blue-600 text-sm py-2.5 px-3 bg-white"
                    value={editingUser.phone || ''}
                    onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                  />
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Dirección</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 shadow-xs focus:ring-brand-blue-600 focus:border-brand-blue-600 text-sm py-2.5 px-3 bg-white"
                    value={editingUser.address || ''}
                    onChange={e => setEditingUser({ ...editingUser, address: e.target.value })}
                  />
                </div>

                {/* Iglesia */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Iglesia de Pertenencia</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 shadow-xs focus:ring-brand-blue-600 focus:border-brand-blue-600 text-sm py-2.5 px-3 bg-white"
                    value={editingUser.church || ''}
                    onChange={e => setEditingUser({ ...editingUser, church: e.target.value })}
                  />
                </div>

                {/* Años vinculados */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Años vinculados</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-300 shadow-xs focus:ring-brand-blue-600 focus:border-brand-blue-600 text-sm py-2.5 px-3 bg-white"
                    value={editingUser.yearsLinked || 0}
                    onChange={e => setEditingUser({ ...editingUser, yearsLinked: parseInt(e.target.value) || 0 })}
                  />
                </div>

                {/* Referente Espiritual */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Referente Espiritual (Nombre)</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 shadow-xs focus:ring-brand-blue-600 focus:border-brand-blue-600 text-sm py-2.5 px-3 bg-white"
                    value={editingUser.referenceName || ''}
                    onChange={e => setEditingUser({ ...editingUser, referenceName: e.target.value })}
                  />
                </div>

                {/* Teléfono Referente */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Teléfono Referente</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 shadow-xs focus:ring-brand-blue-600 focus:border-brand-blue-600 text-sm py-2.5 px-3 bg-white"
                    value={editingUser.referencePhone || ''}
                    onChange={e => setEditingUser({ ...editingUser, referencePhone: e.target.value })}
                  />
                </div>
              </div>

              {/* Si es Profesional, mostrar más campos */}
              {editingUser.role === 'professional' && (
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Datos Profesionales</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Especialidad / Oficio</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-300 shadow-xs focus:ring-brand-blue-600 focus:border-brand-blue-600 text-sm py-2.5 px-3 bg-white"
                        value={editingUser.specialty || ''}
                        onChange={e => setEditingUser({ ...editingUser, specialty: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Modalidad de Servicio</label>
                      <select
                        className="w-full rounded-xl border border-slate-300 shadow-xs focus:ring-brand-blue-600 focus:border-brand-blue-600 text-sm py-2.5 px-3 bg-white"
                        value={editingUser.modality || 'A domicilio'}
                        onChange={e => setEditingUser({ ...editingUser, modality: e.target.value })}
                      >
                        <option value="A domicilio">A domicilio</option>
                        <option value="Taller propio">Taller propio</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Radio de Cobertura (km)</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full rounded-xl border border-slate-300 shadow-xs focus:ring-brand-blue-600 focus:border-brand-blue-600 text-sm py-2.5 px-3 bg-white"
                        value={editingUser.coverageRadius || 5}
                        onChange={e => setEditingUser({ ...editingUser, coverageRadius: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">URL Video Presentación (YouTube)</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-300 shadow-xs focus:ring-brand-blue-600 focus:border-brand-blue-600 text-sm py-2.5 px-3 bg-white"
                      value={editingUser.videoURL || ''}
                      onChange={e => setEditingUser({ ...editingUser, videoURL: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-blue-900 hover:bg-brand-blue-950 text-white text-xs font-bold rounded-xl tracking-wider uppercase shadow-xs transition-colors cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
