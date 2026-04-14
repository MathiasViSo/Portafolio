import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, UploadCloud, Loader2, RefreshCw, ShieldCheck, Lock, Plus, Trash2, Tags, ClipboardPaste } from 'lucide-react';
import api from './api';

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
  const [isUploading, setIsUploading] = useState(false);

  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });

  const fileInputRefProyecto = useRef(null);
  const fileInputRefPerfil = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const [proyectos, setProyectos] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  
  const [msgPage, setMsgPage] = useState(0);
  const [hasMoreMsgs, setHasMoreMsgs] = useState(true);
  const msgLimit = 15;

  const [editingId, setEditingId] = useState(null);
  const [formProyecto, setFormProyecto] = useState({ 
    titulo: '', descripcion: '', tecnologias: '', categoria: '', url_repo: '', imagen_url: '' 
  });
  const [perfil, setPerfil] = useState({
    nombre: '', titulo: '', descripcion: '', imagen_url: '', email: '', github_url: '', linkedin_url: '', redes_sociales: '[]'
  });
  
  const [redesExtra, setRedesExtra] = useState([]);

  const getAuth = () => ({
    headers: { 'x-token': localStorage.getItem('admin_token') }
  });

  const cargarMensajes = (pagina, reset = false) => {
    api.get(`/mensajes?skip=${pagina * msgLimit}&limit=${msgLimit}`, getAuth()).then(res => {
      if(res.data.length < msgLimit) setHasMoreMsgs(false);
      else setHasMoreMsgs(true);
      if(reset) setMensajes(res.data);
      else setMensajes(prev => [...prev, ...res.data]);
    }).catch(() => {});
  };

  const cargarDatos = () => {
    api.get('/proyectos?skip=0&limit=50').then(res => setProyectos(res.data)).catch(() => {});
    api.get('/categorias').then(res => {
        setCategorias(res.data);
        if(res.data.length > 0) setFormProyecto(prev => ({...prev, categoria: res.data[0]}));
    }).catch(() => {});
    api.get('/perfil').then(res => {
      setPerfil(res.data);
      setRedesExtra(JSON.parse(res.data.redes_sociales || '[]'));
    }).catch(() => {});
    setMsgPage(0);
    cargarMensajes(0, true);
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) { setIsAuthenticated(true); cargarDatos(); }
  }, []);

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { password: authKey });
      localStorage.setItem('admin_token', res.data.access_token);
      setIsAuthenticated(true);
      cargarDatos();
      showToast("Bienvenido, Mathias");
    } catch (error) { showToast("Credenciales inválidas.", "error"); }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    window.location.reload();
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) return showToast("Las contraseñas no coinciden", "error");
    try {
      await api.put('/admin/password', { current_password: passForm.current, new_password: passForm.new }, getAuth());
      showToast("Contraseña actualizada. Inicia sesión de nuevo.");
      setTimeout(() => logout(), 2000);
    } catch (error) { showToast(error.response?.data?.detail || "Error", "error"); }
  };

  // --- LÓGICA MEJORADA DE SUBIDA DE IMÁGENES (Soporta archivos directos) ---
  const procesarSubidaImagen = async (file, target) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data', 'x-token': localStorage.getItem('admin_token') }});
      const newUrl = res.data.url;
      if (target === 'proyecto') setFormProyecto(prev => ({ ...prev, imagen_url: prev.imagen_url ? `${prev.imagen_url}, ${newUrl}` : newUrl }));
      else if (target === 'perfil') setPerfil(prev => ({ ...prev, imagen_url: newUrl }));
      showToast("Imagen subida exitosamente");
    } catch (error) { showToast("Error subiendo imagen.", "error"); } 
    finally { setIsUploading(false); }
  };

  // --- NUEVA LÓGICA: INTERCEPTAR EL PORTAPAPELES (CTRL+V) ---
  const handlePasteImage = (e, target) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      // Si el elemento pegado es una imagen (ej: un recorte de pantalla o imagen copiada de la web)
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault(); // Evitamos que intente pegar texto raro en el input
        const file = items[i].getAsFile();
        procesarSubidaImagen(file, target);
        break; // Solo subimos una imagen a la vez por cada Ctrl+V
      }
    }
  };

  const handleSubmitProyecto = async (e) => {
    e.preventDefault();
    if (!formProyecto.categoria) return showToast("Debes seleccionar o crear una categoría", "error");
    try {
      if (editingId) {
        await api.put(`/proyectos/${editingId}`, formProyecto, getAuth());
        showToast("Proyecto actualizado");
      } else {
        await api.post('/proyectos', formProyecto, getAuth());
        showToast("Proyecto creado");
      }
      setFormProyecto({ titulo: '', descripcion: '', tecnologias: '', categoria: categorias[0] || '', url_repo: '', imagen_url: '' });
      setEditingId(null);
      cargarDatos();
    } catch (error) { showToast("Error al guardar", "error"); }
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
    if(window.confirm("¿Eliminar este proyecto permanentemente?")) {
      try {
        await api.delete(`/proyectos/${id}`, getAuth());
        showToast("Proyecto eliminado");
        cargarDatos();
      } catch (error) { showToast("Error al eliminar", "error"); }
    }
  };

  const eliminarMensaje = async (id) => {
    if(window.confirm("¿Eliminar este mensaje? No podrás recuperarlo.")) {
      try {
        await api.delete(`/mensajes/${id}`, getAuth());
        showToast("Mensaje eliminado");
        setMensajes(prev => prev.filter(m => m.id !== id));
      } catch (error) { showToast("Error al eliminar", "error"); }
    }
  };

  // --- GESTIÓN DE CATEGORÍAS ---
  const handleAddCategoria = () => {
    if(!nuevaCategoria.trim()) return;
    const nombre = nuevaCategoria.trim().toUpperCase().replace(/ /g, '_');
    if(categorias.includes(nombre)) return showToast("La categoría ya existe", "error");
    setCategorias([...categorias, nombre]);
    setNuevaCategoria('');
  };

  const handleRemoveCategoria = (cat) => {
    setCategorias(categorias.filter(c => c !== cat));
  };

  const handleSaveCategorias = async () => {
    try {
      await api.put('/categorias', { categorias }, getAuth());
      showToast("Categorías guardadas correctamente");
      cargarDatos();
    } catch (error) { showToast("Error al guardar", "error"); }
  };

  // --- GESTIÓN DE REDES ---
  const handleAddRed = () => setRedesExtra([...redesExtra, { nombre: '', url: '' }]);
  const handleRemoveRed = (idx) => setRedesExtra(redesExtra.filter((_, i) => i !== idx));
  const handleChangeRed = (idx, field, value) => {
    const newRedes = [...redesExtra];
    newRedes[idx][field] = value;
    setRedesExtra(newRedes);
  };

  const handleSubmitPerfil = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...perfil, redes_sociales: JSON.stringify(redesExtra) };
      await api.put('/perfil', payload, getAuth());
      showToast("Perfil actualizado");
      cargarDatos();
    } catch (error) { showToast("Error al actualizar perfil", "error"); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111318] flex items-center justify-center p-6 font-body">
        <AnimatePresence>{toast.show && <Toast message={toast.message} type={toast.type} />}</AnimatePresence>
        <form onSubmit={login} className="bg-[#1a1c20] p-10 rounded-2xl border border-outline-variant/20 w-full max-w-md shadow-2xl text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-container/30">
              <Lock className="text-primary-container" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Terminal de Acceso</h2>
            <p className="text-on-surface-variant text-sm">Identifícate para gestionar el sistema</p>
          </div>
          <input type="password" placeholder="Clave Maestra" autoFocus className="w-full bg-[#0c0e12] border border-gray-700 p-4 rounded-xl text-white text-center focus:border-primary-container outline-none transition-all mb-6" value={authKey} onChange={(e) => setAuthKey(e.target.value)} />
          <button className="w-full bg-primary-container text-background font-bold py-4 rounded-xl hover:brightness-110 transition-all uppercase tracking-widest text-sm shadow-lg shadow-primary-container/10">Desbloquear Sistema</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111318] font-body p-4 md:p-8 text-white max-w-6xl mx-auto">
      <AnimatePresence>{toast.show && <Toast message={toast.message} type={toast.type} />}</AnimatePresence>
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 border-b border-gray-800 pb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter">Panel de Gestión</h2>
          <p className="text-on-surface-variant text-sm mt-1">Control total de arquitectura y contenidos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['proyectos', 'categorias', 'perfil', 'mensajes', 'seguridad'].map((tab) => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 font-bold text-xs uppercase rounded-lg transition-all ${activeTab === tab ? 'bg-primary-container text-background' : 'bg-surface-container-high text-gray-400 hover:text-white'}`}
            >
              {tab === 'mensajes' ? `Bandeja (${mensajes.length})` : tab}
            </button>
          ))}
          <button onClick={logout} className="px-5 py-2.5 text-red-400 text-xs font-bold uppercase hover:bg-red-500/10 rounded-lg ml-2">Cerrar Sesión</button>
        </div>
      </div>

      {activeTab === 'categorias' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <div className="bg-[#1a1c20] p-8 rounded-2xl border border-outline-variant/20 shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              <Tags className="text-primary-container" />
              <h3 className="text-xl font-bold">Gestión de Categorías</h3>
            </div>
            
            <div className="flex gap-4 mb-8">
              <input 
                className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-lg focus:border-[#00f0ff] outline-none text-white uppercase" 
                placeholder="NUEVA_CATEGORIA" value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleAddCategoria()}
              />
              <button onClick={handleAddCategoria} className="bg-gray-800 text-white px-6 font-bold uppercase text-xs rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap">Añadir</button>
            </div>

            <div className="space-y-3 mb-8">
              {categorias.length === 0 ? <p className="text-gray-500 text-sm">No hay categorías. Añade una para empezar.</p> : null}
              {categorias.map(cat => (
                <div key={cat} className="flex justify-between items-center bg-[#0c0e12] p-4 rounded-lg border border-gray-800">
                  <span className="font-mono text-sm font-bold text-primary-container">{cat}</span>
                  <button onClick={() => handleRemoveCategoria(cat)} className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>

            <button onClick={handleSaveCategorias} className="w-full bg-primary-container text-background font-bold py-4 rounded-xl hover:brightness-110 transition-all uppercase text-xs tracking-widest">
              Guardar Cambios de Categorías
            </button>
            <p className="text-gray-500 text-xs mt-4 text-center">No olvides "Guardar Cambios" después de añadir o eliminar categorías.</p>
          </div>
        </motion.div>
      )}

      {activeTab === 'seguridad' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          <div className="bg-[#1a1c20] p-8 rounded-2xl border border-outline-variant/20 shadow-xl">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
              <ShieldCheck className="text-primary-container" />
              <h3 className="text-xl font-bold">Seguridad de Acceso</h3>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Contraseña Actual</label>
                <input type="password" required className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-lg focus:border-primary-container outline-none" value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Nueva Contraseña</label>
                <input type="password" required className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-lg focus:border-primary-container outline-none" value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Confirmar Nueva Contraseña</label>
                <input type="password" required className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-lg focus:border-primary-container outline-none" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} />
              </div>
              <button className="w-full bg-primary-container text-background font-bold py-4 rounded-xl mt-4 hover:brightness-110 transition-all uppercase text-xs tracking-widest">
                Actualizar Credenciales
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {activeTab === 'mensajes' && (
        <div>
          <div className="border-b border-gray-800 pb-4 mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Mail size={20}/> Bandeja de Entrada</h3>
            <p className="text-on-surface-variant text-sm mt-1">Mensajes recibidos desde el formulario de contacto</p>
          </div>
          <div className="grid gap-4">
            {mensajes.length === 0 ? (
              <p className="text-gray-500 italic p-8 text-center bg-[#1a1c20] rounded-xl border border-gray-800">No tienes mensajes nuevos.</p>
            ) : (
              <>
                {mensajes.map(m => (
                  <div key={m.id} className="bg-[#1a1c20] border border-gray-800 p-6 rounded-lg shadow-lg relative group">
                    <button onClick={() => eliminarMensaje(m.id)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors"><X size={20} /></button>
                    <div className="mb-4 border-b border-gray-800 pb-4 pr-8">
                      <h4 className="text-primary-container font-bold text-lg">{m.nombre}</h4>
                      <a href={`mailto:${m.email}`} className="text-sm text-gray-400 hover:text-white transition-colors block">{m.email}</a>
                      <span className="text-xs text-gray-500 block mt-2">{new Date(m.fecha).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{m.mensaje}</p>
                  </div>
                ))}
                {hasMoreMsgs && (
                  <button onClick={() => { const next = msgPage + 1; setMsgPage(next); cargarMensajes(next); }} className="mt-6 flex items-center justify-center gap-2 w-full py-4 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 rounded-lg transition-colors text-sm font-bold tracking-widest uppercase">
                    <RefreshCw size={16} /> Cargar mensajes antiguos
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'proyectos' && (
        <>
          <form onSubmit={handleSubmitProyecto} className="bg-[#1a1c20] p-8 rounded-xl border border-outline-variant/20 mb-8 grid grid-cols-2 gap-6 shadow-lg">
            <div className="col-span-2 flex justify-between items-center border-b border-gray-800 pb-4 mb-2">
              <h3 className="text-lg font-bold text-white">{editingId ? 'Editar Proyecto Existente' : 'Registrar Nuevo Proyecto'}</h3>
              {editingId && <button type="button" onClick={() => {setEditingId(null); setFormProyecto({ titulo: '', descripcion: '', tecnologias: '', categoria: categorias[0]||'', url_repo: '', imagen_url: '' })}} className="text-red-400 text-sm font-bold hover:underline">Cancelar Edición</button>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Título del Proyecto</label>
              <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" value={formProyecto.titulo} onChange={e => setFormProyecto({...formProyecto, titulo: e.target.value})} required />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Categoría</label>
              <select className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md text-gray-300 focus:border-[#00f0ff] outline-none" value={formProyecto.categoria} onChange={e => setFormProyecto({...formProyecto, categoria: e.target.value})} required>
                {categorias.length === 0 && <option value="">Crea una categoría primero</option>}
                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Descripción Detallada</label>
              <textarea className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md h-32 focus:border-[#00f0ff] outline-none resize-none" value={formProyecto.descripcion} onChange={e => setFormProyecto({...formProyecto, descripcion: e.target.value})} required />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Tecnologías Utilizadas</label>
              <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" placeholder="Ej: Flutter, Firebase, Dart" value={formProyecto.tecnologias} onChange={e => setFormProyecto({...formProyecto, tecnologias: e.target.value})} required />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Enlace al Repositorio</label>
              <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" placeholder="https://github.com/..." value={formProyecto.url_repo} onChange={e => setFormProyecto({...formProyecto, url_repo: e.target.value})} />
            </div>
            
            <div className="col-span-2">
              <div className="flex justify-between items-end mb-2">
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400">
                  URLs de las Imágenes 
                  <span className="text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded text-[10px]">¡NUEVO: Pega imágenes aquí con Ctrl+V!</span>
                </label>
                <input 
                  type="file" accept="image/*" className="hidden" ref={fileInputRefProyecto} 
                  onChange={(e) => { procesarSubidaImagen(e.target.files[0], 'proyecto'); e.target.value = null; }} 
                />
                <button type="button" disabled={isUploading} onClick={() => fileInputRefProyecto.current.click()} className="flex items-center gap-2 text-xs font-bold bg-secondary text-background px-3 py-1.5 rounded hover:bg-white transition-colors disabled:opacity-50">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} Subir Carpeta
                </button>
              </div>
              
              <div className="relative">
                {isUploading && (
                  <div className="absolute inset-0 bg-[#0c0e12]/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-md border border-[#00f0ff]">
                    <span className="flex items-center gap-2 text-[#00f0ff] font-bold text-sm tracking-widest uppercase">
                      <Loader2 size={18} className="animate-spin"/> Subiendo a Cloudinary...
                    </span>
                  </div>
                )}
                {/* TEXTAREA MÁGICO CON onPaste */}
                <textarea 
                  className="w-full bg-[#0c0e12] border border-gray-800 p-4 rounded-md h-28 focus:border-[#00f0ff] outline-none resize-none text-sm transition-all" 
                  placeholder="Aquí aparecerán las URLs... &#10;También puedes hacer CLIC AQUÍ y presionar Ctrl+V (o Cmd+V) para pegar una imagen directamente desde tu portapapeles." 
                  value={formProyecto.imagen_url} 
                  onChange={e => setFormProyecto({...formProyecto, imagen_url: e.target.value})}
                  onPaste={(e) => handlePasteImage(e, 'proyecto')}
                />
                <ClipboardPaste className="absolute bottom-3 right-3 text-gray-700 pointer-events-none opacity-50" size={24} />
              </div>
              <span className="text-gray-500 text-[10px] mt-2 block">Las URLs generadas se separan automáticamente por comas.</span>
            </div>
            
            <button disabled={isUploading || categorias.length === 0} className={`col-span-2 text-background font-bold py-4 mt-4 rounded-md transition-colors uppercase tracking-widest text-sm disabled:opacity-50 ${editingId ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-primary-container hover:bg-white'}`}>
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
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Perfil Profesional</label>
            <textarea className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md h-32 focus:border-[#00f0ff] outline-none resize-none" value={perfil.descripcion} onChange={e => setPerfil({...perfil, descripcion: e.target.value})} required />
          </div>

          <div className="col-span-2">
            <div className="flex justify-between items-end mb-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400">
                URL Foto de Perfil
                <span className="text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded text-[10px]">Ctrl+V habilitado</span>
              </label>
              <input 
                type="file" accept="image/*" className="hidden" ref={fileInputRefPerfil} 
                onChange={(e) => { procesarSubidaImagen(e.target.files[0], 'perfil'); e.target.value = null; }} 
              />
              <button type="button" disabled={isUploading} onClick={() => fileInputRefPerfil.current.click()} className="flex items-center gap-2 text-xs font-bold bg-secondary text-background px-3 py-1.5 rounded hover:bg-white transition-colors disabled:opacity-50">
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} Subir
              </button>
            </div>
            
            <div className="relative">
               {isUploading && (
                  <div className="absolute inset-0 bg-[#0c0e12]/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-md border border-[#00f0ff]">
                    <span className="flex items-center gap-2 text-[#00f0ff] font-bold text-sm tracking-widest uppercase">
                      <Loader2 size={16} className="animate-spin"/> Subiendo...
                    </span>
                  </div>
                )}
              {/* TEXTAREA MÁGICO CON onPaste */}
              <input 
                className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none text-sm" 
                placeholder="Pega una URL o haz clic aquí y presiona Ctrl+V para pegar una foto..." 
                value={perfil.imagen_url || ''} 
                onChange={e => setPerfil({...perfil, imagen_url: e.target.value})} 
                onPaste={(e) => handlePasteImage(e, 'perfil')}
              />
            </div>
          </div>

          <div className="col-span-2 border-b border-gray-800 pb-4 mb-2 mt-4">
            <h3 className="text-lg font-bold text-white">Contacto y Redes (Fijas)</h3>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Correo Electrónico</label>
            <input type="email" className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" value={perfil.email} onChange={e => setPerfil({...perfil, email: e.target.value})} required />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Enlace de GitHub</label>
            <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none" value={perfil.github_url || ''} onChange={e => setPerfil({...perfil, github_url: e.target.value})} />
          </div>

          <div className="col-span-2 border-b border-gray-800 pb-4 mb-2 mt-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Redes Sociales Extra</h3>
            <button type="button" onClick={handleAddRed} className="flex items-center gap-2 text-xs font-bold bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors">
              <Plus size={14} /> Añadir Red
            </button>
          </div>

          {redesExtra.map((red, idx) => (
            <div key={idx} className="col-span-2 flex flex-col md:flex-row gap-4 items-end bg-[#0c0e12] p-4 rounded-lg border border-gray-800">
              <div className="w-full md:w-1/3">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Nombre (Ej: LinkedIn)</label>
                <input className="w-full bg-transparent border-b border-gray-700 p-2 text-white focus:border-[#00f0ff] outline-none" value={red.nombre} onChange={e => handleChangeRed(idx, 'nombre', e.target.value)} required />
              </div>
              <div className="w-full md:w-2/3">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Enlace URL</label>
                <div className="flex gap-2">
                  <input className="w-full bg-transparent border-b border-gray-700 p-2 text-white focus:border-[#00f0ff] outline-none" placeholder="https://..." value={red.url} onChange={e => handleChangeRed(idx, 'url', e.target.value)} required />
                  <button type="button" onClick={() => handleRemoveRed(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}

          <button disabled={isUploading} className="col-span-2 bg-primary-container text-background font-bold py-4 mt-6 rounded-md hover:bg-white transition-colors uppercase tracking-widest text-sm disabled:opacity-50">
            Guardar Cambios del Perfil
          </button>
        </form>
      )}
    </div>
  );
}