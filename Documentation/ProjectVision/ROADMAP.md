# PILDHORA - README & Roadmap

## 🎯 Visión del Proyecto (Project Vision)

**PILDHORA** es una solución integral de salud digital diseñada para revolucionar la adherencia al tratamiento farmacológico en adultos mayores. Combinando un pastillero inteligente con una aplicación móvil dual (para pacientes y cuidadores), buscamos ofrecer **"Tranquilidad conectada"**: un ecosistema simple donde el hardware, el paciente y el cuidador están sincronizados en tiempo real.

### Principios Clave:
1.  **SIMPLE** para el paciente (menos es más).
2.  **CONFIABLE** en la detección y alertas.
3.  **COMPLETO** para el cuidador (Control Total).
4.  **RESILIENTE** ante fallos de conexión (Offline-First).
5.  **ACCESIBLE** para todas las edades (WCAG 2.1 AA).
6.  **SEGURO** con los datos médicos.
7.  **PROACTIVO** en la prevención de olvidos.

---

## ✨ Características Actuales (v1.0 - Prototipo Funcional)

### Plataforma
-   **Arquitectura:** Aplicación web con React, simulando una PWA.
-   **Estilo:** Tailwind CSS con una paleta de colores dual para Paciente (cálida, accesible) y Cuidador (Material 3).

### Flujo del Paciente
-   [✓] **Dashboard Simplificado:** Una vista única enfocada en la "Próxima Toma".
-   [✓] **Pastillero Visual Interactivo:** Un gráfico circular que destaca el compartimento correcto.
-   [✓] **Confirmación de Toma:** Botón grande y claro para registrar la toma manualmente.
-   [✓] **Plan del Día:** Lista clara de todas las medicinas del día con su estado (Tomada, Omitida, Pendiente).
-   [✓] **Botón de Emergencia:** Acceso rápido a contactos.
-   [✓] **Feedback Visual y de Estado:** Indicadores de sincronización y mensajes de éxito.
-   [✓] **Diseño Accesible:** Alto contraste, tipografía grande y colores amigables.

### Flujo del Cuidador
-   [✓] **Dashboard con Pestañas:** Navegación intuitiva entre Inicio, Historial, Medicamentos, Tareas y Reportes.
-   [✓] **Gestión Completa de Medicamentos (CRUD):** Añadir, editar y eliminar medicamentos.
-   [✓] **Gestión de Tareas (CRUD):** To-do list simple y funcional para añadir, editar y completar tareas.
-   [✓] **Sistema de Notificaciones:** Centro de notificaciones con alertas para dosis omitidas y stock bajo.
-   [✓] **Preferencias de Notificación:** Control granular sobre qué alertas recibir.
-   [✓] **Reportes de Adherencia:** Gráfico semanal y mensual con opción de imprimir y exportar a CSV.
-   [✓] **Asistente IA:** Generador de instrucciones simplificadas para pacientes usando Gemini API.

### Backend y Datos (Simulado)
-   [✓] **Persistencia Offline-First:** El estado completo de la aplicación (medicamentos, tareas, historial) se guarda en `localStorage`, simulando una base de datos local. La aplicación es funcional sin conexión después de la primera carga.
-   [✓] **Validación de Formularios:** Validación inteligente y "quality of life" en los formularios del cuidador.

---

## 🚀 Hoja de Ruta (Roadmap)

### Hito 1: Estabilización y Pulido del Prototipo (Completado)

-   [✓] **Persistencia de Datos Real:** Re-arquitectura del servicio de datos para usar `localStorage` como una base de datos offline, asegurando consistencia y persistencia.
-   [✓] **Validación Avanzada de Formularios:** Implementación de validación "quality of life" (auto-capitalización, validación de dosis) con feedback inline no disruptivo.
-   [✓] **Auditoría de Accesibilidad (WCAG 2.1 AA):**
    -   [✓] Contraste de colores verificado y corregido.
    -   [✓] Atributos ARIA y roles semánticos en todos los componentes interactivos.
    -   [✓] Navegación por teclado y manejo del foco (especialmente en modales).
-   [✓] **Manejo de Errores Mejorado:**
    -   [✓] Feedback visual claro para el usuario cuando una llamada a la API (como Gemini) falla.

### Hito 2: Conectividad y Backend Real (Próximos Pasos)

-   [ ] **Fase 1: Integración con Backend (Firebase):**
    -   [ ] Reemplazar `localStorage` con **Cloud Firestore**.
    -   [ ] Implementar **Firebase Authentication** para un login real.
    -   [ ] Usar **Firebase Storage** para las imágenes de los medicamentos.
    -   [ ] Configurar **Firebase Cloud Messaging** para notificaciones push reales.
-   [ ] **Fase 2: Conectividad con Hardware (Bluetooth Low Energy):**
    -   [ ] Desarrollar un servicio Bluetooth para escanear y conectar con el pastillero inteligente.
    -   [ ] Implementar el protocolo de comunicación definido (enviar alarmas, recibir estado de compartimentos).
    -   [ ] Sincronizar el estado del pastillero con la app en tiempo real.
    -   [ ] Habilitar el registro de tomas automático (`method: 'bluetooth'`).

### Hito 3: Funcionalidades Avanzadas y Expansión

-   [ ] **Múltiples Pacientes:** Permitir que un cuidador gestione a varios pacientes desde su cuenta.
-   [ ] **Permisos Detallados:** Configurar roles para diferentes tipos de cuidadores (familiar, médico).
-   [ ] **Modo Viaje:** Ajuste automático de zona horaria para los recordatorios de medicación.
-   [ ] **Dashboard de Paciente Mejorado:**
    -   [ ] Integrar sonidos y vibraciones personalizables para las alarmas.
    -   [ ] Añadir un historial de tomas simple dentro de la vista del paciente.
-   [ ] **Analíticas Avanzadas para el Cuidador:**
    -   [ ] Gráficos de tendencias a largo plazo.
    -   [ ] Identificación de patrones de omisión de dosis (ej. "siempre se olvida la dosis del mediodía los fines de semana").

### Hito 4: Lanzamiento y Soporte
-   [ ] **Pruebas con Usuarios Reales:** Beta testing con un grupo de pacientes y cuidadores.
-   [ ] **Optimización de Rendimiento:** Analizar y mejorar la velocidad de carga y la respuesta de la UI.
-   [ ] **Onboarding Interactivo:** Crear tutoriales guiados para la primera configuración.
-   [ ] **Documentación de Usuario:** Guías y FAQs para pacientes y cuidadores.
