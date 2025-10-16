# PILDHORA - Roadmap: Hardware Integration (Expo Go)

## 🎯 Objetivo: Preparar la App para Pruebas con el Pastillero Inteligente

El objetivo de este hito es desarrollar y simular toda la lógica de conectividad Bluetooth y gestión del dispositivo dentro de la aplicación, de modo que cuando el hardware físico esté listo, la integración sea un proceso de "conectar y funcionar". Esto nos permitirá testear los flujos de usuario completos en **Expo Go** antes de tener el hardware final.

---

## 🔧 Hito 1: Simulación de Conectividad y UI de Gestión

En esta fase, no nos conectaremos a un dispositivo real. Crearemos un **servicio Bluetooth simulado (`mockBluetoothService.ts`)** que imite el comportamiento del pastillero inteligente.

-   [✓] **1. Crear Servicio Bluetooth Simulado (`mockBluetoothService.ts`):**
    -   [✓] **Estado del Dispositivo:** Mantener un estado interno que simule el pastillero (ej. `isConnected: boolean`, `batteryLevel: number`, `compartments: { id: number; isOpen: boolean }[]`).
    -   [✓] **Funciones Simuladas:**
        -   `scanForDevices()`: Devuelve una lista de pastilleros falsos con IDs y nombres únicos después de un `setTimeout`.
        -   `connect(deviceId)`: Cambia `isConnected` a `true` y empieza a emitir eventos.
        -   `disconnect()`: Cambia `isConnected` a `false`.
        -   `setAlarm(compartmentId, time)`: Simula programar una alarma en el dispositivo.
        -   `triggerLed(compartmentId)`: Simula encender un LED.
    -   [✓] **Emisión de Eventos (Callbacks o Emitter):**
        -   El servicio debe permitir que la UI se suscriba a eventos como `onDeviceStateChange`, `onCompartmentOpened`, `onBatteryLow`.
        -   Simular la apertura de un compartimento: `mockOpenCompartment(compartmentId)` que invoca el callback `onCompartmentOpened`.

-   [✓] **2. Crear UI de Gestión de Dispositivos (Vista del Cuidador):**
    -   [✓] **Nueva Pestaña/Sección:** Añadir una nueva sección en el dashboard del cuidador llamada "Dispositivo".
    -   [✓] **Pantalla de Escaneo:**
        -   Un botón "Buscar Pastillero" que llama a `scanForDevices()`.
        -   Muestra una lista de dispositivos encontrados con un botón "Conectar" al lado de cada uno.
        -   Muestra un estado de "Buscando..." mientras escanea.
    -   [✓] **Pantalla de Estado del Dispositivo:**
        -   Una vez conectado, muestra:
            -   Nombre y estado del dispositivo ("Conectado").
            -   Nivel de batería (con un ícono).
            -   Un botón para probar la conexión (que llama a `triggerLed` y muestra un feedback en la UI).
            -   Un botón "Desconectar".

---

## ⚙️ Hito 2: Integración del Flujo del Paciente

Con el servicio simulado y la UI de gestión listos, integraremos el flujo de toma de medicación.

-   [✓] **1. Conectar `DataContext` al Servicio Simulado:**
    -   [✓] El `DataContext` debe inicializar el `mockBluetoothService`.
    -   [✓] Debe suscribirse a los eventos del servicio (ej. `onCompartmentOpened`).

-   [✓] **2. Actualizar el Dashboard del Paciente:**
    -   [✓] **Detección Automática de Toma:**
        -   Cuando el `DataContext` recibe un evento `onCompartmentOpened` del servicio:
            a.  Verifica si la apertura corresponde a la `nextMedication`.
            b.  Si coincide, llama a `updateIntakeStatus` con el estado `TAKEN` y el método `bluetooth`.
            c.  Muestra la confirmación de éxito en la UI del paciente automáticamente.
    -   [✓] **Feedback de Alarma:**
        -   Cuando es hora de una toma, además de la alarma en la app, la UI debe mostrar un estado "Esperando apertura del pastillero..." y visualmente indicar que la alarma en el dispositivo físico estaría sonando (ej. el `VisualPillbox` parpadea).

-   [✓] **3. Notificaciones al Cuidador Basadas en Hardware:**
    -   [✓] Generar notificaciones para eventos críticos del hardware:
        -   "El pastillero de Elena tiene la batería baja (15%)."
        -   "El pastillero de Elena se ha desconectado."
    -   [✓] Notificación al cuidador si se abre un compartimento incorrecto.

---

## 📦 Hito 3: Preparación para Expo Go y Pruebas Reales

-   [ ] **1. Crear un `bluetoothService.ts` Real:**
    -   [ ] Crear un nuevo archivo que use una librería de Bluetooth para Expo (ej. `expo-bluetooth-le`).
    -   [ ] Implementar la misma interfaz que el `mockBluetoothService` (mismas funciones y eventos).

-   [ ] **2. Inyección de Dependencias:**
    -   [ ] Modificar la aplicación para que pueda cambiar fácilmente entre el servicio real y el simulado. Se puede usar una variable de entorno o un simple switch de configuración.
    -   `const bluetoothService = IS_DEV_MODE ? mockBluetoothService : realBluetoothService;`

-   [ ] **3. Empaquetado y Pruebas:**
    -   [ ] Generar el build con Expo Go.
    -   [ ] Realizar pruebas de extremo a extremo del flujo completo: Conectar dispositivo -> Programar medicación -> Recibir alarma -> Abrir compartimento -> Verificación en la app del cuidador.