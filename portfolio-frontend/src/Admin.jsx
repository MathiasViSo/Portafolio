import React, { useState, useEffect } from 'react';
import api from './api';

export default function AdminPanel() {
  const [authKey, setAuthKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('proyectos'); // 'proyectos' o 'perfil'
  
  // --- Estados de Proyectos ---
  const [proyectos, setProyectos] = useState([]);
  const [editingId, setEditingId] = useState(null); // Saber si estamos creando o editando
  const [formProyecto, setFormProyecto] = useState({ 
    titulo: '', descripcion: '', tecnologias: '', categoria: 'MOBILE', url_repo: '', imagen_url: '' 
  });

  // --- Estados de Perfil ---
  const [perfil, setPerfil] = useState({
    nombre: '', titulo: '', descripcion: '', imagen_url: '', email: '', github_url: '', linkedin_url: ''
  });

  // --- CARGA DE DATOS ---
  const cargarDatos = () => {
    api.get('/proyectos').then(res => setProyectos(res.data)).catch(() => {});
    api.get('/perfil').then(res => setPerfil(res.data)).catch(() => {});
  };

  const login = (e) => {
    e.preventDefault();
    if (authKey === 'root_mathias_2026') { 
      setIsAuthenticated(true);
      cargarDatos();
    } else {
      alert("ACCESO DENEGADO: Credenciales incorrectas.");
    }
  };

  // --- LÓGICA DE PROYECTOS ---
  const handleSubmitProyecto = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // MODO EDICIÓN
        await api.put(`/proyectos/${editingId}`, formProyecto, { headers: { 'x-token': authKey } });
        alert("Proyecto Actualizado");
      } else {
        // MODO CREACIÓN
        await api.post('/proyectos', formProyecto, { headers: { 'x-token': authKey } });
        alert("Proyecto Creado");
      }
      setFormProyecto({ titulo: '', descripcion: '', tecnologias: '', categoria: 'MOBILE', url_repo: '', imagen_url: '' });
      setEditingId(null);
      cargarDatos();
    } catch (error) { 
      alert("Error de autorización al intentar guardar."); 
    }
  };

  const iniciarEdicion = (proyecto) => {
    setEditingId(proyecto.id);
    setFormProyecto({
      titulo: proyecto.titulo, descripcion: proyecto.descripcion, tecnologias: proyecto.tecnologias,
      categoria: proyecto.categoria, url_repo: proyecto.url_repo || '', imagen_url: proyecto.imagen_url || ''
    });
    window.scrollTo(0, 0); // Sube la pantalla al formulario
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setFormProyecto({ titulo: '', descripcion: '', tecnologias: '', categoria: 'MOBILE', url_repo: '', imagen_url: '' });
  };

  const eliminarProyecto = async (id) => {
    if(window.confirm("¿Confirmar eliminación definitiva del registro?")) {
      try {
        await api.delete(`/proyectos/${id}`, { headers: { 'x-token': authKey } });
        cargarDatos();
      } catch (error) { alert("Error al eliminar."); }
    }
  };

  // --- LÓGICA DE PERFIL ---
  const handleSubmitPerfil = async (e) => {
    e.preventDefault();
    try {
      await api.put('/perfil', perfil, { headers: { 'x-token': authKey } });
      alert("Perfil Maestro Actualizado");
      cargarDatos();
    } catch (error) {
      alert("Error al actualizar perfil.");
    }
  };

  // --- RENDERIZADO DE SEGURIDAD ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center font-mono">
        <form onSubmit={login} className="bg-panel p-8 border border-neon/50 flex flex-col gap-4 text-center shadow-[0_0_20px_rgba(0,240,255,0.1)]">
          <p className="text-neon tracking-widest text-sm mb-2">SYSTEM_LOCKED</p>
          <input 
            type="password" placeholder="Enter Root Key" 
            className="bg-obsidian border border-gray-700 p-2 text-white text-center focus:border-neon outline-none transition-colors" 
            value={authKey} onChange={(e) => setAuthKey(e.target.value)} 
          />
          <button className="bg-neon text-black font-bold py-2 hover:bg-white transition-colors tracking-widest">UNLOCK</button>
        </form>
      </div>
    );
  }

  // --- RENDERIZADO DEL PANEL ADMIN ---
  return (
    <div className="min-h-screen bg-obsidian font-mono p-4 md:p-8 text-white max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h2 className="text-2xl text-neon font-bold">ADMIN_TERMINAL // UNLOCKED</h2>
        
        {/* Navegación de Pestañas */}
        <div className="flex gap-4 mt-4 md:mt-0">
          <button 
            onClick={() => setActiveTab('proyectos')} 
            className={`px-4 py-2 border ${activeTab === 'proyectos' ? 'border-neon text-neon' : 'border-gray-800 text-gray-500'} transition-colors`}
          >
            PROYECTOS
          </button>
          <button 
            onClick={() => setActiveTab('perfil')} 
            className={`px-4 py-2 border ${activeTab === 'perfil' ? 'border-neon text-neon' : 'border-gray-800 text-gray-500'} transition-colors`}
          >
            PERFIL_MAESTRO
          </button>
        </div>
      </div>

      {/* --- PESTAÑA: PROYECTOS --- */}
      {activeTab === 'proyectos' && (
        <>
          <form onSubmit={handleSubmitProyecto} className="bg-panel p-6 border border-neon/30 mb-8 grid grid-cols-2 gap-4 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <div className="col-span-2 flex justify-between items-center mb-2">
              <span className="text-neon text-sm tracking-widest">{editingId ? 'EDICIÓN_DE_REGISTRO' : 'NUEVO_REGISTRO'}</span>
              {editingId && <button type="button" onClick={cancelarEdicion} className="text-red-500 text-xs hover:underline">CANCELAR EDICIÓN</button>}
            </div>

            <input className="bg-obsidian border border-gray-800 p-3 col-span-2 text-sm focus:outline-none focus:border-neon transition-colors" placeholder="Título del Proyecto" value={formProyecto.titulo} onChange={e => setFormProyecto({...formProyecto, titulo: e.target.value})} required />
            <textarea className="bg-obsidian border border-gray-800 p-3 col-span-2 text-sm h-24 focus:outline-none focus:border-neon transition-colors" placeholder="Descripción de la arquitectura" value={formProyecto.descripcion} onChange={e => setFormProyecto({...formProyecto, descripcion: e.target.value})} required />
            <input className="bg-obsidian border border-gray-800 p-3 text-sm focus:outline-none focus:border-neon transition-colors" placeholder="Stack (Ej: Flutter, Kotlin)" value={formProyecto.tecnologias} onChange={e => setFormProyecto({...formProyecto, tecnologias: e.target.value})} required />
            
            <select className="bg-obsidian border border-gray-800 p-3 text-sm text-gray-300 focus:outline-none focus:border-neon transition-colors" value={formProyecto.categoria} onChange={e => setFormProyecto({...formProyecto, categoria: e.target.value})}>
              <option value="MOBILE">MOBILE (Android / Flutter)</option>
              <option value="WEB">WEB_APP (Laravel / React / JS)</option>
              <option value="BACKEND">BACKEND (Python / FastAPI)</option>
              <option value="DESKTOP">DESKTOP (Java / C++)</option>
            </select>
            
            <input className="bg-obsidian border border-gray-800 p-3 text-sm focus:outline-none focus:border-neon transition-colors" placeholder="URL Repositorio (GitHub)" value={formProyecto.url_repo} onChange={e => setFormProyecto({...formProyecto, url_repo: e.target.value})} />
            <input className="bg-obsidian border border-gray-800 p-3 text-sm focus:outline-none focus:border-neon transition-colors" placeholder="URL Imagen Frontal" value={formProyecto.imagen_url} onChange={e => setFormProyecto({...formProyecto, imagen_url: e.target.value})} />
            
            <button className={`col-span-2 text-black font-bold py-3 mt-4 transition-colors tracking-widest text-sm ${editingId ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-neon hover:bg-white'}`}>
              {editingId ? 'EXECUTE_UPDATE' : 'EXECUTE_INSERT'}
            </button>
          </form>

          <div>
            <h3 className="text-gray-400 mb-4 border-b border-gray-800 pb-2 text-sm">DATA_RECORDS</h3>
            {proyectos.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-panel border border-gray-800 p-4 mb-3 hover:border-gray-600 transition-colors">
                <span className="text-sm">{p.titulo} <span className="text-xs text-neon ml-2">[{p.categoria}]</span></span>
                <div className="flex gap-4">
                  <button onClick={() => iniciarEdicion(p)} className="text-yellow-500 hover:text-yellow-400 text-xs tracking-wider">EDIT</button>
                  <button onClick={() => eliminarProyecto(p.id)} className="text-red-500 hover:text-red-400 text-xs tracking-wider">TERMINATE</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- PESTAÑA: PERFIL MAESTRO --- */}
      {activeTab === 'perfil' && (
        <form onSubmit={handleSubmitPerfil} className="bg-panel p-6 border border-gray-800 grid grid-cols-2 gap-6 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
          <div className="col-span-2 mb-2"><span className="text-gray-400 text-sm tracking-widest border-b border-gray-800 pb-2 block">DATOS_PRINCIPALES</span></div>
          
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">IDENTIFICADOR (NOMBRE)</label>
            <input className="w-full bg-obsidian border border-gray-800 p-3 text-sm focus:border-neon outline-none" value={perfil.nombre} onChange={e => setPerfil({...perfil, nombre: e.target.value})} required />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">TÍTULO PROFESIONAL</label>
            <input className="w-full bg-obsidian border border-gray-800 p-3 text-sm focus:border-neon outline-none" value={perfil.titulo} onChange={e => setPerfil({...perfil, titulo: e.target.value})} required />
          </div>
          
          <div className="col-span-2">
            <label className="text-[10px] text-gray-500 block mb-1">DESCRIPCIÓN (ABOUT ME)</label>
            <textarea className="w-full bg-obsidian border border-gray-800 p-3 text-sm h-32 focus:border-neon outline-none" value={perfil.descripcion} onChange={e => setPerfil({...perfil, descripcion: e.target.value})} required />
          </div>

          <div className="col-span-2">
            <label className="text-[10px] text-gray-500 block mb-1">URL FOTO DE PERFIL</label>
            <input className="w-full bg-obsidian border border-gray-800 p-3 text-sm focus:border-neon outline-none" placeholder="https://..." value={perfil.imagen_url || ''} onChange={e => setPerfil({...perfil, imagen_url: e.target.value})} />
          </div>

          <div className="col-span-2 mt-4"><span className="text-gray-400 text-sm tracking-widest border-b border-gray-800 pb-2 block">CONTACTO_Y_REDES</span></div>

          <div className="col-span-2 md:col-span-1">
            <label className="text-[10px] text-gray-500 block mb-1">EMAIL PRINCIPAL</label>
            <input type="email" className="w-full bg-obsidian border border-gray-800 p-3 text-sm focus:border-neon outline-none" value={perfil.email} onChange={e => setPerfil({...perfil, email: e.target.value})} required />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-[10px] text-gray-500 block mb-1">URL GITHUB</label>
            <input className="w-full bg-obsidian border border-gray-800 p-3 text-sm focus:border-neon outline-none" value={perfil.github_url || ''} onChange={e => setPerfil({...perfil, github_url: e.target.value})} />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-gray-500 block mb-1">URL LINKEDIN</label>
            <input className="w-full bg-obsidian border border-gray-800 p-3 text-sm focus:border-neon outline-none" placeholder="https://linkedin.com/in/..." value={perfil.linkedin_url || ''} onChange={e => setPerfil({...perfil, linkedin_url: e.target.value})} />
          </div>

          <button className="col-span-2 bg-neon text-black font-bold py-4 mt-6 hover:bg-white transition-colors tracking-widest text-sm">
            OVERRIDE_PROFILE_DATA
          </button>
        </form>
      )}
    </div>
  );
}