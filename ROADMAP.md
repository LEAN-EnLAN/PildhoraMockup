# PILDHORA Development Roadmap

Este documento describe los pasos necesarios para transformar la aplicación PILDHORA de un prototipo web de React a una aplicación móvil multiplataforma funcional utilizando React Native y Expo Go.

## Fase 1: Configuración del Proyecto y Migración Base

*   **Objetivo:** Establecer el entorno de desarrollo de Expo y migrar la estructura básica del proyecto.
*   **Tareas:**
    1.  **Inicializar Expo:** Instalar y configurar Expo en el proyecto existente.
    2.  **Instalar Dependencias Fundamentales:** Añadir `react-native`, `expo`, `@react-navigation/native`, y otras bibliotecas esenciales.
    3.  **Reemplazar Dependencias Web:** Eliminar `react-dom` y `react-router-dom`.
    4.  **Adaptar Punto de Entrada:** Modificar `App.tsx` para que funcione como el punto de entrada de una aplicación Expo.
    5.  **Crear Rama `development`:** Aislar el nuevo desarrollo del código base original.

## Fase 2: Refactorización de la Interfaz de Usuario

*   **Objetivo:** Convertir todos los componentes de la interfaz de usuario de HTML a componentes de React Native.
*   **Tareas:**
    1.  **Refactorizar `pages`:** Migrar `LoginPage`, `PatientDashboard`, y `CaregiverDashboard` a componentes de React Native (usando `<View>`, `<Text>`, `<TextInput>`, etc.).
    2.  **Refactorizar `components`:** Convertir todos los componentes compartidos y específicos de roles.
    3.  **Aplicar Estilos:** Utilizar el sistema de estilos de React Native para implementar el diseño de Catppuccin Mocha.

## Fase 3: Implementación de Navegación

*   **Objetivo:** Reemplazar el enrutamiento web con una navegación nativa robusta.
*   **Tareas:**
    1.  **Configurar `React Navigation`:** Implementar un navegador de pila (stack navigator) para gestionar las transiciones entre pantallas.
    2.  **Crear Flujo de Autenticación:** Gestionar la transición entre las pantallas de autenticación y las pantallas principales de la aplicación.
    3.  **Implementar Navegación por Pestañas (Caregiver):** Si es necesario, añadir un navegador de pestañas para el panel del cuidador.

## Fase 4: Integración de Servicios y Lógica de Negocio

*   **Objetivo:** Adaptar los servicios existentes y desarrollar la lógica de negocio principal.
*   **Tareas:**
    1.  **Servicio de Autenticación:** Integrar Firebase Auth para el inicio de sesión por correo/contraseña y biométrico.
    2.  **Base de Datos Local:** Configurar SQLite para el almacenamiento de datos offline.
    3.  **Sincronización con Firestore:** Desarrollar el `syncService` para sincronizar la base de datos local con Firestore.
    4.  **Servicio de Notificaciones:** Implementar notificaciones locales y push con Firebase Cloud Messaging.

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