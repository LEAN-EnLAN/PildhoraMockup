# PILDHORA Documentation

Este documento proporciona una descripción técnica de la aplicación PILDHORA, su arquitectura y sus componentes clave, basados en un enfoque 100% local utilizando Expo.

## 1. Resumen de la Arquitectura

PILDHORA utiliza una arquitectura completamente local ("local-first") para garantizar la máxima privacidad y funcionalidad sin necesidad de una conexión a internet.

*   **Frontend:** React Native (con Expo Go) para una experiencia de usuario nativa en iOS y Android.
*   **Gestión de Estado:** Zustand o Context API para un manejo de estado predecible y centralizado.
*   **Base de Datos Local:** `expo-sqlite` para persistir todos los datos de la aplicación (usuarios, medicamentos, horarios) directamente en el dispositivo.
*   **Autenticación Local:** `expo-secure-store` para gestionar de forma segura la sesión del usuario.
*   **Notificaciones Locales:** `expo-notifications` para programar todas las alertas y recordatorios.
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
 ├── services/        # Lógica de negocio y comunicación con APIs locales
 │   ├── bleService.ts
 │   ├── databaseService.ts
 │   └── notificationService.ts
 ├── store/           # Lógica de gestión de estado
 │   └── appState.ts
 ├── navigation/      # Configuración de React Navigation
 │   └── AppNavigator.tsx
 └── App.tsx          # Punto de entrada principal de la aplicación
```

## 3. Flujo de Datos

1.  **Entrada del Usuario:** Las interacciones del usuario en las pantallas (`screens`) desencadenan acciones.
2.  **Gestión de Estado:** Las acciones actualizan el estado global a través de la tienda de Zustand/Context.
3.  **Persistencia Local:** Los cambios de estado relevantes (p. ej., añadir un medicamento) se guardan inmediatamente en la base de datos `expo-sqlite`.
4.  **Notificaciones Programadas:** Acciones como la creación de un nuevo horario de medicación programan notificaciones locales a través del `notificationService`.

## 4. Sistema de Diseño y UI

*   **Tema:** Catppuccin Mocha, un tema de alto contraste y accesible.
*   **Componentes:** ShadcnUI para los componentes principales, Chakra UI para los modales.
*   **Estilos:** Se utilizan utilidades de Tailwind CSS para un estilizado consistente y sin estilos en línea.
*   **Tipografía:** Sistema de tipografía de Cupertino para una legibilidad óptima.
*   **Animaciones:** Transiciones suaves y animaciones de feedback para una experiencia de usuario fluida.

## 5. Módulos Clave

### `databaseService.ts`

Responsable de todas las operaciones de la base de datos con `expo-sqlite`.
*   Inicializa la base de datos y crea las tablas.
*   Proporciona métodos CRUD (Crear, Leer, Actualizar, Eliminar) para todos los datos de la aplicación.
*   Gestiona las transacciones de la base de datos.

### `notificationService.ts`

Gestiona la programación y el manejo de todas las notificaciones locales.
*   Solicita permisos de notificación al usuario.
*   Programa notificaciones para recordatorios de dosis, alertas de recarga, etc.
*   Maneja las interacciones del usuario con las notificaciones.

### `bleService.ts`

Responsable de gestionar la conexión BLE con el pastillero inteligente.
*   Escanea y se conecta a dispositivos BLE.
*   Lee datos del pastillero (p. ej., compartimentos abiertos).
*   Maneja las desconexiones y los errores de conexión.