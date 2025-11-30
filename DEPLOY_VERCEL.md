# Despliegue en Vercel con Backend Seguro

## 🚀 Pasos para desplegar

### 1. Crear cuenta en Vercel (Gratis)
- Ve a https://vercel.com/signup
- Regístrate con tu cuenta de GitHub

### 2. Importar el proyecto
- En Vercel, haz clic en **"Add New Project"**
- Selecciona **"Import Git Repository"**
- Busca y selecciona `lumina-app`

### 3. Configurar las variables de entorno
Antes de desplegar, añade la variable de entorno:
- En la sección **"Environment Variables"**:
  - **Name**: `VITE_API_KEY`
  - **Value**: Tu API key de Gemini (la misma que usaste en GitHub)
  - Marca las 3 opciones: Production, Preview, Development

### 4. Desplegar
- Haz clic en **"Deploy"**
- Espera 2-3 minutos

### 5. ¡Listo!
Tu aplicación estará disponible en una URL como:
`https://lumina-app-tu-usuario.vercel.app`

## 🔒 Seguridad

✅ **API Key 100% protegida**: La clave NUNCA se expone en el código JavaScript del navegador
✅ **Backend serverless**: Las peticiones a Gemini se hacen desde el servidor de Vercel
✅ **Código limpio**: El repositorio de GitHub no contiene ninguna clave sensible

## 🔄 Actualizaciones automáticas

Cada vez que hagas `git push` a GitHub, Vercel desplegará automáticamente la nueva versión.

## 💡 Desarrollo local

Para probar localmente con el backend:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Ejecutar en modo desarrollo
vercel dev
```

Esto iniciará tanto el frontend como el backend en `http://localhost:3000`
