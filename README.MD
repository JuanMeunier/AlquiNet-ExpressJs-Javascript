# 🏠 Sistema de Gestión de Propiedades y Alquileres 

## 📋 Descripción

Sistema backend RESTful desarrollado con **Express** y **JavaScript** para la gestión integral de propiedades inmobiliarias y alquileres.  
Permite a los usuarios (propietarios, inquilinos y administradores) publicar, buscar y reservar propiedades de manera segura y eficiente.

El sistema cuenta con:  
🔐 Autenticación y autorización basada en roles.  
🛡️ Seguridad reforzada con bcrypt, rate-limiting y validaciones.  
⚡ Cache con Redis para optimizar consultas frecuentes.  
📚 Documentación API con Swagger.  
📝 Logs detallados de actividades y errores.  
🧪 Testing unitario y end-to-end.

---

## 🚀 Características principales

- 🧑‍🤝‍🧑 Registro y login de usuarios con roles: `admin`, `propietario`, `inquilino`.  
- 🏡 Publicación y edición de propiedades por parte de propietarios.  
- 🔎 Búsqueda avanzada con filtros (ubicación, precio, tipo).  
- 📅 Gestión de reservas y estado de las mismas.  
- ⭐ Sistema de reseñas y puntuaciones para propiedades.  
- 📊 Dashboard administrativo para gestión y monitoreo.  
- 🛠️ Cacheo de datos con Redis para mejorar rendimiento.  
- 🔐 Protección de rutas 
- 📖 Documentación interactiva y actualizada con Swagger UI.

---

## 🛠️ Tecnologías usadas

- Node.js  
- Express  
- TypeScript  
- Redis  
- Bcrypt  
- Swagger (OpenAPI)  
- Jest   
- dotenv  
- express-rate-limit  
- winston (logging)  
- PostgreSQL (según preferencia)  
- Docker (opcional para despliegue)
