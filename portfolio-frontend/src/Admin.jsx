import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from './api';

// --- NOTIFICACIONES TOAST ---
const Toast = ({ message, type }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
    className={`fixed bottom-8 right-8 p-4 font-semibold text-sm tracking-wide z-50 rounded shadow-lg border ${
      type === 'error' ? 'bg-[#93000a] text-white border-red-500' : 'bg-surface-container-highest text-primary-container border-primary-container'
    }`}
  >
    {message}
  </motion.div>
);

export default function AdminPanel() {
  const [authKey, setAuthKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('proyectos');
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const [proyectos, setProyectos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formProyecto, setFormProyecto] = useState({ 
    titulo: '', descripcion: '', tecnologias: '', categoria: 'MOBILE', url_repo: '', imagen_url: '' 
  });

  const [perfil, setPerfil] = useState({
    nombre: '', titulo: '', descripcion: '', imagen_url: '', email: '', github_url: '', linkedin_url: ''
  });

  // --- FUNCIÓN DE AUTORIZACIÓN PARA PETICIONES ---
  const getAuth = () => ({
    headers: { 'x-token': localStorage.getItem('admin_token') }
  });

  const cargarDatos = () => {
    api.get('/proyectos').then(res => setProyectos(res.data)).catch(() => {});
    api.get('/perfil').then(res => setPerfil(res.data)).catch(() => {});
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
      cargarDatos();
    }
  }, []);

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { password: authKey });
      localStorage.setItem('admin_token', res.data.access_token);
      setIsAuthenticated(true);
      cargarDatos();
      showToast("Acceso concedido al panel");
    } catch (error) {
      showToast("Credenciales incorrectas.", "error");
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    showToast("Sesión cerrada");
  };

  const handleSubmitProyecto = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/proyectos/${editingId}`, formProyecto, getAuth());
        showToast("Proyecto actualizado correctamente");
      } else {
        await api.post('/proyectos', formProyecto, getAuth());
        showToast("Proyecto creado correctamente");
      }
      setFormProyecto({ titulo: '', descripcion: '', tecnologias: '', categoria: 'MOBILE', url_repo: '', imagen_url: '' });
      setEditingId(null);
      cargarDatos();
    } catch (error) { 
      showToast("Error al guardar el proyecto. Revisa tu sesión.", "error"); 
    }
  };

  const iniciarEdicion = (proyecto) => {
    setEditingId(proyecto.id);
    setFormProyecto({
      titulo: proyecto.titulo, descripcion: proyecto.descripcion, tecnologias: proyecto.tecnologias,
      categoria: proyecto.categoria, url_repo: proyecto.url_repo || '', imagen_url: proyecto.imagen_url || ''
    });
    window.scrollTo(0, 0);
  };

  const eliminarProyecto = async (id) => {
    if(window.confirm("¿Estás seguro de eliminar este proyecto permanentemente?")) {
      try {
        await api.delete(`/proyectos/${id}`, getAuth());
        showToast("Proyecto eliminado");
        cargarDatos();
      } catch (error) { showToast("Error al eliminar", "error"); }
    }
  };

  const handleSubmitPerfil = async (e) => {
    e.preventDefault();
    try {
      await api.put('/perfil', perfil, getAuth());
      showToast("Información de perfil actualizada");
      cargarDatos();
    } catch (error) {
      showToast("Error al actualizar perfil", "error");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111318] flex items-center justify-center font-body text-white">
        <AnimatePresence>{toast.show && <Toast message={toast.message} type={toast.type} />}</AnimatePresence>
        <form onSubmit={login} className="bg-[#1a1c20] p-10 rounded-xl border border-outline-variant/30 flex flex-col gap-6 text-center w-full max-w-sm shadow-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h2>
            <p className="text-on-surface-variant text-sm">Ingresa tu clave de administrador</p>
          </div>
          <input 
            type="password" placeholder="Contraseña" 
            className="bg-[#0c0e12] border border-gray-700 p-3 rounded-md text-white text-center focus:border-[#00f0ff] outline-none transition-colors" 
            value={authKey} onChange={(e) => setAuthKey(e.target.value)} 
          />
          <button className="bg-primary-container text-background font-bold py-3 rounded-md hover:bg-white transition-colors uppercase tracking-widest text-sm">Entrar al Panel</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111318] font-body p-4 md:p-8 text-white max-w-5xl mx-auto">
      <AnimatePresence>{toast.show && <Toast message={toast.message} type={toast.type} />}</AnimatePresence>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl text-white font-bold tracking-tight">Panel de Administración</h2>
          <p className="text-on-surface-variant text-sm mt-1">Gestiona tu portafolio público</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <button onClick={() => setActiveTab('proyectos')} className={`px-4 py-2 font-bold text-sm uppercase rounded-md transition-all ${activeTab === 'proyectos' ? 'bg-primary-container/10 text-primary-container' : 'text-gray-400 hover:bg-gray-800'}`}>Proyectos</button>
          <button onClick={() => setActiveTab('perfil')} className={`px-4 py-2 font-bold text-sm uppercase rounded-md transition-all ${activeTab === 'perfil' ? 'bg-primary-container/10 text-primary-container' : 'text-gray-400 hover:bg-gray-800'}`}>Mi Perfil</button>
          <button onClick={logout} className="text-red-400 text-sm hover:text-red-300 ml-4 font-bold">Salir</button>
        </div>
      </div>

      {activeTab === 'proyectos' && (
        <>
          <form onSubmit={handleSubmitProyecto} className="bg-[#1a1c20] p-8 rounded-xl border border-outline-variant/20 mb-8 grid grid-cols-2 gap-6 shadow-lg">
            <div className="col-span-2 flex justify-between items-center border-b border-gray-800 pb-4 mb-2">
              <h3 className="text-lg font-bold text-white">{editingId ? 'Editar Proyecto Existente' : 'Registrar Nuevo Proyecto'}</h3>
              {editingId && <button type="button" onClick={() => {setEditingId(null); setFormProyecto({ titulo: '', descripcion: '', tecnologias: '', categoria: 'MOBILE', url_repo: '', imagen_url: '' })}} className="text-red-400 text-sm font-bold hover:underline">Cancelar Edición</button>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Título del Proyecto</label>
              <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" value={formProyecto.titulo} onChange={e => setFormProyecto({...formProyecto, titulo: e.target.value})} required />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Categoría</label>
              <select className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md text-gray-300 focus:border-[#00f0ff] outline-none" value={formProyecto.categoria} onChange={e => setFormProyecto({...formProyecto, categoria: e.target.value})}>
                <option value="MOBILE">Aplicación Móvil</option>
                <option value="WEB_APP">Aplicación Web</option>
                <option value="BACKEND">Backend & API</option>
                <option value="DESKTOP">Software de Escritorio</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Descripción Detallada</label>
              <textarea className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md h-32 focus:border-[#00f0ff] outline-none resize-none" value={formProyecto.descripcion} onChange={e => setFormProyecto({...formProyecto, descripcion: e.target.value})} required />
            </div>

            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Tecnologías Utilizadas (separadas por comas)</label>
              <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" placeholder="Ej: Flutter, Firebase, Dart" value={formProyecto.tecnologias} onChange={e => setFormProyecto({...formProyecto, tecnologias: e.target.value})} required />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Enlace al Repositorio (Opcional)</label>
              <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" placeholder="https://github.com/..." value={formProyecto.url_repo} onChange={e => setFormProyecto({...formProyecto, url_repo: e.target.value})} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">URL de la Imagen (Opcional)</label>
              <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" placeholder="https://..." value={formProyecto.imagen_url} onChange={e => setFormProyecto({...formProyecto, imagen_url: e.target.value})} />
            </div>
            
            <button className={`col-span-2 text-background font-bold py-4 mt-4 rounded-md transition-colors uppercase tracking-widest text-sm ${editingId ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-primary-container hover:bg-white'}`}>
              {editingId ? 'Guardar Cambios del Proyecto' : 'Publicar Nuevo Proyecto'}
            </button>
          </form>

          <div>
            <h3 className="text-gray-300 mb-4 text-lg font-bold">Proyectos Publicados</h3>
            <div className="grid gap-3">
              {proyectos.map(p => (
                <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between bg-[#1a1c20] border border-gray-800 p-5 rounded-lg hover:border-gray-600 transition-colors">
                  <div>
                    <span className="text-base font-bold text-white block md:inline">{p.titulo}</span>
                    <span className="text-xs text-primary-container md:ml-3 bg-primary-container/10 px-2 py-1 rounded">{p.categoria}</span>
                  </div>
                  <div className="flex gap-4 mt-4 md:mt-0">
                    <button onClick={() => iniciarEdicion(p)} className="text-yellow-500 hover:text-yellow-400 text-sm font-bold">Editar</button>
                    <button onClick={() => eliminarProyecto(p.id)} className="text-red-500 hover:text-red-400 text-sm font-bold">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'perfil' && (
        <form onSubmit={handleSubmitPerfil} className="bg-[#1a1c20] p-8 rounded-xl border border-gray-800 grid grid-cols-2 gap-6 shadow-lg">
          <div className="col-span-2 border-b border-gray-800 pb-4 mb-2">
            <h3 className="text-lg font-bold text-white">Información Principal</h3>
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Nombre Completo</label>
            <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" value={perfil.nombre} onChange={e => setPerfil({...perfil, nombre: e.target.value})} required />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Título Profesional</label>
            <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" value={perfil.titulo} onChange={e => setPerfil({...perfil, titulo: e.target.value})} required />
          </div>
          
          <div className="col-span-2">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Perfil Profesional (Acerca de mí)</label>
            <textarea className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md h-32 focus:border-[#00f0ff] outline-none resize-none" value={perfil.descripcion} onChange={e => setPerfil({...perfil, descripcion: e.target.value})} required />
          </div>

          <div className="col-span-2">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">URL de tu Foto de Perfil</label>
            <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" placeholder="https://..." value={perfil.imagen_url || ''} onChange={e => setPerfil({...perfil, imagen_url: e.target.value})} />
          </div>

          <div className="col-span-2 border-b border-gray-800 pb-4 mb-2 mt-4">
            <h3 className="text-lg font-bold text-white">Contacto y Redes</h3>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Correo Electrónico Público</label>
            <input type="email" className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" value={perfil.email} onChange={e => setPerfil({...perfil, email: e.target.value})} required />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Enlace de GitHub</label>
            <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" value={perfil.github_url || ''} onChange={e => setPerfil({...perfil, github_url: e.target.value})} />
          </div>

          <button className="col-span-2 bg-primary-container text-background font-bold py-4 mt-6 rounded-md hover:bg-white transition-colors uppercase tracking-widest text-sm">
            Guardar Cambios del Perfil
          </button>
        </form>
      )}
    </div>
  );
}