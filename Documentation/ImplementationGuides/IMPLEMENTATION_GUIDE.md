# Guía de Implementación Técnica - PILDHORA

Este documento detalla los objetivos técnicos y la estrategia para implementar características clave del prototipo de PILDHORA. Sirve como un plan de acción para el desarrollo.

---

## Hito 1: Estabilización y Pulido del Prototipo

### ✅ 1. Persistencia de Datos Real (Offline-First) - *Completado*

**Objetivo:** Eliminar la inconsistencia de datos entre componentes y sesiones. La aplicación debe sentirse como una herramienta autocontenida y resiliente que funciona sin conexión después de la primera carga.

**Estrategia Técnica:**
1.  **Re-arquitectura del `mockApiService`:**
    -   El servicio ya no mantendrá un estado en memoria. Actuará como una capa de acceso a `localStorage`.
    -   **Inicialización:** En el momento de la construcción (`constructor` o al ser instanciado por primera vez), el servicio debe:
        a.  Intentar cargar el estado completo (medicamentos, tareas, etc.) desde `localStorage`.
        b.  Si no hay datos locales (primera vez que se usa la app), generar el conjunto de datos inicial (dummy data).
        c.  Guardar inmediatamente este estado inicial en `localStorage`.
    -   **Operaciones CRUD:** Cada función de modificación (`saveMedication`, `deleteTask`, `updateIntakeStatus`, etc.) debe:
        a.  Realizar la operación sobre los datos en memoria.
        b.  **Inmediatamente después, guardar el estado completo y actualizado en `localStorage`**.
2.  **Refactorización del `DataContext`:**
    -   El `DataContext` debe obtener su estado directamente del `mockApiService` en cada render o a través de un único `fetchData` inicial.
    -   Ya no necesita manejar la lógica de "primer uso vs. uso subsiguiente", ya que el servicio se encarga de ello.
3.  **Limpieza en Logout:**
    -   La función `logout` en `AuthContext` debe invocar una función `clearData` que explícitamente elimine todas las claves de PILDHORA de `localStorage`.

---

### ✅ 2. Validación Avanzada de Formularios ("Quality of Life") - *Completado*

**Objetivo:** Mejorar la experiencia del cuidador al añadir/editar medicamentos, guiándolo para introducir datos correctos y consistentes sin ser disruptivo.

**Estrategia Técnica (`MedicationFormModal.tsx`):**
1.  **Estado de Errores:**
    -   Añadir un estado local para los errores de validación: `const [errors, setErrors] = useState<{ name?: string; dosage?: string }>({});`.
2.  **Función de Validación (`validateForm`):**
    -   Crear una función que se ejecute en el `handleSubmit` antes de guardar.
    -   **Validación de Nombre:**
        -   Regla: No debe estar vacío (`!formData.name.trim()`).
        -   Error: "El nombre del medicamento es obligatorio."
    -   **Validación de Dosis (Inteligente):**
        -   Regla: Debe contener al menos un número Y una unidad de medida común.
        -   Implementación: Usar una expresión regular simple. Ej: `/(?=.*\d)(?=.*(mg|g|ml|iu|pastilla|tableta|cucharada))/i`.
        -   Error: "La dosis debe incluir un número y una unidad (ej. 10mg, 1 pastilla)."
    -   La función `validateForm` debe actualizar el estado `errors` y devolver `true` o `false`.
3.  **Feedback Visual (Inline):**
    -   Debajo de cada `input`, renderizar condicionalmente un `<p>` con el mensaje de error correspondiente si `errors.name` o `errors.dosage` existen.
    -   Estilo del error: Texto pequeño y de color rojo (`text-pildhora-error`).
4.  **Auto-Capitalización:**
    -   En la función `handleChange`, para el campo `name`, transformar el `value` antes de hacer `setFormData`: `value = value.charAt(0).toUpperCase() + value.slice(1);`.

---
### ✅ 3. Auditoría de Accesibilidad y Manejo de Errores - *Completado*

**Objetivo:** Asegurar que la aplicación sea usable por personas con diversas capacidades (WCAG 2.1 AA) y que maneje los fallos de forma elegante.

**Estrategia Técnica:**
1.  **Modales Accesibles (`EmergencyModal`, `InstructionGenerator`):**
    -   Añadir `role="dialog"` y `aria-modal="true"` al contenedor del modal.
    -   Implementar **trampa de foco** (Focus Trapping) para que el usuario no pueda tabular fuera del modal.
    -   Cerrar el modal al presionar la tecla `Escape`.
    -   Al cerrar, devolver el foco al elemento que lo abrió.
2.  **Contraste de Colores:**
    -   Auditar los colores de texto, especialmente los de estado (verde para "Tomada", rojo para "Omitida").
    -   Crear y usar tonos más oscuros que cumplan con la relación de contraste 4.5:1.
3.  **Anuncios en Tiempo Real (ARIA Live Regions):**
    -   Añadir `aria-live="polite"` al `SyncStatusIndicator` para que los lectores de pantalla anuncien los cambios de estado.
4.  **Manejo de Errores de API (Gemini):**
    -   En `InstructionGenerator`, en el bloque `catch` de la llamada a la API, establecer un estado de error (`setError('Mensaje amigable')`).
    -   Renderizar condicionalmente una vista de error dentro del modal en lugar de solo mostrar el texto del error.
