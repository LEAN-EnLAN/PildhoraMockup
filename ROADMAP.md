# PILDHORA Development Roadmap

Este documento describe los pasos necesarios para transformar la aplicación PILDHORA de un prototipo web de React a una aplicación móvil multiplataforma funcional utilizando React Native y Expo Go, con una arquitectura 100% local.

## Fase 1: Configuración del Proyecto y Migración Base (Completada)

*   **Objetivo:** Establecer el entorno de desarrollo de Expo y migrar la estructura básica del proyecto.
*   **Tareas:**
    1.  Inicializar Expo, instalar dependencias de React Native y eliminar las de la web.
    2.  Adaptar el punto de entrada (`App.tsx`) para la navegación nativa.
    3.  Crear la rama `development`.

## Fase 2: Refactorización de la Interfaz de Usuario

*   **Objetivo:** Convertir todos los componentes de la interfaz de usuario de HTML a componentes de React Native.
*   **Tareas:**
    1.  **Refactorizar `pages`:** Migrar `LoginPage`, `PatientDashboard`, y `CaregiverDashboard` a componentes de React Native.
    2.  **Refactorizar `components`:** Convertir todos los componentes compartidos y específicos de roles.
    3.  **Aplicar Estilos:** Utilizar el sistema de estilos de React Native para implementar el diseño de Catppuccin Mocha.

## Fase 3: Implementación de Navegación

*   **Objetivo:** Implementar una navegación nativa robusta y un flujo de autenticación local.
*   **Tareas:**
    1.  **Configurar `React Navigation`:** Implementar un navegador de pila para gestionar las transiciones entre pantallas.
    2.  **Crear Flujo de Autenticación Local:** Gestionar la transición entre las pantallas de autenticación y las principales de la aplicación, basándose en la sesión guardada localmente.

## Fase 4: Implementación de Lógica de Negocio Local

*   **Objetivo:** Desarrollar la lógica de negocio principal utilizando las APIs de Expo para una funcionalidad completamente offline.
*   **Tareas:**
    1.  **Base de Datos Local con `expo-sqlite`:** Configurar y gestionar la base de datos SQLite como la única fuente de verdad para los datos de la aplicación (usuarios, medicamentos, horarios).
    2.  **Servicio de Autenticación Local:** Utilizar `expo-secure-store` para guardar y gestionar de forma segura la sesión del usuario en el dispositivo.
    3.  **Servicio de Notificaciones Locales:** Implementar `expo-notifications` para programar todas las alertas, recordatorios y notificaciones de la aplicación directamente en el dispositivo.

## Fase 5: Funcionalidades Nativas

*   **Objetivo:** Implementar las características específicas del hardware del móvil.
*   **Tareas:**
    1.  **Integración BLE:** Desarrollar el `bleService` para conectar y comunicarse con el pastillero inteligente (ESP32).
    2.  **Modo de Emergencia:** Implementar la funcionalidad del botón SOS.
    3.  **Generación de Informes:** Crear la funcionalidad para generar y exportar informes de adherencia.

## Fase 6: Pruebas y Optimización

*   **Objetivo:** Asegurar la calidad, el rendimiento y la fiabilidad de la aplicación.
*   **Tareas:**
    1.  **Pruebas Unitarias y de Integración:** Escribir pruebas para los componentes y servicios críticos.
    2.  **Pruebas en Dispositivos Físicos:** Probar la aplicación en dispositivos iOS y Android.
    3.  **Optimización de Rendimiento:** Perfilar la aplicación y optimizar el rendimiento para alcanzar los 60fps.
    4.  **Revisión de Accesibilidad:** Asegurar que la aplicación cumple con las pautas de accesibilidad.