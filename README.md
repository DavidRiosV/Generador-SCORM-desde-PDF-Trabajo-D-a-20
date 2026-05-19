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
