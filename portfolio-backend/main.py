from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import models
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ADMIN_SECRET_TOKEN = "root_mathias_2026" 

def verificar_admin(x_token: str = Header(...)):
    if x_token != ADMIN_SECRET_TOKEN:
        raise HTTPException(status_code=401, detail="Acceso denegado")

# --- ESQUEMAS PYDANTIC ---
class ProyectoBase(BaseModel):
    titulo: str
    descripcion: str
    tecnologias: str
    categoria: str
    url_repo: Optional[str] = None
    imagen_url: Optional[str] = None

class ProyectoResponse(ProyectoBase):
    id: int
    class Config:
        from_attributes = True

class PerfilBase(BaseModel):
    nombre: str
    titulo: str
    descripcion: str
    imagen_url: Optional[str] = None
    email: str
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class PerfilResponse(PerfilBase):
    id: int
    class Config:
        from_attributes = True

# --- RUTAS DE PERFIL ---
@app.get("/api/v1/perfil", response_model=PerfilResponse)
def leer_perfil(db: Session = Depends(get_db)):
    perfil = db.query(models.Perfil).first()
    if not perfil:
        # Si no existe, creamos uno por defecto la primera vez
        perfil = models.Perfil()
        db.add(perfil)
        db.commit()
        db.refresh(perfil)
    return perfil

@app.put("/api/v1/perfil", response_model=PerfilResponse)
def actualizar_perfil(perfil_data: PerfilBase, db: Session = Depends(get_db), token: str = Depends(verificar_admin)):
    perfil = db.query(models.Perfil).first()
    
    # --- NUEVA LÓGICA DE SEGURIDAD ---
    if not perfil:
        # Si no existe en la base de datos, lo instanciamos primero
        perfil = models.Perfil()
        db.add(perfil)
    # ---------------------------------
        
    for key, value in perfil_data.model_dump().items():
        setattr(perfil, key, value)
        
    db.commit()
    db.refresh(perfil)
    return perfil

# --- RUTAS DE PROYECTOS ---
@app.get("/api/v1/proyectos", response_model=List[ProyectoResponse])
def leer_proyectos(db: Session = Depends(get_db)):
    return db.query(models.Proyecto).all()

@app.post("/api/v1/proyectos", response_model=ProyectoResponse)
def crear_proyecto(proyecto: ProyectoBase, db: Session = Depends(get_db), token: str = Depends(verificar_admin)):
    db_proyecto = models.Proyecto(**proyecto.model_dump())
    db.add(db_proyecto)
    db.commit()
    db.refresh(db_proyecto)
    return db_proyecto

@app.put("/api/v1/proyectos/{id}", response_model=ProyectoResponse)
def actualizar_proyecto(id: int, proyecto_data: ProyectoBase, db: Session = Depends(get_db), token: str = Depends(verificar_admin)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    for key, value in proyecto_data.model_dump().items():
        setattr(proyecto, key, value)
        
    db.commit()
    db.refresh(proyecto)
    return proyecto

@app.delete("/api/v1/proyectos/{id}")
def eliminar_proyecto(id: int, db: Session = Depends(get_db), token: str = Depends(verificar_admin)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == id).first()
    db.delete(proyecto)
    db.commit()
    return {"status": "success"}