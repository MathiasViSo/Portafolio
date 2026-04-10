import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code, Smartphone, Database, Server, ExternalLink, X, FileText, Send } from 'lucide-react';
import api from './api';
import AdminPanel from './Admin';

// --- ANIMACIONES ---
const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }};
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } }};

// --- COMPONENTES ---
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

// --- COMPONENTE DE CONTACTO CON WHATSAPP ---
const Contact = ({ perfil }) => {
  const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' });
  
  // ---> AQUÍ DEBES PONER TU NÚMERO DE WHATSAPP (Con código de país, sin el +, por ejemplo 51 para Perú) <---
  const numeroWhatsApp = "51943809992"; 

  const enviarPorWhatsApp = (e) => {
    e.preventDefault();
    // Creamos el texto formateado para WhatsApp
    const textoMensaje = `Hola Mathias, soy ${formData.nombre}.%0A%0A${formData.mensaje}%0A%0AMi correo de contacto es: ${formData.email}`;
    // Abrimos la URL de la API de WhatsApp en una nueva pestaña
    window.open(`https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${textoMensaje}`, '_blank');
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
                <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">Correo Electrónico</p>
                <a href={`mailto:${perfil?.email || ''}`} className="text-on-surface font-headline hover:text-secondary transition-colors">
                  {perfil?.email || 'Cargando...'}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">Ubicación</p>
                <p className="text-on-surface font-headline">Chiclayo, Perú // UTC-5</p>
              </div>
            </div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-panel p-10 rounded-xl relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-container/30 to-transparent"></div>
          
          <form className="space-y-8" onSubmit={enviarPorWhatsApp}>
            <div className="relative group">
              <label className="block text-xs uppercase tracking-[0.1em] text-on-surface-variant mb-2">Nombre</label>
              <input 
                required type="text" 
                className="w-full bg-surface border-0 border-b border-outline-variant/30 py-3 px-2 text-on-surface focus:ring-0 focus:border-primary-container transition-colors placeholder:text-surface-variant font-headline" 
                placeholder="Tu nombre" 
                value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
              />
            </div>
            <div className="relative group">
              <label className="block text-xs uppercase tracking-[0.1em] text-on-surface-variant mb-2">Correo de Contacto</label>
              <input 
                required type="email" 
                className="w-full bg-surface border-0 border-b border-outline-variant/30 py-3 px-2 text-on-surface focus:ring-0 focus:border-primary-container transition-colors placeholder:text-surface-variant font-headline" 
                placeholder="tucorreo@ejemplo.com" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="relative group">
              <label className="block text-xs uppercase tracking-[0.1em] text-on-surface-variant mb-2">Mensaje</label>
              <textarea 
                required rows="3" 
                className="w-full bg-surface border-0 border-b border-outline-variant/30 py-3 px-2 text-on-surface focus:ring-0 focus:border-primary-container transition-colors placeholder:text-surface-variant font-headline resize-none" 
                placeholder="Escribe tu mensaje aquí..."
                value={formData.mensaje} onChange={e => setFormData({...formData, mensaje: e.target.value})}
              ></textarea>
            </div>
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-background font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:scale-[1.02] transition-all flex justify-center items-center gap-2">
              Enviar por WhatsApp <Send size={18} />
            </button>
          </form>

        </motion.div>
      </div>
    </section>
  );
};

// --- MAIN PORTFOLIO ---
const Portfolio = () => {
  const [proyectos, setProyectos] = useState([]);
  const [proyectoActivo, setProyectoActivo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState('TODOS');
  const [perfil, setPerfil] = useState({
    nombre: 'Mathias Villazón', titulo: 'Estudiante de Ingeniería de Sistemas', 
    descripcion: 'Cargando información...', email: '', github_url: '', linkedin_url: ''
  });

  useEffect(() => {
    Promise.all([
      api.get('/proyectos').catch(() => ({ data: [] })),
      api.get('/perfil').catch(() => ({ data: perfil }))
    ]).then(([resProyectos, resPerfil]) => {
      setProyectos(resProyectos.data);
      if(resPerfil.data.nombre) setPerfil(resPerfil.data);
      setTimeout(() => setIsLoading(false), 600); 
    });

    const keepAlive = setInterval(() => api.get('/proyectos').catch(() => {}), 600000);
    return () => clearInterval(keepAlive);
  }, []);

  const categorias = ['TODOS', 'MOBILE', 'WEB_APP', 'BACKEND', 'DESKTOP'];
  const proyectosFiltrados = filtroActivo === 'TODOS' ? proyectos : proyectos.filter(p => p.categoria === filtroActivo);

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
        
        {/* HERO - TIPOGRAFÍA REDUCIDA Y AJUSTADA */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} className="min-h-[90vh] flex flex-col md:flex-row items-center justify-between pt-20 gap-12" id="home">
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] w-12 bg-primary-container"></div>
              <span className="text-sm tracking-[0.2em] text-primary-container uppercase font-bold">Disponible para proyectos</span>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold leading-tight tracking-tighter text-on-surface uppercase">
                {perfil.nombre.split('_').join(' ')}
              </h1>
              <h2 className="text-2xl md:text-3xl text-primary-container font-headline font-semibold uppercase tracking-wide">
                {perfil.titulo}
              </h2>
              <p className="text-base md:text-lg text-on-surface-variant font-light leading-relaxed mt-4 border-l-2 border-primary-container/30 pl-6 max-w-2xl">
                {perfil.descripcion}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-12">
              <a href="#projects" className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-background font-headline font-bold text-sm tracking-widest uppercase rounded-sm shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:scale-[1.02] transition-all duration-300">
                Ver Proyectos
              </a>
              <a href="/Mathias_Villazon_CV.pdf" download className="px-8 py-4 bg-surface-container-highest border border-outline-variant/50 hover:border-secondary text-on-surface-variant hover:text-secondary font-headline font-bold text-sm tracking-widest uppercase rounded-sm transition-all duration-300 flex items-center gap-2">
                <FileText size={18} /> Descargar CV
              </a>
              {perfil.github_url && (
                <a href={perfil.github_url} target="_blank" rel="noreferrer" className="px-8 py-4 border border-outline-variant/50 hover:border-primary-container text-on-surface-variant hover:text-primary-container font-headline font-bold text-sm tracking-widest uppercase rounded-sm transition-all duration-300 flex items-center gap-2">
                  <Code size={18} /> GitHub
                </a>
              )}
            </div>
          </div>

          {perfil.imagen_url && (
            <div className="hidden md:block w-72 h-72 lg:w-96 lg:h-96 relative group mt-12 md:mt-0 flex-shrink-0">
              <div className="absolute inset-0 bg-primary-container/20 rounded-xl blur-3xl group-hover:bg-primary-container/30 transition-colors duration-500"></div>
              <img src={perfil.imagen_url} alt={perfil.nombre} className="w-full h-full object-cover rounded-2xl border border-outline-variant/30 grayscale hover:grayscale-0 transition-all duration-500 relative z-10 shadow-2xl" />
            </div>
          )}
        </motion.section>

        <Skills />
        
        {/* PROJECTS */}
        <section className="py-24 border-t border-outline-variant/10" id="projects">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-2xl font-headline font-bold text-on-surface tracking-[0.2em] uppercase">Proyectos Destacados</h2>
              <div className="w-20 h-1 bg-primary-container mt-4"></div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categorias.map(cat => (
                <button 
                  key={cat} onClick={() => setFiltroActivo(cat)}
                  className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase rounded-sm transition-all ${filtroActivo === cat ? 'bg-primary-container text-background' : 'border border-outline-variant/30 text-on-surface-variant hover:border-primary-container/50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {proyectosFiltrados.map((proj) => (
                <motion.div 
                  layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
                  key={proj.id} onClick={() => setProyectoActivo(proj)}
                  className="group relative overflow-hidden rounded-xl glass-panel transition-all hover:-translate-y-2 cursor-pointer flex flex-col h-full border border-outline-variant/20 hover:border-primary-container/40"
                >
                  <div className="relative bg-surface-container-low h-full flex flex-col">
                    {proj.imagen_url ? (
                      <div className="relative h-48 overflow-hidden">
                        <img alt={proj.titulo} src={proj.imagen_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
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
                        <div className="flex flex-wrap gap-2 mb-6">
                          <span className="text-[10px] uppercase tracking-wider bg-surface-container-highest px-2 py-1 rounded-sm text-primary-container font-mono border border-primary-container/20">{proj.categoria}</span>
                          {proj.tecnologias.split(',').slice(0, 2).map((tech, i) => (
                             <span key={i} className="text-[10px] uppercase tracking-wider bg-surface-container-highest px-2 py-1 rounded-sm text-on-surface-variant font-mono border border-outline-variant/30">{tech.trim()}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-primary-container text-xs font-bold tracking-widest opacity-70 group-hover:opacity-100 transition-opacity uppercase">
                          Ver Detalles <ExternalLink size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {proyectosFiltrados.length === 0 && <p className="text-on-surface-variant text-sm italic col-span-full">No se encontraron proyectos en esta categoría.</p>}
          </motion.div>
        </section>

        <Contact perfil={perfil} />
      </main>
      
      {/* MODAL DETALLES */}
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
              className="bg-surface border border-outline-variant/30 max-w-5xl w-full p-8 md:p-12 relative shadow-2xl max-h-[95vh] overflow-y-auto rounded-xl"
            >
              <button onClick={() => setProyectoActivo(null)} className="absolute top-6 right-6 z-20 text-on-surface-variant hover:text-primary-container transition-colors p-2">
                <X size={28} />
              </button>
              
              <section className="mb-10">
                <span className="text-xs font-bold tracking-widest text-primary-container uppercase block mb-2">{proyectoActivo.categoria}</span>
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-on-surface tracking-tighter pr-12">{proyectoActivo.titulo}</h2>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                  {proyectoActivo.imagen_url && (
                    <div className="rounded-xl overflow-hidden border border-outline-variant/20 shadow-lg">
                       <img src={proyectoActivo.imagen_url} alt={proyectoActivo.titulo} className="w-full h-auto object-cover" />
                    </div>
                  )}
                </div>

                <div className="space-y-8 flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline text-xl text-on-surface mb-4 font-bold border-b border-outline-variant/30 pb-2">Descripción General</h3>
                    <p className="text-base text-on-surface-variant leading-relaxed font-light">{proyectoActivo.descripcion}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-headline text-lg text-on-surface mb-3 font-bold">Tecnologías Utilizadas</h3>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {proyectoActivo.tecnologias.split(',').map((tech, i) => (
                        <span key={i} className="bg-surface-container-high px-4 py-2 text-sm font-medium rounded-sm border border-outline-variant/20 text-on-surface">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>

                    {proyectoActivo.url_repo && (
                      <a href={proyectoActivo.url_repo} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-3 bg-primary-container text-background font-headline text-sm font-bold tracking-widest transition-all duration-300 px-8 py-4 rounded-sm uppercase hover:scale-[1.02] w-full">
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

      <footer className="w-full py-8 bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col items-center justify-center mt-20 text-center px-4">
        <p className="text-on-surface-variant font-light text-sm">
            © {new Date().getFullYear()} {perfil?.nombre || 'Mathias Villazón'}. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

// --- ESCUDO DE SEGURIDAD ---
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