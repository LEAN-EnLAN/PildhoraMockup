# PILDHORA Documentation

Este documento proporciona una descripción técnica de la aplicación PILDHORA, su arquitectura y sus componentes clave.

## 1. Resumen de la Arquitectura

PILDHORA sigue una arquitectura de "primero sin conexión" (offline-first) diseñada para garantizar la funcionalidad incluso sin una conexión a internet estable.

*   **Frontend:** React Native (con Expo Go) para una experiencia de usuario nativa en iOS y Android.
*   **Gestión de Estado:** Zustand o Context API para un manejo de estado predecible y centralizado.
*   **Base de Datos Local:** SQLite para persistir los datos de la aplicación localmente en el dispositivo.
*   **Base de Datos Remota:** Firestore para la sincronización de datos en la nube y el soporte de múltiples dispositivos.
*   **Autenticación:** Firebase Authentication para gestionar el inicio de sesión y la seguridad de los usuarios.
*   **Notificaciones:** Firebase Cloud Messaging para notificaciones push.
*   **Conectividad Hardware:** Módulo Bluetooth Low Energy (BLE) para la comunicación con el pastillero inteligente.

## 2. Estructura de Archivos

La estructura del proyecto está organizada para separar las preocupaciones y facilitar el mantenimiento.

```
/src
 ├── components/      # Componentes de UI reutilizables
 │   ├── Patient/     # Componentes específicos para el paciente
 │   ├── Caregiver/   # Componentes específicos para el cuidador
 │   └── Shared/      # Componentes compartidos por ambos roles
 ├── screens/         # Pantallas principales de la aplicación
 │   ├── Auth/        # Pantallas de inicio de sesión y registro
 │   ├── Dashboard/   # Paneles de control para paciente y cuidador
 │   ├── Reports/     # Pantallas de informes
 │   └── Settings/    # Pantallas de configuración
 ├── services/        # Lógica de negocio y comunicación con APIs
 │   ├── bleService.ts
 │   ├── firebaseService.ts
 │   └── syncService.ts
 ├── database/        # Configuración y migraciones de la BD local
 │   └── localDB.ts
 ├── store/           # Lógica de gestión de estado
 │   └── appState.ts
 ├── navigation/      # Configuración de React Navigation
 │   └── AppNavigator.tsx
 └── App.tsx          # Punto de entrada principal de la aplicación
```

## 3. Flujo de Datos

1.  **Entrada del Usuario:** Las interacciones del usuario en las pantallas (`screens`) desencadenan acciones.
2.  **Gestión de Estado:** Las acciones actualizan el estado global a través de la tienda de Zustand/Context.
3.  **Persistencia Local:** Los cambios de estado relevantes (p. ej., añadir un medicamento) se guardan inmediatamente en la base de datos SQLite local.
4.  **Sincronización en Segundo Plano:** El `syncService` detecta los cambios en la base de datos local y los sincroniza con Firestore cuando hay conexión a internet.
5.  **Resolución de Conflictos:** Los conflictos de datos se resuelven utilizando marcas de tiempo (timestamps), dando prioridad al cambio más reciente.

## 4. Sistema de Diseño y UI

*   **Tema:** Catppuccin Mocha, un tema de alto contraste y accesible.
*   **Componentes:** ShadcnUI para los componentes principales, Chakra UI para los modales.
*   **Estilos:** Se utilizan utilidades de Tailwind CSS para un estilizado consistente y sin estilos en línea.
*   **Tipografía:** Sistema de tipografía de Cupertino para una legibilidad óptima.
*   **Animaciones:** Transiciones suaves y animaciones de feedback para una experiencia de usuario fluida.

## 5. Módulos Clave

### `bleService.ts`

Responsable de gestionar la conexión BLE con el pastillero inteligente.
*   Escanea y se conecta a dispositivos BLE.
*   Lee datos del pastillero (p. ej., compartimentos abiertos).
*   Maneja las desconexiones y los errores de conexión.

### `syncService.ts`

Orquesta la sincronización de datos entre la base de datos local y Firestore.
*   Monitoriza los cambios en la base de datos local.
*   Envía los cambios a Firestore cuando está en línea.
*   Obtiene los cambios de Firestore y los aplica a la base de datos local.

### `firebaseService.ts`

Gestiona todas las interacciones con los servicios de Firebase (Auth, Firestore, Cloud Messaging).
*   Autenticación de usuarios.
*   Operaciones CRUD en Firestore.
*   Envío y recepción de notificaciones push.