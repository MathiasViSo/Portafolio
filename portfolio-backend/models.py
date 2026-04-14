from sqlalchemy import Column, Integer, String, Text, DateTime
import datetime
from database import Base

class Proyecto(Base):
    __tablename__ = "proyectos"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(100), index=True)
    descripcion = Column(Text)
    tecnologias = Column(String(255))
    categoria = Column(String(50))
    url_repo = Column(String(255), nullable=True)
    imagen_url = Column(String(255), nullable=True)

class Perfil(Base):
    __tablename__ = "perfil"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), default="Mathias_Villazón")
    titulo = Column(String(100), default="Estudiante de Ingeniería de Sistemas")
    descripcion = Column(Text, default="Perfil en construcción...")
    imagen_url = Column(String(255), nullable=True)
    email = Column(String(100), default="mathiasvillazons@gmail.com")
    github_url = Column(String(255), default="https://github.com/MathiasViSo")
    linkedin_url = Column(String(255), nullable=True)
    redes_sociales = Column(Text, default="[]") # <-- NUEVA COLUMNA DINÁMICA

class Mensaje(Base):
    __tablename__ = "mensajes"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    email = Column(String)
    mensaje = Column(Text)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)

class Config(Base):
    __tablename__ = "configuracion"
    id = Column(Integer, primary_key=True, index=True)
    admin_password = Column(String, default="root_mathias_2026")