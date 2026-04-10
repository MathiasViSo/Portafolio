import os
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import models
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

# --- 1. MIDDLEWARE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción final, podrías cambiar "*" por "https://mathias-portfolio.onrender.com"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. MIDDLEWARE DE CABECERAS DE SEGURIDAD (ANTI-CLICKJACKING Y SNIFFING) ---
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# --- CONFIGURACIÓN DE SEGURIDAD (JWT) ---
ADMIN_SECRET_TOKEN = os.getenv("ADMIN_SECRET_TOKEN", "root_mathias_2026")
JWT_SECRET = os.getenv("JWT_SECRET", "super_secreto_para_encriptar_tokens_123")
ALGORITHM = "HS256"

def crear_token():
    exp = datetime.now(timezone.utc) + timedelta(hours=2)
    return jwt.encode({"sub": "admin_root", "exp": exp}, JWT_SECRET, algorithm=ALGORITHM)

def verificar_admin(x_token: str = Header(...)):
    try:
        payload = jwt.decode(x_token, JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("sub") != "admin_root":
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

# --- ESQUEMAS PYDANTIC ---
class LoginRequest(BaseModel):
    password: str

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

# --- RUTA DE LOGIN ---
@app.post("/api/v1/login")
def login(data: LoginRequest):
    if data.password == ADMIN_SECRET_TOKEN:
        token = crear_token()
        return {"access_token": token}
    raise HTTPException(status_code=401, detail="Acceso denegado")

# --- RUTAS DE PERFIL ---
@app.get("/api/v1/perfil", response_model=PerfilResponse)
def leer_perfil(db: Session = Depends(get_db)):
    perfil = db.query(models.Perfil).first()
    if not perfil:
        perfil = models.Perfil()
        db.add(perfil)
        db.commit()
        db.refresh(perfil)
    return perfil

@app.put("/api/v1/perfil", response_model=PerfilResponse)
def actualizar_perfil(perfil_data: PerfilBase, db: Session = Depends(get_db), token: str = Depends(verificar_admin)):
    perfil = db.query(models.Perfil).first()
    
    if not perfil:
        perfil = models.Perfil()
        db.add(perfil)
        
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
    if not proyecto:
         raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    db.delete(proyecto)
    db.commit()
    return {"status": "success"}