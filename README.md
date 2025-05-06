# Copilot Chat Helper

## Descripción
Copilot Chat Helper es una extensión de Visual Studio Code que permite interactuar con el chat de GitHub Copilot para realizar preguntas sobre el proyecto abierto y recibir respuestas directamente en el editor.

## Instalación

1. **Compilar la extensión**:
   - Abre una terminal en el directorio del proyecto.
   - Ejecuta el comando `npm run watch` para compilar la extensión en modo de observación.

2. **Cargar la extensión en Visual Studio Code**:
   - Abre Visual Studio Code.
   - Ve al menú de extensiones (`Ctrl+Shift+X` o `Cmd+Shift+X` en macOS).
   - Haz clic en el botón con el ícono de engranaje (⚙️) y selecciona "Instalar desde VSIX...".
   - Selecciona el archivo `.vsix` generado (si no está generado, puedes probar la extensión directamente desde el entorno de desarrollo).

3. **Ejecutar la extensión**:
   - Presiona `F5` en Visual Studio Code para abrir una nueva ventana de desarrollo con la extensión cargada.
   - En la nueva ventana, abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`) y busca el comando `Ask Copilot`.

## Uso

1. Abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`).
2. Escribe `Ask Copilot` y selecciona el comando.
3. Ingresa tu pregunta en el cuadro de entrada que aparece.
4. Recibe la respuesta directamente en un mensaje emergente.

## Desarrollo

Para contribuir o modificar esta extensión:

- Asegúrate de tener Node.js instalado.
- Usa `npm install` para instalar las dependencias.
- Usa `npm run watch` para compilar los cambios automáticamente.

## Licencia
Este proyecto está bajo la licencia MIT.
