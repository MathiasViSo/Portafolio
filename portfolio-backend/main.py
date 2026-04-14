import os
import jwt
import json
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException, Header, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text 
from pydantic import BaseModel
from typing import List, Optional
import models
from database import engine, get_db
import cloudinary
import cloudinary.uploader

models.Base.metadata.create_all(bind=engine)

# --- SCRIPT DE AUTO-MIGRACIÓN ---
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE perfil ADD COLUMN redes_sociales TEXT DEFAULT '[]'"))
        conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE configuracion ADD COLUMN categorias TEXT DEFAULT '[\"MOBILE\", \"WEB_APP\", \"BACKEND\", \"DESKTOP\"]'"))
        conn.commit()
except Exception:
    pass

# --- NUEVO SCRIPT: AMPLIAR TAMAÑO DE COLUMNAS DE IMÁGENES ---
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE proyectos ALTER COLUMN imagen_url TYPE TEXT;"))
        conn.execute(text("ALTER TABLE perfil ALTER COLUMN imagen_url TYPE TEXT;"))
        conn.commit()
except Exception:
    pass

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

ADMIN_SECRET_TOKEN = os.getenv("ADMIN_SECRET_TOKEN", "root_mathias_2026")
JWT_SECRET = os.getenv("JWT_SECRET", "super_secreto_para_encriptar_tokens_123")
ALGORITHM = "HS256"

cloudinary.config(
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME', 'tu_cloud_name_aqui'),
  api_key = os.getenv('CLOUDINARY_API_KEY', 'tu_api_key_aqui'),
  api_secret = os.getenv('CLOUDINARY_API_SECRET', 'tu_api_secret_aqui')
)

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

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class CategoriasUpdate(BaseModel):
    categorias: List[str]

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
    redes_sociales: Optional[str] = "[]"

class PerfilResponse(PerfilBase):
    id: int
    class Config:
        from_attributes = True

class MensajeBase(BaseModel):
    nombre: str
    email: str
    mensaje: str

class MensajeCreate(MensajeBase):
    pass

class MensajeResponse(MensajeBase):
    id: int
    fecha: datetime
    class Config:
        from_attributes = True

# --- RUTAS DE LOGIN Y CONFIGURACIÓN ---
@app.post("/api/v1/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    config = db.query(models.Config).first()
    if not config:
        config = models.Config(admin_password=ADMIN_SECRET_TOKEN)
        db.add(config)
        db.commit()
        db.refresh(config)
        
    if data.password == config.admin_password:
        token = crear_token()
        return {"access_token": token}
    raise HTTPException(status_code=401, detail="Acceso denegado")

@app.put("/api/v1/admin/password")
def change_password(data: PasswordChangeRequest, db: Session = Depends(get_db), token: str = Depends(verificar_admin)):
    config = db.query(models.Config).first()
    if data.current_password != config.admin_password:
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")
    
    config.admin_password = data.new_password
    db.commit()
    return {"status": "success", "message": "Contraseña actualizada correctamente"}

@app.get("/api/v1/categorias")
def get_categorias(db: Session = Depends(get_db)):
    config = db.query(models.Config).first()
    if config and config.categorias:
        return json.loads(config.categorias)
    return ["MOBILE", "WEB_APP", "BACKEND", "DESKTOP"]

@app.put("/api/v1/categorias")
def update_categorias(data: CategoriasUpdate, db: Session = Depends(get_db), token: str = Depends(verificar_admin)):
    config = db.query(models.Config).first()
    if not config:
        config = models.Config(admin_password=ADMIN_SECRET_TOKEN)
        db.add(config)
    config.categorias = json.dumps(data.categorias)
    db.commit()
    return {"status": "success"}

@app.post("/api/v1/upload")
async def upload_image(file: UploadFile = File(...), token: str = Depends(verificar_admin)):
    try:
        resultado = cloudinary.uploader.upload(file.file)
        return {"url": resultado.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error subiendo imagen: {str(e)}")

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
def leer_proyectos(skip: int = 0, limit: int = 6, categoria: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Proyecto)
    if categoria and categoria != "TODOS":
        query = query.filter(models.Proyecto.categoria == categoria)
    return query.order_by(models.Proyecto.id.desc()).offset(skip).limit(limit).all()

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

# --- RUTAS DE MENSAJES ---
@app.post("/api/v1/mensajes", response_model=MensajeResponse)
def crear_mensaje(mensaje: MensajeCreate, db: Session = Depends(get_db)):
    db_mensaje = models.Mensaje(**mensaje.model_dump())
    db.add(db_mensaje)
    db.commit()
    db.refresh(db_mensaje)
    return db_mensaje

@app.get("/api/v1/mensajes", response_model=List[MensajeResponse])
def leer_mensajes(skip: int = 0, limit: int = 15, db: Session = Depends(get_db), token: str = Depends(verificar_admin)):
    return db.query(models.Mensaje).order_by(models.Mensaje.fecha.desc()).offset(skip).limit(limit).all()

@app.delete("/api/v1/mensajes/{id}")
def eliminar_mensaje(id: int, db: Session = Depends(get_db), token: str = Depends(verificar_admin)):
    mensaje = db.query(models.Mensaje).filter(models.Mensaje.id == id).first()
    if not mensaje:
         raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    db.delete(mensaje)
    db.commit()
    return {"status": "success"}