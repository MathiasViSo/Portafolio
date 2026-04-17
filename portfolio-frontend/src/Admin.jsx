import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, UploadCloud, Loader2, RefreshCw, ShieldCheck, Lock, Plus, Trash2, Tags, ClipboardPaste, Eye, Edit3, Crop } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Cropper from 'react-easy-crop';
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

// --- UTILIDAD PARA GENERAR EL RECORTE DE IMAGEN ---
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(new File([file], 'foto_perfil.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg');
  });
};
// ---------------------------------------------------

export default function AdminPanel() {
  const [authKey, setAuthKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('proyectos');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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
  const [formProyecto, setFormProyecto] = useState({ titulo: '', descripcion: '', tecnologias: '', categoria: '', url_repo: '', imagen_url: '' });
  const [perfil, setPerfil] = useState({ nombre: '', titulo: '', descripcion: '', imagen_url: '', email: '', github_url: '', linkedin_url: '', redes_sociales: '[]' });
  const [redesExtra, setRedesExtra] = useState([]);

  // --- ESTADOS PARA EL RECORTADOR (CROPPER) ---
  const [cropModal, setCropModal] = useState({ show: false, imageSrc: null });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const getAuth = () => ({ headers: { 'x-token': localStorage.getItem('admin_token') } });

  const cargarMensajes = (pagina, reset = false) => {
    api.get(`/mensajes?skip=${pagina * msgLimit}&limit=${msgLimit}`, getAuth()).then(res => {
      if(res.data.length < msgLimit) setHasMoreMsgs(false); else setHasMoreMsgs(true);
      if(reset) setMensajes(res.data); else setMensajes(prev => [...prev, ...res.data]);
    }).catch(() => {});
  };

  const cargarDatos = () => {
    api.get('/proyectos?skip=0&limit=50').then(res => setProyectos(res.data)).catch(() => {});
    api.get('/categorias').then(res => setCategorias(res.data)).catch(() => {});
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
      showToast("Bienvenido");
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

  const handlePasteImage = (e, target) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault(); 
        const file = items[i].getAsFile();
        procesarSubidaImagen(file, target);
        break; 
      }
    }
  };

  // --- LÓGICA DEL RECORTADOR ---
  const handleSelectFileForCrop = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setCropModal({ show: true, imageSrc: reader.result }));
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = null; // Reset
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCroppedImage = async () => {
    try {
      const croppedFile = await getCroppedImg(cropModal.imageSrc, croppedAreaPixels);
      setCropModal({ show: false, imageSrc: null }); // Cerrar modal rápido
      procesarSubidaImagen(croppedFile, 'perfil'); // Subir el archivo generado
    } catch (e) {
      showToast("Error al procesar el recorte", "error");
    }
  };
  // ------------------------------

  const toggleCategoria = (cat) => {
    const currentCats = formProyecto.categoria ? formProyecto.categoria.split(',').map(c => c.trim()).filter(Boolean) : [];
    let newCats;
    if (currentCats.includes(cat)) newCats = currentCats.filter(c => c !== cat);
    else newCats = [...currentCats, cat];
    setFormProyecto({ ...formProyecto, categoria: newCats.join(', ') });
  };

  const handleSubmitProyecto = async (e) => {
    e.preventDefault();
    if (!formProyecto.categoria) return showToast("Debes seleccionar al menos una categoría", "error");
    try {
      if (editingId) { await api.put(`/proyectos/${editingId}`, formProyecto, getAuth()); showToast("Proyecto actualizado"); } 
      else { await api.post('/proyectos', formProyecto, getAuth()); showToast("Proyecto creado"); }
      setFormProyecto({ titulo: '', descripcion: '', tecnologias: '', categoria: '', url_repo: '', imagen_url: '' });
      setEditingId(null); setShowPreview(false); cargarDatos();
    } catch (error) { showToast("Error al guardar", "error"); }
  };

  const iniciarEdicion = (proyecto) => {
    setEditingId(proyecto.id); setShowPreview(false);
    setFormProyecto({ titulo: proyecto.titulo, descripcion: proyecto.descripcion, tecnologias: proyecto.tecnologias, categoria: proyecto.categoria, url_repo: proyecto.url_repo || '', imagen_url: proyecto.imagen_url || '' });
    window.scrollTo(0, 0);
  };

  const eliminarProyecto = async (id) => {
    if(window.confirm("¿Eliminar este proyecto permanentemente?")) {
      try { await api.delete(`/proyectos/${id}`, getAuth()); showToast("Proyecto eliminado"); cargarDatos(); } catch (error) { showToast("Error al eliminar", "error"); }
    }
  };

  const eliminarMensaje = async (id) => {
    if(window.confirm("¿Eliminar este mensaje?")) {
      try { await api.delete(`/mensajes/${id}`, getAuth()); showToast("Mensaje eliminado"); setMensajes(prev => prev.filter(m => m.id !== id)); } catch (error) { showToast("Error al eliminar", "error"); }
    }
  };

  const handleAddCategoria = () => {
    if(!nuevaCategoria.trim()) return;
    const nombre = nuevaCategoria.trim().toUpperCase().replace(/ /g, '_');
    if(categorias.includes(nombre)) return showToast("La categoría ya existe", "error");
    setCategorias([...categorias, nombre]); setNuevaCategoria('');
  };

  const handleRemoveCategoria = (cat) => setCategorias(categorias.filter(c => c !== cat));

  const handleSaveCategorias = async () => {
    try { await api.put('/categorias', { categorias }, getAuth()); showToast("Categorías guardadas correctamente"); cargarDatos(); } catch (error) { showToast("Error al guardar", "error"); }
  };

  const handleAddRed = () => setRedesExtra([...redesExtra, { nombre: '', url: '' }]);
  const handleRemoveRed = (idx) => setRedesExtra(redesExtra.filter((_, i) => i !== idx));
  const handleChangeRed = (idx, field, value) => {
    const newRedes = [...redesExtra]; newRedes[idx][field] = value; setRedesExtra(newRedes);
  };

  const handleSubmitPerfil = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...perfil, redes_sociales: JSON.stringify(redesExtra) };
      await api.put('/perfil', payload, getAuth());
      showToast("Perfil actualizado"); cargarDatos();
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
          </div>
          <input type="password" placeholder="Clave Maestra" autoFocus className="w-full bg-[#0c0e12] border border-gray-700 p-4 rounded-xl text-white text-center focus:border-primary-container outline-none transition-all mb-6" value={authKey} onChange={(e) => setAuthKey(e.target.value)} />
          <button className="w-full bg-primary-container text-background font-bold py-4 rounded-xl hover:brightness-110 transition-all uppercase tracking-widest text-sm shadow-lg shadow-primary-container/10">Desbloquear Sistema</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111318] font-body p-4 md:p-8 text-white max-w-6xl mx-auto relative">
      <AnimatePresence>{toast.show && <Toast message={toast.message} type={toast.type} />}</AnimatePresence>
      
      {/* MODAL DEL RECORTADOR (CROPPER) */}
      <AnimatePresence>
        {cropModal.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-2xl h-[60vh] bg-black rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
              <Cropper
                image={cropModal.imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // 1:1 para perfil (cuadrado/círculo)
                cropShape="round" // Aspecto visual de círculo para guiarte
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="w-full max-w-2xl mt-6 flex flex-col sm:flex-row items-center gap-4">
              <input type="range" value={zoom} min={1} max={3} step={0.1} aria-labelledby="Zoom" onChange={(e) => setZoom(e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00F0FF]" />
              <div className="flex w-full sm:w-auto gap-2">
                <button onClick={() => setCropModal({ show: false, imageSrc: null })} className="px-6 py-3 rounded-lg font-bold text-sm bg-gray-800 text-white hover:bg-gray-700 w-full">Cancelar</button>
                <button onClick={handleSaveCroppedImage} className="px-6 py-3 rounded-lg font-bold text-sm bg-primary-container text-background flex items-center gap-2 hover:brightness-110 w-full justify-center">
                  <Crop size={18} /> Recortar y Subir
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 border-b border-gray-800 pb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter">Panel de Gestión</h2>
          <p className="text-on-surface-variant text-sm mt-1">Control total de arquitectura y contenidos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['proyectos', 'categorias', 'perfil', 'mensajes', 'seguridad'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 font-bold text-xs uppercase rounded-lg transition-all ${activeTab === tab ? 'bg-primary-container text-background' : 'bg-surface-container-high text-gray-400 hover:text-white'}`}>
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
              <input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-lg focus:border-[#00f0ff] outline-none text-white uppercase" placeholder="NUEVA_CATEGORIA" value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCategoria()} />
              <button onClick={handleAddCategoria} className="bg-gray-800 text-white px-6 font-bold uppercase text-xs rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap">Añadir</button>
            </div>
            <div className="space-y-3 mb-8">
              {categorias.map(cat => (
                <div key={cat} className="flex justify-between items-center bg-[#0c0e12] p-4 rounded-lg border border-gray-800">
                  <span className="font-mono text-sm font-bold text-primary-container">{cat}</span>
                  <button onClick={() => handleRemoveCategoria(cat)} className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
            <button onClick={handleSaveCategorias} className="w-full bg-primary-container text-background font-bold py-4 rounded-xl hover:brightness-110 transition-all uppercase text-xs tracking-widest">Guardar Cambios de Categorías</button>
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
              <div><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Contraseña Actual</label><input type="password" required className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-lg focus:border-primary-container outline-none" value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})} /></div>
              <div><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Nueva Contraseña</label><input type="password" required className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-lg focus:border-primary-container outline-none" value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} /></div>
              <div><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Confirmar Nueva Contraseña</label><input type="password" required className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-lg focus:border-primary-container outline-none" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} /></div>
              <button className="w-full bg-primary-container text-background font-bold py-4 rounded-xl mt-4 hover:brightness-110 transition-all uppercase text-xs tracking-widest">Actualizar Credenciales</button>
            </form>
          </div>
        </motion.div>
      )}

      {activeTab === 'mensajes' && (
        <div>
          <div className="border-b border-gray-800 pb-4 mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><Mail size={20}/> Bandeja de Entrada</h3></div>
          <div className="grid gap-4">
            {mensajes.length === 0 ? <p className="text-gray-500 italic p-8 text-center bg-[#1a1c20] rounded-xl border border-gray-800">No tienes mensajes nuevos.</p> : (
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
                {hasMoreMsgs && <button onClick={() => { const next = msgPage + 1; setMsgPage(next); cargarMensajes(next); }} className="mt-6 flex items-center justify-center gap-2 w-full py-4 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 rounded-lg transition-colors text-sm font-bold tracking-widest uppercase"><RefreshCw size={16} /> Cargar mensajes antiguos</button>}
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
              {editingId && <button type="button" onClick={() => {setEditingId(null); setShowPreview(false); setFormProyecto({ titulo: '', descripcion: '', tecnologias: '', categoria: '', url_repo: '', imagen_url: '' })}} className="text-red-400 text-sm font-bold hover:underline">Cancelar Edición</button>}
            </div>

            <div className="col-span-2 md:col-span-1"><label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Título del Proyecto</label><input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none text-white" value={formProyecto.titulo} onChange={e => setFormProyecto({...formProyecto, titulo: e.target.value})} required /></div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Categorías (Selecciona Varias)</label>
              <div className="flex flex-wrap gap-2 p-2 bg-[#0c0e12] border border-gray-800 rounded-md min-h-[48px] items-center">
                {categorias.map(cat => {
                  const isSelected = formProyecto.categoria ? formProyecto.categoria.split(',').map(c => c.trim()).includes(cat) : false;
                  return (
                    <button type="button" key={cat} onClick={() => toggleCategoria(cat)} className={`px-3 py-1.5 text-xs font-bold rounded-md uppercase transition-all ${isSelected ? 'bg-primary-container text-background shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'bg-[#1a1c20] text-gray-400 border border-gray-700 hover:border-[#00f0ff] hover:text-white'}`}>{cat.replace(/_/g, ' ')}</button>
                  );
                })}
              </div>
            </div>

            <div className="col-span-2">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs uppercase tracking-wider text-gray-400">Descripción Detallada</label>
                <button type="button" onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 text-xs font-bold bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors">{showPreview ? <><Edit3 size={14}/> Editar Código</> : <><Eye size={14}/> Ver Resultado Visual</>}</button>
              </div>
              {showPreview ? (
                <div className="w-full bg-[#0c0e12] border border-[#00f0ff]/50 p-4 rounded-md h-40 overflow-y-auto custom-scrollbar text-sm shadow-[0_0_15px_rgba(0,240,255,0.05)]">
                  <ReactMarkdown components={{ ul: ({node, ...props}) => <ul className="space-y-3 mt-4 mb-6" {...props} />, li: ({node, ...props}) => (<li className="flex items-start gap-3 text-gray-300 leading-relaxed font-light text-sm"><span className="text-primary-container mt-1.5 flex-shrink-0 text-[10px]">◈</span><span>{props.children}</span></li>), strong: ({node, ...props}) => <strong className="font-bold text-white text-primary-container/90" {...props} />, p: ({node, ...props}) => <p className="mb-4 text-sm text-gray-300 leading-relaxed font-light" {...props} />, h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mt-4 mb-2" {...props} />, h2: ({node, ...props}) => <h2 className="text-base font-bold text-white mt-4 mb-2" {...props} />, }}>{formProyecto.descripcion || '*No hay contenido...*'}</ReactMarkdown>
                </div>
              ) : ( <textarea className="w-full bg-[#0c0e12] border border-gray-800 p-4 rounded-md h-40 focus:border-[#00f0ff] outline-none resize-none text-sm font-mono text-gray-300" placeholder="Escribe usando Markdown..." value={formProyecto.descripcion} onChange={e => setFormProyecto({...formProyecto, descripcion: e.target.value})} required /> )}
            </div>

            <div className="col-span-2 md:col-span-1"><label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Tecnologías Utilizadas</label><input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none text-white" value={formProyecto.tecnologias} onChange={e => setFormProyecto({...formProyecto, tecnologias: e.target.value})} required /></div>
            <div className="col-span-2 md:col-span-1"><label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Enlace al Repositorio</label><input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none text-white" value={formProyecto.url_repo} onChange={e => setFormProyecto({...formProyecto, url_repo: e.target.value})} /></div>
            
            <div className="col-span-2">
              <div className="flex justify-between items-end mb-2">
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400">URLs de las Imágenes <span className="text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded text-[10px]">Ctrl+V habilitado</span></label>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRefProyecto} onChange={(e) => { procesarSubidaImagen(e.target.files[0], 'proyecto'); e.target.value = null; }} />
                <button type="button" disabled={isUploading} onClick={() => fileInputRefProyecto.current.click()} className="flex items-center gap-2 text-xs font-bold bg-secondary text-background px-3 py-1.5 rounded hover:bg-white transition-colors disabled:opacity-50">{isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} Subir Archivo</button>
              </div>
              <div className="relative">
                {isUploading && <div className="absolute inset-0 bg-[#0c0e12]/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-md border border-[#00f0ff]"><span className="flex items-center gap-2 text-[#00f0ff] font-bold text-sm tracking-widest uppercase"><Loader2 size={18} className="animate-spin"/> Subiendo...</span></div>}
                <textarea className="w-full bg-[#0c0e12] border border-gray-800 p-4 rounded-md h-28 focus:border-[#00f0ff] outline-none resize-none text-sm transition-all text-gray-300" placeholder="URLs de imágenes..." value={formProyecto.imagen_url} onChange={e => setFormProyecto({...formProyecto, imagen_url: e.target.value})} onPaste={(e) => handlePasteImage(e, 'proyecto')} />
                <ClipboardPaste className="absolute bottom-3 right-3 text-gray-700 pointer-events-none opacity-50" size={24} />
              </div>
            </div>
            
            <button disabled={isUploading || !formProyecto.categoria} className={`col-span-2 text-background font-bold py-4 mt-4 rounded-md transition-colors uppercase tracking-widest text-sm disabled:opacity-50 ${editingId ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-primary-container hover:bg-white'}`}>{editingId ? 'Guardar Cambios del Proyecto' : 'Publicar Nuevo Proyecto'}</button>
          </form>

          <div>
            <h3 className="text-gray-300 mb-4 text-lg font-bold">Proyectos Publicados</h3>
            <div className="grid gap-3">
              {proyectos.map(p => (
                <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between bg-[#1a1c20] border border-gray-800 p-5 rounded-lg hover:border-gray-600 transition-colors">
                  <div>
                    <span className="text-base font-bold text-white block md:inline">{p.titulo}</span>
                    <div className="inline-flex flex-wrap gap-2 mt-2 md:mt-0 md:ml-3">
                      {p.categoria && p.categoria.split(',').map((cat, i) => ( <span key={i} className="text-[10px] text-primary-container bg-primary-container/10 px-2 py-1 rounded font-bold uppercase tracking-wider">{cat.trim().replace(/_/g, ' ')}</span> ))}
                    </div>
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
          <div className="col-span-2 border-b border-gray-800 pb-4 mb-2"><h3 className="text-lg font-bold text-white">Información Principal</h3></div>
          
          <div className="col-span-2 md:col-span-1"><label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Nombre Completo</label><input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none text-white" value={perfil.nombre} onChange={e => setPerfil({...perfil, nombre: e.target.value})} required /></div>
          <div className="col-span-2 md:col-span-1"><label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Título Profesional</label><input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none text-white" value={perfil.titulo} onChange={e => setPerfil({...perfil, titulo: e.target.value})} required /></div>
          
          <div className="col-span-2"><label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Perfil Profesional</label><textarea className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md h-32 focus:border-[#00f0ff] outline-none resize-none text-white" value={perfil.descripcion} onChange={e => setPerfil({...perfil, descripcion: e.target.value})} required /></div>

          {/* BOTÓN CON RECORTADOR PARA FOTO DE PERFIL */}
          <div className="col-span-2">
            <div className="flex justify-between items-end mb-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400">URL Foto de Perfil</label>
              <input 
                type="file" accept="image/*" className="hidden" ref={fileInputRefPerfil} 
                onChange={handleSelectFileForCrop} 
              />
              <button type="button" disabled={isUploading} onClick={() => fileInputRefPerfil.current.click()} className="flex items-center gap-2 text-xs font-bold bg-secondary text-background px-3 py-1.5 rounded hover:bg-white transition-colors disabled:opacity-50">
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Crop size={14} />} Elegir y Recortar
              </button>
            </div>
            
            <div className="relative">
               {isUploading && <div className="absolute inset-0 bg-[#0c0e12]/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-md border border-[#00f0ff]"><span className="flex items-center gap-2 text-[#00f0ff] font-bold text-sm tracking-widest uppercase"><Loader2 size={16} className="animate-spin"/> Subiendo...</span></div>}
              <input 
                className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none text-sm text-gray-300" 
                placeholder="Pega una URL aquí..." value={perfil.imagen_url || ''} 
                onChange={e => setPerfil({...perfil, imagen_url: e.target.value})} 
              />
            </div>
          </div>

          <div className="col-span-2 border-b border-gray-800 pb-4 mb-2 mt-4"><h3 className="text-lg font-bold text-white">Contacto y Redes</h3></div>

          <div className="col-span-2 md:col-span-1"><label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Correo Electrónico</label><input type="email" className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none text-white" value={perfil.email} onChange={e => setPerfil({...perfil, email: e.target.value})} required /></div>
          <div className="col-span-2 md:col-span-1"><label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Enlace de GitHub</label><input className="w-full bg-[#0c0e12] border border-gray-800 p-3 rounded-md focus:border-[#00f0ff] outline-none text-white" value={perfil.github_url || ''} onChange={e => setPerfil({...perfil, github_url: e.target.value})} /></div>

          <div className="col-span-2 border-b border-gray-800 pb-4 mb-2 mt-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Redes Sociales Extra</h3>
            <button type="button" onClick={handleAddRed} className="flex items-center gap-2 text-xs font-bold bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors"><Plus size={14} /> Añadir Red</button>
          </div>

          {redesExtra.map((red, idx) => (
            <div key={idx} className="col-span-2 flex flex-col md:flex-row gap-4 items-end bg-[#0c0e12] p-4 rounded-lg border border-gray-800">
              <div className="w-full md:w-1/3"><label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Nombre</label><input className="w-full bg-transparent border-b border-gray-700 p-2 text-white focus:border-[#00f0ff] outline-none" value={red.nombre} onChange={e => handleChangeRed(idx, 'nombre', e.target.value)} required /></div>
              <div className="w-full md:w-2/3"><label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">URL</label><div className="flex gap-2"><input className="w-full bg-transparent border-b border-gray-700 p-2 text-white focus:border-[#00f0ff] outline-none" value={red.url} onChange={e => handleChangeRed(idx, 'url', e.target.value)} required /><button type="button" onClick={() => handleRemoveRed(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={18} /></button></div></div>
            </div>
          ))}

          <button disabled={isUploading} className="col-span-2 bg-primary-container text-background font-bold py-4 mt-6 rounded-md hover:bg-white transition-colors uppercase tracking-widest text-sm disabled:opacity-50">Guardar Cambios del Perfil</button>
        </form>
      )}
    </div>
  );
}