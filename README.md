# Copilot Chat Helper

## Descripción
Copilot Chat Helper es una extensión de Visual Studio Code que permite interactuar con el chat de GitHub Copilot para realizar preguntas sobre el proyecto abierto y recibir respuestas directamente en el editor. Además, permite analizar el código del proyecto utilizando Ollama, una herramienta de ejecución local de modelos de inteligencia artificial, permitiendo así un análisis de código totalmente offline.

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

### Interacción con GitHub Copilot
1. Abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`).
2. Escribe `Ask Copilot` y selecciona el comando.
3. Ingresa tu pregunta en el cuadro de entrada que aparece.
4. Recibe la respuesta directamente en un panel del editor.

### Análisis de código con Ollama (Offline)
1. Abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`).
2. Escribe `Analizar Código con Ollama` y selecciona el comando.
3. La extensión verificará automáticamente la instalación de Ollama y el modelo necesario.
4. Si Ollama o el modelo no están disponibles, se te guiará para instalarlos.
5. El código del proyecto será analizado y recibirás la respuesta en un panel del editor.

## Requisitos para el análisis offline con Ollama

Para utilizar la funcionalidad de análisis de código offline con Ollama, necesitas:

1. **Tener instalado Ollama**: 
   - Si no lo tienes instalado, la extensión te ofrecerá descargar Ollama desde su [sitio web oficial](https://ollama.com/download).
   - Ollama debe estar en ejecución para que la extensión pueda comunicarse con él.

2. **Tener un modelo compatible**:
   - La extensión está configurada para usar `codellama` por defecto.
   - Si el modelo no está instalado, la extensión te ofrecerá descargarlo automáticamente.
   - También puedes seleccionar cualquier otro modelo que tengas instalado en Ollama.

La extensión intentará guiarte durante todo el proceso de configuración, minimizando los pasos manuales necesarios.

### Configuración de Ollama
1. Abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`).
2. Escribe `Configurar Ollama para Análisis de Código` y selecciona el comando.
3. Sigue las instrucciones para configurar Ollama y descargar los modelos necesarios.

### Personalizar la configuración
Puedes personalizar la configuración de Ollama en los ajustes de VS Code:
1. Ve a Configuración (`Ctrl+,` o `Cmd+,` en macOS).
2. Busca "Copilot Chat Helper".
3. Configura las opciones:
   - `copilotChatHelper.ollama.model`: Modelo de Ollama a utilizar (predeterminado: "codellama").
   - `copilotChatHelper.ollama.host`: URL del servidor de Ollama (predeterminado: "http://localhost:11434").
   - `copilotChatHelper.ollama.autoSetup`: Intentar configurar Ollama automáticamente (predeterminado: true).

## Desarrollo

Para contribuir o modificar esta extensión:

- Asegúrate de tener Node.js instalado.
- Usa `npm install` para instalar las dependencias.
- Usa `npm run watch` para compilar los cambios automáticamente.

### Extensión de la funcionalidad
Esta extensión demuestra dos enfoques para el análisis de código:
- **Con GitHub Copilot**: Requiere conexión a internet y una suscripción activa.
- **Con Ollama (offline)**: Completamente offline, usando modelos locales.

## Licencia
Este proyecto está bajo la licencia MIT.
