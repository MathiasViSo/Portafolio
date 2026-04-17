import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code, Smartphone, Database, Server, ExternalLink, X, FileText, Send, CheckCircle, RefreshCw, Link as LinkIcon, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactGA from 'react-ga4';
import ReactMarkdown from 'react-markdown';
import api from './api';
import AdminPanel from './Admin';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }};
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } }};

const Navbar = ({ perfil }) => (
  <nav className="fixed top-0 w-full z-50 bg-[#111318]/80 backdrop-blur-xl border-b border-[#00F0FF]/10 shadow-[0_0_20px_rgba(0,240,255,0.05)]">
    <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto font-headline tracking-tighter">
      <div className="text-xl font-bold tracking-widest text-on-surface uppercase">
        {perfil?.nombre ? perfil.nombre.split('_')[0] : 'PORTAFOLIO'}
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm">
        <a className="text-on-surface-variant hover:text-on-surface transition-all" href="#home">Inicio</a>
        <a className="text-on-surface-variant hover:text-on-surface transition-all" href="#skills">Habilidades</a>
        <a className="text-on-surface-variant hover:text-on-surface transition-all" href="#projects">Proyectos</a>
        <a className="text-on-surface-variant hover:text-on-surface transition-all" href="#contact">Contacto</a>
      </div>
    </div>
  </nav>
);

const Skills = () => (
  <section className="py-24 border-t border-outline-variant/10" id="skills">
    <div className="mb-16">
      <h2 className="text-2xl font-headline font-bold text-on-surface tracking-[0.2em] uppercase">Habilidades Técnicas</h2>
      <div className="w-20 h-1 bg-primary-container mt-4"></div>
    </div>
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { name: 'Mobile (Kotlin & Flutter)', icon: <Smartphone size={24}/>, color: 'bg-primary-container', desc: 'Desarrollo de aplicaciones móviles nativas y multiplataforma.' },
        { name: 'Backend (Python & FastAPI)', icon: <Terminal size={24}/>, color: 'bg-secondary', desc: 'Arquitectura de APIs REST seguras y de alto rendimiento.' },
        { name: 'Web (PHP & Laravel)', icon: <Server size={24}/>, color: 'bg-primary-container', desc: 'Sistemas monolíticos y plataformas web escalables.' },
        { name: 'Core (Java & SQL)', icon: <Database size={24}/>, color: 'bg-secondary', desc: 'Lógica empresarial, algoritmos y gestión de bases de datos.' }
      ].map((skill, i) => (
        <motion.div key={i} variants={fadeUp} className="glass-panel p-8 bg-surface-container-low/40 rounded-xl space-y-6 hover:bg-surface-container-low transition-all duration-300 group">
          <div className="flex items-center gap-4 text-on-surface">
            <span className={`text-${skill.color === 'bg-primary-container' ? 'primary-container' : 'secondary'}`}>{skill.icon}</span>
            <div>
              <span className="font-headline font-bold tracking-widest block">{skill.name}</span>
              <span className="text-sm text-on-surface-variant mt-1 block font-light">{skill.desc}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

const Contact = ({ perfil }) => {
  const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' });
  const [status, setStatus] = useState('idle');

  const enviarMensaje = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/mensajes', formData);
      setStatus('success');
      setFormData({ nombre: '', email: '', mensaje: '' });
      ReactGA.event({ category: "Engagement", action: "Send_Message", label: "Contact Form" });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section className="py-24 border-t border-outline-variant/10 relative" id="contact">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="flex flex-col justify-center">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary-container mb-4 block">Ponte en contacto</span>
          <h2 className="text-5xl font-headline font-bold text-on-surface tracking-tighter leading-none mb-8">
            Trabajemos <br/><span className="text-primary-fixed-dim">Juntos</span>
          </h2>
          <p className="text-on-surface-variant text-base max-w-md leading-relaxed mb-12">
            Estoy disponible para conversar sobre oportunidades laborales, proyectos de desarrollo de software o consultas sobre arquitectura de sistemas.
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(209,188,255,0.6)]"></div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">Correo Electrónico Principal</p>
                <a href={`mailto:${perfil?.email || ''}`} className="text-on-surface font-headline hover:text-secondary transition-colors">
                  {perfil?.email || 'Cargando...'}
                </a>
              </div>
            </div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-panel p-10 rounded-xl relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-container/30 to-transparent"></div>
          <form className="space-y-8" onSubmit={enviarMensaje}>
            <div className="relative group">
              <label className="block text-xs uppercase tracking-[0.1em] text-on-surface-variant mb-2">Nombre</label>
              <input required type="text" disabled={status === 'loading'} className="w-full bg-surface border-0 border-b border-outline-variant/30 py-3 px-2 text-on-surface focus:ring-0 focus:border-primary-container transition-colors placeholder:text-surface-variant font-headline disabled:opacity-50" placeholder="Tu nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div className="relative group">
              <label className="block text-xs uppercase tracking-[0.1em] text-on-surface-variant mb-2">Correo de Contacto</label>
              <input required type="email" disabled={status === 'loading'} className="w-full bg-surface border-0 border-b border-outline-variant/30 py-3 px-2 text-on-surface focus:ring-0 focus:border-primary-container transition-colors placeholder:text-surface-variant font-headline disabled:opacity-50" placeholder="tucorreo@ejemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="relative group">
              <label className="block text-xs uppercase tracking-[0.1em] text-on-surface-variant mb-2">Mensaje</label>
              <textarea required rows="3" disabled={status === 'loading'} className="w-full bg-surface border-0 border-b border-outline-variant/30 py-3 px-2 text-on-surface focus:ring-0 focus:border-primary-container transition-colors placeholder:text-surface-variant font-headline resize-none disabled:opacity-50" placeholder="Escribe tu mensaje aquí..." value={formData.mensaje} onChange={e => setFormData({...formData, mensaje: e.target.value})}></textarea>
            </div>
            <button type="submit" disabled={status === 'loading'} className={`w-full py-4 font-headline font-bold uppercase tracking-widest text-sm rounded-sm transition-all flex justify-center items-center gap-2 ${status === 'success' ? 'bg-green-600 text-white' : status === 'error' ? 'bg-red-600 text-white' : 'bg-gradient-to-r from-primary to-primary-container text-background hover:scale-[1.02]'}`}>
              {status === 'loading' && 'Enviando...'}
              {status === 'success' && <><CheckCircle size={18} /> ¡Mensaje Enviado!</>}
              {status === 'error' && 'Error al enviar'}
              {status === 'idle' && <>Enviar Mensaje <Send size={18} /></>}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

const Portfolio = () => {
  const [proyectos, setProyectos] = useState([]);
  const [proyectoActivo, setProyectoActivo] = useState(null);
  
  // NUEVO: Estado del Lightbox con Carrusel
  const [lightbox, setLightbox] = useState({ isOpen: false, index: 0, images: [] });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState('TODOS');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 6;

  const [categoriasDB, setCategoriasDB] = useState([]);

  const [perfil, setPerfil] = useState({
    nombre: 'Mathias Villazón', titulo: 'Estudiante de Ingeniería de Sistemas', 
    descripcion: 'Cargando información...', email: '', github_url: '', linkedin_url: '', redes_sociales: '[]'
  });

  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_TRACKING_ID;
    if (gaId) {
      ReactGA.initialize(gaId);
      ReactGA.send({ hitType: "pageview", page: window.location.pathname, title: "Home Portfolio" });
    }
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/perfil').catch(() => ({data: perfil})),
      // Si la BD aún no devuelve categorías dinámicas, dejamos un fallback temporal.
      api.get('/categorias').catch(() => ({data: ['MOBILE', 'WEB_APP', 'BACKEND', 'DESKTOP']}))
    ]).then(([resPerfil, resCat]) => {
      if(resPerfil.data.nombre) setPerfil(resPerfil.data);
      setCategoriasDB(resCat.data);
    });
  }, []);

  useEffect(() => {
    cargarProyectos(0, filtroActivo, true);
  }, [filtroActivo]);

  const cargarProyectos = (paginaActual, categoria, resetData = false) => {
    if(!resetData) setIsLoadingMore(true);
    
    // EL TRUCO: Pedimos limit + 1 para saber si existe una "página siguiente" oculta
    let url = `/proyectos?skip=${paginaActual * limit}&limit=${limit + 1}`;
    if(categoria !== 'TODOS') url += `&categoria=${categoria}`;

    api.get(url).then(res => {
      // Si trajo más del límite, sí hay más proyectos. Si no, ya llegamos al final.
      const hayMasProyectos = res.data.length > limit;
      setHasMore(hayMasProyectos);
      
      // Cortamos el proyecto extra para mostrar exactamente el límite (6)
      const dataParaMostrar = hayMasProyectos ? res.data.slice(0, limit) : res.data;

      if(resetData) setProyectos(dataParaMostrar);
      else setProyectos(prev => [...prev, ...dataParaMostrar]);
      
      setIsLoading(false); setIsLoadingMore(false);
    }).catch(() => { setIsLoading(false); setIsLoadingMore(false); });
  };

  const handleCargarMas = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    cargarProyectos(nextPage, filtroActivo, false);
  };

  const tabsFiltros = ['TODOS', ...categoriasDB];

  const getImagenes = (urlsString) => {
    if (!urlsString) return [];
    return urlsString.split(',').map(url => url.trim()).filter(url => url !== '');
  };

  const abrirProyecto = (proj) => {
    setProyectoActivo(proj);
    ReactGA.event({ category: "Projects", action: "View_Project_Details", label: proj.titulo });
  };

  // Funciones de navegación del Lightbox
  const nextImage = (e) => {
    e.stopPropagation();
    setLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setLightbox(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));
  };

  const redesExtra = JSON.parse(perfil.redes_sociales || '[]');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary-container rounded-full animate-spin mb-4"></div>
        <p className="text-primary-container tracking-[0.2em] text-sm uppercase">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-surface font-body selection:bg-primary-container selection:text-background relative overflow-hidden">
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-container/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/5 blur-[120px] pointer-events-none z-0"></div>

      <Navbar perfil={perfil} />
      
      <main className="px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        
        <motion.section initial="hidden" animate="visible" variants={fadeUp} className="min-h-[90vh] flex flex-col md:flex-row items-center justify-center md:justify-between pt-28 pb-12 gap-8 md:gap-12" id="home">
          <div className="flex-1 flex flex-col justify-center text-center md:text-left items-center md:items-start order-2 md:order-1">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="h-[1px] w-8 md:w-12 bg-primary-container"></div>
              <span className="text-xs md:text-sm tracking-[0.2em] text-primary-container uppercase font-bold">Disponible para proyectos</span>
              <div className="h-[1px] w-8 bg-primary-container md:hidden"></div>
            </div>
            <div className="flex flex-col gap-4 w-full">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-bold leading-tight tracking-tighter text-on-surface uppercase">
                {perfil.nombre.split('_').join(' ')}
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl text-primary-container font-headline font-semibold uppercase tracking-wide">
                {perfil.titulo}
              </h2>
              <p className="text-base md:text-lg text-on-surface-variant font-light leading-relaxed mt-4 border-l-0 md:border-l-2 border-primary-container/30 pl-0 md:pl-6 max-w-2xl mx-auto md:mx-0">
                {perfil.descripcion}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-10 w-full">
              <a href="#projects" className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-background font-headline font-bold text-xs md:text-sm tracking-widest uppercase rounded-sm shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:scale-[1.02] transition-all duration-300">
                Ver Proyectos
              </a>
              <a 
                href="/Mathias_Villazon_CV.pdf" download 
                onClick={() => ReactGA.event({ category: "Engagement", action: "Download_CV" })}
                className="px-8 py-4 bg-surface-container-highest border border-outline-variant/50 hover:border-secondary text-on-surface-variant hover:text-secondary font-headline font-bold text-xs md:text-sm tracking-widest uppercase rounded-sm transition-all duration-300 flex items-center gap-2"
              >
                <FileText size={18} /> Descargar CV
              </a>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6 w-full">
              {perfil.github_url && (
                <a 
                  href={perfil.github_url} target="_blank" rel="noreferrer" 
                  onClick={() => ReactGA.event({ category: "Outbound", action: "Click_GitHub", label: perfil.github_url })}
                  className="px-4 py-2 bg-[#1a1c20] border border-outline-variant/30 hover:border-primary-container text-on-surface-variant hover:text-primary-container font-headline font-bold text-xs tracking-widest uppercase rounded-sm transition-all duration-300 flex items-center gap-2"
                >
                  <Code size={16} /> GitHub
                </a>
              )}
              {redesExtra.map((red, idx) => (
                <a 
                  key={idx} href={red.url} target="_blank" rel="noreferrer" 
                  onClick={() => ReactGA.event({ category: "Outbound", action: `Click_${red.nombre}`, label: red.url })}
                  className="px-4 py-2 bg-[#1a1c20] border border-outline-variant/30 hover:border-primary-container text-on-surface-variant hover:text-primary-container font-headline font-bold text-xs tracking-widest uppercase rounded-sm transition-all duration-300 flex items-center gap-2"
                >
                  <LinkIcon size={16} /> {red.nombre}
                </a>
              ))}
            </div>
          </div>

          {perfil.imagen_url && (
            <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 relative group flex-shrink-0 mx-auto md:mx-0 order-1 md:order-2 mt-8 md:mt-0">
              {/* Anillos Cybernéticos Tecnológicos */}
              <div className="absolute inset-0 border-2 border-primary-container/30 rounded-full md:rounded-2xl group-hover:border-primary-container/80 transition-colors duration-700 shadow-[0_0_20px_rgba(0,240,255,0.1)] group-hover:shadow-[0_0_40px_rgba(0,240,255,0.4)] z-20 pointer-events-none"></div>
              <div className="absolute inset-[-15px] border border-secondary/30 rounded-full md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-95 group-hover:scale-100 z-0"></div>
              
              <div className="absolute inset-0 bg-primary-container/10 rounded-full md:rounded-2xl blur-3xl group-hover:bg-primary-container/30 transition-colors duration-700"></div>
              
              {/* Imagen siempre a color, con un ligero zoom elegante al pasar el mouse */}
              <img src={perfil.imagen_url} alt={perfil.nombre} className="w-full h-full object-cover rounded-full md:rounded-2xl relative z-10 transition-transform duration-700 group-hover:scale-[1.02]" />
            </div>
          )}
        </motion.section>

        <Skills />
        
        <section className="py-24 border-t border-outline-variant/10" id="projects">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-2xl font-headline font-bold text-on-surface tracking-[0.2em] uppercase">Proyectos Destacados</h2>
              <div className="w-20 h-1 bg-primary-container mt-4"></div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {tabsFiltros.map(cat => (
                <button 
                  key={cat} onClick={() => { setFiltroActivo(cat); setPage(0); }}
                  className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase rounded-sm transition-all ${filtroActivo === cat ? 'bg-primary-container text-background' : 'border border-outline-variant/30 text-on-surface-variant hover:border-primary-container/50'}`}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

          </div>
          
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {proyectos.map((proj) => {
                const imagenes = getImagenes(proj.imagen_url);
                return (
                  <motion.div 
                    layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
                    key={proj.id} onClick={() => abrirProyecto(proj)}
                    className="group relative overflow-hidden rounded-xl glass-panel transition-all hover:-translate-y-2 cursor-pointer flex flex-col h-full border border-outline-variant/20 hover:border-primary-container/40"
                  >
                    <div className="relative bg-surface-container-low h-full flex flex-col">
                      {imagenes.length > 0 ? (
                        <div className="relative h-48 overflow-hidden">
                          <img alt={proj.titulo} src={imagenes[0]} className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                        </div>
                      ) : (
                        <div className="relative h-48 bg-surface-container-highest border-b border-outline-variant/20 flex flex-col items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">schema</span>
                        </div>
                      )}
                      <div className="p-8 flex-grow flex flex-col">
                        <h3 className="font-headline text-xl font-bold text-on-surface mb-4 group-hover:text-primary-container transition-colors">{proj.titulo}</h3>
                        <p className="text-on-surface-variant text-sm mb-6 line-clamp-3 font-light leading-relaxed">{proj.descripcion}</p>
                        <div className="mt-auto">
                          
                          {/* NUEVO: Soporte para Múltiples Categorías en las tarjetas */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {proj.categoria.split(',').map((cat, i) => (
                              <span key={i} className="text-[10px] uppercase tracking-wider bg-surface-container-highest px-2 py-1 rounded-sm text-primary-container font-mono border border-primary-container/20">
                                {cat.trim().replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-primary-container text-xs font-bold tracking-widest opacity-70 group-hover:opacity-100 transition-opacity uppercase">
                            Ver Detalles <ExternalLink size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
          
          {proyectos.length === 0 && !isLoadingMore && <p className="text-on-surface-variant text-sm italic mt-8 text-center">No se encontraron proyectos en esta categoría.</p>}
          
          {hasMore && proyectos.length > 0 && (
             <div className="flex justify-center mt-16">
               <button 
                 onClick={handleCargarMas} disabled={isLoadingMore}
                 className="flex items-center gap-3 px-8 py-3 border border-outline-variant/50 hover:border-primary-container text-on-surface-variant hover:text-primary-container font-headline font-bold text-xs tracking-widest uppercase rounded-sm transition-all disabled:opacity-50"
               >
                 {isLoadingMore ? <RefreshCw className="animate-spin" size={16}/> : <RefreshCw size={16}/>}
                 {isLoadingMore ? 'Cargando...' : 'Cargar Más Proyectos'}
               </button>
             </div>
          )}
        </section>

        <Contact perfil={perfil} />
      </main>
      
      {/* MODAL DE DETALLES DEL PROYECTO */}
      <AnimatePresence>
        {proyectoActivo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0c0e12]/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
            onClick={() => setProyectoActivo(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-outline-variant/30 max-w-5xl w-full p-8 md:p-12 relative shadow-2xl max-h-[95vh] overflow-y-auto rounded-xl custom-scrollbar"
            >
              <button onClick={() => setProyectoActivo(null)} className="absolute top-6 right-6 z-20 text-on-surface-variant hover:text-primary-container transition-colors p-2"><X size={28} /></button>
              <section className="mb-10">
                
                {/* NUEVO: Soporte para Múltiples Categorías en el Modal */}
                <div className="flex flex-wrap gap-2 mb-2">
                   {proyectoActivo.categoria.split(',').map((cat, i) => (
                       <span key={i} className="text-xs font-bold tracking-widest text-primary-container uppercase block">
                         {cat.trim().replace(/_/g, ' ')}
                       </span>
                   ))}
                </div>

                <h2 className="text-3xl md:text-5xl font-headline font-bold text-on-surface tracking-tighter pr-12">{proyectoActivo.titulo}</h2>
              </section>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-4">
                  {getImagenes(proyectoActivo.imagen_url).length > 0 && (
                    <>
                      {/* IMAGEN PRINCIPAL (Abre el Lightbox en el índice 0) */}
                      <div 
                        className="rounded-xl overflow-hidden border border-outline-variant/20 shadow-lg bg-surface-container-lowest cursor-zoom-in group relative"
                        onClick={() => setLightbox({ isOpen: true, index: 0, images: getImagenes(proyectoActivo.imagen_url) })}
                      >
                         <img src={getImagenes(proyectoActivo.imagen_url)[0]} alt={proyectoActivo.titulo} className="w-full h-auto object-cover object-top group-hover:scale-[1.02] transition-transform duration-500" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                           <span className="bg-black/60 text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest backdrop-blur-sm flex items-center gap-2"><ZoomIn size={16}/> Ampliar</span>
                         </div>
                      </div>
                      
                      {/* MINIATURAS ADICIONALES (Abre el Lightbox en el índice correspondiente) */}
                      {getImagenes(proyectoActivo.imagen_url).length > 1 && (
                        <div className="grid grid-cols-2 gap-4">
                          {getImagenes(proyectoActivo.imagen_url).slice(1).map((imgUrl, idx) => (
                            <div 
                              key={idx} 
                              className="rounded-xl overflow-hidden border border-outline-variant/20 shadow-md h-32 md:h-40 bg-surface-container-lowest cursor-zoom-in group relative"
                              onClick={() => setLightbox({ isOpen: true, index: idx + 1, images: getImagenes(proyectoActivo.imagen_url) })}
                            >
                               <img src={imgUrl} alt={`${proyectoActivo.titulo} - vista ${idx + 2}`} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                 <ZoomIn size={24} className="text-white opacity-80" />
                               </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="space-y-8 flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline text-xl text-on-surface mb-4 font-bold border-b border-outline-variant/30 pb-2">Descripción General</h3>
                    <ReactMarkdown
                      components={{
                        ul: ({node, ...props}) => <ul className="space-y-3 mt-4 mb-6" {...props} />,
                        li: ({node, ...props}) => (
                          <li className="flex items-start gap-3 text-on-surface-variant leading-relaxed font-light text-base">
                            <span className="text-primary-container mt-1.5 flex-shrink-0 text-xs">◈</span>
                            <span>{props.children}</span>
                          </li>
                        ),
                        strong: ({node, ...props}) => <strong className="font-bold text-on-surface text-primary-container/90" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 text-base text-on-surface-variant leading-relaxed font-light" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-on-surface mt-6 mb-3" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold text-on-surface mt-6 mb-3" {...props} />,
                      }}
                    >
                      {proyectoActivo.descripcion}
                    </ReactMarkdown>
                  </div>
                  <div>
                    <h3 className="font-headline text-lg text-on-surface mb-3 font-bold">Tecnologías Utilizadas</h3>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {proyectoActivo.tecnologias.split(',').map((tech, i) => (
                        <span key={i} className="bg-surface-container-high px-4 py-2 text-sm font-medium rounded-sm border border-outline-variant/20 text-on-surface">{tech.trim()}</span>
                      ))}
                    </div>
                    {proyectoActivo.url_repo && (
                      <a 
                        href={proyectoActivo.url_repo} target="_blank" rel="noreferrer" 
                        onClick={() => ReactGA.event({ category: "Projects", action: "Click_Project_Source", label: proyectoActivo.titulo })}
                        className="inline-flex items-center justify-center gap-3 bg-primary-container text-background font-headline text-sm font-bold tracking-widest transition-all duration-300 px-8 py-4 rounded-sm uppercase hover:scale-[1.02] w-full"
                      >
                        <Code size={18} /> Ver Código Fuente
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NUEVO: LIGHTBOX CON CARRUSEL INTEGRADO */}
      <AnimatePresence>
        {lightbox.isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0c0e12]/95 backdrop-blur-md flex items-center justify-center p-4 select-none"
            onClick={() => setLightbox({ isOpen: false, index: 0, images: [] })}
          >
            {/* Cerrar */}
            <button className="absolute top-6 right-6 z-[110] text-white/70 hover:text-[#00F0FF] transition-colors bg-black/40 p-3 rounded-full backdrop-blur-sm">
              <X size={28} />
            </button>

            {/* Anterior */}
            {lightbox.images.length > 1 && (
              <button 
                onClick={prevImage} 
                className="absolute left-4 md:left-10 z-[110] text-white/70 hover:text-[#00F0FF] bg-black/40 p-4 rounded-full transition-all hover:scale-110"
              >
                <ChevronLeft size={36} />
              </button>
            )}
            
            <motion.img
              key={lightbox.index} // Forza la re-animación al cambiar de imagen
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
              src={lightbox.images[lightbox.index]}
              alt="Vista ampliada"
              className="w-full max-w-5xl max-h-[90vh] object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] cursor-default"
              onClick={(e) => e.stopPropagation()} 
            />

            {/* Siguiente */}
            {lightbox.images.length > 1 && (
              <button 
                onClick={nextImage} 
                className="absolute right-4 md:right-10 z-[110] text-white/70 hover:text-[#00F0FF] bg-black/40 p-4 rounded-full transition-all hover:scale-110"
              >
                <ChevronRight size={36} />
              </button>
            )}

            {/* Contador de Imágenes */}
            {lightbox.images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full tracking-widest text-sm font-mono backdrop-blur-sm">
                {lightbox.index + 1} / {lightbox.images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="w-full py-8 bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col items-center justify-center mt-20 text-center px-4">
        <p className="text-on-surface-variant font-light text-sm">
            © {new Date().getFullYear()} {perfil?.nombre || 'Mathias Villazón'}. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'U') || (e.ctrlKey && e.key === 'S')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}