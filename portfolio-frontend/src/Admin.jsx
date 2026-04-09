import React, { useState, useEffect } from 'react';
import api from './api';

export default function AdminPanel() {
  const [authKey, setAuthKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [form, setForm] = useState({ 
    titulo: '', descripcion: '', tecnologias: '', categoria: 'MOBILE', url_repo: '', imagen_url: '' 
  });

  const login = (e) => {
    e.preventDefault();
    if (authKey === 'root_mathias_2026') { 
      setIsAuthenticated(true);
      cargarProyectos();
    } else {
      alert("ACCESO DENEGADO: Credenciales incorrectas.");
    }
  };

  const cargarProyectos = () => {
    api.get('/proyectos').then(res => setProyectos(res.data)).catch(err => console.error(err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/proyectos', form, { headers: { 'x-token': authKey } });
      setForm({ titulo: '', descripcion: '', tecnologias: '', categoria: 'MOBILE', url_repo: '', imagen_url: '' });
      cargarProyectos();
    } catch (error) { 
      alert("Error de autorización al intentar guardar."); 
    }
  };

  const eliminar = async (id) => {
    if(window.confirm("¿Confirmar eliminación definitiva del registro?")) {
      try {
        await api.delete(`/proyectos/${id}`, { headers: { 'x-token': authKey } });
        cargarProyectos();
      } catch (error) {
        alert("Error de autorización al intentar eliminar.");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center font-mono">
        <form onSubmit={login} className="bg-panel p-8 border border-neon/50 flex flex-col gap-4 text-center shadow-[0_0_20px_rgba(0,240,255,0.1)]">
          <p className="text-neon tracking-widest text-sm mb-2">SYSTEM_LOCKED</p>
          <input 
            type="password" 
            placeholder="Enter Root Key" 
            className="bg-obsidian border border-gray-700 p-2 text-white text-center focus:border-neon outline-none transition-colors" 
            value={authKey} 
            onChange={(e) => setAuthKey(e.target.value)} 
          />
          <button className="bg-neon text-black font-bold py-2 hover:bg-white transition-colors tracking-widest">UNLOCK</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian font-mono p-8 text-white max-w-4xl mx-auto">
      <h2 className="text-2xl text-neon font-bold mb-6">ADMIN_TERMINAL // UNLOCKED</h2>
      
      <form onSubmit={handleSubmit} className="bg-panel p-6 border border-gray-800 mb-8 grid grid-cols-2 gap-4 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
        <input className="bg-obsidian border border-gray-800 p-3 col-span-2 text-sm focus:outline-none focus:border-neon transition-colors" placeholder="Título del Proyecto" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required />
        <textarea className="bg-obsidian border border-gray-800 p-3 col-span-2 text-sm h-24 focus:outline-none focus:border-neon transition-colors" placeholder="Descripción de la arquitectura" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required />
        <input className="bg-obsidian border border-gray-800 p-3 text-sm focus:outline-none focus:border-neon transition-colors" placeholder="Stack (Ej: Flutter, Kotlin, Java)" value={form.tecnologias} onChange={e => setForm({...form, tecnologias: e.target.value})} required />
        
        <select className="bg-obsidian border border-gray-800 p-3 text-sm text-gray-300 focus:outline-none focus:border-neon transition-colors" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
          <option value="MOBILE">MOBILE (Android / Flutter)</option>
          <option value="WEB">WEB_APP (Laravel / React / JS)</option>
          <option value="BACKEND">BACKEND (Python / FastAPI)</option>
          <option value="DESKTOP">DESKTOP (Java / C++)</option>
        </select>
        
        <input className="bg-obsidian border border-gray-800 p-3 text-sm focus:outline-none focus:border-neon transition-colors" placeholder="URL Repositorio (GitHub)" value={form.url_repo} onChange={e => setForm({...form, url_repo: e.target.value})} />
        <input className="bg-obsidian border border-gray-800 p-3 text-sm focus:outline-none focus:border-neon transition-colors" placeholder="URL Imagen (Cloudinary)" value={form.imagen_url} onChange={e => setForm({...form, imagen_url: e.target.value})} />
        
        <button className="col-span-2 bg-neon text-black font-bold py-3 mt-4 hover:bg-white transition-colors tracking-widest text-sm">EXECUTE_INSERT</button>
      </form>

      <div>
        <h3 className="text-gray-400 mb-4 border-b border-gray-800 pb-2 text-sm">DATA_RECORDS</h3>
        {proyectos.map(p => (
          <div key={p.id} className="flex justify-between items-center bg-panel border border-gray-800 p-4 mb-3 hover:border-gray-600 transition-colors">
            <span className="text-sm">{p.titulo} <span className="text-xs text-neon ml-2">[{p.categoria}]</span></span>
            <button onClick={() => eliminar(p.id)} className="text-red-500 hover:text-red-400 text-xs tracking-wider">TERMINATE_PROCESS</button>
          </div>
        ))}
      </div>
    </div>
  );
}