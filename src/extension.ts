import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
	console.log('Activando la extensión Copilot Chat Helper...');
	console.log('Congratulations, your extension "copilot-chat-helper" is now active!');

	// The command has been defined in the package.json file
	const disposableHelloWorld = vscode.commands.registerCommand('copilot-chat-helper.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Copilot Chat Helper!');
	});

	context.subscriptions.push(disposableHelloWorld);

	// Registrar un comando para interactuar con el chat de Copilot
	const disposableAskCopilot = vscode.commands.registerCommand('copilotChatHelper.askCopilot', async () => {
		console.log('Comando copilotChatHelper.askCopilot ejecutado.');
		try {
			console.log('Solicitando entrada del usuario...');
			// Solicitar al usuario que ingrese una pregunta
			const question = await vscode.window.showInputBox({
				prompt: 'Escribe tu pregunta para Copilot',
				placeHolder: '¿Qué hace esta función?'
			});

			if (!question) {
				console.warn('No se ingresó ninguna pregunta.');
				vscode.window.showWarningMessage('No se ingresó ninguna pregunta.');
				return;
			}

			console.log(`Pregunta ingresada: ${question}`);

			// Mostrar un mensaje de progreso mientras se procesa la solicitud
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Consultando a GitHub Copilot',
				cancellable: false
			}, async (progress) => {
				try {
					 // Verificar si Visual Studio Code tiene instalada la extensión de GitHub Copilot
					console.log('Verificando si la extensión de GitHub Copilot está instalada...');
					const extension = vscode.extensions.getExtension('GitHub.copilot');
					if (!extension) {
						throw new Error('No se encontró la extensión de GitHub Copilot. Por favor, instálala primero.');
					}

					console.log('Extensión de GitHub Copilot encontrada. Verificando disponibilidad del comando github.copilot.generate...');
					const availableCommands = await vscode.commands.getCommands(true);
					if (!availableCommands.includes('github.copilot.generate')) {
						throw new Error('El comando github.copilot.generate no está disponible.');
					}

					console.log('Comando github.copilot.generate disponible. Creando panel de respuesta...');
					// Crear un panel para mostrar la respuesta
					const panel = vscode.window.createWebviewPanel(
						'copilotResponse',
						'Respuesta de Copilot',
						vscode.ViewColumn.One,
						{
							enableScripts: true
						}
					);

					console.log('Ejecutando comando github.copilot.generate...');
					// Ejecutar comando de Copilot Chat (esto dependerá de las APIs disponibles públicamente)
					// Nota: Esta es una solución alternativa ya que no podemos acceder directamente a la API de Copilot
					await vscode.commands.executeCommand('github.copilot.generate', question);
					console.log('Comando ejecutado con éxito. Mostrando instrucciones al usuario.');
					
					// Mostrar mensaje inicial en el panel
					panel.webview.html = getWebviewContent(
						question, 
						"Estamos intentando obtener una respuesta directamente desde GitHub Copilot. Por favor, verifica el chat de Copilot para ver la respuesta."
					);
					
				} catch (err) {
					console.error('Error durante la interacción con Copilot:', err);
					vscode.window.showErrorMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
				}
			});
		} catch (err) {
			console.error('Error al interactuar con Copilot:', err);
			vscode.window.showErrorMessage(`Error al interactuar con Copilot: ${err instanceof Error ? err.message : String(err)}`);
		}
	});

	context.subscriptions.push(disposableAskCopilot);

	// Registrar un comando para analizar código con Ollama (modelo local)
	const disposableAnalyzeWithOllama = vscode.commands.registerCommand('copilotChatHelper.analyzeWithOllama', async () => {
		console.log('Comando copilotChatHelper.analyzeWithOllama ejecutado.');
		try {
			// Mostrar un mensaje de progreso mientras se procesa la solicitud
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Analizando código con Ollama',
				cancellable: false
			}, async (progress) => {
				try {
					 // Verificar y configurar Ollama antes de ejecutar la consulta
					const setupSuccess = await setupOllama((message) => progress.report({ message }));
					if (!setupSuccess) {
						return;
					}

					// 1. Obtener el contenido del proyecto
					console.log('Recopilando archivos del proyecto...');
					progress.report({ message: 'Recopilando archivos del proyecto...' });
					const projectContent = await getProjectContent();
					
					// 2. Crear panel para mostrar la respuesta
					console.log('Creando panel para mostrar respuesta...');
					const panel = vscode.window.createWebviewPanel(
						'ollamaResponse',
						'Análisis de Código con Ollama',
						vscode.ViewColumn.One,
						{
							enableScripts: true
						}
					);
					
					// Mostrar mensaje inicial en el panel
					panel.webview.html = getWebviewContent(
						"¿Puedes identificar los protocolos de seguridad usados en este proyecto?", 
						"Analizando el código con Ollama, por favor espere..."
					);

					// 3. Enviar petición a Ollama
					console.log('Enviando petición a Ollama...');
					progress.report({ message: 'Enviando petición a Ollama...' });
					
					try {
						const response = await queryOllama("¿Puedes identificar los protocolos de seguridad usados en este proyecto?", projectContent);
						console.log('Respuesta recibida de Ollama');
						
						// 4. Mostrar respuesta en el panel
						panel.webview.html = getWebviewContent(
							"¿Puedes identificar los protocolos de seguridad usados en este proyecto?", 
							response || "No se pudo obtener una respuesta de Ollama."
						);
					} catch (error) {
						console.error('Error al comunicarse con Ollama:', error);
						panel.webview.html = getWebviewContent(
							"¿Puedes identificar los protocolos de seguridad usados en este proyecto?", 
							`Error al comunicarse con Ollama: ${error instanceof Error ? error.message : String(error)}. Asegúrate de que Ollama está instalado y ejecutándose en http://localhost:11434.`
						);
					}
				} catch (err) {
					console.error('Error durante el análisis con Ollama:', err);
					vscode.window.showErrorMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
				}
			});
		} catch (err) {
			console.error('Error al analizar con Ollama:', err);
			vscode.window.showErrorMessage(`Error al analizar con Ollama: ${err instanceof Error ? err.message : String(err)}`);
		}
	});

	context.subscriptions.push(disposableAnalyzeWithOllama);

	// Registrar un comando para configurar Ollama
	const disposableSetupOllama = vscode.commands.registerCommand('copilotChatHelper.setupOllama', async () => {
		console.log('Comando copilotChatHelper.setupOllama ejecutado.');
		try {
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Configurando Ollama',
				cancellable: false
			}, async (progress) => {
				const success = await setupOllama((message) => progress.report({ message }));
				if (success) {
					vscode.window.showInformationMessage('Ollama configurado correctamente.');
				} else {
					vscode.window.showWarningMessage('No se pudo completar la configuración de Ollama.');
				}
			});
		} catch (error) {
			console.error('Error al configurar Ollama:', error);
			vscode.window.showErrorMessage(`Error al configurar Ollama: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	context.subscriptions.push(disposableSetupOllama);
}

// Función para crear el contenido HTML del panel de respuesta
function getWebviewContent(question: string, response: string) {
	return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Respuesta de Copilot</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        .question {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .response {
            background-color: #e9f7fe;
            padding: 10px;
            border-radius: 5px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <h2>Consulta</h2>
    <div class="question">
        <p>${question}</p>
    </div>
    <h2>Respuesta de Copilot</h2>
    <div class="response">
        <p>${response}</p>
    </div>
</body>
</html>`;
}

// Función para obtener el contenido del proyecto
async function getProjectContent(): Promise<string> {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		throw new Error('No se encontraron carpetas de trabajo abiertas.');
	}

	const projectFolder = workspaceFolders[0].uri.fsPath;
	let projectContent = '';

	const readDirectory = async (dir: string) => {
		const files = await fs.promises.readdir(dir);
		for (const file of files) {
			const filePath = path.join(dir, file);
			const stat = await fs.promises.stat(filePath);
			if (stat.isDirectory()) {
				// Ignorar carpetas node_modules y .git
				if (file !== 'node_modules' && file !== '.git') {
					await readDirectory(filePath);
				}
			} else if (stat.isFile()) {
				// Ignorar archivos binarios y muy grandes
				if (path.extname(filePath).match(/\.(js|ts|json|md|html|css|scss|less|jsx|tsx|py|java|c|cpp|h|cs|go|php|rb)$/i) && stat.size < 1000000) {
					try {
						const content = await fs.promises.readFile(filePath, 'utf-8');
						projectContent += `\n\n// File: ${filePath}\n${content}`;
					} catch (err) {
						console.warn(`No se pudo leer el archivo ${filePath}:`, err);
					}
				}
			}
		}
	};

	await readDirectory(projectFolder);
	return projectContent;
}

// Función para enviar una consulta a Ollama
async function queryOllama(prompt: string, context: string, modelName: string = 'codellama', host: string = 'http://localhost:11434'): Promise<string> {
	console.log(`Enviando consulta al modelo ${modelName} en ${host}`);
	
	const response = await fetch(`${host}/api/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ 
			model: modelName,
			prompt: `${prompt}\n\nCódigo del proyecto:\n${context}`,
			stream: false
		})
	});

	if (!response.ok) {
		throw new Error(`Error en la solicitud a Ollama: ${response.statusText}`);
	}

	const data = await response.json() as { response: string };
	return data.response;
}

// Función para verificar si Ollama está en ejecución
async function isOllamaRunning(host: string = 'http://localhost:11434'): Promise<boolean> {
    try {
        console.log(`Verificando si Ollama está ejecutándose en ${host}...`);
        const response = await fetch(`${host}/api/tags`);
        return response.ok;
    } catch (error) {
        console.error('Error al verificar Ollama:', error);
        return false;
    }
}

// Función para obtener los modelos instalados en Ollama
async function getInstalledOllamaModels(host: string = 'http://localhost:11434'): Promise<string[]> {
    try {
        const response = await fetch(`${host}/api/tags`);
        if (!response.ok) {
            return [];
        }
        
        const data = await response.json() as { models: Array<{ name: string }> };
        return data.models.map(model => model.name);
    } catch (error) {
        console.error('Error al obtener modelos de Ollama:', error);
        return [];
    }
}

// Función para descargar un modelo si no está disponible
async function downloadOllamaModel(model: string, host: string = 'http://localhost:11434'): Promise<boolean> {
    try {
        console.log(`Descargando modelo ${model}...`);
        // El endpoint correcto es /api/pull para descargar modelos
        const response = await fetch(`${host}/api/pull`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: model })
        });
        
        if (!response.ok) {
            throw new Error(`Error al descargar el modelo: ${response.statusText}`);
        }
        
        return true;
    } catch (error) {
        console.error(`Error al descargar el modelo ${model}:`, error);
        return false;
    }
}

// Función para abrir el navegador con la página de instalación de Ollama
function openInstallationPage() {
    vscode.env.openExternal(vscode.Uri.parse('https://ollama.com/download'));
}

// Función para verificar y configurar Ollama antes de ejecutar una consulta
async function setupOllama(progressReporter?: (message: string) => void): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('copilotChatHelper.ollama');
    const host = config.get<string>('host') || 'http://localhost:11434';
    const modelName = config.get<string>('model') || 'codellama';
    
    // 1. Verificar si Ollama está en ejecución
    const report = (message: string) => {
        console.log(message);
        if (progressReporter) {
            progressReporter(message);
        }
    };
    
    report('Verificando si Ollama está en ejecución...');
    const running = await isOllamaRunning(host);
    
    if (!running) {
        report('Ollama no está en ejecución.');
        const installOption = 'Instalar Ollama';
        const openDocsOption = 'Abrir documentación';
        
        const result = await vscode.window.showErrorMessage(
            'Ollama no está instalado o no está en ejecución. Se necesita Ollama para analizar el código sin conexión.',
            { modal: true },
            installOption,
            openDocsOption
        );
        
        if (result === installOption) {
            openInstallationPage();
        } else if (result === openDocsOption) {
            vscode.env.openExternal(vscode.Uri.parse('https://ollama.com/docs'));
        }
        
        return false;
    }
    
    // 2. Verificar si el modelo está instalado
    report('Verificando si el modelo está instalado...');
    const installedModels = await getInstalledOllamaModels(host);
    
    if (!installedModels.includes(modelName)) {
        report(`El modelo ${modelName} no está instalado.`);
        const downloadOption = `Descargar modelo ${modelName}`;
        const chooseAnotherOption = 'Elegir otro modelo';
        
        const result = await vscode.window.showWarningMessage(
            `El modelo ${modelName} no está instalado en Ollama.`,
            { modal: true },
            downloadOption,
            chooseAnotherOption
        );
        
        if (result === downloadOption) {
            report(`Descargando modelo ${modelName}. Esto puede tardar varios minutos...`);
            const success = await downloadOllamaModel(modelName, host);
            
            if (!success) {
                vscode.window.showErrorMessage(`No se pudo descargar el modelo ${modelName}.`);
                return false;
            }
            
            report(`Modelo ${modelName} descargado correctamente.`);
        } else if (result === chooseAnotherOption) {
            // Mostrar modelos disponibles para elegir
            if (installedModels.length === 0) {
                vscode.window.showErrorMessage('No se encontraron modelos instalados en Ollama.');
                return false;
            }
            
            const selectedModel = await vscode.window.showQuickPick(installedModels, {
                placeHolder: 'Selecciona un modelo instalado'
            });
            
            if (!selectedModel) {
                return false;
            }
            
            // Actualizar la configuración
            await config.update('model', selectedModel, vscode.ConfigurationTarget.Global);
            report(`Modelo cambiado a ${selectedModel}.`);
        } else {
            return false;
        }
    }
    
    report(`Ollama está listo para usar con el modelo ${modelName}.`);
    return true;
}

// This method is called when your extension is deactivated
export function deactivate() {}
