# Guía de Solución de Problemas (Troubleshooting)

Este documento contiene soluciones a problemas comunes que pueden surgir durante el desarrollo de PILDHORA.

## Problema: Al ejecutar `npx expo start` y abrir la versión web, aparece una pantalla en blanco.

### Síntoma

Después de iniciar el servidor de desarrollo de Expo, si seleccionas la opción de abrir la aplicación en un navegador web (pulsando la tecla `w` en la terminal), se abre una pestaña en el navegador, pero la pantalla permanece completamente en blanco. No se muestra ningún contenido de la aplicación.

### Causa Raíz

La razón de este comportamiento es que **el proyecto ha sido migrado de una aplicación web de React a una aplicación exclusivamente móvil con React Native y Expo**.

1.  **Eliminación de la Base Web:** En una aplicación web de React estándar, existe un archivo `index.html` que sirve como el "lienzo" sobre el cual se renderiza la aplicación. El código de React (a través de `react-dom`) se "monta" en un elemento de este HTML (generalmente un `<div id="root">`). Durante la migración a React Native, eliminamos `index.html` y la dependencia `react-dom` porque una aplicación móvil no los necesita.

2.  **Arquitectura Nativa:** React Native no renderiza HTML. En su lugar, utiliza componentes nativos de la plataforma (`<View>`, `<Text>`, etc.) que se corresponden con los elementos de la interfaz de usuario de iOS y Android.

3.  **El Rol de Expo Go:** La forma correcta de probar este proyecto es utilizando la aplicación **Expo Go** en un dispositivo móvil (o un simulador de iOS/Android). Expo Go sabe cómo tomar el código de JavaScript de nuestra aplicación y traducirlo en componentes nativos reales. El servidor de desarrollo de Expo (`npx expo start`) está diseñado principalmente para servir este código a Expo Go.

En resumen, la opción "web" del menú de Expo no funciona porque nuestro proyecto ya no tiene el andamiaje necesario para renderizarse en un navegador.

### Solución

Para probar y visualizar la aplicación correctamente, sigue estos pasos:

1.  **Instala la aplicación Expo Go** en tu teléfono iOS o Android.
2.  Ejecuta `npx expo start` en la terminal, en el directorio del proyecto.
3.  Espera a que aparezca un **código QR** en la terminal.
4.  Abre la aplicación Expo Go en tu teléfono y **escanea el código QR**.

La aplicación se cargará en tu dispositivo y podrás interactuar con ella como un usuario final.