# Guía de Implementación Técnica - Hito 2: Repositorio de Datos

Este documento detalla los objetivos técnicos y la estrategia para re-arquitectar la capa de datos de PILDHORA, pasando de un servicio de mockeo simple a un patrón de Repositorio de Datos robusto y unificado.

**Objetivo Principal:** Crear una fuente única de verdad (`single source of truth`) para todos los datos de la aplicación, desacoplando la lógica de la interfaz de usuario de las fuentes de datos (local y remota). Esto mejora la consistencia, facilita las pruebas y prepara la aplicación para una futura integración con un backend real.

---

### ✅ 1. Creación del Repositorio de Datos Unificado - *Completado*

**Objetivo:** Centralizar toda la lógica de obtención y modificación de datos en un solo lugar, manejando la sincronización entre el almacenamiento local y el "servidor".

**Estrategia Técnica:**
1.  **Crear `services/dataRepository.ts`:** Este será el único módulo que interactúe directamente con `localStorageService` y `mockApiService`.
2.  **Lógica Offline-First:**
    -   Las funciones `get...` (ej. `getMedications`) deben:
        a.  Obtener datos tanto de `localStorage` (local) como de `mockApiService` (remoto).
        b.  Comparar los `updatedAt` timestamps para determinar la fuente más reciente.
        c.  Devolver siempre los datos más nuevos.
        d.  Si los datos remotos son más nuevos, actualizar el caché local en `localStorage` de forma transparente.
3.  **Actualizaciones Optimistas:**
    -   Las funciones de modificación (`update...`, `add...`, `delete...`) deben:
        a.  Actualizar los datos en `localStorage` **primero** para una respuesta instantánea en la UI.
        b.  Luego, de forma asíncrona, enviar la actualización al `mockApiService` para simular la sincronización con el servidor.

---

### ✅ 2. Refactorización del `DataContext` - *Completado*

**Objetivo:** Simplificar el `DataContext` para que actúe únicamente como un contenedor de estado para la UI, delegando toda la lógica de negocio al repositorio.

**Estrategia Técnica:**
1.  **Eliminar Lógica Compleja:** Remover todas las implementaciones de `fetch`, `localStorage`, y lógica de negocio del `DataContext`.
2.  **Delegar al Repositorio:** Todas las funciones de `DataContext` (ej. `updateIntakeStatus`, `addMedication`) ahora deben ser simples llamadas a las funciones correspondientes en el `dataRepository`.
3.  **Fuente Única:** El `DataContext` obtiene todos sus datos iniciales y sus actualizaciones a través del `dataRepository`, asegurando que la UI siempre refleje el estado de la fuente de verdad unificada.

---

### ✅ 3. Implementación del Modelo de Datos Persistente - *Completado*

**Objetivo:** Añadir los metadatos necesarios a nuestros datos para permitir la resolución de conflictos basada en timestamps.

**Estrategia Técnica:**
1.  **Crear Wrapper `PersistentData<T>` en `types.ts`:**
    -   Definir una interfaz genérica que envuelva cualquier tipo de dato (ej. `Medication[]`) y le añada una propiedad `updatedAt: number`.
    -   Ejemplo: `interface PersistentData<T> { data: T; updatedAt: number; }`
2.  **Adoptar el Wrapper:**
    -   Actualizar `localStorageService` y `mockApiService` para que todas las operaciones de almacenamiento y transferencia utilicen este wrapper. Esto es fundamental para que el `dataRepository` pueda comparar fechas y resolver conflictos.

---

### Resumen de Finalización

**Estado:** **COMPLETADO**

Los objetivos descritos en esta guía de implementación han sido alcanzados con éxito. La aplicación ahora cuenta con una capa de datos robusta y desacoplada, basada en el patrón de Repositorio. Esto ha resuelto los problemas de inconsistencia de datos y ha establecido una arquitectura escalable y resiliente, alineada con los principios de diseño "Offline-First" y "Confiable" del proyecto PILDHORA.
