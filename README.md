# 🚀 Trabajo Día 20 – Generador SCORM desde PDF

---

## 📄 Descripción del proyecto

Este proyecto implementa un sistema completo que permite transformar documentos PDF en contenido educativo interactivo de forma automática.

El sistema es capaz de:

- 📄 Extraer contenido desde archivos PDF  
- 🧠 Generar automáticamente preguntas educativas  
- 🎯 Crear distintos tipos de ejercicios  
- 🌐 Construir un examen interactivo en HTML  
- 📦 Exportar el contenido como paquete SCORM 1.2  
- 🏫 Integrarlo directamente en plataformas LMS como Moodle  

---

## 🧱 Arquitectura del sistema

El flujo general del sistema es el siguiente:

**PDF → Extracción de texto → Generación de preguntas → Actividades → Examen HTML → SCORM ZIP → LMS**

Este pipeline automatiza todo el proceso de creación de contenido educativo digital.

---

## ⚙️ Tecnologías utilizadas

- Node.js ≥ 18  
- JavaScript (CommonJS)  
- pdf-parse  
- archiver  
- HTML5  
- CSS3  
- JavaScript Vanilla  
- Estándar SCORM 1.2  

---

## 🧠 Funcionamiento del sistema

### 1. 📄 Extracción del PDF
El sistema lee el documento PDF y limpia el texto eliminando cabeceras, pies de página y ruido innecesario.

---

### 2. 🧠 Generación de preguntas
Detecta automáticamente preguntas a partir del contenido, especialmente frases interrogativas como “¿…?”.

---

### 3. 🎯 Generación de actividades
Convierte las preguntas en distintos tipos de ejercicios educativos:

- Tipo test  
- Verdadero / Falso  
- Unir con flechas (matching)  
- Rellenar huecos  

---

### 4. 🌐 Examen interactivo
Se genera una interfaz web donde el alumno puede responder las actividades de forma dinámica.

---

### 5. 📦 Exportación SCORM
El sistema empaqueta todo el contenido en un archivo ZIP compatible con SCORM 1.2, listo para LMS.

---

## 🎯 Objetivo del proyecto

Automatizar la creación de contenido educativo digital a partir de documentos PDF, reduciendo significativamente el tiempo de desarrollo de cursos e integrándolo en estándares e-learning profesionales como SCORM.

---

## 🚀 Resultado final

Un sistema completo capaz de convertir cualquier PDF educativo en:

- 📘 Curso interactivo  
- 🧪 Examen online  
- 📦 Paquete SCORM compatible con Moodle y otros LMS  

---

# 🛠️ Guía de instalación y manual de uso

---

## 📥 Clonar el repositorio

```bash
git clone https://github.com/DavidRiosV/Generador-SCORM-desde-PDF-Trabajo-D-a-20.git
```

---

## 📂 Entrar en el proyecto

```bash
cd Generador-SCORM-desde-PDF-Trabajo-D-a-20
```

---

## ⚠️ IMPORTANTE: Node.js 18.20 obligatorio

Este proyecto **solo funciona correctamente con Node.js 18.20**.

---

### 🔍 Comprobar versión actual

```bash
node -v
npm -v
```

---

### ❌ Eliminar versiones anteriores

```bash
sudo apt remove nodejs -y
sudo apt autoremove -y
```

---

### 📦 Instalar NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
```

---

### 🔍 Comprobar NVM

```bash
nvm --version
```

---

### ⬇️ Instalar Node.js 18.20

```bash
nvm install 18.20
```

---

### 🚀 Activar versión correcta

```bash
nvm use 18.20
nvm alias default 18.20
```

---

### ✅ Verificación final

```bash
node -v
```

Debe aparecer:

```bash
v18.20.x
```

---

## 📦 Instalar dependencias

```bash
npm install
```

---

# 🚀 Cómo usar el sistema

---

## 📄 Paso 1 — Añadir PDF

Coloca el PDF en:

```bash
/pdf
```

---

## 🧠 Paso 2 — Generar preguntas

```bash
node generarPreguntasDesdePDF.js pdf/documento.pdf
```

---

## 🌐 Paso 3 — Ejecutar aplicación

```bash
node app.js
```

---

# 📋 Menú del sistema

## 1️⃣ Generar HTML
Crea un examen interactivo en HTML.

## 2️⃣ Generar SCORM
Crea un .zip compatible con Moodle.

## 3️⃣ Generar nuevas preguntas
Permite cambiar el PDF y regenerar el JSON de preguntas.

---

# ✏️ Personalización manual

Puedes editar el JSON de preguntas manualmente para añadir o modificar contenido para generar examenes con preguntas ya creadas por ti, eso si recuerda que debe de seguir la misma estrutura que las que genera el programa para que funcione.

---

# 🏫 Compatibilidad

- Moodle  
- Blackboard  
- Canvas  
- SCORM Cloud  

---

# 👨‍💻 Autores

David Ríos Valencia e Israel Jimenez Jimenez
