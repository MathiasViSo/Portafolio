import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code, Smartphone, Database, Server, ExternalLink, X, FileText } from 'lucide-react';
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
        {perfil?.nombre ? perfil.nombre.split('_')[0] : 'SISTEMAS'}
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm">
        <a className="text-on-surface-variant hover:text-on-surface transition-all" href="#home">Home</a>
        <a className="text-on-surface-variant hover:text-on-surface transition-all" href="#skills">Stack</a>
        <a className="text-on-surface-variant hover:text-on-surface transition-all" href="#projects">Engineered_Solutions</a>
        <a className="text-on-surface-variant hover:text-on-surface transition-all" href="#contact">Contact</a>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/admin" className="hidden md:block text-[10px] uppercase tracking-widest border border-outline-variant/30 px-3 py-1.5 text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-all">
          [ROOT_ACCESS]
        </Link>
        <span className="material-symbols-outlined p-2 hover:bg-surface-container-highest/50 rounded-full cursor-pointer transition-all text-primary-container">terminal</span>
      </div>
    </div>
  </nav>
);

const Skills = () => (
  <section className="py-24 border-t border-outline-variant/10" id="skills">
    <div className="mb-16">
      <h2 className="text-2xl font-headline font-bold text-on-surface tracking-[0.2em] uppercase">Technical_Stack</h2>
      <div className="w-20 h-1 bg-primary-container mt-4"></div>
    </div>
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { name: 'Kotlin & Flutter', icon: <Smartphone size={24}/>, val: '95%', color: 'bg-primary-container', desc: 'Desarrollo móvil nativo y cruzado' },
        { name: 'Python & FastAPI', icon: <Terminal size={24}/>, val: '85%', color: 'bg-secondary', desc: 'Arquitectura Backend y APIs REST' },
        { name: 'PHP & Laravel', icon: <Server size={24}/>, val: '80%', color: 'bg-primary-container', desc: 'Sistemas monolíticos y web' },
        { name: 'Java & SQL', icon: <Database size={24}/>, val: '90%', color: 'bg-secondary', desc: 'Lógica core y bases de datos' }
      ].map((skill, i) => (
        <motion.div key={i} variants={fadeUp} className="glass-panel p-8 bg-surface-container-low/40 rounded-xl space-y-6 hover:bg-surface-container-low transition-all duration-300 group">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-on-surface">
              <span className={`text-${skill.color === 'bg-primary-container' ? 'primary-container' : 'secondary'}`}>{skill.icon}</span>
              <div>
                <span className="font-headline font-bold tracking-widest block">{skill.name}</span>
                <span className="text-xs text-on-surface-variant font-mono mt-1 block">{skill.desc}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded border border-outline-variant/20">{skill.val}_LOAD</span>
          </div>
          <div className="w-full bg-outline-variant/20 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full ${skill.color} relative`} style={{ width: skill.val }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

const Contact = ({ perfil }) => (
  <section className="py-24 border-t border-outline-variant/10 relative" id="contact">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div className="flex flex-col justify-center">
        <span className="font-mono text-xs uppercase tracking-[0.4em] text-primary-container mb-4 block">0x03 // COMMUNICATION_PROTOCOL</span>
        <h2 className="text-5xl font-headline font-bold text-on-surface tracking-tighter leading-none mb-8">
          Establish <br/><span className="text-primary-fixed-dim">Connection</span>
        </h2>
        <p className="text-on-surface-variant text-base max-w-md leading-relaxed mb-12">
          La arquitectura del futuro requiere colaboración de alto ancho de banda. Contáctame para discutir infraestructura de sistemas, retos lógicos o proyectos de ciberseguridad.
        </p>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="mt-1.5 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(209,188,255,0.6)]"></div>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">Primary Endpoint</p>
              <a href={`mailto:${perfil?.email || ''}`} className="text-on-surface font-headline hover:text-secondary transition-colors">
                {perfil?.email || 'Awaiting Data...'}
              </a>
            </div>
          </div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-panel p-10 rounded-xl relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-container/30 to-transparent"></div>
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); window.location.href = `mailto:${perfil?.email || ''}`; }}>
          <div className="relative group">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-mono">Identifier</label>
            <input required type="text" className="w-full bg-surface border-0 border-b border-outline-variant/30 py-3 px-2 text-on-surface focus:ring-0 focus:border-primary-container transition-colors placeholder:text-surface-variant font-headline" placeholder="E.G. UNIT_01" />
          </div>
          <div className="relative group">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-mono">Data Payload</label>
            <textarea required rows="3" className="w-full bg-surface border-0 border-b border-outline-variant/30 py-3 px-2 text-on-surface focus:ring-0 focus:border-primary-container transition-colors placeholder:text-surface-variant font-headline resize-none" placeholder="DESCRIBE THE ARCHITECTURAL CHALLENGE..."></textarea>
          </div>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-background font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:scale-[1.02] transition-all">
            Transmitir Datos
          </button>
        </form>
      </motion.div>
    </div>
  </section>
);

// --- MAIN PORTFOLIO ---
const Portfolio = () => {
  const [proyectos, setProyectos] = useState([]);
  const [proyectoActivo, setProyectoActivo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState('ALL');
  const [perfil, setPerfil] = useState({
    nombre: 'MATHIAS_VILLAZÓN', titulo: 'SISTEMAS ENGINEER.', 
    descripcion: 'Inicializando módulos de perfil...', email: '', github_url: '', linkedin_url: ''
  });

  useEffect(() => {
    Promise.all([
      api.get('/proyectos').catch(() => ({ data: [] })),
      api.get('/perfil').catch(() => ({ data: perfil }))
    ]).then(([resProyectos, resPerfil]) => {
      setProyectos(resProyectos.data);
      if(resPerfil.data.nombre) setPerfil(resPerfil.data);
      setTimeout(() => setIsLoading(false), 800); // Simulamos tiempo para mostrar el loader épico
    });

    const keepAlive = setInterval(() => api.get('/proyectos').catch(() => {}), 600000);
    return () => clearInterval(keepAlive);
  }, []);

  const categorias = ['ALL', 'MOBILE', 'WEB_APP', 'BACKEND', 'DESKTOP'];
  const proyectosFiltrados = filtroActivo === 'ALL' ? proyectos : proyectos.filter(p => p.categoria === filtroActivo);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono">
        <div className="w-16 h-16 border-4 border-outline-variant border-t-primary-container rounded-full animate-spin mb-4"></div>
        <p className="text-primary-container tracking-[0.3em] text-xs uppercase animate-pulse">Establishing_Connection...</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-surface font-body selection:bg-primary-container selection:text-background relative overflow-hidden">
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-container/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/5 blur-[120px] pointer-events-none z-0"></div>

      <Navbar perfil={perfil} />
      
      <main className="px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        
        {/* HERO */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} className="min-h-[90vh] flex flex-col md:flex-row items-center justify-between pt-20 gap-12" id="home">
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] w-12 bg-primary-container"></div>
              <span className="font-mono text-xs tracking-[0.3em] text-primary-container uppercase">System_State: Fully_Operational</span>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight tracking-tighter text-on-surface uppercase">
                {perfil.nombre.split('_')[0]} <br/>
                <span className="text-primary-container">{perfil.titulo}</span>
              </h1>
              <p className="text-lg text-on-surface-variant font-light leading-relaxed mt-6 border-l border-outline-variant/30 pl-6">
                {perfil.descripcion}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-12">
              <a href="#projects" className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-background font-headline font-bold text-sm tracking-widest uppercase rounded-sm shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:scale-[1.02] transition-all duration-300">
                Ejecutar Portafolio
              </a>
              <a href="/Mathias_Villazon_CV.pdf" download className="px-8 py-4 bg-surface-container-highest border border-outline-variant/50 hover:border-secondary text-on-surface-variant hover:text-secondary font-headline font-bold text-sm tracking-widest uppercase rounded-sm transition-all duration-300 flex items-center gap-2">
                <FileText size={18} /> Download_CV
              </a>
              {perfil.github_url && (
                <a href={perfil.github_url} target="_blank" rel="noreferrer" className="px-8 py-4 border border-outline-variant/50 hover:border-primary-container text-on-surface-variant hover:text-primary-container font-headline font-bold text-sm tracking-widest uppercase rounded-sm transition-all duration-300 flex items-center gap-2">
                  <Code size={18} /> GitHub_Repo
                </a>
              )}
            </div>
          </div>

          {perfil.imagen_url && (
            <div className="hidden md:block w-72 h-72 lg:w-96 lg:h-96 relative group mt-12 md:mt-0">
              <div className="absolute inset-0 bg-primary-container/20 rounded-full blur-3xl group-hover:bg-primary-container/30 transition-colors duration-500"></div>
              <img src={perfil.imagen_url} alt={perfil.nombre} className="w-full h-full object-cover rounded-2xl border border-outline-variant/30 grayscale hover:grayscale-0 transition-all duration-500 relative z-10" />
              <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-primary-container z-20"></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-primary-container z-20"></div>
            </div>
          )}
        </motion.section>

        <Skills />
        
        {/* PROJECTS (Con Filtros) */}
        <section className="py-24 border-t border-outline-variant/10" id="projects">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-2xl font-headline font-bold text-on-surface tracking-[0.2em] uppercase">Engineered_Solutions</h2>
              <div className="w-20 h-1 bg-primary-container mt-4"></div>
            </div>
            
            {/* Controles de Filtro */}
            <div className="flex flex-wrap gap-2">
              {categorias.map(cat => (
                <button 
                  key={cat} onClick={() => setFiltroActivo(cat)}
                  className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase border transition-all ${filtroActivo === cat ? 'bg-primary-container/10 border-primary-container text-primary-container' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary-container/50'}`}
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
                  className="group relative overflow-hidden rounded-xl glass-panel transition-all hover:-translate-y-2 cursor-pointer flex flex-col h-full"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-container/20 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
                  <div className="relative bg-surface-container-low h-full flex flex-col">
                    {proj.imagen_url ? (
                      <div className="relative h-48 overflow-hidden">
                        <img alt={proj.titulo} src={proj.imagen_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                        <div className="absolute inset-0 scan-line pointer-events-none opacity-30"></div>
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
                          <span className="text-[10px] uppercase tracking-wider bg-surface-container-highest px-2 py-1 rounded-sm text-on-surface-variant font-mono border border-outline-variant/30 text-primary-container/80">{proj.categoria}</span>
                          {proj.tecnologias.split(',').slice(0, 2).map((tech, i) => (
                             <span key={i} className="text-[10px] uppercase tracking-wider bg-surface-container-highest px-2 py-1 rounded-sm text-on-surface-variant font-mono border border-outline-variant/30">{tech.trim()}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {proyectosFiltrados.length === 0 && <p className="text-on-surface-variant font-mono text-sm italic col-span-full">Awaiting database entries for {filtroActivo}...</p>}
          </motion.div>
        </section>

        <Contact perfil={perfil} />
      </main>
      
      {/* MODAL DETALLES */}
      <AnimatePresence>
        {proyectoActivo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0c0e12]/95 backdrop-blur-md flex items-center justify-center p-4 z-[60]"
            onClick={() => setProyectoActivo(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-outline-variant/30 max-w-7xl w-full p-8 md:p-12 relative shadow-[0_0_50px_rgba(0,240,255,0.05)] max-h-[95vh] overflow-y-auto rounded-xl custom-scrollbar"
            >
              <button onClick={() => setProyectoActivo(null)} className="absolute top-8 right-8 z-20 text-on-surface-variant hover:text-primary-container transition-colors bg-surface-container-highest/50 p-2 rounded-full backdrop-blur">
                <X size={24} />
              </button>
              
              <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-2 border-primary-container pl-6 py-2 mb-12">
                <div>
                  <span className="font-mono text-xs tracking-[0.3em] text-on-surface-variant uppercase">Project_Insight // 00{proyectoActivo.id}</span>
                  <h2 className="text-4xl md:text-6xl font-headline font-bold text-on-surface tracking-tighter mt-2 pr-12">{proyectoActivo.titulo}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {proyectoActivo.tecnologias.split(',').map((tech, i) => (
                    <span key={i} className="bg-surface-container-high px-3 py-1 text-[10px] font-mono tracking-widest rounded-sm border border-outline-variant/20 uppercase text-on-surface-variant">{tech.trim()}</span>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                  <div className="relative group aspect-video bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/20">
                    {proyectoActivo.imagen_url ? (
                       <img src={proyectoActivo.imagen_url} alt={proyectoActivo.titulo} className="w-full h-full object-cover opacity-70 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700 group-hover:scale-105" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center"><Terminal size={64} className="text-outline-variant opacity-20"/></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111318] to-transparent opacity-60"></div>
                  </div>
                  <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 relative overflow-hidden">
                    <h3 className="font-headline text-xl text-on-surface mb-4">Architecture_Overview</h3>
                    <p className="text-base text-on-surface-variant leading-relaxed font-light">{proyectoActivo.descripcion}</p>
                  </div>
                  {proyectoActivo.url_repo && (
                    <a href={proyectoActivo.url_repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-primary-container/10 hover:bg-primary-container border border-primary-container/30 hover:border-primary-container text-primary-container hover:text-background font-headline text-xs font-bold tracking-widest transition-all duration-300 px-8 py-4 rounded-sm uppercase group">
                      <ExternalLink size={18} className="group-hover:scale-110 transition-transform" /> Access_Source_Code
                    </a>
                  )}
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/15 space-y-8">
                    <h2 className="font-headline text-xs tracking-[0.4em] uppercase text-on-surface-variant">System_Metrics</h2>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="font-mono text-[10px] uppercase text-on-surface-variant">Category</span>
                          <span className="text-lg font-headline font-bold text-on-surface">{proyectoActivo.categoria}</span>
                        </div>
                        <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-on-surface-variant w-[100%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}